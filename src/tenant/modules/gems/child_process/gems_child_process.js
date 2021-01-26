let fs = require('fs');
let xlsx = require('xlsx');
let path = require('path');
let Validator = require('validatorjs');
let uuid = require('uuid');
let mkdirp = require('mkdirp');
let schoolObj = {}, productObj = {}, userTypeObj = {},nationalityObj={};
let schoolArray, productArray, userTypeArray, customerArray, customerIdArray = [], customerObj = {}, tierId, tenantId,nationalityArray;
let handBackParentData = [], handBackStaffData = [], emailData = { staff: [], parent: [], new_ppid: [] };
let parentStaffDir, handBackFilesDir, flatFileDumpDir;
let thankYouCustomerArray, uniqueId;
let sftpService = new (require('../services/sftp.service'))();
let knex, gemsProcessFiles = [], errorResponse;
let customerStaffArray, customerStaffIds = [];
let processEnv;
let globalAppRoot;

process.on('uncaughtException', function (err) {
    console.error(err);
    process.send('err');
});

process.on('unhandledRejection', error => {
    console.log(error);
    process.send('err');
});

process.on('message', async ([message, appRoot, env]) => {
    if (message === 'sync') {
        console.log('Parent / Staff flat file processing started.');
        parentStaffDir = path.join(appRoot, 'uploads/flat_files/pending_files');
        handBackFilesDir = path.join(appRoot, 'uploads/flat_files/handback_files');
        flatFileDumpDir = path.join(appRoot, 'uploads/flat_files/archive_files');
        errorResponse = require(path.join(appRoot, 'src/tenant/modules/gems/responses/gems.response'));
        knex = require('../../../../../config/knex');
        processEnv = env;
        globalAppRoot = appRoot;
        
        if(processEnv !== 'development')
            await sftpService.syncSftp(globalAppRoot, 'download', 'sync_customers');
        
        syncCustomers();
       
    } else process.send('exit');
});

function syncCustomers() {
    fs.readdir(parentStaffDir, async (err, flatFilesList) => {
        if (err) {
            console.log('Unable to read file directory');
            process.send('err');
        } else {
            uniqueId = uuid.v1();
            let gemsProcessFilesArray = await getGemsProcessFiles();
			schoolArray = await getMaster('master_school');
			productArray = await getMaster('master_product');
			userTypeArray = await getMaster('master_member_type');
			nationalityArray = await getMaster('master_nationality');
			customerArray = await getAllCustomers();
			customerStaffArray = await getAllStaffIds();
			tierId = await knex('customer_tiers').select('id').limit(1);
			tenantId = await knex('tenants').select('id').where('status',1).limit(1);
            
            for (let schoolValue of schoolArray)
                schoolObj[schoolValue.code] = schoolValue;
            for (let productValue of productArray)
                productObj[productValue.code] = productValue;
            for (let userTypeValue of userTypeArray)
				userTypeObj[userTypeValue.code] = userTypeValue;
			for (let nationalityValue of nationalityArray)
			    nationalityObj[nationalityValue.code] = nationalityValue;
            for (let customerValue of customerArray) {
                customerObj[customerValue.gems_customer_id] = customerValue
                customerIdArray.push(customerValue.gems_customer_id);
            }
            for(let processFiles of gemsProcessFilesArray)
                gemsProcessFiles.push(processFiles.file_name);
            for(let staffId of customerStaffArray)
                customerStaffIds.push(staffId.gems_staff_id);

            for (let fileName of flatFilesList) {
                let fileProcessId;
                if(gemsProcessFiles.indexOf(fileName) > -1)
                    continue;
                else if( !(fileName.includes('PARENT_PROFILE')) &&
                         !(fileName.includes('STAFF_PROFILE'))  )
                    continue;
                else if(fileName.includes('DONE'))
                    continue;
                else if(fileName.split('.')[1] !== 'csv')
                    continue;
                else 
                    fileProcessId = await knex('gems_process_files').insert({
                        file_name: fileName
                    }).returning('id');

                let fileType;
                

                if (fileName.indexOf('PARENT') > -1)
                    fileType = 'parent';
                else if (fileName.indexOf('STAFF') > -1)
                    fileType = 'staff'
                await updateCustomers(fileName, fileType);

                await genereteHandBackFile(handBackFilesDir, fileType, fileName, fileProcessId[0]);
                await moveFlatFiles(flatFileDumpDir, fileName);
            };
            await resolveFlatFileProcess();
            process.send(['emailDetails', emailData]);
            process.send('exit');
        }
    })
}

