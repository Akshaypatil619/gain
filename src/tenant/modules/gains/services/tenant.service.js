
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
let tenant_model = new (require("../../../../tenant/modules/tenant/models/tenant.mysql"))();
let sftpService = new (require('../services/sftp.service'))();
knex = require('../../../../../config/knex');
const CronNotifications = require('../../../../core/cron_notifications');
module.exports = class TenantService {

    constructor() { }


    syncTenant(req, res) {
        let emailData;
        return new Promise(async (resolve, reject) => {
            parentStaffDir = path.join(appRoot, 'uploads/flat_files/pending_files');
            handBackFilesDir = path.join(appRoot, 'uploads/flat_files/handback_files');
            flatFileDumpDir = path.join(appRoot, 'uploads/flat_files/archive_files');

          

            globalAppRoot = appRoot;
            if(process.env.NODE_ENV !== 'development'){
                await sftpService.syncSftp(globalAppRoot, 'download', 'TENANT_');
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
                        else if( !(fileName.includes('TENANT_')))
                            continue;
                        else if (fileName.includes('DONE'))
                            continue;
                        else if (fileName.split('.')[1] !== 'csv')
                            continue;
                        else
                            fileProcessId = await knex('gains_process_files').insert({
                                file_name: fileName
                            });

                       emailData = await updateTenant(fileName,req, res);
                        await genereteHandBackFile(handBackFilesDir, fileName, fileProcessId[0]);
                        await moveFlatFiles(flatFileDumpDir, fileName);
                    }
                   return resolve(emailData);

                }


            })



        })

    }
}



