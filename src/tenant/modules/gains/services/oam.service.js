
let fs = require('fs');
let xlsx = require('xlsx');
let path = require('path');
let Validator = require('validatorjs');
let uuid = require('uuid');
let mkdirp = require('mkdirp');

const errorResponse = require('../responses/gains.response');

let config = require("../../../../../config/config");
let parentStaffDir, handBackFilesDir, flatFileDumpDir;
let knex, gainsProcessFiles = [];
let handBackData = []
let globalAppRoot;
let encription_key = config.encription_key;
let tenant_model = new (require("../../tenant/models/tenant.mysql"))();
let sftpService = new (require('./sftp.service'))();
knex = require('../../../../../config/knex');
const CronNotifications = require('../../../../core/cron_notifications');
module.exports = class OAMService {

    constructor() { }


    syncOAM(req, res) {
        return new Promise(async (resolve, reject) => {
            parentStaffDir = path.join(appRoot, 'uploads/flat_files/pending_files');
            handBackFilesDir = path.join(appRoot, 'uploads/flat_files/handback_files');
            flatFileDumpDir = path.join(appRoot, 'uploads/flat_files/archive_files');

          

            globalAppRoot = appRoot;
            if(process.env.NODE_ENV !== 'development'){
                await sftpService.syncSftp(globalAppRoot, 'download', 'OAM_');
            }
            fs.readdir(parentStaffDir, async (err, flatFilesList) => {
                if (err) {
                    console.log('Unable to read file directory');
                    // process.send('err');
                    reject(err);

                } else {
                    let gainsProcessFilesArray = await getgainsProcessFiles();
                   
                    for (let processFiles of gainsProcessFilesArray)
                        gainsProcessFiles.push(processFiles.file_name);

                    for (let fileName of flatFilesList) {
                        console.log("fileNamess=", fileName);

                        let fileProcessId;
                        if (gainsProcessFiles.indexOf(fileName) > -1)
                            continue;
                        else if( !(fileName.includes('OAM_')))
                            continue;
                        else if (fileName.includes('DONE'))
                            continue;
                        else if (fileName.split('.')[1] !== 'csv')
                            continue;
                        else
                            fileProcessId = await knex('gains_process_files').insert({
                                file_name: fileName
                            });
                        await updateOAM(fileName,req, res);
                        await genereteHandBackFile(handBackFilesDir, fileName, fileProcessId[0]);
                        await moveFlatFiles(flatFileDumpDir, fileName);
                    }
                   return resolve();
                }
            })
        })
    }
}



