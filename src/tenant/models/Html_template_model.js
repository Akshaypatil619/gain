/************** Load Libraries ****************/
let Validator = require('validatorjs');

/************** Load Files****************/
let messages = require("../../../config/messages.js");
let status_codes = require("../../../config/response_status_codes.js");
let knex = require("../../../config/knex");
let Common_functions = require("../../core/common_functions.js");
Response_adapter = require("../../core/response_adapter");
let Queries = require("../queries/mysql/html_template");

/************** Generate Objects ****************/
let response = new Response_adapter();
let common_functions = new Common_functions();
let queries = new Queries();

module.exports = class Html_template_model {
    upload_template(form_data, callback) {
        let rules = {
            tenant_id: "required",
            name: "required",
            template: "required",
            description: "required",
            status: "required",
        };
        //Check Validation
        let validation = new Validator(form_data, rules);
        if (validation.passes() && !validation.fails()) {
            queries.upload_template("insert_html_template",form_data)
                .then((id) => {
                    return callback(response.response_success(true, status_codes.html_templates_store_success, messages.html_templates_store_success))
                }).catch((err) => callback(common_functions.catch_error(err)));
        } else {
            let errors = validation.errors.errors;
            return callback(response.response_error(false, status_codes.form_field_reqired, messages.form_field_reqired, errors));
        }
    }

    get_templates(query_data, callback) {
        let return_result = {};
        let obj = queries.get_templates("get_html_template",query_data)

        obj.then((t_result) => {
            if (t_result.length > 0) {
                return_result.html_template_total_record = Object.keys(t_result).length;
                obj.limit(query_data['limit'])
                    .offset(query_data['offset'])
                    .then((result) => {
                        if (result.length > 0) {
                            return_result.html_template_list = result;

                            return callback(response.response_success(true, status_codes.html_template_found, messages.html_template_found, return_result))
                        } else {
                            return callback(response.response_error(false, status_codes.html_templates_not_found, messages.html_templates_not_found))
                        }
                    })
            } else {
                return callback(response.response_error(false, status_codes.html_templates_not_found, messages.html_templates_not_found))
            }
        }).catch((err) => callback(common_functions.catch_error(err)));
    }
};