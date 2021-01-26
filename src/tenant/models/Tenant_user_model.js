/************** Load Libraries ****************/
let uuid = require('uuid');
let Validator = require('validatorjs');
var bcrypt = require('bcryptjs');

/************** Load Files****************/
let messages = require("../../../config/messages.js");
let status_codes = require("../../../config/response_status_codes.js");
let Response_adapter = require("../../core/response_adapter");
let Common_functions = require("../../core/common_functions.js");

let knex = require("../../../config/knex.js");
let Queries = require("../queries/mysql/tenant_user");

/************** Generate Objects ****************/
let response_adapter = new Response_adapter();
let common_functions = new Common_functions();
let queries = new Queries();

module.exports = class Tenant_user_model {
    constructor() {
    }

    check_login(username, password, user_agent, callback) {

        let err = 0;
        let error = {};
        let status_code = "";
        if (username === null || username === undefined || username === "") {
            error['username'] = messages.login_username_required;
            status_code = status_codes.login_field_required;
            err++;
        }
        if (password === null || password === undefined || password === "") {
            error["password"] = messages.login_password_required;
            status_code = status_codes.login_field_required;
            err++;
        }
        if (err !== 0) {
            return callback(({
                "status": false,
                code: status_code,
                message: error
            }), null);
        } else {
            try {
                let req_data = {
                    username: username,
                    password: password,
                    user_agent: user_agent
                }
                let query_obj = queries.check_login('login', req_data)
                    .then(async function (result) {
                        console.log("resultresultresultresultresult : ",result);
                        if (result.length > 0) {
                            var getPassword = bcrypt.compareSync(password, result[0].password);
                        } else {
                            return callback({
                                status: false,
                                status_code: status_codes.password_dose_not_match,
                                message: "Data Not Exit"
                            });
                        }

                        if (getPassword !== true) {
                            return callback({
                                status: false,
                                status_code: status_codes.password_dose_not_match,
                                message: messages.password_dose_not_match
                            });
                        } else {
                            queries.check_login('get_tenants', req_data)
                                .then((res) => console.log("res"));
                            if (result.length == 0) {
                                return callback({
                                    status: false,
                                    status_code: status_codes.login_failed,
                                    message: messages.login_failed
                                });
                            }
                            let encryptData = {}
                            let token_data ={};

                            encryptData.tenant_id = common_functions.encryptData(result[0]['tenant_id'].toString(),'credosyssolutions');
                            encryptData.secret_key = common_functions.encryptData('credosysTechnology','credosyssolutions');

                            let login_token = await common_functions.create_token(encryptData);
                           
                             token_data = {
                                'tenant_id': result[0]['tenant_id'],
                                'tenant_user_id': result[0]['tenant_user_id'],
                                'login_token': login_token,
                                'agent_type': user_agent,
                                'created_at':knex.raw("CURRENT_TIMESTAMP"),
                                'updated_at':knex.raw("CURRENT_TIMESTAMP")
                            };
                            console.log("SSSSSSSSSSSSSSSSSSSSSSS : ",token_data,result)

                            queries.check_login("insert_token", token_data)
                                .then(function (token_result) {
                                    if (result.length === 0) {
                                        return callback({
                                            status: false,
                                            status_code: status_codes.login_failed,
                                            message: messages.login_failed
                                        });
                                    } else {
                                        if (result['activated'] === 0) {
                                            return callback({
                                                status: false,
                                                status_code: status_codes.deactive_tenant,
                                                message: messages.deactive_tenant
                                            });
                                        } else {
                                            result[0]['token'] = login_token;
                                            return callback({
                                                status: true,
                                                status_code: status_codes.login_success,
                                                message: messages.login_success,
                                                value: result
                                            });
                                        }
                                    }
                                }).catch(function (err) {
                                    console.log(err);
                                    let result = status_codes.check_error_code("DATABASE", err.errno);
                                    return callback(Object.assign({
                                        "status": false
                                    }, result));
                                });
                        }
                    }).catch(function (err) {
                        console.log(err);
                        let result = status_codes.check_error_code("DATABASE", err.errno);
                        return callback(Object.assign({
                            "status": false
                        }, result));
                    });
            } catch (e) {
                console.log(e);
                return callback({
                    status: false,
                    status_code: status_codes.login_failed,
                    message: messages.login_failed,
                });
            }
        }
    }

    generate_api_token(res) {
        let validation_code = uuid.v1();
        res.json({
            "status": true,
            code: validation_code
        });
    }

    get_module_permissions(tenant_id, callback) {
        try {
            let query_data = {
                tenant_id: tenant_id
            }
            let query = queries.get_module_permissions("get_permissions", query_data)
            console.log(query.toString());
            query.then(function (result) {
                if (result.length === 0) {
                    return callback({
                        status: false,
                        status_code: "212",//status_codes.module_permission_failed,
                        message: messages.module_permission_failed
                    });
                } else {

                    return callback({
                        status: true,
                        status_code: status_codes.module_permission_success,
                        message: messages.module_permission_success,
                        value: result
                    });
                }
            }).catch(function (err) {
                let result = status_codes.check_error_code("DATABASE", err.errno);
                console.log(err);
                return callback(Object.assign({
                    "status": false,
                }, result));
            });

        } catch (e) {
            return callback({
                status: false,
                status_code: status_codes.login_failed,
                message: messages.login_failed,
            });
        }
    }

    check_operation_permission(tenant_id, operation, callback) {

        let data = {
            tenant_id: tenant_id,
            operation: operation
        }
        queries.check_operation_permission("check", data)
            .then(function (result) {
                if (result.length === 0) {
                    callback({
                        status: false,
                        status_code: status_codes.module_permission_failed,
                        message: messages.module_not_permitted + operation
                    });
                } else {
                    return callback({
                        status: true,
                        status_code: status_codes.module_permission_success,
                        message: messages.module_permission_success,
                        value: result
                    });
                }
            }).catch(function (err) {

                console.log(err);
                let result = status_codes.check_error_code("DATABASE", err.errno);
                return callback(Object.assign({
                    "status": false
                }, result));
            });
    }

    activate_or_deactivate_admin(tenant_id, activation_tenant_id, status, callback) {
        let err = 0;
        let module = "Activate/Deactivate Admin";
        let error = {};
        let status_code = "";
        if (activation_tenant_id === null || activation_tenant_id === undefined || activation_tenant_id === "") {
            error['activation_tenant_id'] = messages.activation_tenant_id;
            status_code = status_codes.login_field_required;
            err++;
        }
        if (status === null || status === undefined || status === "") {
            error["status"] = messages.status_required;
            status_code = status_codes.form_field_reqired;
            err++
        }
        if (err !== 0) {
            return callback(({
                "status": false,
                code: status_code,
                message: error
            }), null);
        } else {
            this.check_operation_permission(tenant_id, module, function (result) {
                if (result.status_code === 401) {
                    return callback(Object.assign({
                        "status": false
                    }, result));
                } else {
                    knex.select("activated")
                        .where("id", activation_tenant_id)
                        .table("admin_users").then(function (result) {
                            if (parseInt(result[0]['activated']) === parseInt(status)) {
                                let code = "";
                                if (parseInt(status) === 0) {
                                    code = "admin_already_deactivated";
                                } else {
                                    code = "admin_already_activated";
                                }
                                return callback(response_adapter.response_success(true, status_codes[code], messages[code], result));
                            } else {
                                knex.where("id", activation_tenant_id)
                                    .update({
                                        activated: status
                                    }).then(function (result) {
                                        let code = "";
                                        if (parseInt(status) === 0) {
                                            code = "admin_deactivated_success";
                                        } else {
                                            code = "admin_activated_success";
                                        }
                                        return callback(response_adapter.response_success(true, status_codes[code], messages[code], result));
                                    }).catch(function (err) {
                                        let result = status_codes.check_error_code("DATABASE", err.errno);
                                        return callback(Object.assign({
                                            "status": false
                                        }, result));
                                    });
                            }
                        }).catch(function (err) {
                            console.log(err);
                            let result = status_codes.check_error_code("DATABASE", err.errno);
                            return callback(Object.assign({
                                "status": false
                            }, result));
                        });

                }
            })

        }
    }

    add_redemption_channel(form_data, callback) {
        let data = {};
        Object.assign(data, form_data);
        let rules = {
            redemption_channel_id: "required",
            burn_redemption_rate: "required",
        };
        //Check Validation
        let validation = new Validator(data, rules);
        if (validation.passes() && !validation.fails()) {
            queries.add_redemption_channel("insert_redemption_channels", data)
            .then((tenant_redemption_channel_id) => {
                return callback(response_adapter.response_error(true, status_codes.tenant_redemption_channel_create_success, messages.tenant_redemption_channel_create_success, tenant_redemption_channel_id));
            }).catch((err) => {
                return callback(response_adapter.response_error(false, status_codes.tenant_redemption_channel_create_failed, messages.tenant_redemption_channel_create_failed, err.message));
            });
        } else {
            let errors = validation.errors.errors;
            return callback(response_adapter.response_error(false, status_codes.form_field_reqired, messages.form_field_reqired, errors));
        }
    }

    edit_redemption_channel(redemption_channel_id, form_data, callback) {
        let data = {};
        data.insert = {};
        Object.assign(data.insert, form_data);
        data.redemption_channel_id = redemption_channel_id;
        queries.edit_redemption_channel("update", data)
            .then((tenant_redemption_channel_id) => {
                return callback(response_adapter.response_error(false, status_codes.tenant_redemption_channel_update_success, messages.tenant_redemption_channel_update_success, tenant_redemption_channel_id));
            }).catch((err) => {
                return callback(response_adapter.response_error(false, status_codes.tenant_redemption_channel_update_failed, messages.tenant_redemption_channel_update_failed, err.message));
            });
    }


    get_redemption_channel(callback) {
        let now = new Date();
        let data = {
            columns: {
                id: "redemption_channel_master.id",
                name: "redemption_channel_master.name",
                code: "redemption_channel_master.code"
            }
        };

        queries.get_redemption_channel("get_channels", data)
            .then((result) => {
                console.log(result)
                if (result.length > 0) {
                    return callback(response_adapter.response_success(true, status_codes.redemption_channel_master_found, messages.redemption_channel_master_found, (result)));
                } else {
                    return callback(response_adapter.response_error(false, status_codes.redemption_channel_master_not_found, messages.redemption_channel_master_not_found));
                }
            })
    }

    get_tenant(tenant_id, callback) {
        if (typeof tenant_id != undefined) {
            
            let data = {
                tenant_id: tenant_id
            }
            console.log("tenant_id",tenant_id);
            queries.get_tenant("get_tenant", data)
                .then((result) => {
                    if (result.length > 0) {
                        console.log(result)
                        return callback(response_adapter.response_success(true, status_codes.tenants_found, messages.tenants_found, (result)));
                    } else {
                        return callback(response_adapter.response_error(false, status_codes.tenants_not_found, messages.tenants_not_found));
                    }
                }).catch(function (err) {
                    let result = status_codes.check_error_code("DATABASE", err.errno);
                    return callback(Object.assign({
                        "status": false
                    }, result));
                });
        } else {
            let errors = "Invalid Tenant ID.";
            return callback(response_adapter.response_error(false, status_codes.form_field_reqired, messages.form_field_reqired, errors));
        }
    }

    edit_tenant(tenant_id, form_data, callback) {
        let data = {};

        let rules = {
            base_point_rate : "required",
            selling_point_rate : "required",
            aging_mechanism : "required",
            round_off_type : "required",
            round_off_threshold : "required",
            // base_burn_mechanism : "required",
            // base_burn_point_rate : "required",
        }
        Object.assign(data, form_data);
                
        //Check Validation
        let validation = new Validator(data, rules);
        if (validation.passes() && !validation.fails()) {
            data['is_base_configuration_complete'] = 1;
            let query_data = {
                data: data,
                tenant_id: tenant_id,
            };
            queries.edit_tenant("edit_tenant", query_data)
                .then((result) => {
                    return callback(response_adapter.response_success(true, status_codes.tenants_update_success, messages.tenants_update_success));
                }).catch((err) => {
                    return callback(response_adapter.response_error(false, status_codes.tenants_create_failed, messages.tenants_create_failed, err.message));
                });
        } else {
            let errors = validation.errors.errors;
            return callback(response_adapter.response_error(false, status_codes.form_field_reqired, messages.form_field_reqired, errors));
        }
    }

    get_rule_types(callback) {
        let now = new Date();

        let data = {
            columns: {
                id: "rule_type_master.id",
                name: "rule_type_master.name",
                rule_priority: "rule_type_master.rule_priority",
                slug: "rule_type_master.slug"
            }
        };
        queries.get_rule_types("get_rule_types", data)
            .then((result) => {
                if (result.length > 0) {
                    return callback(response_adapter.response_success(true, status_codes.rule_type_master_found, messages.rule_type_master_found, (result)));
                } else {
                    return callback(response_adapter.response_error(false, status_codes.rule_type_master_not_found, messages.rule_type_master_not_found));
                }
            })
    }

    add_tenant_user(formData, callback) {
        let data = formData.data;
        let rules = {
            name: "required",
            email: "required",
            phone: "required",
            role: "required",
            status: "required",
            created_by: "required"
        };

        //Check Validation
        let validation = new Validator(data, rules);
        if (validation.passes() && !validation.fails()) {

            queries.add_tenant_user("get_tenant_user", form_data)
                .then((result) => {
                    if (result.length > 0) {
                        if (data.phone === result[0].phone) {
                            throw new Error("phone_already_exist")
                        } else {
                            throw new Error("email_already_exist")
                        }
                    } else {
                        data.password = "1234";
                        return queries.add_tenant_user("insert_tenant_user", data)
                    }
                }).then((id) => {
                    return callback(response_adapter.response_success(true, status_codes.tenant_user_create_success, messages.tenant_user_create_success, {
                        id: id
                    }));
                }).catch((err) => callback(common_functions.catch_error(err)));
        } else {
            let errors = validation.errors.errors;
            return callback(response_adapter.response_error(false, status_codes.form_field_reqired, messages.field_required, errors));
        }
    }

    edit_tenant_user(formData, callback) {
        let data = formData.data;
        let rules = {
            tenant_user_id: "required",
            name: "required",
            email: "required",
            phone: "required",
            role: "required",
            status: "required",
        };

        //Check Validation
        let validation = new Validator(data, rules);
        if (validation.passes() && !validation.fails()) {
            queries.edit_tenant_user("get_tenant_user", form_data)
                .then((result) => {
                    if (result.length > 0) {
                        if (data.phone === result[0].phone) {
                            // throw message key that want to show in error
                            throw new Error("phone_already_exist")
                        } else {
                            // throw message key that want to show in error
                            throw new Error("email_already_exist")
                        }
                    } else {
                        return queries.edit_tenant_user("get_tenant_user_id", form_data)
                    }
                }).then((id) => {
                    if (id.length > 0) {
                        data.id = data.tenant_user_id;
                        delete data.tenant_user_id;
                        return queries.edit_tenant_user("update_tenant_user", data)
                    } else {
                        // throw message key that want to show in error
                        throw new Error("tenant_user_does_not_exist")
                    }
                }).then((id) => {
                    return callback(response_adapter.response_success(true, status_codes.tenant_user_details_updated_success, messages.tenant_user_details_updated_success));
                }).catch((err) => callback(common_functions.catch_error(err)));
        } else {
            let errors = validation.errors.errors;
            return callback(response_adapter.response_error(false, status_codes.form_field_reqired, messages.field_required, errors));
        }
    }

    get_tenant_users_list(queryData, callback) {
        let return_result = {};
        queryData.columns = {
            tenant_user_id: "tenant_users.id",
            role_id: "master_tenant_user_role.id",
            role_name: "master_tenant_user_role.name",
            name: "tenant_users.name",
            email: "tenant_users.email",
            phone: "tenant_users.phone",
            status: knex.raw("if(tenant_users.status=1,'Active','Inactive')"),
            created_by: "tenant_user_creator.name",
            created_time: "tenant_users.created_at"
        };
        let obj = queries.get_tenant_users_list("get_list", queryData)
        obj.then((t_result) => {
            if (t_result.length > 0) {
                return_result.tenant_users_total_record = Object.keys(t_result).length;

                obj.limit(queryData['limit'])
                    .offset(queryData['offset'])
                    .then((result) => {
                        if (result.length > 0) {
                            return_result.tenant_users_list = result;
                            return callback(response_adapter.response_success(true, status_codes.tenant_user_list_fetched_success, messages.tenant_user_list_fetched_success, return_result));
                        } else {
                            return callback(response_adapter.response_error(false, status_codes.tenant_user_does_not_exist, messages.tenant_user_does_not_exist));
                        }
                    })
            } else {
                return callback(response_adapter.response_error(false, status_codes.tenant_user_does_not_exist, messages.tenant_user_does_not_exist));
            }
        }).catch((err) => callback(common_functions.catch_error(err)));
    }

    get_tenant_user_by_id(queryData, callback) {
        queryData.columns = {
            role_id: "master_tenant_user_role.id",
            role_name: "master_tenant_user_role.name",
            name: "tenant_users.name",
            email: "tenant_users.email",
            phone: "tenant_users.phone",
            status: knex.raw("if(tenant_users.status=1,'Active','Inactive')"),
            created_by: "tenant_user_creator.name",
            created_time: "tenant_users.created_at"
        };
        console.log('Query Data', queryData)
        queries.get_tenant_user_by_id("get_tenant_user", queryData)
            .then((result) => {
                if (result.length > 0) {
                    return callback(response_adapter.response_success(true, status_codes.tenant_user_found, messages.tenant_user_found, result));
                } else {
                    return callback(response_adapter.response_error(false, status_codes.tenant_user_does_not_exist, messages.tenant_user_does_not_exist));
                }
            }).catch((err) => callback(common_functions.catch_error(err)));
    }


    get_tenant_user_by_id_email(req, callback) {
        queries.get_tenant_user_by_id_email("get_tenant_user", req)
            .then((result) => {
            if (result.length > 0) {
                return callback(response_adapter.response_success(true, status_codes.tenant_user_found, messages.tenant_user_found, result));
            } else {
                return callback(response_adapter.response_error(false, status_codes.tenant_user_does_not_exist, messages.tenant_user_does_not_exist));
            }
        }).catch((err) => callback(common_functions.catch_error(err)));
    }



    update_tenant_userDetails(queryData, callback) {
        queries.update_tenant_userDetails("update", queryData)
            .then((result) => {
                if (result == 1) {
                    return callback(response_adapter.response_success(true, 'Success', 'User Details Updated', result));
                }
                else
                    return callback(response_adapter.response_error(false, 'failed', 'Something went wrong'))

            })


    }



    change_password(old_password, new_password, id, emailId, callback) {
        queries.change_password("get_tenant_user", {
            id: id,
            emailId: emailId
        }).then(function (result) {
            var verifyOldPswd = bcrypt.compareSync(old_password, result[0].password);
            if (verifyOldPswd !== true) {
                return callback({
                    status: false,
                    status_code: 'failed',
                    message: "Password is incorrect"
                });
            }
            else {
                let hashPswd = common_functions.password_encrypt(new_password)
                queries.change_password("update_tenant_user", {
                    id: id,
                    emailId: emailId,
                    hashPswd: hashPswd
                })
                    .then((result) => {
                        if (result === 1) {
                            return callback({
                                status: true,
                                status_code: 'success',
                                message: "Password has been Updated Successfully"
                            });
                        }
                        else {
                            return callback({
                                status: false,
                                status_code: 'failed',
                                message: "Something got wrong"
                            });
                        }
                    })



            }
        })
    }


    get_group_codes(callback) {
        queries.get_group_codes("get_group_codes")
            .then((group_codes) => {
                return callback(response_adapter.response_success(true, status_codes.group_codes_found, messages.group_codes_found, group_codes));
            })
    }

    /* Tenant Branches */
    get_tenant_branch_list(query_data, callback) {
        let rules = {
            tenant_id: "required",
        };
        //Check Validation
        let validation = new Validator(query_data, rules);
        if (validation.passes() && !validation.fails()) {
            queries.get_tenant_branch_list("get_list", query_data)
                .then((tenant_branches) => {
                    if (tenant_branches.length == 0) {
                        throw new Error('tenant_branch_not_found');
                    } else {
                        return callback(response_adapter.response_success(true, status_codes.tenant_branch_found, messages.tenant_branch_found, (tenant_branches)));
                    }
                }).catch((err) => callback(common_functions.catch_error(err)));
        } else {
            let errors = validation.errors.errors;
            return callback(response_adapter.response_error(false, status_codes.form_field_reqired, messages.form_field_reqired, errors));
        }
    }

    /***
	* Description : Fetch Dashboard Graph.
    * Params : Query Data {tenant_id,start_date,end_date} and Callback.
    * Returns : Dashboard Graph Data.
    * Author : Fahad.
    ***/
    async get_dashboard_graph(query_data, callback) {
        let rules = {
            start_date: "required",
            end_date: "required", 
        };
        /* Check Validation */
        let validation = new Validator(query_data, rules);
        if (validation.passes() && !validation.fails()) {
            try{
                let graph_data = await queries.get_dashboard_graph("get_graph_data", query_data)
                return callback(response_adapter.response_success(true, status_codes.dashboard_graph_found, messages.dashboard_graph_found, (graph_data)));
            }catch(err){
                // logger_service.log(err)
            };
        } else {
            let errors = validation.errors.errors;
            return callback(response_adapter.response_error(false, status_codes.form_field_reqired, messages.form_field_reqired, errors));
        }
    }

    /***
	* Description : Fetch Dashboard Count.
    * Params : Query Data {tenant_id,start_date,end_date} and Callback.
    * Returns : Dashboard Count.
    * Author : Fahad.
    ***/
    async get_dashboard_count(query_data, callback) {
        let rules = {
            start_date: "required",
            end_date: "required", 
        };

        /* Check Validation */
        let validation = new Validator(query_data, rules);
        if (validation.passes() && !validation.fails()) {
            try{
                let pointCount = await queries.get_dashboard_count("point_data", {query_data: query_data});
                let memberCount = await queries.get_dashboard_count("customer_data", {query_data: query_data});
                
                pointCount.map((pointData) => {
                    pointData.total_liability_point = pointData.total_accrual_point - (pointData.total_redeemed_point + pointData.total_expired_point);
                })
                return callback(response_adapter.response_success(true, status_codes.dashboard_count_found, messages.dashboard_count_found, {pointCount,memberCount}));
            }catch(err){
                // logger_service.log(err)
            };
        } else {
            let errors = validation.errors.errors;
            return callback(response_adapter.response_error(false, status_codes.form_field_reqired, messages.form_field_reqired, errors));
        }
    }
    
    unlock_assign_point(form_data, callback) {
        let data = {};
        Object.assign(data, form_data);
        delete data.customer_id;
        delete data.tenant_id;
        let rules = {
            lock_point_id: "required",
            customer_id: "required",
        };
        //Check Validation
        let validation = new Validator(form_data, rules);
        if (validation.passes() && !validation.fails()) {
            delete data.lock_point_id;
            queries.unlock_assign_point("get_lock_points", {
                data: data,
                lock_point_id: form_data['lock_point_id']
            })
                .then(function (result) {
                    return callback(response_adapter.response_success(true, status_codes.unlock_data_successfully, messages.unlock_data_successfully));
                }).catch(function (err) {
                    return callback(response_adapter.response_error(false, status_codes.unlock_update_failed, messages.unlock_update_failed, err.message));
                });
        } else {
            let errors = validation.errors.errors;
            return callback(response_adapter.response_error(false, status_codes.form_field_reqired, messages.form_field_reqired, errors));
        }
    }

    /* point_redeem_tenant(form_data, callback) {
        let d = new Date();
        let d1 = [];
        let fullYear = d.getFullYear();
        let getMonth = d.getMonth();
        let day = d.getDate();
        d1.push(fullYear);
        d1.push(getMonth);
        d1.push(day);
        let transaction_date = d1.join('');

        let data = {};
        let result_data = {};
        let transactionId = {};
        let redeem_voucher_no;

        Object.assign(data, form_data);

        let rules = {
            'debit_points': 'required',
        };


        let columns = {
            service_code: "customers.column_24",
            company_id: "customers.column_3",
            sales_office_id: "customers.column_9",
            tenant_branch_id: "customers.tenant_branch_id",
            redem_id: knex.raw("(select id from redem_master where redem_master.redem_code='?')", [form_data.code])
        }

        //Check Validation
        let validation = new Validator(data, rules);
        if (validation.passes() && !validation.fails()) {
            queries.point_redeem_tenant("get_customers", {
                columns: columns,
                form_data: form_data,
            })
                .then((insert_data) => {
                    result_data = insert_data
                    if (insert_data.length == 0) {
                        return callback(response_adapter.response_error(false, status_codes.test, messages.test));
                    } else {
                        return new Promise((resolve, reject) => {
                            let point_model = new Point_model();
                            point_model.debit_points({
                                debit_points: form_data['debit_points'],
                                customer_id: form_data['customer_id'],
                                tenant_id: form_data['tenant_id'],
                            }, (transaction_result) => {
                                if (transaction_result['status']) {
                                    resolve(transaction_result['values'])
                                } else {
                                    reject(transaction_result['message'])
                                }
                            })
                        });
                    }
                }).then(async (result) => {
                    let pad = function (code, width) {
                        code = code + '';
                        return code.length >= width ? code : new Array(width - code.length + 1).join('0') + code;
                    }
                    transactionId = result;
                    let redeemVoucherNo = await queries.point_redeem_tenant("get_tedeem_vouchers", {});
                    let lsl_code = redeemVoucherNo[0].redeem_voucher_no.split("-");
                    delete lsl_code[0];
                    lsl_code = lsl_code.join('');
                    lsl_code = lsl_code >= 600 ? pad(parseInt(lsl_code) + 1, 4) : pad(600, 4);
                    redeem_voucher_no = 'LSL' + result_data[0].redem_id + "-" + lsl_code;


                    let redeem_transaction_data = {};
                    redeem_transaction_data['customer_id'] = form_data['customer_id'];
                    redeem_transaction_data['redem_points'] = form_data['debit_points'];
                    redeem_transaction_data['redem_voucher_no'] = redeem_voucher_no;
                    redeem_transaction_data['redem_date'] = transaction_date;
                    redeem_transaction_data['redem_info'] = form_data['redem_info'];
                    redeem_transaction_data['redem_id'] = result_data[0].redem_id;
                    redeem_transaction_data['sales_office_id'] = result_data[0].sales_office_id;
                    redeem_transaction_data['service_code'] = result_data[0].service_code;
                    redeem_transaction_data['alliance_type_code'] = form_data.alliance_data.alliance_type_code;
                    redeem_transaction_data['alliance_id'] = form_data.alliance_data.id;
                    redeem_transaction_data['alliance_name'] = form_data.alliance_data.name;
                    redeem_transaction_data['redem_status'] = "A";
                    return queries.point_redeem_tenant("insert_redeem_transactions", {
                        redeem_transaction_data: redeem_transaction_data
                    })
                }).then((insertData) => {
                    console.log("calleddd");
                    let transaction_id = insertData[0];
                    let data_insert = {};
                    if (transactionId.transaction_id) {
                        data_insert['customer_id'] = form_data['customer_id'];
                        data_insert['points'] = form_data['debit_points'];
                        data_insert['redeem_voucher_no'] = redeem_voucher_no;
                        data_insert['transaction_date'] = transaction_date;
                        data_insert['redeem_transaction_date'] = transaction_date;
                        data_insert['alliance_id'] = form_data.alliance_data.id;
                        data_insert['redem_id'] = result_data[0].redem_id;
                        data_insert['service_code'] = result_data[0].service_code;
                        data_insert['company_id'] = result_data[0].company_id;
                        data_insert['sales_office_id'] = result_data[0].sales_office_id;
                        data_insert['tenant_branch_id'] = result_data[0].tenant_branch_id;
                        data_insert['redeem_trans_id'] = transaction_id;
                        // this code hardcord only 
                        data_insert['redeem_status'] = "A";
                        queries.point_redeem_tenant("insert_redemption_details", {
                            data_insert: data_insert
                        })
                            .then((insert_data) => {
                                return callback(response_adapter.response_success(true, status_codes.redeemPoint, insert_data));
                            })
                    } else {
                        return callback(response_adapter.response_success(false, status_codes.redeemPoint, "not get"));
                    }
                }).catch((err) => callback(common_functions.catch_error(err)));
        } else {
            let errors = validation.errors.errors;
            return callback(response_adapter.response_error(false, status_codes.form_field_reqired, messages.form_field_reqired, errors));
        }
    } */
}