function updateOAM(fileName, req, res) {  
    return new Promise(async (resolve, reject) => {
        let userTypeArray = await getMaster('master_user_type');
        const notif_instance = new CronNotifications();
		await notif_instance.init_templates(req.activity_detail[0].id);
        let workBook = xlsx.readFile(parentStaffDir + '/' + fileName);
        let workSheet = workBook['Sheets'][Object.keys(workBook['Sheets'])[0]];
        let workSheetData = xlsx.utils.sheet_to_json(workSheet, { raw: true, defval: null });
        let insertArray = [], updateArray = [], deleteArray = [];
        thankYouCustomerArray = [];

        let rules = {
            first_name: 'required',
            last_name: 'required',
            oam_code: 'required',
            email: 'required',
            phone: 'required',
            address: 'required',
            oam_commission: 'required',
            owner_commission: 'required',
            gain_commission: 'required',
            status: 'required'
        };
        for (let record of workSheetData) {
            let validation = new Validator(record, rules);
            if (validation.passes() && !validation.fails()) {
                let country = await getCountry(record);
                let customer = await getCustomerRecords(record);
                record['id'] = (customer.length>0) ? customer[0].id : null;
                record['country_id'] = (country.length>0) ? country[0].id : null;
                let dbObject = {
                    id: record.id,
                    oam_code: record.oam_code,
                    first_name: record.first_name,
                    last_name: record.last_name,
                    email: record.email,
                    phone: record.phone,
                    status:record.status,
                    oam_commission: record.oam_commission,
                    owner_commission: record.owner_commission,
                    gain_commission: record.gain_commission,
                    manager: record.manager,
                    user_type_id: Number(userTypeArray[0]['id']),
                    country_id: record.country_id
                };
                if ((record.status).toUpperCase() == 'INSERT') {
                    // if(customerIdArray.indexOf(record.customer_id) > -1) {
                    if((record['id'] !=null) || (getTotalCommsion(record)==false)) {
                        generateHandBackObject(record, errorResponse.customer_already_present, 'Failed');
                        continue;
                    } else {
                        delete dbObject['status'];
                        let member_no = Math.floor(1000000000 + Math.random() * 9000000000);
                        dbObject['customer_unique_id'] = knex.raw("AES_ENCRYPT('" + (member_no) + "', '" + encription_key + "')");
                        dbObject['oam_code'] = knex.raw("AES_ENCRYPT('" + dbObject['oam_code'] + "', '" + encription_key + "')");
                        dbObject['first_name'] = knex.raw("AES_ENCRYPT('" + dbObject['first_name'] + "', '" + encription_key + "')");
                        dbObject['last_name'] = knex.raw("AES_ENCRYPT('" + dbObject['last_name'] + "', '" + encription_key + "')");
                        dbObject['email'] = knex.raw("AES_ENCRYPT('" + dbObject['email'] + "', '" + encription_key + "')");
                        dbObject['phone'] = knex.raw("AES_ENCRYPT('" + dbObject['phone'] + "', '" + encription_key + "')");
                        insertArray.push(dbObject);
                        let customerId = await knex("customers").insert(dbObject);
                        await knex("cc_account_summary").insert({customer_id: customerId[0]});
                        let oamCustomer = {
                            phone: record['phone'],
                            email: record['email'],
                            language_code: "EN"
                        };
                        let templateDetails = {
                            user_name: record['first_name']+" "+record['last_name'],
                            phone: record['phone'],
                            email: record['email'],
                            logo_url: config['base_url']
                        }; 
                        let data = { templateCode: 'SYNCOAM', customerDetails: oamCustomer, templateDetails };
                        notif_instance.send_notifications(data)
                                                .then(res => console.log(res)).catch(err => console.log(err));
                        // customerIdArray.push(record.id);
                        // emailData.push({
                        //     id: record['id'],
                        //     first_name: record['first_name'],
                        //     last_name: record['last_name'],
                        //     user_name: record['first_name']+" "+record['last_name'],
                        //     email: record['email'],
                        //     phone: record['phone'],
                        //     language_code: "EN"
                        // });
                    };
                }
                else if ((record.status).toUpperCase() == 'DELETE') {
                    // if(!(customerIdArray.indexOf(record.customer_id) > -1)) {
                    if(record['id'] ==null){
                        generateHandBackObject(record, errorResponse.customer_not_found, 'Failed');
                        continue;
                    } else deleteArray.push(dbObject.id);
                }
                else if ((record.status).toUpperCase() == 'UPDATE') {
                    // if(!(customerIdArray.indexOf(record.customer_id) > -1)) {
                    if((record['id'] ==null) || (getTotalCommsion(record)==false)) {
                            generateHandBackObject(record, errorResponse.customer_not_found, 'Failed');
                        continue;
                    } else {
                        // emailData.push({
                        //     id: record['id'],
                        //     first_name: record['first_name'],
                        //     last_name: record['last_name'],
                        //     user_name: record['first_name']+" "+record['last_name'],
                        //     email: record['email'],
                        //     phone: record['phone'],
                        //     language_code: "EN"
                        // });
                        let customerId = dbObject.id;
                        delete dbObject.id;
                        delete dbObject.email;
                        delete dbObject.customer_unique_id;
                        delete dbObject.status;
                        dbObject['first_name'] = knex.raw("AES_ENCRYPT('" + dbObject['first_name'] + "', '" + encription_key + "')");
                        dbObject['last_name'] = knex.raw("AES_ENCRYPT('" + dbObject['last_name'] + "', '" + encription_key + "')");
                        dbObject['phone'] = knex.raw("AES_ENCRYPT('" + dbObject['phone'] + "', '" + encription_key + "')");
                        await knex('customers').update(dbObject).where('id', customerId);
                    };
                };
                  generateHandBackObject(record, '', 'Success');
            } else 
            generateHandBackObject(record, validation.errors.errors, 'Failed');
		};

    if(insertArray.length>0){
        for (let i = 0; i < insertArray.length; i++) {
            
        };
    }
    if(deleteArray.length>0){
        for (let i = 0; i <= deleteArray.length; i = (i + deleteChunkSize)) {
            await knex('customers')
            .leftJoin('customer_referral', 'customer_referral.referrer_customer_id', 'customers.id')
            .update({
                'customers.status': 0,
                'customer_referral.status': 0,
                'customers.deactivated_at' : knex.raw("current_timestamp()"),
              })
            .whereIn('id', deleteArray.slice(i, i + deleteChunkSize));
        };
    }
        resolve();
    });
}

function getgainsProcessFiles() {
    return knex('gains_process_files').select('file_name')
        .where('status', 1);
}
function getMaster(table) {
    return knex(table).select({
        id: 'id',
        name: 'name'
    }).where('name', "OAM")
    .andWhere("status", 1);
}

