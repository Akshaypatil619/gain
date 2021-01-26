
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
let encription_key = config.encription_key;
let sftpService = new (require('../services/sftp.service'))();
knex = require('../../../../../config/knex');
let processEnv=process.env.NODE_ENV;
var { nanoid } = require("nanoid");
module.exports = class PropertyService {

    constructor() { }


    syncProperty() {
        return new Promise(async(resolve, reject) => {
            // parentStaffDir = path.join(appRoot, 'uploads/property_flat_files/pending_files');
            // handBackFilesDir = path.join(appRoot, 'uploads/property_flat_files/handback_files');
            // flatFileDumpDir = path.join(appRoot, 'uploads/property_flat_files/archive_files');

            parentStaffDir = path.join(appRoot, 'uploads/flat_files/pending_files');
            handBackFilesDir = path.join(appRoot, 'uploads/flat_files/handback_files');
            flatFileDumpDir = path.join(appRoot, 'uploads/flat_files/archive_files');


            globalAppRoot = appRoot;

       

            if(processEnv !== 'development'){
                await sftpService.syncSftp(globalAppRoot, 'download', 'PROPERTY_');
                }
           
                
            fs.readdir(parentStaffDir, async (err, flatFilesList) => {
                if (err) {
                    console.log('Unable to read file directory');
                    // process.send('err');
                    reject(err);

                } else {
                    console.log("files===", flatFilesList);
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

                        await updateProperty(fileName);
                        await genereteHandBackFile(handBackFilesDir, fileName, fileProcessId[0]);
                        await moveFlatFiles(flatFileDumpDir, fileName);


                    }
                    if(flatFilesList.length==0){
                        resolve("File not found");
                    }else{
                    resolve("File process done");
                    }

                }


            })



        })

    }
}