function updateCustomers(fileName, type) {
    return new Promise(async (resolve, reject) => {
        let workBook = xlsx.readFile(parentStaffDir + '/' + fileName);
        let workSheet = workBook['Sheets'][Object.keys(workBook['Sheets'])[0]];
        let workSheetData = xlsx.utils.sheet_to_json(workSheet, { raw: true, defval: null });
        let insertArray = [], updateArray = [], deleteArray = [];
        thankYouCustomerArray = [];

        let rules = {
            TRAN_FIRST_NAME: 'required',
            // TRAN_LAST_NAME: 'required',
            TRAN_EMAIL: 'required',
            TRAN_CUSTOMER_ID: 'required|integer',
            TRAN_SCHOOL: 'required',
            TRAN_PRODUCT: 'required',
            TRAN_MOBILE_NO: 'required',
            TRAN_GENDER: 'required',
            TRAN_ACTION: 'required',
        };
        if (type == 'parent') {
            rules.TRAN_STAFF = 'required';
            rules.TRAN_PARENT_PORTAL_ID = 'required';
        } else if (type == 'staff') rules.TRAN_STAFF_ID = 'required';

        for (let record of workSheetData) {
            let validation = new Validator(record, rules);
            if (validation.passes() && !validation.fails()) {
                let schoolId, productId,nationalityId;
                if (schoolObj.hasOwnProperty(record.TRAN_SCHOOL))
                    schoolId = schoolObj[record.TRAN_SCHOOL].id;
                else {
                    generateHandBackObject(type, record, errorResponse.school_not_found, 'Failed');
                    continue;
                };
                if (productObj.hasOwnProperty(record.TRAN_PRODUCT))
                    productId = productObj[record.TRAN_PRODUCT].id;
                else {
                    generateHandBackObject(type, record, errorResponse.product_not_found, 'Failed');
                    continue;
				};
				if (nationalityObj.hasOwnProperty(record.TRAN_NATIONALITY))
					nationalityId = nationalityObj[record.TRAN_NATIONALITY].id;
				
			    else {
					generateHandBackObject(type, record, errorResponse.nationality_not_found, 'Failed');
					continue;
		    	};
                record.TRAN_CUSTOMER_ID = parseInt(record.TRAN_CUSTOMER_ID);
                if(record.TRAN_STAFF_ID)
                    record.TRAN_STAFF_ID = parseInt(record.TRAN_STAFF_ID);
                let dbObject = {
                    gems_customer_id: record.TRAN_CUSTOMER_ID,
                    first_name: record.TRAN_FIRST_NAME,
                    middle_name: record.TRAN_MID_NAME,
                    last_name: record.TRAN_LAST_NAME,
                    member_type_id: userTypeObj[type].id,
                    school_id: schoolId,
                    product_id: productId,
                    email: record.TRAN_EMAIL,
                    phone: record.TRAN_MOBILE_NO,
                    tier_id: tierId[0].id,
                    gender: record.TRAN_GENDER,
                    gems_staff_id: record.TRAN_STAFF_ID,
                    is_staff: record.TRAN_STAFF,
                    tenant_id: tenantId[0].id,
					gems_parent_portal_id: record.TRAN_PARENT_PORTAL_ID,
					nationality_id:nationalityId
				};
                if (record.TRAN_ACTION == 'INSERT') {
                    if(customerIdArray.indexOf(record.TRAN_CUSTOMER_ID) > -1) {
                        generateHandBackObject(type, record, errorResponse.customer_already_present, 'Failed');
                        continue;
                    } else if(type == 'staff' && customerStaffIds.indexOf(record.TRAN_STAFF_ID) > -1) {
                        generateHandBackObject(type, record, errorResponse.staff_id_already_present, 'Failed');
                        continue;
                    } else {
                        insertArray.push(dbObject);
                        customerIdArray.push(record.TRAN_CUSTOMER_ID);
                        emailData[type].push({
                            email: record.TRAN_EMAIL,
                            login_id: (type == 'staff' ? record.TRAN_STAFF_ID : record.TRAN_PARENT_PORTAL_ID)
                        });
                        customerObj[record.TRAN_CUSTOMER_ID] = { gems_parent_portal_id: record.TRAN_PARENT_PORTAL_ID };
                    };
                }
                else if (record.TRAN_ACTION == 'DELETE') {
                    if(!(customerIdArray.indexOf(record.TRAN_CUSTOMER_ID) > -1)) {
                        generateHandBackObject(type, record, errorResponse.customer_not_found, 'Failed');
                        continue;
                    } else deleteArray.push(dbObject.gems_customer_id);
                }
                else if (record.TRAN_ACTION == 'UPDATE') {
                    if(!(customerIdArray.indexOf(record.TRAN_CUSTOMER_ID) > -1)) {
                        generateHandBackObject(type, record, errorResponse.customer_not_found, 'Failed');
                        continue;
                    } else {
                        if(type == 'parent' && customerObj[record.TRAN_CUSTOMER_ID].gems_parent_portal_id != 
                            record.TRAN_PARENT_PORTAL_ID) {
                                let username = record.TRAN_FIRST_NAME + ' ' + record.TRAN_LAST_NAME;
                                emailData.new_ppid.push({
                                    email: record.TRAN_EMAIL,
                                    login_id: record.TRAN_PARENT_PORTAL_ID,
                                    username: username.charAt(0).toUpperCase() + username.substring(1)
                                });
                                customerObj[record.TRAN_CUSTOMER_ID].gems_parent_portal_id = record.TRAN_PARENT_PORTAL_ID;
                            }
                        let gemsCustomerId = dbObject.gems_customer_id;
                        delete dbObject.gems_customer_id;
                        await knex('customers').update(dbObject).where('gems_customer_id', gemsCustomerId);
                    };
                };

                // generateThankYouCustomerObject(dbObject, record.TRAN_ACTION);
                generateHandBackObject(type, record, '', 'Success');
            } else generateHandBackObject(type, record, validation.errors.errors, 'Failed');

		};

        let insertChunkSize = 100, deleteChunkSize = 100;
        for (let i = 0; i <= insertArray.length; i = (i + insertChunkSize)) {
            await knex.batchInsert('customers', insertArray.slice(i, i + insertChunkSize), 100);
        };
        for (let i = 0; i <= deleteArray.length; i = (i + deleteChunkSize)) {
			await knex('customers')
			.leftJoin('customer_referral', 'customer_referral.referrer_customer_id', 'customers.id')
			.update({
				'customers.status': 0,
				'customer_referral.status': 0,
				'customers.deactivated_at' : knex.raw("current_timestamp()"),
			  })
			.whereIn('gems_customer_id', deleteArray.slice(i, i + deleteChunkSize));
		};
        /* insertChunkSize = 100;
        for (let i = 0; i <= thankYouCustomerArray.length; i = (i + insertChunkSize)) {
            await knex.batchInsert('thank_you_customers', thankYouCustomerArray.slice(i, i + insertChunkSize), 100);
        }; */

        resolve();
    });
}

