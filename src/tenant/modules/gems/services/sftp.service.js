let path = require('path');
let sftp = require('../../../../../config/sftp');
let knex = require('../../../../../config/knex');
let gemsProcessFiles = [];

module.exports = class sftpService {
    syncSftp(appRoot, action, processType, uploadFileName) {
        return new Promise(async resolve => {
            if (action == 'download') {
                let gemsProcessFilesArray = await getGemsProcessFiles();
                for (let processFiles of gemsProcessFilesArray)
                    gemsProcessFiles.push(processFiles.file_name);
                sftp.connect()
                    .then(() => {
                        sftp.list('home/rainbow/rainbowsftp/UAT/pending_files')
                            .then(async list => {
                                console.log('List ', list)
                                let localDir = path.join(appRoot, 'uploads/flat_files/pending_files/');
                                let remoteDir = 'home/rainbow/rainbowsftp/UAT/pending_files/'
                                for (let file of list) {
                                    // if (file.type == 'd')
                                    //     continue;
                                    // if (gemsProcessFiles.indexOf(file.name) > -1)
                                    //     continue;
                                    // else if (file.name.includes('DONE'))
                                    //     continue;

                                    // if (processType == 'sync_customers') {
                                    //     if (!(file.name.includes('PARENT_PROFILE')) &&
                                    //         !(file.name.includes('STAFF_PROFILE')))
                                    //         continue;
                                    //     else if (file.name.split('.')[1] !== 'csv')
                                    //         continue;
                                    //     else
                                    //         await sftp.get(remoteDir + file.name, localDir + file.name);

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
                                    await sftp.get(remoteDir + file.name, localDir + file.name);
                                    // }
                                };
                                sftp.exit().then(() => setTimeout(resolve, 60000));
                            });
                    })
            } else if (action == 'upload') {
                let location = processType == 'handback' ? 'handback_files' : 'archive_files';
                let localDir = path.join(appRoot, 'uploads/flat_files/' + location + '/');
                let remoteDir = 'home/rainbow/rainbowsftp/UAT/' + location + '/';
                let remotePendingDir = 'home/rainbow/rainbowsftp/UAT/pending_files/'
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
                                // await sftp.put(localDir + uploadFileName, 'home/rainbow/rainbowsftp/UAT/pending_files/' + uploadFileName);
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

function getGemsProcessFiles() {
    return knex('gems_process_files').select('file_name')
        .where('status', 1);
}