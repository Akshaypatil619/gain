let path = require('path');
let sftp = require('../../../../../config/sftp');
let knex = require('../../../../../config/knex');
let config = require('../../../../../config/config');

let gainsProcessFiles = [];

module.exports = class sftpService {
    syncSftp(appRoot, action, processType, uploadFileName) {
        return new Promise(async resolve => {
            if (action == 'download') {
                let gainsProcessFilesArray = await getgainsProcessFiles();
                for (let processFiles of gainsProcessFilesArray)
                    gainsProcessFiles.push(processFiles.file_name);
                sftp.connect()
                    .then(() => {
                        // config['sftp_base_path']
                        sftp.list(config['sftp_base_path']+'pending_files')
                            .then(async list => {
                               let localDir = path.join(appRoot, 'uploads/flat_files/pending_files/');
                                let remoteDir = config['sftp_base_path']+'pending_files/';
                                for (let file of list) {
                                   if (gainsProcessFiles.indexOf(file.name) > -1)
                                        continue;
                                    else if (!file.name.includes(processType))
                                        continue;   
                                    if (file.name.split('.')[1] !== 'csv')
                                            continue;     
                                    else if (file.name.includes('DONE'))
                                        continue;
                                    
                                    await sftp.get(remoteDir + file.name, localDir + file.name);
                                    // if (processType == 'sync_customers') {
                                    //     if (!(file.name.includes('PARENT_PROFILE')) &&
                                    //         !(file.name.includes('STAFF_PROFILE')))
                                    //         continue;
                                    //     else if (file.name.split('.')[1] !== 'csv')
                                    //         continue;
                                    //     else
                                    //         await sftp.get(remoteDir + file.name, localDir + file.name);
                                    // }
                                    // } else if (processType == 'migrate_customers') {
                                    //     if (!(file.name.includes('POINTS_SUMMARY')))
                                    //         continue;
                                    //     else if (file.name.split('.')[1] !== 'xlsx')
                                    //         continue;
                                    //     else
                                    //         await sftp.get(remoteDir + file.name, localDir + file.name);
                                    // } else if (processType == 'process_points') {
                                    //     if (!(file.name.includes('REWARDS_POINTS')))
                                    //         continue;
                                    //     else if (file.name.split('.')[1] !== 'csv')
                                    //         continue;
                                    //     else
                                    //         await sftp.get(remoteDir + file.name, localDir + file.name);
                                    // } else if (processType == 'ty_accrual') {
                                    //     if (!(file.name.includes('Flights')) &&
                                    //         !(file.name.includes('Hotels')) &&
                                    //         !(file.name.includes('Giftcards')))
                                    //         continue;
                                    //     else if (file.name.split('.')[1] !== 'txt')
                                    //         continue;
                                    //     else
                                    //         await sftp.get(remoteDir + file.name, localDir + file.name);
                                    // } else if (processType == 'ty_flights') {
                                    //     if (!(file.name.includes('Flt_details')))
                                    //         continue;
                                    //     else if (file.name.split('.')[1] !== 'txt')
                                    //         continue;
                                    //     else
                                    // await sftp.get(remoteDir + file.name, localDir + file.name);
                                    // }
                                };
                                sftp.exit().then(() => setTimeout(resolve, 60000));
                            });
                    })
            } else if (action == 'upload') {
                let location = processType == 'handback' ? 'handback_files' : 'archive_files';
                let localDir = path.join(appRoot, 'uploads/flat_files/' + location + '/');
                let remoteDir = config['sftp_base_path'] + location + '/';
                let remotePendingDir = config['sftp_base_path']+'pending_files/'
                sftp.connect()
                    .then(async () => {
                        // console.log('remoteDir=================', remoteDir);
                        sftp.exists(remoteDir)
                            .then(async folderResult => {
                                // console.log('folderResult ===> ', folderResult);
                                if(folderResult == false)
                                    await sftp.mkdir(remoteDir);
                                // console.log('remoteDir + uploadFileName', remoteDir + uploadFileName)
                                await sftp.put(localDir + uploadFileName, remoteDir + uploadFileName);
                                // await sftp.put(localDir + uploadFileName, 'home/rainbow/gain/sit/pending_files/' + uploadFileName);
                                console.log('handback upload. ',processType)
                                if (processType == 'archive')
                                    await sftp.delete(remotePendingDir + uploadFileName)
                                sftp.exit().then(() => setTimeout(resolve, 60000));
                            })
                    });
            }
        });
    }

    async deleteFile(remoteFilePath){
        await sftp.delete(remoteFilePath);
    }
}

function getgainsProcessFiles() {
    return knex('gains_process_files').select('file_name')
        .where('status', 1);
}