function getAllCustomers() {
    let columns = {
        customer_id: "customers.id"
    }
    return knex('customers').select(columns)
    .where('status',1);
}
async function getCustomerRecords(record){
    let columns = {
        id: "customers.id"
    }
    if(record.status.toUpperCase()=="INSERT"){
        return await knex("customers").select(columns)
        .whereRaw("CAST(AES_DECRYPT(customers.email,'" + encription_key + "') AS CHAR(255)) = '" + record['email'] + "'")
        .orWhereRaw("CAST(AES_DECRYPT(customers.phone,'" + encription_key + "') AS CHAR(255)) = '" + record['phone'] + "'")
        .orWhereRaw("CAST(AES_DECRYPT(customers.oam_code,'" + encription_key + "') AS CHAR(255)) = '" + record['oam_code'] + "'")
    } else if(record.status.toUpperCase()=="UPDATE"){
      return knex("customers").select(columns)
        .whereRaw("CAST(AES_DECRYPT(customers.email,'" + encription_key + "') AS CHAR(255)) = '" + record['email'] + "'")
        .then((customer)=>{
           return knex("customers").select(columns)
            .whereRaw("CAST(AES_DECRYPT(customers.phone,'" + encription_key + "') AS CHAR(255)) = '" + record['phone'] + "'")
            .andWhereRaw("CAST(AES_DECRYPT(customers.email,'" + encription_key + "') AS CHAR(255)) != '" + record['email'] + "'")
            .then((phone)=>{
                return ((phone.length>0) ? [] : customer);
            })
        })
    } else {
        return await knex("customers").select(columns)
        .whereRaw("CAST(AES_DECRYPT(customers.email,'" + encription_key + "') AS CHAR(255)) = '" + record['email'] + "'")
        .andWhereRaw("CAST(AES_DECRYPT(customers.phone,'" + encription_key + "') AS CHAR(255)) = '" + record['phone'] + "'")
    }
}
async function getTotalCommsion(record) {
    return (((Number(record['oam_commission'])+Number(record['owner_commission'])+Number(record['gain_commission']))>100) ? false : true);
} 
async function getCountry(record){
    let columns = {
        id: "countries.id"
    }
    return await knex("countries").select(columns)
    .where("countries.code",record['country_code']);
}
function generateHandBackObject(record, error, status) {
    if (typeof error == 'object') error = JSON.stringify(error);
    record['process_date'] = new Date();
    record['process_status'] = status;
    record['process_error'] = error;
    handBackData.push(record);
    return;
}



function moveFlatFiles(fileDir, fileName) {
    return new Promise(async resolve => {
        if (!fs.existsSync(fileDir))
            mkdirp.sync(fileDir);

        fs.copyFileSync(parentStaffDir + '/' + fileName, fileDir + '/' + fileName)
        fs.unlinkSync(parentStaffDir + '/' + fileName);

        if(process.env.NODE_ENV !== 'development')
            await sftpService.syncSftp(globalAppRoot, 'upload', 'archive', fileName);
      
        resolve();
    })
}


function genereteHandBackFile(fileDir, worksheetName, fileProcessId) {
  
    return new Promise(async resolve => {
        let jsonData;
        fileDir = fileDir;
        if (!fs.existsSync(fileDir))
            mkdirp.sync(fileDir);


        jsonData = handBackData;
     
        let ws = xlsx.utils.json_to_sheet(jsonData, { dateNF: 22 });
        let wb = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(wb, ws, worksheetName.split('.csv')[0]);
        xlsx.writeFile(wb, fileDir + '/' + worksheetName.split('.csv')[0] + '_DONE.csv');
        let fileTotalRecords = jsonData.length;
        let fileTotalErrors = 0;
        jsonData.forEach(val => {
            if (val.process_status == 'Failed')
                fileTotalErrors++;
        })
        let dumpData = jsonData.map(val => {
            return {
                gains_process_file_id: fileProcessId,
                record_data: JSON.stringify(val),
                is_success: val.process_status == 'Success' ? 1 : 0
            }
        })

        let insertChunkSize = 100;
        for (let i = 0; i <= dumpData.length; i = (i + insertChunkSize)) {
            await knex.batchInsert('gains_process_file_data', dumpData.slice(i, i + insertChunkSize), 100);
        };

        await knex('gains_process_files').update({
            error_count: fileTotalErrors,
            total_records: fileTotalRecords,
            success: fileTotalRecords - fileTotalErrors,
            failure: fileTotalErrors,
            is_processed: 1
        }).where('id', fileProcessId);

        if(process.env.NODE_ENV !== 'development')
            await sftpService.syncSftp(globalAppRoot, 'upload', 'handback',
                worksheetName.split('.csv')[0] + '_DONE.csv');

        resolve();
    })
}