function updateTenant(fileName,req, res) {
    let emailData = [];
    return new Promise(async (resolve, reject) => {
        const notif_instance = new CronNotifications();
		await notif_instance.init_templates(req.activity_detail[0].id);
        let workBook = xlsx.readFile(parentStaffDir + '/' + fileName,{type:'binary',cellText:false,cellDates:true});
        let workSheet = workBook['Sheets'][Object.keys(workBook['Sheets'])[0]];
        let workSheetData = xlsx.utils.sheet_to_json(workSheet, { raw:false,dateNF:'yyyy-mm-dd',  defval: null });
        let insertArray = [], updateArray = [], deleteArray = [];
        thankYouCustomerArray = [];

        let rules = {
            building_code: 'required',
            unit_no: 'required',
            first_name: 'required',
            last_name: 'required',
            email: 'required',
            phone: 'required',
            status: 'required'
        };

        for (let record of workSheetData) {
            let validation = new Validator(record, rules);
            if (validation.passes() && !validation.fails()) {
                if(record['tenant_joining_date']==null || record['tenant_joining_date']==undefined || record['tenant_joining_date']=="" || record['tenant_joining_date']==NaN || record['tenant_joining_date']=="NaN" || isNaN(record['tenant_joining_date'])){
                    record['tenant_joining_date'] = new Date();
                }
                record['tenant_joining_date'] = new Date(record['tenant_joining_date']);
                let joiningDate = new Date(record['tenant_joining_date']);
                joiningDate = new Date(joiningDate.setFullYear(joiningDate.getFullYear()+1));
                if(record['tenant_leaving_date']==null || record['tenant_leaving_date']==undefined || record['tenant_leaving_date']=="" || record['tenant_leaving_date']==NaN || record['tenant_leaving_date']=="NaN" || isNaN(record['tenant_leaving_date'])){
                    record['tenant_leaving_date'] = joiningDate;
                }
                let dbObject = {
                    building_code: record['building_code'],
                    unit_no: record['unit_no'],
                    first_name: record['first_name'],
                    last_name: record['last_name'],
                    email: record['email'],
                    phone: record['phone'],
                    tenant_joining_date: record['tenant_joining_date'],
                    tenant_leaving_date: record['tenant_leaving_date'],
                    tenant_remark: record['tenant_remark'],
                    birthday: record['birthday'],
                    anniversary: record['anniversary'],
                    spouse_name: record['spouse_name'],
                    children: record['children'],
                    fav_cuisine: record['fav_cuisine'],
                    fav_hotel: record['fav_hotel'],
                    fav_travel_destination: record['fav_travel_destination'],
                    annual_household_income: record['annual_household_income'],
                    children_age: (record['children_age'] !=null && record['children_age'] !=undefined && record['children_age'] !="") ? record['children_age'].split("|") : "",
                    brand_suggestion: record.brand_suggestion,
                    status: record['status']
                };
                
                let building = await knex("master_building").select({ id: 'master_building.id' })
                              .where("master_building.code", record['building_code']);
                     dbObject['building_id'] = (building.length > 0) ? building[0].id : null;

                if(dbObject['building_id']==null){
                    generateHandBackObject(record, errorResponse.failed('building_code_not_exist'), 'Failed');
                    continue;
                } else {
                    let unit = await knex("master_unit").select({ id: 'master_unit.id' })
                    .where("master_unit.unit_no", record['unit_no']).andWhere("master_unit.building_id",dbObject['building_id']);
                    dbObject['unit_id'] = (unit.length > 0) ? unit[0].id : null;
                }
                if ((dbObject['unit_id'] == null)) {
                    generateHandBackObject(record, errorResponse.failed('unit_no_not_exist'), 'Failed');
                    continue;
                }
                
               if ((record.status).toUpperCase() == 'INSERT') {
                    let customer_id=null;
                        delete dbObject['building_code'];
                        delete dbObject['unit_no'];
                        delete dbObject['building_id'];
                        delete dbObject['status'];
                        
                        tenantEmail = await knex("customers").select({id: "customers.id"}).whereRaw("CAST(AES_DECRYPT(customers.email,'" + encription_key + "') AS CHAR(255))='"+ dbObject['email']+"'");
                        dbObject['id'] = (tenantEmail.length > 0) ? tenantEmail[0].id : null;
                        if ((dbObject['id'] != null)) {
                            generateHandBackObject(record, errorResponse.failed('tenant_email_exist'), 'Failed');
                            continue;
                        }
                        tenantPhone = await knex("customers").select({id: "customers.id"}).whereRaw("CAST(AES_DECRYPT(customers.phone,'" + encription_key + "') AS CHAR(255))='"+ dbObject['phone']+"'")
                        dbObject['id'] = (tenantPhone.length > 0) ? tenantPhone[0].id : null;
        
                        if ((dbObject['id'] != null)) {
                            generateHandBackObject(record, errorResponse.failed('tenant_mobile_exist'), 'Failed');
                            continue;
                        }

                        let custDetails = await knex('customers').select('customers.id as id', 'master_user_type.code as user_type')
                            .join('master_user_type', 'master_user_type.id', 'customers.user_type_id')
                            .join('master_unit', 'master_unit.customer_id', 'customers.id')
                            .where("master_unit.id",dbObject['unit_id']);
                        if (!custDetails.length){
                            generateHandBackObject(record, errorResponse.failed('owner_not_exist'), 'Failed');
                            continue;
                        }
                        custDetails = custDetails[0];
                        if (custDetails.user_type == 'tenant'){
                            generateHandBackObject(record, errorResponse.failed('incorrect_user_type'), 'Failed');
                                continue;
                        }
                        customer_id = custDetails.id;
                        let family_customer_id = null;
                        if (custDetails.user_type == 'family') {
                            family_customer_id = customer_id;
                           const referrerDetails = await knex('customers').select({
                                referrer_id: 'customers.referrer_id',
                                referrer_user_type: 'master_user_type.code'
                            }).join('customers as rc', 'rc.id', 'customers.referrer_id')
                                .join('master_user_type', 'master_user_type.id', 'rc.user_type_id')
                                .where('customers.id', customer_id);
        
                            if (!referrerDetails.length || !referrerDetails[0].referrer_id){
                                generateHandBackObject(record, errorResponse.failed('incorrect_user_type'), 'Failed');
                                continue;
                            }
                            customer_id = referrerDetails[0].referrer_id;
                            let referrer_user_type = referrerDetails[0].referrer_user_type;
                            if (referrer_user_type == 'tenant'){
                                generateHandBackObject(record, errorResponse.failed('incorrect_user_type'), 'Failed');
                                continue;
                            }
                        }
                        let unitDetails = await tenant_model.get_rent_unit_list(customer_id, dbObject.unit_id);
                    if (!unitDetails.length) {
                        generateHandBackObject(record, errorResponse.failed('unit_no_not_exist'), 'Failed');
                        continue;
                    }
                    if (unitDetails[0].tenant_staying_dates.length > 0) {
                        const usedDates = unitDetails[0].tenant_staying_dates;
                        const requestedJoiningDate = new Date(dbObject.tenant_joining_date);
                        const requestedLeavingDate = new Date(dbObject.tenant_leaving_date);
                        let isInvalidDate = false;
    
                        for (let date of usedDates) {
                            const tenant_joining_date = new Date(date.tenant_joining_date);
                            const tenant_leaving_date = new Date(date.tenant_leaving_date);
    
                            if (requestedJoiningDate > tenant_joining_date) {
                                if (!(requestedJoiningDate > tenant_leaving_date))
                                    isInvalidDate = true;
                            } else if (requestedJoiningDate < tenant_joining_date) {
                                if (!(requestedLeavingDate < tenant_joining_date))
                                    isInvalidDate = true;
                            } else isInvalidDate = true;
    
                            if (isInvalidDate) break;
                        }
                        if (isInvalidDate){
                            generateHandBackObject(record, errorResponse.failed('tenant_staying_date_overlapped'), 'Failed');
                            continue;
                        } 
                    }
                    const check_tenant = await tenant_model.add_tenant("add_tenant_exist", dbObject);
                    if (check_tenant.length > 0){
                        generateHandBackObject(record, errorResponse.failed('tenant_exist'), 'Failed');
                        continue;
                    } else {
                        emailData.push({
                            user_name: dbObject['first_name']+" "+dbObject['last_name'],
                            phone: dbObject['phone'],
                            email: dbObject['email'],
                            unit_id: dbObject['unit_id']
                        });
                        let insert_tenant_data = await format_insert_tenant(dbObject);
                        await knex("customers").insert(insert_tenant_data);
                        let tenantCustomer = {
                            phone: dbObject['phone'],
                            email: dbObject['email'],
                            language_code: "EN"
                        };
                        let templateDetails = {
                            user_name: dbObject['first_name']+" "+dbObject['last_name'],
                            phone: dbObject['phone'],
                            email: dbObject['email'],
                            logo_url: config['base_url']
                        }; 
                        let data = { templateCode: 'SYNCTNT', customerDetails: tenantCustomer, templateDetails };
                        notif_instance.send_notifications(data)
                                                .then(res => console.log(res)).catch(err => console.log(err));
                        let ownerColumns = {
                            first_name: knex.raw("CAST(AES_DECRYPT(customers.first_name,'"+ encription_key +"') AS CHAR(255))"),
                            last_name: knex.raw("CAST(AES_DECRYPT(customers.last_name,'"+ encription_key +"') AS CHAR(255))"),
                            phone: knex.raw("CAST(AES_DECRYPT(customers.phone,'" + encription_key + "')AS CHAR(255))"),
                            email: knex.raw("CAST(AES_DECRYPT(customers.email,'" + encription_key + "')AS CHAR(255))"),
                        };
                        let ownerDeails = await knex("master_unit").select(ownerColumns).join("customers", "customers.id", "=", "master_unit.customer_id").where("master_unit.id",dbObject['unit_id']);
                        if(ownerDeails.length>0){
                            let ownerCustomer = {
                                phone: ownerDeails[0]['phone'],
                                email: ownerDeails[0]['email'],
                                language_code: "EN",
                            };

                            templateDetails['user_name'] = ownerDeails[0]['first_name']+" "+ownerDeails[0]['last_name'];
                            templateDetails['phone'] = ownerDeails[0]['phone'];
                            templateDetails['email'] = ownerDeails[0]['email'];
                            templateDetails['logo_url'] = config['base_url'];
                            notif_instance.send_notifications({ templateCode: 'SYNCTNTOWNER', customerDetails: ownerCustomer, templateDetails })
                                                    .then(res => console.log(res)).catch(err => console.log(err));
                         }
                    }
                }
                else if ((record.status).toUpperCase() == 'DELETE') {
                    tenantEmail = await knex("customers").select({id: "customers.id"}).whereRaw("CAST(AES_DECRYPT(customers.email,'" + encription_key + "') AS CHAR(255))='"+ dbObject['email']+"'");
                        dbObject['id'] = (tenantEmail.length > 0) ? tenantEmail[0].id : null;
                        if ((dbObject['id'] == null)) {
                            generateHandBackObject(record, errorResponse.failed('record_not_found'), 'Failed');
                            continue;
                    
                        } else deleteArray.push({ id: dbObject.id });
                }
                else if ((record.status).toUpperCase() == 'UPDATE') {
                     
                        tenantEmail = await knex("customers").select({id: "customers.id"}).whereRaw("CAST(AES_DECRYPT(customers.email,'" + encription_key + "') AS CHAR(255))='"+ dbObject['email']+"'");
                        dbObject['id'] = (tenantEmail.length > 0) ? tenantEmail[0].id : null;
                        if ((dbObject['id'] == null)) {
                            generateHandBackObject(record, errorResponse.failed('record_not_found'), 'Failed');
                            continue;
                        }
                        tenantPhone = await knex("customers").select({id: "customers.id"}).whereRaw("CAST(AES_DECRYPT(customers.phone,'" + encription_key + "') AS CHAR(255))='"+ dbObject['phone']+"'").andWhereNot("customers.id",dbObject['id']);
                        if ((tenantPhone.length>0)) {
                            generateHandBackObject(record, errorResponse.failed('tenant_mobile_exist'), 'Failed');
                            continue;
                        }
                        
                        let customer_id;
                        let tenantId = dbObject.id;
                        delete dbObject['building_code'];
                        delete dbObject['unit_no'];
                        delete dbObject['building_id'];
                        delete dbObject['status'];

                        let custDetails = await knex('customers').select('customers.id as id', 'master_user_type.code as user_type')
                        .join('master_user_type', 'master_user_type.id', 'customers.user_type_id')
                        .join('master_unit', 'master_unit.customer_id', 'customers.id')
                        .where("master_unit.id",dbObject['unit_id']);
                    if (!custDetails.length){
                        generateHandBackObject(record, errorResponse.failed('owner_not_exist'), 'Failed');
                        continue;
                    }
                    custDetails = custDetails[0];
                    if (custDetails.user_type == 'tenant'){
                        generateHandBackObject(record, errorResponse.failed('incorrect_user_type'), 'Failed');
                            continue;
                    }
                    customer_id = custDetails.id;
                    let family_customer_id = null;
                    if (custDetails.user_type == 'family') {
                        family_customer_id = customer_id;
                       const referrerDetails = await knex('customers').select({
                            referrer_id: 'customers.referrer_id',
                            referrer_user_type: 'master_user_type.code'
                        }).join('customers as rc', 'rc.id', 'customers.referrer_id')
                            .join('master_user_type', 'master_user_type.id', 'rc.user_type_id')
                            .where('customers.id', customer_id);
    
                        if (!referrerDetails.length || !referrerDetails[0].referrer_id){
                            generateHandBackObject(record, errorResponse.failed('incorrect_user_type'), 'Failed');
                            continue;
                        }
                        customer_id = referrerDetails[0].referrer_id;
                        let referrer_user_type = referrerDetails[0].referrer_user_type;
                        if (referrer_user_type == 'tenant'){
                            generateHandBackObject(record, errorResponse.failed('incorrect_user_type'), 'Failed');
                            continue;
                        }
                    }
                    const tenantDetails = await tenant_model.edit_tenant("edit_tenant_exist", dbObject);
               
                    if (!tenantDetails.length){
                        generateHandBackObject(record, errorResponse.failed('tenant_not_exist'), 'Failed');
                        continue;
                    }

                    let unitDetails = await tenant_model.get_rent_unit_list(customer_id, dbObject.unit_id);
                        if (!unitDetails.length) {
                            generateHandBackObject(record, errorResponse.failed('unit_no_not_exist'), 'Failed');
                            continue;
                        }
                    if (unitDetails[0].tenant_staying_dates.length > 0) {
                        const usedDates = unitDetails[0].tenant_staying_dates;
                        const requestedJoiningDate = new Date(dbObject.tenant_joining_date);
                        const requestedLeavingDate = new Date(dbObject.tenant_leaving_date);
                        let isInvalidDate = false;

                        for (let date of usedDates) {
                            const tenant_joining_date = new Date(date.tenant_joining_date);
                            const tenant_leaving_date = new Date(date.tenant_leaving_date);

                            if (requestedJoiningDate > tenant_joining_date) {
                                if (!(requestedJoiningDate > tenant_leaving_date))
                                    isInvalidDate = true;
                            } else if (requestedJoiningDate < tenant_joining_date) {
                                if (!(requestedLeavingDate < tenant_joining_date))
                                    isInvalidDate = true;
                            } else isInvalidDate = true;

                            if (isInvalidDate) break;
                        }
                        if (isInvalidDate){
                            generateHandBackObject(record, errorResponse.failed('tenant_staying_date_overlapped'), 'Failed');
                            continue;
                        } 
                    }
                    emailData.push({
                        user_name: dbObject['first_name']+" "+dbObject['last_name'],
                        phone: dbObject['phone'],
                        email: dbObject['email'],
                        unit_id: dbObject['unit_id']
                    }); 
                    let update_tenant_data = await format_update_tenant(dbObject);
                        await knex('customers').update(update_tenant_data).where('id', tenantId);
                };
                generateHandBackObject(record, '', 'Success');
            } else {
                generateHandBackObject(record, validation.errors.errors, 'Failed');
            }
        };


        if (insertArray.length > 0) {
            // for (let i = 0; i < insertArray.length; i++) {
            //     let record = insertArray[i];
                
            // };
        }
        if (deleteArray.length > 0) {
            for (let i = 0; i < deleteArray.length; i++) {
                let _id = deleteArray[i].id;
                await knex('customer').update('customer.status', 0)
                    .where('customer.id', _id);
            };
        }
        resolve(emailData);
    });
}


