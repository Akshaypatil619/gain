/*--------------- Load Libraries ---------------*/
let Validator = require('validatorjs');

/*--------------- Load Files ---------------*/
let knex = require("../../../config/knex");
let Common_functions = require("../common_functions");
let Response_adapter = require("../response_adapter");

/*--------------- Create Objects ---------------*/
let common_functions = new Common_functions();
let response = new Response_adapter();

module.exports = class TrackEmail {
    check_and_update_status(form_data, callback) {
        let rules = {
            user_id: "required",
            user_type: "required",
            pxl_id: "required"
        };
        let validation = new Validator(form_data, rules);
        if (validation.passes() && !validation.fails()) {
            let check_next = 0;
            let query = knex("email_campaign_sent_status")
                .select(["uuid"])
                .where("uuid", form_data.pxl_id)
                .union(function () {
                    this.select(["uuid"])
                        .from("email_sms_cron_data")
                        .where("uuid", form_data.pxl_id)
                })
                .then((sent_result) => {
                    if (sent_result.length > 0) {
                        if (form_data.track_code === null || form_data.track_code === undefined) {
                            form_data.track_code = 3;
                        }
                        return knex("track_email")
                            .where({
                                pxl_id: form_data.pxl_id,
                                track_code: 0
                            })
                            .update({
                                track_code: 1
                            });
                    } else {
                        return callback(response.success("pxl_code_store_failed"))
                    }
                })
                .then((result) => {
                    return knex("track_email")
                        .insert(form_data, "id");

                })
                .then((sent_result) => {
                    return callback(response.success("pxl_code_store_success"))
                })
                .catch((err) => callback(common_functions.catch_error(err)));
        } else {
            let errors = validation.errors.errors;
            return callback(response.error("form_field_required", errors));
        }
    }

    async get_track_details(form_data, callback) {
        let rules = {
            user_id: "required",
            user_type: "required",
        };
        let validations = new Validator(form_data, rules);
        if (validations.passes() && !validations.fails()) {
            let join = [];
            let select = {};
            let where = null;
            let return_result = {};
            switch (form_data.user_type) {
                case "tenant":
                    form_data.user_type = "customer";
                    join.push({
                        table: "customers",
                        condition: "customers.id = track_email.user_id"
                    });
                    select = {
                        "user_id": "customers.id",
                        "email": "customers.email",
                        "user_type": "track_email.user_type",
                        "status": "track_email_code_master.message",
                        "date": "track_email.created_at"
                    };
                    where = {
                        "customers.tenant_id": form_data.tenant_id
                    };
                    break;
                case "admin":
                    break;
            }
            let query = knex("track_email")
                .select(select)
                .leftJoin("track_email_code_master", "track_email_code_master.id", "=", "track_email.track_code");
            if (join.length > 0) {
                for (let i = 0; i < join.length; i++) {
                    query.joinRaw("JOIN " + join[i].table + " ON " + join[i].condition)
                }
            }
            let total_rec = query.clone();
            query.limit(form_data.limit)
                .offset(form_data.offset);
            query.orderBy("track_email.id", "desc")
                .then(async (track_result) => {
                    if (track_result.length > 0) {
                        return_result.list = track_result;
                        return_result.total_records = await (() => {
                            return new Promise((resolve, reject) => {
                                total_rec.then((result) => {
                                    console.log(result.length);
                                    resolve(result.length);
                                });
                            });
                        })();
                        return callback(response.success("email_track_details_found", return_result));
                    } else {
                        return callback(response.error("email_track_details_not_found"));
                    }
                }).catch((err) => callback(common_functions.catch_error(err)));
        }
    }

    async get_click_details(query_data,callback){
        // knex("track_email")
        //     .select({
        //         total_click:knex.raw("COUNT(*)"),
        //         unique_click:knex.raw("COUNT()")
        //     })
    }
};