function updateProperty(fileName) {
    return new Promise(async (resolve, reject) => {
        console.log("in update");

        let workBook = xlsx.readFile(parentStaffDir + '/' + fileName);
        let workSheet = workBook['Sheets'][Object.keys(workBook['Sheets'])[0]];
        let workSheetData = xlsx.utils.sheet_to_json(workSheet, { raw: true, defval: null });
        let insertArray = [], updateArray = [], deleteArray = [];
        thankYouCustomerArray = [];




        let rules = {
            property_code: 'required',
            property_name: 'required',
            property_type: 'required',
            // property_elevation_code: 'required',
            oam_code: 'required',
            country_code: 'required',
            emirate_code: 'required',
            // area: 'required',
            // address_line_1: 'required',
            latitude: 'required',
            longitude: 'required',
           


        };






        for (let record of workSheetData) {
            let validation = new Validator(record, rules);
            if (validation.passes() && !validation.fails()) {
                let property = await getPropertyRecords(record);




                let oam_id = await knex("customers").select({ id: 'customers.id' })
                             .whereRaw("CAST(AES_DECRYPT(oam_code,'" + encription_key + "') AS CHAR(255)) = '" + record['oam_code'] + "'")


                 let country_id = await knex("countries").select({ id: 'countries.id' })
                             .where("countries.code", record['country_code'])


                let emirate_id = await knex("master_emirate").select({ id: 'master_emirate.id' })
                               .where("master_emirate.code", record['emirate_code'])


                let property_type_code_id = await knex("master_property_type").select({ id: 'master_property_type.id' })
                    .where("master_property_type.code", record['property_type'])


                // let property_elevation_code_id = await knex("master_property_elevation").select({ id: 'master_property_elevation.id' })
                //     .where("master_property_elevation.code", record['property_elevation_code'])




                record['id'] = (property.length > 0) ? property[0].id : null;

             
               
                let dbObject = {
                    id: record.id,
                    property_code: record.property_code,
                    property_name: record.property_name,
                    property_type_id: (property_type_code_id.length > 0) ? property_type_code_id[0].id : null,
                    // property_elevation_id: (property_elevation_code_id.length > 0) ? property_elevation_code_id[0].id : null,
                    oam_id: (oam_id.length > 0) ? oam_id[0].id : null,
                    country_id: (country_id.length > 0) ? country_id[0].id : null,
                    emirate_id: (emirate_id.length > 0) ? emirate_id[0].id : null,
                 //   image_path: record.image_path,
                    image_name: record.image_name,
                    latitude: record.latitude,
                    longitude: record.longitude,
                    address_line_1:record.address_line_1,
                    area:record.area,
                   
                };

                console.log("dbObject====>",dbObject);

                let obj = dbObject;



                let amnty_code=[];
                let amnty_data=[];
                let amnt_status=true;
                if(record.amenity_code!==undefined && record.amenity_code!==null &&   record.amenity_code!=="" ){
                    amnty_code=record.amenity_code.split(",");
                    for(let i=0;i<amnty_code.length;i++){
                        let  amnty_id = await knex("master_amenities").select({ id: 'master_amenities.id' })
                        .where("master_amenities.code",amnty_code[i]);
                        let aid=JSON.parse(JSON.stringify(amnty_id));
                        console.log("amnty_id==>",aid);
                        if(aid.length>0){
                          
                          amnty_data.push(aid[0].id);
                        }else{
                            amnt_status=false;
                            break;
                        }
       
                    }
                }

              dbObject["amenity_code"]=amnty_data;
               console.log("amnty_data=",dbObject);

                let fieldExist = await checkRequiredFields(obj)
                if (!fieldExist.status) {
                    generateHandBackObject(record, errorResponse.failed(fieldExist.msg), 'Failed');
                    continue;
                }

                if (!amnt_status) {
                    generateHandBackObject(record, errorResponse.failed('amnty_not_exist'), 'Failed');
                    continue;
                }
                

                if ((record.status).toUpperCase() == 'INSERT') {

                    if (dbObject['id'] != null) {
                        console.log("hannd back 1");
                        generateHandBackObject(record, errorResponse.failed('property_already_present'), 'Failed');
                        continue;
                    }

                    else {

                        delete dbObject['status'];

                        // insertArray.push(dbObject);


                     
                          
                         
                                 let image_name = dbObject.image_name;
                                 let aminity=dbObject.amenity_code;
                                 // let image_path = dbObject.image_path;
                                 delete dbObject.image_name;
                                 delete dbObject.image_path;
                                 delete dbObject.amenity_code;
                 
                                 let Id = await knex("master_property").insert(dbObject);
                 
                                 if (image_name != undefined && image_name != null) {
                                     console.log("img______");
                                     let img_array = image_name.split(",");
                                  //   let path_array = image_path.split(",");
                                     for (let j = 0; j < img_array.length; j++) {
                                         let img_path="/uploads/images/units"+nanoid(10)+img_array[j];
                                         let obj = { property_id: Id, path:img_path, name: img_array[j], status: 1 };
                                         await knex("property_has_images").insert(obj);
                                     }
                                 }
                                 if(aminity.length>0){
                                     console.log("amm______");
                 
                                     for (let j = 0; j < aminity.length; j++) {
                                         let obj = { property_id: Id,amenity_id:aminity[j], status: 1 };
                                         await knex("property_has_amenities").insert(obj);
                                     }
                 
                 
                                 }
                 
                 
                                 //await knex("cc_account_summary").insert({customer_id: Id[0]});
                             
                         



                    };
                } else if ((record.status).toUpperCase() == 'DELETE') {

                    if (record['id'] == null) {

                        generateHandBackObject(record, errorResponse.failed('record_not_found'), 'Failed');
                        continue;
                    } else deleteArray.push(dbObject.id);

                } else if ((record.status).toUpperCase() == 'UPDATE') {

                    if ((record['id'] == null)) {
                        generateHandBackObject(record, errorResponse.failed('record_not_found'), 'Failed');
                        continue;
                    } else {

                        let propertyId = dbObject.id;
                        let image_path = dbObject.image_path;
                        let image_name = dbObject.image_name;
                        delete dbObject.id;
                        delete dbObject.image_path;
                        delete dbObject.image_name;
                        let db_img_obj = {
                            path: image_path,
                            name: image_name
                        }

                        await knex('master_property').update(dbObject).where('id', propertyId);
                        if (image_name != undefined && image_name != null && image_name != '') {

                            await knex('property_has_images').update(db_img_obj).where('property_id', propertyId);
                        }





                    };
                };

                generateHandBackObject(record, '', 'Success');
            } else {


                generateHandBackObject(record, validation.errors.errors, 'Failed');
            }
        };


        // if (insertArray.length > 0) {
        //    console.log("in ins=",insertArray);
        //     for (let i = 0; i < insertArray.length; i++) {
        //         let image_name = dbObject.image_name;
        //         let aminity=insertArray[i].amenity_code;
        //         // let image_path = insertArray[i].image_path;
        //         delete insertArray[i].image_name;
        //         delete insertArray[i].image_path;
        //         delete insertArray[i].amenity_code;

        //         let Id = await knex("master_property").insert(insertArray[i]);

        //         if (image_name != undefined && image_name != null) {
        //             console.log("img______");
        //             let img_array = image_name.split(",");
        //          //   let path_array = image_path.split(",");
        //             for (let j = 0; j < img_array.length; j++) {
        //                 let obj = { property_id: Id, path:"/uploads/images/units", name: img_array[j], status: 1 };
        //                 await knex("property_has_images").insert(obj);
        //             }
        //         }
        //         if(aminity.length>0){
        //             console.log("amm______");

        //             for (let j = 0; j < aminity.length; j++) {
        //                 let obj = { property_id: Id,amenity_id:aminity[j], status: 1 };
        //                 await knex("property_has_amenities").insert(obj);
        //             }


        //         }


        //         //await knex("cc_account_summary").insert({customer_id: Id[0]});
        //     };
        // }
        if (deleteArray.length > 0) {

            for (let i = 0; i < deleteArray.length; i++) {
                let delete_id = deleteArray[i];

                let id = await knex('master_property').update('master_property.status', 0)
                    .where('master_property.id', delete_id);



            };
        }
        resolve();
    });
}