async function format_insert_tenant(record){
    let userTypeId = await knex('master_user_type').select('id').where('master_user_type.name',"Tenant");
    return {
        customer_unique_id: knex.raw("AES_ENCRYPT('" + (Math.floor(1000000000 + Math.random() * 9000000000)) + "', '" + encription_key + "')"),
        first_name: knex.raw("AES_ENCRYPT('" + record['first_name'] + "', '" + encription_key + "')"),
        last_name: knex.raw("AES_ENCRYPT('" + record['last_name'] + "', '" + encription_key + "')"),
        email: knex.raw("AES_ENCRYPT('" + record['email'] + "', '" + encription_key + "')"),
        phone: knex.raw("AES_ENCRYPT('" + record['phone'] + "', '" + encription_key + "')"),
        tenant_remark:record.tenant_remark,
        unit_id:record.unit_id,
        tenant_joining_date:record.tenant_joining_date,
        tenant_leaving_date:record.tenant_leaving_date,
        user_type_id: Number(userTypeId[0]['id']),
        status: 1,
        birthday: record.birthday,
        anniversary: record.anniversary,
        spouse_name: record.spouse_name,
        children: record.children,
        fav_cuisine: record.fav_cuisine,
        fav_hotel: record.fav_hotel,
        fav_travel_destination: record.fav_travel_destination,
        annual_household_income: record.annual_household_income,
        children_age: record.children_age.toString(),
        brand_suggestion: record.brand_suggestion
    }
}

async function format_update_tenant(record){
    return {
        id:record.id,
        first_name: knex.raw("AES_ENCRYPT('" + record['first_name'] + "', '" + encription_key + "')"),
        last_name: knex.raw("AES_ENCRYPT('" + record['last_name'] + "', '" + encription_key + "')"),
        phone: knex.raw("AES_ENCRYPT('" + record['phone'] + "', '" + encription_key + "')"),
        tenant_remark:record.tenant_remark,
        tenant_joining_date:record.tenant_joining_date,
        tenant_leaving_date:record.tenant_leaving_date,
        status: 1,
        birthday: record.birthday,
        anniversary: record.anniversary,
        spouse_name: record.spouse_name,
        children: record.children,
        fav_cuisine: record.fav_cuisine,
        fav_hotel: record.fav_hotel,
        fav_travel_destination: record.fav_travel_destination,
        annual_household_income: record.annual_household_income,
        children_age: record.children_age.toString(),
        brand_suggestion: record.brand_suggestion
    }
}


function getgainsProcessFiles() {
    return knex('gains_process_files').select('file_name')
        .where('status', 1);
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



