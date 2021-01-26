/*--------------- Load Libraries ---------------*/
let node_cron = require("node-cron");
let Validator = require('validatorjs');
let uuid = require("uuid");

/*--------------- Load Files ---------------*/
let config = require("../../../config/config.js");
let knex = require("../../../config/knex");
let Common_functions = require("../../core/common_functions");
let Response_adapter = require("../../core/response_adapter");
let Cron_Jobs = require("../../core/Cron_jobs");

/*--------------- Create Objects ---------------*/
let common_functions = new Common_functions();
let response = new Response_adapter();
let cron_jobs = new Cron_Jobs();

module.exports = class CronManagement {

    async cron_list(query_data, callback) {
        let rules = {
            user_type: 'required',
            user_id: 'required',
        };
        let validation = new Validator(query_data, rules);
        if (validation.passes() && !validation.fails()) {
            let count_query = '';
            let return_result = {};
            let queryObject = knex("cron_jobs")
                .where({
                    user_type: query_data.user_type,
                    user_id: query_data.user_id,
                });
            (query_data.status !== undefined ?
                (query_data.status.toLowerCase() !== 'both' ? queryObject.where({status: query_data.status}) : "")
                : queryObject.where({status: 1}));
            query_data.name !== undefined ? queryObject.where("name", "like", "%" + query_data.name + "%") : "";
            query_data.url !== undefined ? queryObject.where("url", "like", "%" + query_data.url + "%") : "";
            count_query = queryObject.clone();
            queryObject
                .select({
                    id: "cron_jobs.id",
                    user_type: "cron_jobs.user_type",
                    user_id: "cron_jobs.user_id",
                    uuid: "cron_jobs.uuid",
                    name: "cron_jobs.name",
                    url: "cron_jobs.url",
                    cron_range: "cron_jobs.cron_range",
                    status: "cron_jobs.status",
                    started: "cron_jobs.started",
                    created_by: "cron_jobs.created_by",
                    created_at: "cron_jobs.created_at",
                })
                .limit(query_data.limit)
                .offset(parseInt(query_data.offset))
                .then((result) => {
                    if (result.length > 0) {
                        return_result.list = result;
                        return count_query.select({
                            total_records: knex.raw("COUNT(*)")
                        })
                    } else {
                        throw new Error("cron_not_found");
                    }
                })
                .then((count_result) => {
                    return_result.total_records = count_result[0].total_records;
                    console.log(return_result);
                    return callback(response.success("cron_found", return_result));
                })
                .catch((err) => callback(common_functions.catch_error(err)));
        } else {
            let errors = validation.errors.errors;
            return callback(response.error("form_field_required", errors));
        }
    }

    async add_cron(form_data, callback) {
        let rules = {
            user_type: 'required',
            user_id: 'required',
            cron_range: 'required',
            url: 'required',
            name: 'required',
            status: 'required',
            started: 'required',
        };
        let validation = new Validator(form_data, rules);
        if (validation.passes() && !validation.fails()) {
            let is_valid = node_cron.validate(form_data.cron_range);
            if (is_valid) {
                knex("cron_jobs")
                    .where({
                        user_type: form_data.user_type,
                        user_id: form_data.user_id,
                        name: form_data.name,
                        status: 1
                    })
                    .then((result) => {
                        if (result.length > 0) {
                            throw new Error("cron_already_exist");
                        } else {
                            form_data.uuid = uuid.v1();
                            return knex("cron_jobs")
                                .insert(form_data,"id");
                        }
                    })
                    .then((inserted_id) => {
                        console.log(inserted_id);
                        global.cron_jobs.push({
                            id:inserted_id,
                            cron_range: form_data.cron_range ,
                            url: form_data.url ,
                            name: form_data.name ,
                            status: form_data.status ,
                            started: form_data.started ,
                            uuid:form_data.uuid,
                        });
                        
                        if (form_data.started == 1 && form_data.status == 1) {
                            cron_jobs.start_db_crons();
                        }
                        return callback(response.success("cron_store_success"))
                    })
                    .catch((err) => callback(common_functions.catch_error(err)));
            } else {
                return callback(response.error("form_field_required", {
                    cron_range: "Invalid cron range"
                }));
            }
        } else {
            let errors = validation.errors.errors;
            return callback(response.error("form_field_required", errors));
        }
    }

    async modify_cron(form_data, callback) {
        console.log("Cronjobs", global.cron_jobs);
        let rules = {
            cron_id: 'required',
            user_type: 'required',
            user_id: 'required',
            cron_range: 'required',
            url: 'required',
            name: 'required',
            status: 'required',
            started: 'required',
        };
        let validation = new Validator(form_data, rules);
        if (validation.passes() && !validation.fails()) {
            let is_valid = node_cron.validate(form_data.cron_range);
            let cron_result = {};
            if (is_valid) {
                knex("cron_jobs")
                    .where({
                        id: form_data.cron_id
                    })
                    .then((result) => {
                        if (result.length > 0) {
                            cron_result = result;
                            return knex("cron_jobs")
                                .where({
                                    user_type: form_data.user_type,
                                    user_id: form_data.user_id,
                                    name: form_data.name,
                                    status: 1
                                })
                                .whereNot({
                                    id: form_data.cron_id
                                });
                        } else {
                            throw new Error("cron_not_found");
                        }
                    })
                    .then((result) => {
                        if (result.length > 0) {
                            throw new Error("cron_already_exist");
                        } else {
                            form_data.id = form_data.cron_id;
                            delete form_data.cron_id;
                            cron_result[0].cron_id = cron_result[0].id;
                            cron_result[0].operation = "updated information";
                            delete cron_result[0].id;
                            return knex("updated_cron_jobs")
                                .insert(cron_result[0]);
                        }
                    })
                    .then(() => {
                        return knex("cron_jobs")
                            .where({
                                id: form_data.id
                            })
                            .update(form_data);
                    })
                    .then(() => {
                        for(let i=0;i<global.cron_jobs.length;i++){
                            console.log("id: ",global.cron_jobs[i]);
                            if(global.cron_jobs[i].id == cron_result[0].cron_id){
                                global.cron_jobs[i].cron_range= form_data.cron_range ;
                                global.cron_jobs[i].url= form_data.url ;
                                global.cron_jobs[i].name= form_data.name ;
                                global.cron_jobs[i].status= form_data.status ;
                                global.cron_jobs[i].started= form_data.started ;
                                // global.cron_jobs[i].uuid=form_data.uuid;
                                break;
                            }
                        }
                        cron_jobs.start_db_crons();
                        return callback(response.success("cron_store_success"))
                    })
                    .catch((err) => callback(common_functions.catch_error(err)));
            } else {
                return callback(response.error("form_field_required", {
                    cron_range: "Invalid cron range"
                }));
            }
        } else {
            let errors = validation.errors.errors;
            return callback(response.error("form_field_required", errors));
        }
    }

    async cron_detail(query_data, callback) {
        let rules = {
            user_type: 'required',
            user_id: 'required',
            cron_id: 'required'
        };
        let validation = new Validator(query_data, rules);
        if (validation.passes() && !validation.fails()) {
            let queryObject = knex("cron_jobs")
                .select({
                    id: "cron_jobs.id",
                    name: "cron_jobs.name",
                    url: "cron_jobs.url",
                    cron_range: "cron_jobs.cron_range",
                    status: "cron_jobs.status",
                    started: "cron_jobs.started",
                })
                .where({
                    user_type: query_data.user_type,
                    user_id: query_data.user_id,
                    id: query_data.cron_id
                });
            (query_data.status !== undefined ?
                (query_data.status.toLowerCase() !== 'both' ? queryObject.where({status: query_data.status}) : "")
                : queryObject.where({status: 1}));
            queryObject.limit(query_data.limit)
                .offset(query_data.offset);
            queryObject
                .then((result) => {
                    if (result.length > 0) {
                        return callback(response.success("cron_found", result))
                    } else {
                        throw new Error("cron_not_found");
                    }
                })
                .catch((err) => callback(common_functions.catch_error(err)));
        } else {
            let errors = validation.errors.errors;
            return callback(response.error("form_field_required", errors));
        }
    }

    action(form_data, callback) {
        console.log("Cronjobs",global.cron_jobs);
        let rules = {
            user_type: 'required',
            user_id: 'required',
            cron_id: 'required',
            action: 'required',
        };
        let validation = new Validator(form_data, rules);
        if (validation.passes() && !validation.fails()) {
            knex("cron_jobs")
                .where({
                    user_type: form_data.user_type,
                    user_id: form_data.user_id,
                    id: form_data.cron_id
                })
                .then((cron_result) => {
                    if (cron_result.length > 0) {
                        if (cron_result[0]['started'] == form_data.action) {
                            if (form_data.action == 1) {
                                throw new Error("cron_already_running")
                            } else {
                                throw new Error("cron_already_stopped")
                            }
                        } else {
                            cron_result[0].cron_id = cron_result[0].id;
                            cron_result[0].operation = "updated action";
                            for(let i=0;i<global.cron_jobs.length;i++){
                                console.log(global.cron_jobs);
                                if(global.cron_jobs[i].id == cron_result[0].id){
                                    global.cron_jobs[i].started = form_data.action ;
                                }
                            }
                            delete cron_result[0].id;
                            cron_jobs.start_db_crons();
                            return knex("updated_cron_jobs")
                                .insert(cron_result);
                        }
                    } else {
                        throw new Error("cron_not_found");
                    }
                })
                .then(() => {
                    return knex("cron_jobs")
                        .where({
                            user_type: form_data.user_type,
                            user_id: form_data.user_id,
                            id: form_data.cron_id
                        })
                        .update({
                            started: form_data.action
                        })
                })
                .then(() => {
                    return callback(response.success("cron_action_updated"));
                })
                .catch((err) => callback(common_functions.catch_error(err)));
        } else {
            let errors = validation.errors.errors;
            return callback(response.error("form_field_required", errors));
        }
    }
};