function checkRequiredFields(dbObject) {


    if (dbObject['oam_id'] == null || dbObject['oam_id'] == undefined || dbObject['oam_id'] == '') {
        return ({ status: false, msg: "oam_code_not_exist" });
    }

    else if (dbObject['country_id'] == null || dbObject['country_id'] == undefined || dbObject['country_id'] == '') {
        return ({ status: false, msg: "country_code_not_exist" });
    }

    else if (dbObject['emirate_id'] == null || dbObject['emirate_id'] == undefined || dbObject['emirate_id'] == '') {
        return ({ status: false, msg: "emirate_code_not_exist" });
    }

    else if (dbObject['property_type_id'] == null || dbObject['property_type_id'] == undefined || dbObject['property_type_id'] == '') {
        return ({ status: false, msg: "property_code_not_exist" });

    }
    
    // else if (dbObject['property_elevation_id'] == null || dbObject['property_elevation_id'] == undefined || dbObject['property_elevation_code_id'] == '') {
    //     return ({ status: false, msg: "property_elevation_code_not_exist" });

    // } 
    
    
    else {
        return ({ status: true, msg: "" });
    }

}


async function getPropertyRecords(record) {


    let columns = {
        id: "master_property.id"
    }
    if (record.status.toUpperCase() == "INSERT") {
        return await knex("master_property").select(columns)
            .where("master_property.property_code", record['property_code'].trim())
    } else if (record.status.toUpperCase() == "UPDATE") {
        return await knex("master_property").select(columns)
            .where("master_property.property_code", record['property_code'].trim())

    } else {

        return await knex("master_property").select(columns)
            .where("master_property.property_code", record['property_code'].trim())

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





        if(processEnv !== 'development')
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

        if(processEnv !== 'development')
            await sftpService.syncSftp(globalAppRoot, 'upload', 'handback',
                worksheetName.split('.csv')[0] + '_DONE.csv');

        resolve();
    })
}