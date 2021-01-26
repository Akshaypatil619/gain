
let fs = require('fs');
let xlsx = require('xlsx');
let path = require('path');
let Validator = require('validatorjs');
let mkdirp = require('mkdirp');

const errorResponse = require('../responses/gains.response');
let sftpService = new (require('../services/sftp.service'))();
let config = require("../../../../../config/config");
let parentStaffDir, handBackFilesDir, flatFileDumpDir;
let knex, gainsProcessFiles = [];
let handBackData = []
let globalAppRoot;
knex = require('../../../../../config/knex')
let processEnv = process.env.NODE_ENV;
module.exports = class BuildingService {

    constructor() { }


    syncBuilding() {
        return new Promise(async (resolve, reject) => {
            // parentStaffDir = path.join(appRoot, 'uploads/building_flat_files/pending_files');
            // handBackFilesDir = path.join(appRoot, 'uploads/building_flat_files/handback_files');
            // flatFileDumpDir = path.join(appRoot, 'uploads/building_flat_files/archive_files');

            parentStaffDir = path.join(appRoot, 'uploads/flat_files/pending_files');
            handBackFilesDir = path.join(appRoot, 'uploads/flat_files/handback_files');
            flatFileDumpDir = path.join(appRoot, 'uploads/flat_files/archive_files');


            globalAppRoot = appRoot;
            if (processEnv !== 'development') {
                await sftpService.syncSftp(globalAppRoot, 'download', 'BUILDING_');
            }

            fs.readdir(parentStaffDir, async (err, flatFilesList) => {
                if (err) {
                    console.log('Unable to read file directory');
                    // process.send('err');
                    reject(err);

                } else {
                    console.log("files=", flatFilesList);
                    let gainsProcessFilesArray = await getgainsProcessFiles();
                    console.log("gainsProcessFilesArray=", gainsProcessFilesArray);
                    for (let processFiles of gainsProcessFilesArray)
                        gainsProcessFiles.push(processFiles.file_name);

                    for (let fileName of flatFilesList) {
                        console.log("fileNamess=", fileName);

                        let fileProcessId;
                        if (gainsProcessFiles.indexOf(fileName) > -1)
                            continue;
                        // else if( !(fileName.includes('OAM_PROFILE')))
                        //     continue;
                        else if (fileName.includes('DONE'))
                            continue;
                        else if (fileName.split('.')[1] !== 'csv')
                            continue;
                        else
                            fileProcessId = await knex('gains_process_files').insert({
                                file_name: fileName
                            }).returning('id');

                        await updateBuilding(fileName);
                        await genereteHandBackFile(handBackFilesDir, fileName, fileProcessId[0]);
                        await moveFlatFiles(flatFileDumpDir, fileName);


                    }


                    if (flatFilesList.length == 0) {
                        resolve("File not found");
                    } else {
                        resolve("File process done");
                    }


                }


            })



        })

    }
}



