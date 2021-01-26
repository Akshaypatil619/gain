let fs = require('fs');
let xlsx = require('xlsx');
let Validator = require('validatorjs');
let uuid = require('uuid');
let mkdirp = require('mkdirp');
let knex = require('../../../../../config/knex');
let errorResponse = require('../../../../tenant/modules/gems/responses/gems.response');
let pointsDataDir = '../../../../../uploads/flat_files/pending_files';
let handBackFilesDir = '../../../../../uploads/flat_files/handback_files';
let flatFileDumpDir = '../../../../../uploads/flat_files/archive_files';
let activityObj = {}, customerObj = {};
let activityArray = [], customerArray = [], transactionArray, transactionIdArray = [];
let handBackArray = [], gemsProcessFiles = [];
let defaultTenant, uniqueId, defaultActivity = [];
let sftpService = new (require('../services/sftp.service'))();

module.exports.startProcess = async function (callback) {
    if(process.env.NODE_ENV !== 'development')
        await sftpService.syncSftp(global.appRoot, 'download', 'process_points');
    fs.readdir(pointsDataDir, async (err, filesList) => {
        if(err) {
            console.log('Unable to read file directory');
            callback({status: false});
        } else {
            console.log('Gems accrual points flat file processing started.');
            callback();
            let gemsProcessFilesArray = await getGemsProcessFiles();

            activityArray = await getActivity();
            customerArray = await getAllCustomers();
            defaultTenant = await getDefaultTenant();
            defaultActivity = await getDefaultActivity();
            transactionArray = await getAllTransactionIds();
            console.log(defaultActivity);
            for(let activityValue of activityArray)
                activityObj[activityValue.code] = activityValue;
            for(let customerValue of customerArray)
                customerObj['customer_'+customerValue.gems_customer_id] = customerValue;
            for(let transactionValue of transactionArray)
                transactionIdArray.push(transactionValue.gems_transaction_id);
            for(let processFiles of gemsProcessFilesArray)
                gemsProcessFiles.push(processFiles.file_name);

            for(let fileName of filesList) {
                
                uniqueId = uuid.v1();

                let fileProcessId;
                if(gemsProcessFiles.indexOf(fileName) > -1)
                    continue;
                else if( !(fileName.includes('REWARDS_POINTS')) )
                    continue;
                else if(fileName.includes('DONE'))
                    continue;
                else if(fileName.split('.')[1] !== 'csv')
                    continue;
                else 
                    fileProcessId = await knex('gems_process_files').insert({
                        file_name: fileName
                    }).returning('id');
                if(defaultActivity.length == 0) {
                    console.log('============ DEFAULT ACTIVITY NOT FOUND ==============');
                    continue;
                }

                let workBook = xlsx.readFile(pointsDataDir + '/' + fileName, { raw: true });
                let workSheet = workBook['Sheets'][Object.keys(workBook['Sheets'])[0]];
                let workSheetData = xlsx.utils.sheet_to_json(workSheet, { raw: true, defval: null });

                let rules = {
                    TRAN_ID: 'required',
                    TRAN_CUSTOMER_ID: 'required|integer',
                    TRAN_POINTS_SOURCE_ID: 'required',
                    TRAN_DATE: 'required',
                    TRAN_POINTS: 'required|numeric'
                };

                for(let record of workSheetData) {
                    let validation = new Validator(record, rules);
                    if(validation.passes() && !validation.fails()) {
                        record.TRAN_CUSTOMER_ID = parseInt(record.TRAN_CUSTOMER_ID);
                        if(record.TRAN_POINTS <= 0) {
                            generateHandBackObject(false, record, errorResponse.invalid_points);
                            continue;
                        }
                        if(!activityObj.hasOwnProperty(record.TRAN_POINTS_SOURCE_ID)) {
                            generateHandBackObject(false, record, errorResponse.source_not_found);
                            continue;
                        };
                        if(!customerObj.hasOwnProperty('customer_'+record.TRAN_CUSTOMER_ID)) {
                            generateHandBackObject(false, record, errorResponse.customer_not_found);
                            continue;
                        };
                        if(transactionIdArray.indexOf(record.TRAN_ID) > -1) {
                            generateHandBackObject(false, record, errorResponse.duplicate_transaction_id);
                            continue;
                        };
                        if(isDateInvalid(record.TRAN_DATE)) {
                            generateHandBackObject(false, record, errorResponse.invalid_date_format);
                            continue;
                        }
                        global.rule_engine_instance.process_activity({
                            tenant_id: defaultTenant[0]['id'],
                            customer_id: customerObj['customer_'+record.TRAN_CUSTOMER_ID]['id'],
                            activity_transaction_amount: record.TRAN_POINTS,
                            activity_id: defaultActivity[0]['id'],
                            activity_code: defaultActivity[0]['code'],
                            activity_name: defaultActivity[0]['name'],
                            gems_source_id: activityObj[record.TRAN_POINTS_SOURCE_ID]['id'],
                            gems_tran_date: record.TRAN_DATE,
                            gems_tran_id: record.TRAN_ID
                        }, async ruleData => {
                            let obj = {
                                customer_id: ruleData.customer_id,
                                transaction_id: ruleData.transaction_id,
                                transaction_type: ruleData.transaction_type,
                                transaction_date: ruleData.gems_tran_date,
                                transaction_status: 'approved',
                                points: ruleData.points,
                                title: 'Points Earned',
                                description: '',
                                activity_id: ruleData.activity_id,
                                activity: ruleData.activity_name,
                                gems_source_id: ruleData.gems_source_id,
                                rule_id: ruleData.rule_id,
                                gems_transaction_id: ruleData.gems_tran_id,
                                accrual_process_id: uniqueId
                            };
                            await knex('customer_transaction').insert(obj);
                        }, {}, {});
                        generateHandBackObject(true, record, null);
                        transactionIdArray.push(record.TRAN_ID);
                    } else generateHandBackObject(false, record, validation.errors.errors);
                };
                await genereteHandBackFile(handBackFilesDir, fileName, fileProcessId[0]);
                await moveFlatFiles(flatFileDumpDir, fileName);
            };
            await resolveFlatFileProcess();
        }
    })
}