function getMaster(table) {
    return knex(table).select({
        id: 'id',
        code: 'code'
    }).where('status', 1);
}

function getAllCustomers() {
    return knex('customers').select('gems_customer_id', 'gems_parent_portal_id')
        .where('status',1);
}

function getAllStaffIds() {
    return knex('customers').select({
        gems_staff_id: knex.raw('DISTINCT gems_staff_id')
    }).where('status',1);
}

function generateHandBackObject(type, record, error, status) {
    if (typeof error == 'object') error = JSON.stringify(error);
    record['process_date'] = new Date();
    record['process_status'] = status;
    record['process_error'] = error;
    if (type == 'parent')
        handBackParentData.push(record);
    else if (type == 'staff')
        handBackStaffData.push(record);
    return;
}

function genereteHandBackFile(fileDir, type, worksheetName, fileProcessId) {
    return new Promise(async resolve => {
        let jsonData;
        fileDir = fileDir;
        if (!fs.existsSync(fileDir))
            mkdirp.sync(fileDir);

        if (type == 'parent') {
            jsonData = handBackParentData;
            handBackParentData = [];
        }
        else if (type == 'staff') {
            jsonData = handBackStaffData;
            handBackStaffData = [];
        }
        let ws = xlsx.utils.json_to_sheet(jsonData, { dateNF: 22 });
        let wb = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(wb, ws, worksheetName.split('.csv')[0]);
        xlsx.writeFile(wb, fileDir + '/' + worksheetName.split('.csv')[0] + '_DONE.csv');
        let fileTotalRecords = jsonData.length;
        let fileTotalErrors = 0;
        jsonData.forEach(val => {
            if(val.process_status == 'Failed')
                fileTotalErrors ++;
        })
        let dumpData = jsonData.map(val => {
            return {
                gems_process_file_id: fileProcessId,
                record_data: JSON.stringify(val),
                is_success: val.process_status == 'Success' ? 1 : 0
            }
        })
        // await knex('gems_process_file_data').insert(dumpData);

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

        if(processEnv !== 'development')
            await sftpService.syncSftp(globalAppRoot, 'upload', 'handback',
                worksheetName.split('.csv')[0] + '_DONE.csv');

        resolve();
    })
}

function moveFlatFiles(fileDir, fileName) {
    return new Promise(async resolve => {
        if (!fs.existsSync(fileDir))
        mkdirp.sync(fileDir);

        fs.copyFileSync(parentStaffDir + '/' + fileName, fileDir + '/' + fileName)
        fs.unlinkSync(parentStaffDir + '/' + fileName);

        if(processEnv !== 'development')
        await sftpService.syncSftp(globalAppRoot, 'upload', 'archive', fileName);
        resolve();
    })
}

function generateThankYouCustomerObject(object, action) {
    let thankYouCustomerObject = Object.assign({}, object);
    thankYouCustomerObject['process_id'] = uniqueId;
    thankYouCustomerObject['action'] = action;
    delete thankYouCustomerObject.tier_id;
    thankYouCustomerArray.push(thankYouCustomerObject);
}

function resolveFlatFileProcess() {
    return knex('flat_file_process_logs').update('process_status',1)
        .where('name','gems_customers');
}

function getGemsProcessFiles() {
    return knex('gems_process_files').select('file_name')
        .where('status',1);
}