
let fs = require('fs');
let xlsx = require('xlsx');
let path = require('path');
let Validator = require('validatorjs');
let uuid = require('uuid');
let mkdirp = require('mkdirp');
let sftpService = new (require('../services/sftp.service'))();
const errorResponse = require('../responses/gains.response');

let config = require("../../../../../config/config");
let parentStaffDir, handBackFilesDir, flatFileDumpDir;
let knex, gainsProcessFiles = [];
let handBackData = [];
let userTypeArray;
let globalAppRoot;
let encription_key = config.encription_key;
knex = require('../../../../../config/knex');
let emailData = [];
const CronNotifications = require('../../../../core/cron_notifications');
let processEnv = process.env.NODE_ENV;
let moment = require('moment');

module.exports = class UnitService {

    constructor() { }


    syncUnit(req, res) {
        return new Promise(async (resolve, reject) => {


            // parentStaffDir = path.join(appRoot, 'uploads/unit_flat_files/pending_files');
            // handBackFilesDir = path.join(appRoot, 'uploads/unit_flat_files/handback_files');
            // flatFileDumpDir = path.join(appRoot, 'uploads/unit_flat_files/archive_files');

            parentStaffDir = path.join(appRoot, 'uploads/flat_files/pending_files');
            handBackFilesDir = path.join(appRoot, 'uploads/flat_files/handback_files');
            flatFileDumpDir = path.join(appRoot, 'uploads/flat_files/archive_files');

            globalAppRoot = appRoot;
            // await sftpService.syncSftp(globalAppRoot, 'download', 'sync_customers');


            if (processEnv !== 'development') {
                await sftpService.syncSftp(globalAppRoot, 'download', 'UNIT_');
            }

            fs.readdir(parentStaffDir, async (err, flatFilesList) => {
                if (err) {
                    console.log('Unable to read file directory');
                    reject(err);

                } else {
                    let gainsProcessFilesArray = await getgainsProcessFiles();
                    for (let processFiles of gainsProcessFilesArray)
                        gainsProcessFiles.push(processFiles.file_name);

                    for (let fileName of flatFilesList) {
                        let fileProcessId;
                        if (gainsProcessFiles.indexOf(fileName) > -1)
                            continue;
                        else if (!(fileName.includes('UNIT_')))
                            continue;
                        else if (fileName.includes('DONE'))
                            continue;
                        else if (fileName.split('.')[1] !== 'csv')
                            continue;
                        else
                            fileProcessId = await knex('gains_process_files').insert({
                                file_name: fileName
                            })
                        let demo = await updateUnit(fileName, req, res);
                        await genereteHandBackFile(handBackFilesDir, fileName, fileProcessId[0]);
                        await moveFlatFiles(flatFileDumpDir, fileName);


                    }
                    resolve();
                }
            })
        })
    }
}



