'use strict';
let path = require('path');
let config = require('../../../../../config/config.js');
let gainsModel = new (require('../models/gains_model.' + config.db_driver))();
let gainsResponse = require('../responses/gains.response');
let childProcess = require('child_process');
let gains_points = require('../process/gains_points');
let fs = require('fs');
let mkdirp = require('mkdirp');
let xlsx = require('xlsx');


module.exports = class gainsService {
    constructor() { }

    syncCustomers(req,res,_data) {
        return gainsModel.checkProcessStatus({ name: 'gains_customers' })
            .then(processResult => {
                if (processResult.length > 0)
                    throw new Error('process_conflict');
                else return gainsModel.logProcess({ name: 'gains_customers' });
            }).then(() => this.startChildProcess(req,res))
            .then(() => gainsResponse.success('flat_file_under_process'))
            .catch(err => gainsResponse.catch_error(err));
    }

    startChildProcess(req,res) {
        return new Promise(resolve => {
            let subProcess = childProcess.fork(path.join(__dirname, '../child_process/gains_child_process.js'));
            subProcess.send(['sync', global.appRoot, process.env.NODE_ENV]);

            subProcess.on('message', message => {
                if (message instanceof Array && message[0] == 'emailDetails'){
                    gainsModel.sendWelcomeEmail(req,res,message[1]);
                }
                if (message === 'exit')
                    subProcess.kill();
                else if (message === 'err')
                    subProcess.kill();
            });

            subProcess.on('exit', function (code) {
                console.log('Child process exited successfully');
            });

            subProcess.on('error', (err) => {
                console.log('Child process error', err);
            });

            resolve();
        })
    }

    getPendingCustomers(_data) {
        return gainsModel.getPendingThankYouCustomers({
            columns: {
                process_id: 'thank_you_customers.process_id',
                action: 'thank_you_customers.action',
                email: 'thank_you_customers.email',
                first_name: 'thank_you_customers.first_name',
                middle_name: 'thank_you_customers.middle_name',
                last_name: 'thank_you_customers.last_name',
                customer_number: 'thank_you_customers.gains_customer_id',
                school_code: 'master_school.code',
                product_code: 'master_product.code',
                phone: 'thank_you_customers.phone',
                gender: 'thank_you_customers.gender'
            }
        }).then(pendingCustomers => {
            if (pendingCustomers.length == 0)
                throw new Error('no_record_to_sync');
            else {
                let returnResult = {};
                pendingCustomers.forEach(val => {
                    let process_id = val.process_id;
                    delete val.process_id;
                    if (returnResult.hasOwnProperty(process_id))
                        returnResult[process_id].push(val);
                    else returnResult[process_id] = [val];
                });

                return gainsResponse.success('sync_customers_found', returnResult);
            }
        }).catch(err => gainsResponse.catch_error(err));
    }

    updateProcessStatus(_data) {
        return gainsModel.getAllProcessIds()
            .then(processIds => {
                if (processIds.length == 0 || processIds[0].id == null ||
                    !(processIds[0].id.split(',').indexOf(_data.process_id) > -1))
                    throw new Error('process_id_not_found');
                else
                    return gainsModel.updateProcessStatus(_data.process_id);
            }).then(() => gainsResponse.success('process_update_success'))
            .catch(err => gainsResponse.catch_error(err));
    }

    migrateCustomers(_data) {
        return gainsModel.checkProcessStatus({ name: 'gains_migration' })
            .then(processResult => {
                if (processResult.length > 0)
                    throw new Error('process_conflict');
                else return gainsModel.logProcess({ name: 'gains_migration' });
            }).then(() => this.startMigrationChildProcess())
            .then(() => gainsResponse.success('flat_file_under_process'))
            .catch(err => gainsResponse.catch_error(err));
    }

    startMigrationChildProcess() {
        return new Promise(resolve => {
            let subProcess = childProcess.fork(path.join(__dirname, '../child_process/migration_child_process.js'));
            subProcess.send(['legacy', global.appRoot, process.env.NODE_ENV]);

            subProcess.on('message', message => {
                if (message === 'exit')
                    subProcess.kill();
                else if (message === 'err')
                    subProcess.kill();
            });

            subProcess.on('exit', function (code) {
                console.log('Child process exited successfully');
            });

            subProcess.on('error', (err) => {
                console.log('Child process error', err);
            });

            resolve();
        })
    }

    processPoints() {
        return gainsModel.checkProcessStatus({ name: 'gains_points' })
            .then(processResult => {
                if (processResult.length > 0)
                    throw new Error('process_conflict');
                else return gainsModel.logProcess({ name: 'gains_points' });
            }).then(() => new Promise(resolve => {
                gains_points.startProcess(resolve);
            })).then(() => gainsResponse.success('flat_file_under_process'))
            .catch(err => gainsResponse.catch_error(err));
    }

    customerReports(data) {
        this.customerReportsChildProcess(data)
        return gainsResponse.success('customer_reports_generated');
    }

    customerReportsChildProcess(data) {
        return new Promise(resolve => {
            let subProcess = childProcess.fork(path.join(__dirname, '../child_process/reports_child_process.js'));
            subProcess.send(['customer_reports', global.appRoot, process.env.NODE_ENV, data]);

            subProcess.on('message', message => {
                console.log("message", message);
                if (message === 'exit')
                    subProcess.kill();
                else (message === 'err')
                subProcess.kill();
                subProcess.on('exit', function (code) {
                    console.log('Child process exited successfully');
                });

                subProcess.on('error', (err) => {
                    console.log('Child process error', err);
                });

                resolve();
            });
        })
    }
    
    fnfReports(data) {
        this.fnfReportsChildProcess(data)
        return gainsResponse.success('fnf_reports_generated');
    }

    fnfReportsChildProcess(data) {
        return new Promise(resolve => {
            let subProcess = childProcess.fork(path.join(__dirname, '../child_process/reports_child_process.js'));
            subProcess.send(['fnf_reports', global.appRoot, process.env.NODE_ENV, data]);

            subProcess.on('message', message => {
                console.log("message", message);
                if (message === 'exit')
                    subProcess.kill();
                else (message === 'err')
                subProcess.kill();
                subProcess.on('exit', function (code) {
                    console.log('Child process exited successfully');
                });

                subProcess.on('error', (err) => {
                    console.log('Child process error', err);
                });

                resolve();
            });
        })
    }

    loginReports(data) {
        this.loginReportsChildProcess(data)
        return gainsResponse.success('login_reports_generated');
    }

    loginReportsChildProcess(data) {
        return new Promise(resolve => {
            let subProcess = childProcess.fork(path.join(__dirname, '../child_process/reports_child_process.js'));
            subProcess.send(['login_reports', global.appRoot, process.env.NODE_ENV, data]);

            subProcess.on('message', message => {
                console.log("message", message);
                if (message === 'exit')
                    subProcess.kill();
                else (message === 'err')
                subProcess.kill();
                subProcess.on('exit', function (code) {
                    console.log('Child process exited successfully');
                });

                subProcess.on('error', (err) => {
                    console.log('Child process error', err);
                });

                resolve();

            });
        })
    }

    generateReport(fileName, data) {
        let fileDir = path.join(global.appRoot, 'reports');
        if (!fs.existsSync(fileDir)) mkdirp.sync(fileDir);

        let ws = xlsx.utils.json_to_sheet(data, { dateNF: 22 });
        let wb = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(wb, ws, fileName);
        xlsx.writeFile(wb, fileDir + '/' + fileName + '.xlsx');
    }

    customerDump(data) {
        this.customerDumpChildProcess(data)
        return gainsResponse.success('customer_dump_generated');
    }

    customerDumpChildProcess(data) {
        return new Promise(resolve => {
            let subProcess = childProcess.fork(path.join(__dirname, '../child_process/reports_child_process.js'));
            subProcess.send(['customer_dump', global.appRoot, process.env.NODE_ENV, data]);

            subProcess.on('message', message => {
                console.log("message", message);
                if (message === 'exit')
                    subProcess.kill();
                else (message === 'err')
                subProcess.kill();
                subProcess.on('exit', function (code) {
                    console.log('Child process exited successfully');
                });

                subProcess.on('error', (err) => {
                    console.log('Child process error', err);
                });
                resolve();
            });
        })
    }
    check_login_status(customerDump) {
        return new Promise(resolve => {
            let returnResult = customerDump.cc_customers;
            let customerIds = customerDump.ty_customer_logins
                .map(v => v.gains_customer_id.toString());
            returnResult = returnResult
                .map(v => {
                    if (v.is_referral !== 1)
                        v.logged_in = customerIds.indexOf(v.gains_customer_id.toString()) > -1 ?
                            'Y' : 'N';
                    return v;
                });
            returnResult = returnResult.concat(customerDump.inactive_referrals);
            resolve(returnResult);
        });
    }

    generateCustDumpData(exportData) {
        return new Promise(resolve => {
            let date = new Date();
            let fileName = 'Customer_Dump' +
                date.getDate() + date.toLocaleString('en-GB', { month: 'short' }) + date.getFullYear();
            this.generateReport(fileName, exportData);
            resolve(fileName);
        })
    }
}