function updateBuilding(fileName) {
    return new Promise(async (resolve, reject) => {

        let workBook = xlsx.readFile(parentStaffDir + '/' + fileName);
        let workSheet = workBook['Sheets'][Object.keys(workBook['Sheets'])[0]];
        let workSheetData = xlsx.utils.sheet_to_json(workSheet, { raw: true, defval: null });
        let insertArray = [], updateArray = [], deleteArray = [];
        thankYouCustomerArray = [];

        let rules = {
            building_name: 'required',
            building_code: 'required',
            property_code: 'required',

        };

        for (let record of workSheetData) {
            let validation = new Validator(record, rules);
            if (validation.passes() && !validation.fails()) {
                let building = await getBuildingRecords(record);


                let property_type_code_id = await knex("master_property").select({ id: 'master_property.id' })
                    .where("master_property.property_code", record['property_code'])


                record['id'] = (building.length > 0) ? building[0].id : null;


                let dbObject = {
                    id: record.id,
                    code: record.building_code,
                    name: record.building_name,
                    property_id: (property_type_code_id.length > 0) ? property_type_code_id[0].id : null,
                    property_code: record.property_code
                };







                let broker_code = [];
                let broker_data = [];
                let broker_status = true;
                if (record.broker_code !== undefined && record.broker_code !== null && record.broker_code !== "") {
                    broker_code = record.broker_code.split(",");
                    for (let i = 0; i < broker_code.length; i++) {
                        let _id = await knex("master_broker").select({ id: 'master_broker.id' })
                            .where("master_broker.broker_code", broker_code[i]);
                        let aid = JSON.parse(JSON.stringify(_id));
                        // console.log("amnty_id==>", aid);
                        if (aid.length > 0) {

                            broker_data.push(aid[0].id);
                        } else {
                            broker_status = false;
                            break;
                        }

                    }
                }

                dbObject["broker_code"] = broker_data;





                let obj = dbObject;
                let fieldExist = await checkRequiredFields(obj)
                if (!fieldExist.status) {
                    generateHandBackObject(record, errorResponse.failed(fieldExist.msg), 'Failed');
                    continue;
                }



                if (!broker_status) {
                    generateHandBackObject(record, errorResponse.failed('broker_not_exist'), 'Failed');
                    continue;
                }




                if ((record.status).toUpperCase() == 'INSERT') {

                    if (dbObject['id'] != null) {

                        generateHandBackObject(record, errorResponse.failed('property_already_present'), 'Failed');
                        continue;
                    }

                    else {
                        delete dbObject['id'];
                        delete dbObject['status'];

                        let broker_code = dbObject["broker_code"];
                        delete dbObject["broker_code"];
                        let Id = await knex("master_building").insert(dbObject);


                        if (broker_code.length > 0) {
                            console.log("broker_code***");

                            for (let j = 0; j < broker_code.length; j++) {
                                let obj = { building_id: Id, broker_id: broker_code[j], status: 1 };
                                await knex("building_has_brokers").insert(obj);
                            }






                        };






                    };
                }
                else if ((record.status).toUpperCase() == 'DELETE') {

                    if (record['id'] == null) {

                        generateHandBackObject(record, errorResponse.failed('record_not_found'), 'Failed');
                        continue;
                    } else deleteArray.push(dbObject.id);
                }
                else if ((record.status).toUpperCase() == 'UPDATE') {

                    if ((record['id'] == null)) {
                        generateHandBackObject(record, errorResponse.failed('record_not_found'), 'Failed');
                        continue;
                    } else {

                        let buildingId = dbObject.id;
                        delete dbObject.id;


                        await knex('master_building').update(dbObject).where('id', buildingId);
                    };
                };
                generateHandBackObject(record, '', 'Success');
            } else {


                generateHandBackObject(record, validation.errors.errors, 'Failed');
            }
        };


        // if (insertArray.length > 0) {
        //     console.log("insertArray=", insertArray);
        //     for (let i = 0; i < insertArray.length; i++) {
        //         let broker_code = insertArray[i].broker_code;
        //         delete insertArray[i].broker_code
        //         let Id = await knex("master_building").insert(insertArray[i]);


        //         if (broker_code.length > 0) {
        //             console.log("broker_code***");

        //             for (let j = 0; j < broker_code.length; j++) {
        //                 let obj = { building_id: Id, broker_id: broker_code[j], status: 1 };
        //                 await knex("building_has_brokers").insert(obj);
        //             }


        //         }



        //     };
        // }
        if (deleteArray.length > 0) {

            for (let i = 0; i < deleteArray.length; i++) {
                let delete_id = deleteArray[i];

                let id = await knex('master_building').update('master_building.status', 0)
                    .where('master_building.id', delete_id);



            };
        }
        resolve();
    });
}


function checkRequiredFields(dbObject) {
    if (dbObject['property_id'] == null || dbObject['property_id'] == undefined || dbObject['property_id'] == '') {
        return ({ status: false, msg: "property_code_not_exist" });

    } else {
        return ({ status: true, msg: "" });
    }
}

async function getBuildingRecords(record) {
    let columns = {
        id: "master_building.id"
    }
    let findOn = record['building_code'].trim();

    if (record.status.toUpperCase() == "INSERT") {
        return await knex("master_building").select(columns)
            .where("master_building.code", findOn)
    } else if (record.status.toUpperCase() == "UPDATE") {

        return await knex("master_building").select(columns)
            .where("master_building.code", findOn)

    } else {
        return await knex("master_building").select(columns)
            .where("master_building.code", findOn)
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
    console.log("")
    return new Promise(async resolve => {
        let jsonData;
        fileDir = fileDir;
        if (!fs.existsSync(fileDir))
            mkdirp.sync(fileDir);


        jsonData = handBackData;
        console.log("handBackData=", handBackData);
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

        console.log("dumpData=", JSON.stringify(dumpData));
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