async function updateUnit(fileName, req, res) {
    userTypeArray = await getMaster('master_user_type');
    return new Promise(async (resolve, reject) => {
        console.log("req.activity_detail=", req.activity_detail);
        const notif_instance = new CronNotifications();
        await notif_instance.init_templates(req.activity_detail[0].id);

        let workBook = xlsx.readFile(parentStaffDir + '/' + fileName);
        let workSheet = workBook['Sheets'][Object.keys(workBook['Sheets'])[0]];
        let workSheetData = xlsx.utils.sheet_to_json(workSheet, { raw: false, defval: null, dateNF: 'yyyy-mm-dd' });

        let insertArray = [], updateArray = [], deleteArray = [];
        thankYouCustomerArray = [];

        let rules = {
            unit_code: 'required',
            unit_no: 'required',
            building_code: 'required',
            first_name: 'required',
            last_name: 'required',
            unit_type: ['required', { 'in': ['none', 'sale', 'rent', 'self_occupied', 'rent_occupied'] }],
            email: 'required',
            phone: 'required',

        };

        for (let record of workSheetData) {
            let validation = new Validator(record, rules);
            if (validation.passes() && !validation.fails()) {
                console.log("recordrecordrecordrecordrecord : ", record);
                let building_id = await knex("master_building").select({ id: 'master_building.id' })
                    .where("master_building.code", record['building_code']);

      
                let dbObject = {
                    unit_code: record.unit_code,
                    unit_no: record.unit_no,
                    building_id: (building_id.length > 0) ? building_id[0].id : null,
                    building_code: record.building_code,
                    unit_type: record.unit_type,
                    reference_number: record.reference_number
                };
                let obj = dbObject;

                if (record['birthday']) {

                    if (moment(new Date(record['birthday'])).isValid()) {
                        record["birthday"] = moment(new Date(record['birthday'])).format();
                    } else {
                        generateHandBackObject(record, errorResponse.failed('invalid_dates_format'), 'Failed');
                        continue;
                    }
                }



                if (record['anniversary']) {
              
                    if (moment(new Date(record['anniversary'])).isValid()) {
                        record["anniversary"] = moment(new Date(record['anniversary'])).format();
                    } else {
                        generateHandBackObject(record, errorResponse.failed('invalid_dates_format'), 'Failed');
                        continue;
                    }
                }






                let fieldExist = await checkRequiredFields(obj)
                if (!fieldExist.status) {
                    generateHandBackObject(record, errorResponse.failed(fieldExist.msg), 'Failed');
                    continue;
                }

                let data = await getUnitRecords(record);
                dbObject['id'] = data.unit_id;

                dbObject['customer_id'] = data.customer_id;


                if ((record.status).toUpperCase() == 'INSERT') {
                    if (dbObject['id'] != null) {
                        generateHandBackObject(record, errorResponse.failed('unit_already_exist'), 'Failed');
                        continue;
                    }
                    else {
                        delete dbObject['status'];
                        delete dbObject['country_id'];
                        // insertArray.push(dbObject);


                        await knex("master_unit").insert(dbObject);



                    };
                }
                else if ((record.status).toUpperCase() == 'DELETE') {
                    if (dbObject['id'] == null) {
                        generateHandBackObject(record, errorResponse.failed('record_not_found'), 'Failed');
                        continue;
                    } else deleteArray.push({ id: dbObject.id, c_id: dbObject.customer_id });
                }
                else if ((record.status).toUpperCase() == 'UPDATE') {
                    if ((dbObject['id'] == null)) {
                        generateHandBackObject(record, errorResponse.failed('record_not_found'), 'Failed');
                        continue;
                    } else {
                        let unitId = dbObject.id;
                        let cust_Id = dbObject.customer_id;
                        delete dbObject.id;
                        let dob_date = new Date(record["dob"]);
                        let cust_db_obj = {
                            first_name: knex.raw("AES_ENCRYPT('" + record["first_name"] + "', '" + encription_key + "')"),
                            last_name: knex.raw("AES_ENCRYPT('" + record["last_name"] + "', '" + encription_key + "')"),
                            dob: dob_date,
                            email: knex.raw("AES_ENCRYPT('" + record["email"] + "', '" + encription_key + "')"),
                            phone: knex.raw("AES_ENCRYPT('" + record["phone"] + "', '" + encription_key + "')"),
                            gender: record["gender"],
                            country_id: record["country_id"],
                            address_line1: record["address_line1"],
                            user_type_id: userTypeArray[0].id
                        }





                        emailData.push({
                            first_name: record['first_name'],
                            last_name: record['last_name'],
                            user_name: record['first_name'] + " " + record['last_name'],
                            email: record['email'],
                            phone: record['phone'],
                            language_code: "EN"
                        });
                        delete dbObject['country_id'];
                        await knex('master_unit').update(dbObject).where('id', unitId);
                        await knex('customers').update(cust_db_obj).where('id', cust_Id);
                    };
                };
                generateHandBackObject(record, '', 'Success');
            } else {
                generateHandBackObject(record, validation.errors.errors, 'Failed');
            }
        };
        // if (insertArray.length > 0) {
        //     for (let i = 0; i < insertArray.length; i++) {
        //         let Id = await knex("master_unit").insert(insertArray[i]);
        //     };



            for (let i = 0; i < emailData.length; i++) {
                console.log("Emaling....");

                let tenantCustomer = {
                    phone: emailData[i]['phone'],
                    email: emailData[i]['email'],
                    language_code: emailData[i]['language_code']
                };

                let templateDetails = {
                    user_name: emailData[i]['first_name'] + " " + emailData[i]['last_name'],
                    phone: emailData[i]['phone'],
                    email: emailData[i]['email'],
                    logo_url: config['base_url']
                };
                console.log("tenantCustomer=", tenantCustomer);
                console.log("templateDetails=", templateDetails);
                let data = { templateCode: 'ADDUNITOWNR', customerDetails: tenantCustomer, templateDetails };
                notif_instance.send_notifications(data)
                    .then(res => console.log(res)).catch(err => console.log(err));

            }



       // }
        if (deleteArray.length > 0) {

            for (let i = 0; i < deleteArray.length; i++) {
                let unit_id = deleteArray[i].id;
                let cust_id = deleteArray[i].c_id;

                await knex('master_unit').update('master_unit.status', 0)
                    .where('master_unit.id', unit_id);

                await knex('customers').update('customers.status', 0)
                    .where('customers.id', cust_id);
            };
        }
        resolve();
    });
}
function getMaster(table) {
    return knex(table).select({
        id: 'id',
        name: 'name'
    }).where('name', "OWNER")
        .andWhere("status", 1);
}

