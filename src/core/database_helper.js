status_codes = require("../../config/response_status_codes.js");
let config = require("../../config/config.js");

let Common_functions = require("./common_functions.js");
let common_functions = new Common_functions();
let knex = require("../../config/knex.js");

module.exports = class Database_helper {

    get_driver() {
        return config.db_driver;
    }

    cc_insert(table, data, is_checksum = false) {
        let process;
        let current_class = this;

        switch (this.get_driver()) {
            case 'mssql':
                process = function (resolve, reject) {
                    let obj = knex(table).insert(data).returning('id')
                    obj.then(function(insert_id){
                        if (is_checksum === true) {
                            current_class.cc_checksum_update(table, { where: { id: insert_id } });
                        }
                        resolve(insert_id);
                    }).catch((err) => {
                        reject(err)
                    })
                }
                break;
            default:
                process = function (resolve, reject) {
                    knex(table).insert(data).then((insert_id) => {
                        if (is_checksum === true) {
                            current_class.cc_checksum_update(table, { where: { id: insert_id } });
                        }
                        resolve(insert_id);
                    }).catch((err) => {
                        reject(err)
                    })
                }
                break;
        }
        return new Promise(process);
    }

    cc_multiple_insert(table, data_array, is_checksum = false) {
        let process;
        let current_class = this;
        let ids_array = [];
        switch (this.get_driver()) {
            case 'mssql':
                process = function (resolve, reject) {
                    knex.transaction(async function (trx) {
                        for (let obj in data_array) {
                            let insertResult = await trx.insert(data_array[obj], 'id').into(table)
                            if (insertResult) {
                                ids_array.push(insertResult[0])
                            } else {
                                trx.rollback
                            }
                        }
                        trx.commit
                    }).then(function (id) {
                        if (is_checksum === true) {
                            current_class.cc_checksum_update(table, { whereIn: { id: ids_array } });
                        }
                        resolve(id);
                    }).catch(function (error) {
                        console.error(" error Found" + error);
                        reject(error)
                    });
                }
                break;
            default:
                process = function (resolve, reject) {
                    knex.transaction(async function (trx) {
                        for (let obj in data_array) {
                            let insertResult = await trx.insert(data_array[obj], 'id').into(table)
                            if (insertResult) {
                                ids_array.push(insertResult[0])
                            } else {
                                trx.rollback
                            }
                        }
                        trx.commit
                    }).then(function (id) {
                        if (is_checksum === true) {
                            current_class.cc_checksum_update(table, { whereIn: { id: ids_array } });
                        }
                        resolve(id);
                    }).catch(function (error) {
                        console.error(" error Found" + error);
                        reject(error)
                    });
                }
                break;
        }
        return new Promise(process);
    }

    cc_update(table, data, whereConditions, is_checksum = false) {
        let process;
        let current_class = this;
        switch (this.get_driver()) {
            case 'mssql':
                process = function (resolve, reject) {
                    knex(table).update(data).where(whereConditions).then((update_id) => {
                        if (is_checksum === true) {
                            current_class.cc_checksum_update(table, { where: whereConditions });
                        }
                        resolve(update_id);
                    }).catch((err) => {
                        reject(err)
                    })
                }
                break;
            default:
                process = function (resolve, reject) {
                    knex(table).update(data).where(whereConditions).then((update_id) => {
                        if (is_checksum === true) {
                            current_class.cc_checksum_update(table, { where: whereConditions });
                        }
                        resolve(update_id);
                    }).catch((err) => {
                        reject(err)
                    })
                }
                break;
        }
        return new Promise(process);
    }

    cc_get(table, columns, whereConditions, extras) {
        let process;
               
        switch (this.get_driver()) {
            case 'mssql':
                process = function (resolve, reject) {
                    // let obj = knex(table).select(columns).where(whereConditions.where);
                    let obj = knex(table).column(columns).select().where(whereConditions.where);
                    if (whereConditions.whereNot !== undefined) {
                        obj.where(function(){
                            this.whereNot(whereConditions.whereNot);
                        })
                    }
                    if (whereConditions.orWhere !== undefined) {
                        obj.where(function(){
                            this.orWhere(whereConditions.orWhere);
                        })
                    }
                    obj.then((returnData) => {
                        resolve(returnData);
                    }).catch((err) => {
                        reject(err)
                    })
                }
                break;
            default:
                process = function (resolve, reject) {
                    let obj = knex(table).select(columns).where(whereConditions.where);
                    if (whereConditions.whereNot !== undefined) {
                        obj.whereNot(whereConditions.whereNot);
                    }
                    if (whereConditions.orWhere !== undefined) {
                        obj.orWhere(whereConditions.orWhere);
                    }
                    if(extras !== undefined) Object.keys(extras)
                        .forEach(key => obj[key](extras[key]));
                    obj.then((returnData) => {
                        resolve(returnData);
                    }).catch((err) => {
                        reject(err)
                    })
                }
                break;
        }
        return new Promise(process);
    }

    cc_checksum_update(table, whereConditions) {
        let obj = knex(table).select('*');
        if (typeof whereConditions.whereIn != 'undefined') {
            obj.whereIn(Object.keys(whereConditions.whereIn)[0], whereConditions.whereIn.id);
        } else if (typeof whereConditions.where != 'undefined') {
            obj.where(whereConditions.where);
        } else {
            console.log('QUERY FILTER/WHERE CONDITION NOT DEFINED IN CHECKSUM');
            return false;
        }

        obj.then((returnData) => {
            if (returnData.length > 0) {
                for (let arrData of returnData) {
                    delete arrData['checksum'];
                    let raw_data_str = Object.values(arrData).join(",");
                    let checksum = common_functions.cc_checksum_hash(raw_data_str);
                    knex(table).update({ checksum: checksum }).where({ 'id': arrData.id }).then((_id) => {
                        console.log('CHECKSUM UPDATE', table, arrData.id)
                    }).catch((err) => {
                        console.log('ERROR WHILE UPDATING CHECKSUM', table, arrData.id)
                        return err;
                    });
                }
            }
        }).catch((err) => {
            return err;
        });
    }

};