function getActivity(table) {
    return knex('master_activity').select({
        id: 'id', name: 'name', code: 'code'
    }).where('activity_type','accrual');
}

function getAllCustomers() {
    return knex('customers').select({
        gems_customer_id: 'gems_customer_id',
        id: 'id'
        }).where('status',1);
}

function generateHandBackObject(status, record, error) {
    if (typeof error == 'object') error = JSON.stringify(error);
    record['process_date'] = new Date();
    record['process_status'] = status == true ? 'Success' : 'Failed' ;
    record['process_error'] = error;
    handBackArray.push(record);
}

function getDefaultTenant() {
    return knex('tenants').select('id')
        .where('status',1).limit(1);
}

function getDefaultActivity() {
    return knex('master_activity').select('id','code','name')
        .where('code', 'GPE')
        .where('status', 1);
}

function getAllTransactionIds() {
    return knex('customer_transaction')
        .select(knex.raw('DISTINCT gems_transaction_id'));
}

function genereteHandBackFile(fileDir, worksheetName, fileProcessId) {
    return new Promise(async resolve => {
        if (!fs.existsSync(fileDir))
            mkdirp.sync(fileDir);

        let ws = xlsx.utils.json_to_sheet(handBackArray, { dateNF: 22 });
        let wb = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(wb, ws, worksheetName.split('.csv')[0]);
        xlsx.writeFile(wb, fileDir + '/' + worksheetName.split('.csv')[0] + '_DONE.csv');
        let fileTotalRecords = handBackArray.length;
        let fileTotalErrors = 0;
        handBackArray.forEach(val => {
            if(val.process_status == 'Failed')
                fileTotalErrors ++;
        })
        let dumpData = handBackArray.map(val => {
            return {
                gems_process_file_id: fileProcessId,
                record_data: JSON.stringify(val),
                is_success: val.process_status == 'Success' ? 1 : 0
            }
        });

        let insertChunkSize = 100;
        for (let i = 0; i <= dumpData.length; i = (i + insertChunkSize)) {
            await knex.batchInsert('gems_process_file_data', dumpData.slice(i, i + insertChunkSize), 100);
        };

        await knex('gems_process_files').update({
            error_count: fileTotalErrors,
            total_records: fileTotalRecords,
            success: fileTotalRecords - fileTotalErrors,
            failure: fileTotalErrors,
            is_processed: 1
        }).where('id', fileProcessId);

        handBackArray = [];

        if(process.env.NODE_ENV !== 'development')
            await sftpService.syncSftp(global.appRoot, 'upload', 'handback',
                worksheetName.split('.csv')[0] + '_DONE.csv');

        resolve();
    })
}

function isDateInvalid(date) {
    if(typeof date !== 'string') return true;
    let splitDate = date.split('-');
    if(splitDate.length !== 3) return true;
    for(let val of splitDate)
        if(isNaN(val)) return true;
    return (splitDate[0].toString().length !== 4 || splitDate[0] > 2999) ? true
        : splitDate[1] > 12 ? true
        : splitDate[2] > 31 ? true
        : Date.parse(date) == NaN ? true
        : false;
}

function moveFlatFiles(fileDir, fileName) {
    return new Promise(async resolve => {
        if (!fs.existsSync(fileDir))
        mkdirp.sync(fileDir);

        fs.copyFileSync(pointsDataDir + '/' + fileName, fileDir + '/' + fileName)
        fs.unlinkSync(pointsDataDir + '/' + fileName);

        if(process.env.NODE_ENV !== 'development')
        await sftpService.syncSftp(global.appRoot, 'upload', 'archive', fileName);

        resolve();
    })
}

function resolveFlatFileProcess() {
    return knex('flat_file_process_logs').update('process_status',1)
        .where('name','gems_points');
}

function getGemsProcessFiles() {
    return knex('gems_process_files').select('file_name')
        .where('status',1);
}