function checkRequiredFields(dbObject) {
    if (dbObject['building_id'] == null || dbObject['building_id'] == undefined || dbObject['building_id'] == '') {
        return ({ status: false, msg: "building_code_not_exist" });
    }
    // else if (dbObject['furnishing_id'] == null || dbObject['furnishing_id'] == undefined || dbObject['furnishing_id'] == '') {
    //     return ({ status: false, msg: "furnishing_code_not_exist" });
    // }
    // else if (dbObject['broker_id'] == null || dbObject['broker_id'] == undefined || dbObject['broker_id'] == '') {
    //     return ({ status: false, msg: "broker_code_not_exist" });
    // }
    else {
        return ({ status: true, msg: "" });
    }
}

async function getUnitRecords(record) {
    let columns = {
        id: "master_unit.id",
        customer_id: "master_unit.customer_id"
    }
    let findOn = record['unit_code'].trim();

    let _ids = await knex("master_unit").select(columns)
        .where("master_unit.unit_code", findOn);

    let unit_ids = await knex("master_unit").select(columns)
        .where("master_unit.unit_no", record['unit_no'])
        .andWhere("master_unit.building_code",record['building_code']);    

    if (_ids.length > 0) {
        console.log("1*");
        return ({ unit_id: _ids[0].id, customer_id: _ids[0].customer_id });
    }else if (unit_ids.length > 0){
        console.log("2*");
        return ({ unit_id: unit_ids[0].id, customer_id: unit_ids[0].customer_id });
    }
    else if (record.status.toUpperCase() == "INSERT") {

        let cust_id = await knex("customers").select({ id: 'customers.id' })
            .whereRaw("CAST(AES_DECRYPT(customers.email,'" + encription_key + "') AS CHAR(255)) = '" + record['email'] + "'")
            .orWhereRaw("CAST(AES_DECRYPT(customers.phone,'" + encription_key + "') AS CHAR(255)) = '" + record['phone'] + "'")



        if (cust_id.length > 0) {
            return ({ unit_id: null, customer_id: cust_id[0].id });
        } else {
            let dob_date = new Date(record["dob"]);
            let member_no = Math.floor(1000000000 + Math.random() * 9000000000);
            let childern_edges = (record['children_age'] != null && record['children_age'] != undefined && record['children_age'] != "") ? record['children_age'].split("|") : "";
            let cust_db_obj = {
                customer_unique_id: knex.raw("AES_ENCRYPT('" + (member_no) + "', '" + encription_key + "')"),
                first_name: knex.raw("AES_ENCRYPT('" + record["first_name"] + "', '" + encription_key + "')"),
                last_name: knex.raw("AES_ENCRYPT('" + record["last_name"] + "', '" + encription_key + "')"),
                dob: dob_date,
                email: knex.raw("AES_ENCRYPT('" + record["email"] + "', '" + encription_key + "')"),
                phone: knex.raw("AES_ENCRYPT('" + record["phone"] + "', '" + encription_key + "')"),
                gender: record["gender"],
                country_id: record["country_id"],
                address_line1: record["address_line1"],
                user_type_id: userTypeArray[0].id,

                spouse_name: record.spouse_name,
                children: record.children,
                fav_cuisine: record.fav_cuisine,
                fav_hotel: record.fav_hotel,
                fav_travel_destination: record.fav_travel_destination,
                annual_household_income: record.annual_household_income,
                anniversary: record.anniversary,
                birthday: record.birthday,
                children_age: childern_edges.toString(),
                brand_suggestion: record.brand_suggestion,
            }
            emailData.push({
                first_name: record['first_name'],
                last_name: record['last_name'],
                user_name: record['first_name'] + " " + record['last_name'],
                email: record['email'],
                phone: record['phone'],
                language_code: "EN"
            });
            let customerId = await knex('customers').insert(cust_db_obj).returning('id');
            await knex("cc_account_summary").insert({ customer_id: customerId[0] });
            return ({ unit_id: null, customer_id: customerId[0] });
        }

    } else {
        return ({ unit_id: null, customer_id: null });
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


        if (processEnv !== 'development')
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

        if (processEnv !== 'development')
            await sftpService.syncSftp(globalAppRoot, 'upload', 'handback',
                worksheetName.split('.csv')[0] + '_DONE.csv');

        resolve();
    })
}



