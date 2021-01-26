let Validator = require('validatorjs');

/************** Load Files****************/
let messages = require("../../../config/messages.js");
let status_codes = require("../../../config/response_status_codes.js");
Response_adapter = require("../../core/response_adapter");
Common_functions = require("../../core/common_functions.js");

let Queries = require("../queries/mysql/tenant_user_role");

/************** Generate Objects ****************/
let response_adapter = new Response_adapter();
let common_functions = new Common_functions();
let queries = new Queries();

module.exports = class Tenant_user_role_model {
    constructor() {
    }

    add_tenant_user_role(formData, callback) {
        let data = formData.data;
        let rules = {
            name: "required",
            description: "required",
            status: "required",
            created_by: "required"
        };
        //Check Validation
        let validation = new Validator(data, rules);
        if (validation.passes() && !validation.fails()) {
            queries.add_tenant_user_role("get_role_master", {
                name: data.name,
                tenant_id: formData.tenant_id
            })
                .then((role_result) => {
                    console.log(role_result.length);
                    if (role_result.length === 0) {
                        return queries.add_tenant_user_role("insert", data)
                    } else {
                        // throw status_code index
                        throw new Error("tenant_user_role_exist");
                    }
                }).then((id) => {
                    return callback(response_adapter.response_success(true, status_codes.tenant_user_role_added_success, messages.tenant_user_role_added_success, { id: id }));
                }).catch((err) => callback(common_functions.catch_error(err)));
        } else {
            let errors = validation.errors.errors;
            return callback(response_adapter.response_error(false, status_codes.form_field_reqired, messages.field_required, errors));
        }
    }

    edit_tenant_user_role(formData, callback) {
        let data = formData.data;
        let rules = {
            role_id: "required",
            name: "required",
            description: "required",
            status: "required",
        };
        //Check Validation
        let validation = new Validator(data, rules);
        if (validation.passes() && !validation.fails()) {
            let role_id = data.role_id;
            delete data.role_id;
            queries.edit_tenant_user_role("update", {
                role_id: role_id,
                data: data
            })
                .then((id) => {
                    return callback(response_adapter.response_success(true, status_codes.tenant_user_role_update_success, messages.tenant_user_role_update_success));
                }).catch((err) => callback(common_functions.catch_error(err)));
        } else {
            let errors = validation.errors.errors;
            return callback(response_adapter.response_error(false, status_codes.form_field_reqired, messages.field_required, errors));
        }
    }

    get_tenant_user_roles_list(queryData, callback) {
        let now = new Date();
        let return_result = {};

        let obj = queries.get_tenant_user_roles_list("get_list", queryData)
        obj.then((t_result) => {
            if (t_result.length > 0) {
                return_result.tenant_users_role_total_record = Object.keys(t_result).length;
                obj.limit(queryData['limit'])
                    .offset(queryData['offset'])
                    .then((result) => {
                        if (result.length > 0) {
                            result = result.map((res) => {
                                return (res.is_admin === 1 ? Object.assign(res, { editable: false }) : Object.assign(res, { editable: true }))
                            });
                            return_result.tenant_users_role_list = result;

                            return callback(response_adapter.response_success(true, status_codes.tenant_tenant_user_role_not_found, messages.tenant_tenant_user_role_list_fetched_success, return_result));
                        } else {
                            return callback(response_adapter.response_error(false, status_codes.tenant_user_role_not_found, messages.tenant_user_role_not_found));
                        }
                    })
            } else {
                return callback(response_adapter.response_error(false, status_codes.tenant_user_role_not_found, messages.tenant_user_role_not_found));
            }
        }).catch((err) => callback(common_functions.catch_error(err)));
    }

    get_tenant_user_role_by_id(queryData, callback) {
        queries.get_tenant_user_role_by_id("get_user_role", queryData)
            .then((result) => {
                if (result.length > 0) {
                    return callback(response_adapter.response_success(true, status_codes.tenant_user_role_list_fetched_success, messages.tenant_user_role_not_found, result));
                } else {
                    return callback(response_adapter.response_error(false, status_codes.tenant_user_role_not_found, messages.tenant_user_role_not_found));
                }
            }).catch((err) => callback(common_functions.catch_error(err)));
    }

    update_status(formData, callback) {
        let data = formData.data;
        let rules = {
            role_id: "required",
            status: "required",
        };
        //Check Validation
        let validation = new Validator(data, rules);
        if (validation.passes() && !validation.fails()) {
            let role_id = data.role_id;
            delete data.role_id;
            queries.update_status("update_status", formData)
                .then((id) => {
                    return callback(response_adapter.response_success(true, status_codes.tenant_user_role_status_update_success, messages.tenant_user_role_status_update_success));
                }).catch((err) => callback(common_functions.catch_error(err)));
        } else {
            let errors = validation.errors.errors;
            return callback(response_adapter.response_error(false, status_codes.form_field_reqired, messages.field_required, errors));
        }
    }

};