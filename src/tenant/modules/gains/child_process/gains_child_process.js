let fs = require('fs');
let xlsx = require('xlsx');
let path = require('path');
let Validator = require('validatorjs');
let uuid = require('uuid');
let mkdirp = require('mkdirp');
let schoolObj = {}, productObj = {}, userTypeObj = {},nationalityObj={};
let schoolArray, productArray, userTypeArray, customerArray, customerIdArray = [], customerObj = {}, tierId, tenantId,nationalityArray;
let handBackParentData = [], handBackData = [], handBackStaffData = [];

// emailData = { staff: [], parent: [], new_ppid: [] };
let emailData = [];
let parentStaffDir, handBackFilesDir, flatFileDumpDir;
let thankYouCustomerArray, uniqueId;
let sftpService = new (require('../services/sftp.service'))();
let knex, gainsProcessFiles = [], errorResponse;
let customerStaffArray, customerStaffIds = [];
let processEnv;
let globalAppRoot;
let config = require("../../../../../config/config").get(process.env.NODE_ENV);
let encription_key = config.encription_key;

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
        // console.log('Parent / Staff flat file processing started.');
        parentStaffDir = path.join(appRoot, 'uploads/flat_files/pending_files');
        handBackFilesDir = path.join(appRoot, 'uploads/flat_files/handback_files');
        flatFileDumpDir = path.join(appRoot, 'uploads/flat_files/archive_files');
        errorResponse = require(path.join(appRoot, 'src/tenant/modules/gains/responses/gains.response'));
        knex = require(path.join(appRoot, 'config/knex'));
        processEnv = env;
        globalAppRoot = appRoot;
        // if(processEnv !== 'development'){
            await sftpService.syncSftp(globalAppRoot, 'download', 'sync_customers');
        // }

        
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
            let gainsProcessFilesArray = await getgainsProcessFiles();
		    userTypeArray = await getMaster('master_user_type');
			customerArray = await getAllCustomers();
			tierId = await knex('customer_tiers').select('id').limit(1);
			tenantId = await knex('tenants').select('id').where('status',1).limit(1);
            
            for (let userTypeValue of userTypeArray)
				userTypeObj[userTypeValue.id] = userTypeValue;
			for (let customerValue of customerArray) {
                customerObj[customerValue.gains_customer_id] = customerValue
                customerIdArray.push(customerValue.customer_id);
            }
            for(let processFiles of gainsProcessFilesArray)
                gainsProcessFiles.push(processFiles.file_name);
            for (let fileName of flatFilesList) {
                let fileProcessId;
                if(gainsProcessFiles.indexOf(fileName) > -1)
                    continue;
                else if( !(fileName.includes('OAM_PROFILE')))
                    continue;
                else if(fileName.includes('DONE'))
                    continue;
                else if(fileName.split('.')[1] !== 'csv')
                    continue;
                else 
                    fileProcessId = await knex('gains_process_files').insert({
                        file_name: fileName
                    }).returning('id');
               
                await updateCustomers(fileName);
                await genereteHandBackFile(handBackFilesDir, fileName, fileProcessId[0]);
                await moveFlatFiles(flatFileDumpDir, fileName);
            };
            await resolveFlatFileProcess();
            process.send(['emailDetails', emailData]);
            process.send('exit');
        }
    })
}

function updateCustomers(fileName) {   
    return new Promise(async (resolve, reject) => {
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
                    // tier_id: tierId[0].id,
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
                        dbObject['first_name'] = knex.raw("AES_ENCRYPT('" + dbObject['oam_code'] + "', '" + encription_key + "')");
                        dbObject['first_name'] = knex.raw("AES_ENCRYPT('" + dbObject['first_name'] + "', '" + encription_key + "')");
                        dbObject['last_name'] = knex.raw("AES_ENCRYPT('" + dbObject['last_name'] + "', '" + encription_key + "')");
                        dbObject['email'] = knex.raw("AES_ENCRYPT('" + dbObject['email'] + "', '" + encription_key + "')");
                        dbObject['phone'] = knex.raw("AES_ENCRYPT('" + dbObject['phone'] + "', '" + encription_key + "')");
                        insertArray.push(dbObject);
                        customerIdArray.push(record.id);
                        emailData.push({
                            id: record['id'],
                            first_name: record['first_name'],
                            last_name: record['last_name'],
                            user_name: record['first_name']+" "+record['last_name'],
                            email: record['email'],
                            phone: record['phone'],
                            language_code: "EN"
                        });
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
                        emailData.push({
                            id: record['id'],
                            first_name: record['first_name'],
                            last_name: record['last_name'],
                            user_name: record['first_name']+" "+record['last_name'],
                            email: record['email'],
                            phone: record['phone'],
                            language_code: "EN"
                        });
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

    // let insertChunkSize = 100, deleteChunkSize = 100;
    // if(insertArray.length>0){
    //         for (let i = 0; i <= insertArray.length; i = (i + insertChunkSize)) {
    //         let customerId = await knex.batchInsert('customers', insertArray.slice(i, i + insertChunkSize), 100);
    //         await knex("cc_account_summary").insert({customer_id: customerId[0]});
    //     };
    // }
    if(insertArray.length>0){
        for (let i = 0; i < insertArray.length; i++) {
        let customerId = await knex("customers").insert(insertArray[i]);
        await knex("cc_account_summary").insert({customer_id: customerId[0]});
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

function getAllStaffIds() {
    return knex('customers').select({
        gains_staff_id: knex.raw('DISTINCT gains_staff_id')
    }).where('status',1);
}


function generateHandBackObject(record, error, status) {
    if (typeof error == 'object') error = JSON.stringify(error);
    record['process_date'] = new Date();
    record['process_status'] = status;
    record['process_error'] = error;
    handBackData.push(record);
    return;
}
function getTotalCommsion(record) {
    return (((Number(record['oam_commission'])+Number(record['owner_commission'])+Number(record['gain_commission']))>100) ? false : true);
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
async function getCountry(record){
    let columns = {
        id: "countries.id"
    }
    return await knex("countries").select(columns)
    .where("countries.code",record['country_code']);
}
function genereteHandBackFile(fileDir, worksheetName, fileProcessId) {
    console.log("")
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
            if(val.process_status == 'Failed')
                fileTotalErrors ++;
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
        .where('name','gains_customers');
}

function getgainsProcessFiles() {
    return knex('gains_process_files').select('file_name')
        .where('status',1);
}