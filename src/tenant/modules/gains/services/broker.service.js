
let fs = require('fs');
let xlsx = require('xlsx');
let path = require('path');
let Validator = require('validatorjs');
let mkdirp = require('mkdirp');

const errorResponse = require('../responses/gains.response');

let config = require("../../../../../config/config");
let parentStaffDir, handBackFilesDir, flatFileDumpDir;
let knex, gainsProcessFiles = [];
let handBackData = []
let globalAppRoot;
knex = require('../../../../../config/knex');
module.exports = class BrokerService {

    constructor() { }


    syncBroker() {
        return new Promise((resolve, reject) => {
            parentStaffDir = path.join(appRoot, 'uploads/broker_flat_files/pending_files');
            handBackFilesDir = path.join(appRoot, 'uploads/broker_flat_files/handback_files');
            flatFileDumpDir = path.join(appRoot, 'uploads/broker_flat_files/archive_files');


            globalAppRoot = appRoot;


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

                        await updateBroker(fileName);
                        await genereteHandBackFile(handBackFilesDir, fileName, fileProcessId[0]);
                        await moveFlatFiles(flatFileDumpDir, fileName);


                    }
                    resolve("done");

                }


            })



        })

    }
}



function updateBroker(fileName) {
    return new Promise(async (resolve, reject) => {

        let workBook = xlsx.readFile(parentStaffDir + '/' + fileName);
        let workSheet = workBook['Sheets'][Object.keys(workBook['Sheets'])[0]];
        let workSheetData = xlsx.utils.sheet_to_json(workSheet, { raw: true, defval: null });
        let insertArray = [], updateArray = [], deleteArray = [];
        thankYouCustomerArray = [];

        let rules = {
            name: 'required',
            email: 'required',
            phone: 'required',
            role_id: 'required',
            orn_number: 'required',
            address: 'required',
            experience: 'required',
            image_path: 'required',
            languages: 'required',

        };

        for (let record of workSheetData) {
            let validation = new Validator(record, rules);
            if (validation.passes() && !validation.fails()) {


                let dbObject = {
                    name: record['name'],
                    email: record['email'],
                    phone: record['phone'],
                    role_id: record['role_id'],
                    orn_number: record['orn_number'],
                    address: record['address'],
                    experience: record['experience'],
                    image_path: record['image_path'],
                    languages: record['languages'],
                };


                let broker_id = await knex("master_broker").select({ id: 'master_broker.id' })
                    .where("master_broker.email", record['email']);
                dbObject['id'] = (broker_id.length > 0) ? broker_id[0].id : null;





              

                if ((record.status).toUpperCase() == 'INSERT') {

                    if (dbObject['id'] != null) {

                        generateHandBackObject(record, errorResponse.failed('broker_already_exist'), 'Failed');
                        continue;
                    }

                    else {

                        delete dbObject['status'];
                        delete dbObject['id'];
                        insertArray.push(dbObject);

                    };
                }
                else if ((record.status).toUpperCase() == 'DELETE') {

                    if (dbObject['id'] == null) {

                        generateHandBackObject(record, errorResponse.failed('record_not_found'), 'Failed');
                        continue;
                    } else deleteArray.push({ id: dbObject.id });
                }
                else if ((record.status).toUpperCase() == 'UPDATE') {

                    if ((dbObject['id'] == null)) {
                        generateHandBackObject(record, errorResponse.failed('record_not_found'), 'Failed');
                        continue;
                    } else {

                        let brokerId = dbObject.id;

                        delete dbObject.id;

                        await knex('master_broker').update(dbObject).where('id', brokerId);

                    };
                };
                generateHandBackObject(record, '', 'Success');
            } else {


                generateHandBackObject(record, validation.errors.errors, 'Failed');
            }
        };


        if (insertArray.length > 0) {

            for (let i = 0; i < insertArray.length; i++) {

                let Id = await knex("master_broker").insert(insertArray[i]);


            };
        }
        if (deleteArray.length > 0) {
         
            for (let i = 0; i < deleteArray.length; i++) {
                let _id = deleteArray[i].id;

            

                await knex('master_broker').update('master_broker.status', 0)
                    .where('master_broker.id', _id);

            };
        }
        resolve();
    });
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

        // if(processEnv !== 'development')
        //     await sftpService.syncSftp(globalAppRoot, 'upload', 'handback',
        //         worksheetName.split('.csv')[0] + '_DONE.csv');

        resolve();
    })
}



