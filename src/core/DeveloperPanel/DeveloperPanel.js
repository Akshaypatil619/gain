/*--------------- Load Libraries ---------------*/
let Validator = require('validatorjs');

/*--------------- Load Files ---------------*/
let knex = require("../../../config/knex");
let Common_functions = require("../common_functions");
let Response_adapter = require("../response_adapter");
let Queries = require("../queries/mysql/developer_panel");

/*--------------- Create Objects ---------------*/
let common_functions = new Common_functions();
let response = new Response_adapter();
let queries = new Queries();

module.exports = class DeveloperPanel {
    constructor() {
        queries.check_table_exist("api_groups");
    }

    get_route_list(query_data, callback) {
        let rules = {
            user_type: "required",
            user_id: "required",
            // type_id: [{ required_if: ['user_type', 'tenant'] }]
        };
        let validation = new Validator(query_data, rules);
        if (validation.passes() && !validation.fails()) {
            let return_result = {};

            return queries.get_route_list("get_route_list", query_data)
                .then((result) => {
                    if (result.length > 0) {
                        return_result.list = result;
                        return queries.get_route_list("get_group_master", query_data)
                    } else {
                        throw new Error("routes_not_found");
                    }
                }).then((result) => {
                    if (result.length > 0) {
                        return_result.api_permission_group_list = result;
                    }
                    if (query_data.user_type == 'tenant') {
                        return queries.get_route_list("get_master_group_code", query_data)
                    }
                }).then((result) => {
                    if (result !== undefined && result.length > 0) {
                        return_result.group_code_list = result;
                    }
                    if (query_data.user_type == 'tenant') {
                        //
                    }
                    return callback(response.success("routes_found", return_result));
                }).catch((err) => callback(common_functions.catch_error(err)));
        } else {
            let errors = validation.errors.errors;
            return callback(response.error("form_field_required", errors));
        }
    }

    store_routes(query_data, callback) {
        let rules = {
            user_type: "required",
            // user_id: "required",
            // tenant_type_id: "required",
            routes: "array"
        };
        let validation = new Validator(query_data, rules)
        if (validation.passes() && !validation.fails()) {
            let insert_result = [];
            let update_result = [];
            // Getting Tenent Type 
            // queries.store_routes("get_master_tenant_type", query_data) 
            //     .then((result) => {
            // if length is 0 then TenantType not Available
            // if (result.length > 0) {
            // Update all route status 0 for Perticular Tenant Type
            // return
            queries.store_routes("update_routes_status", query_data)
                //     } else {
                //         throw new Error("tenant_type_not_found");
                //     }
                // })
                .then((result) => {
                    // Getting all routes for perticular tenant type
                    
                    return queries.store_routes("get_routes", query_data)
                })
                .then((route_result) => {
                    if (route_result.length > 0) {
                        for (let r_i = 0; r_i < route_result.length; r_i++) {
                            let route_index = query_data.routes.indexOf(route_result[r_i].route);
                            if (route_index > -1) {
                                update_result.push(route_result[r_i].id);
                                query_data.routes.splice(route_index, 1);
                            }
                        }
                    }
                    for (let r_i = 0; r_i < query_data.routes.length; r_i++) {
                        insert_result.push({
                            user_type: query_data.user_type,
                            // user_id: query_data.user_id,
                            route: query_data.routes[r_i],
                            enabled: 1,
                            status: 1,
                            tenant_type_id: query_data.type_id
                        });
                    }
                    return queries.store_routes("batch_insert_routes", insert_result)
                })
                .then((result) => {
                    return queries.store_routes("update_status_enable", {
                        user_type: query_data.user_type,
                        tenant_type_id: query_data.type_id,
                        update_result: update_result
                    })
                }).then((result) => {
                    return callback(response.success("route_found", { insert_data: insert_result, update_data: update_result }));
                })
                .catch((err) => callback(common_functions.catch_error(err)));
        } else {
            let errors = validation.errors.errors;
            return callback(response.error("form_field_required", errors));
        }
    }

    enable_disable_route(form_data, callback) {
        let rules = {
            user_type: "required",
           type_id: "required",
            route_id: "required",
            enabled: "required",
        }
        let validation = new Validator(form_data, rules);
        if (validation.passes() && !validation.fails()) {
            queries.enable_disable_route("get_routes", form_data)
                .then((result) => {
                    if (result.length > 0) {
                        return queries.enable_disable_route("update_status", form_data)
                    } else {
                        throw new Error("routes_not_found");
                    }
                })
                .then(() => {
                    return callback(response.success("route_updated_success"));
                })
                .catch((err) => callback(common_functions.catch_error(err)));
        } else {
            let errors = validation.errors.errors;
            return callback(response.error("form_field_required", errors));
        }
    }

    update_valid_permission_type(form_data, callback) {
        let rules = {
            user_type: "required",
            user_id: "required",
            route_id: "required",
            // tenant_type_id: "required",
            valid_permission_type: "required"
        }
        let validation = new Validator(form_data, rules);
        if (validation.passes() && !validation.fails()) {
            queries.update_valid_permission_type("get_routes", form_data)
                .then((result) => {
                    if (result.length > 0) {
                        return queries.update_valid_permission_type("update", form_data)
                    } else {
                        throw new Error("routes_not_found");
                    }
                })
                .then(() => {
                    return callback(response.success("route_permission_type_updated"))
                })
                .catch((err) => callback(common_functions.catch_error(err)));
        } else {
            let errors = validation.errors.errors;
            return callback(response.error("form_field_required", errors));
        }
    }

    update_route_group(form_data, callback) {
        let rules = {
            user_type: "required",
            user_id: "required",
            route_id: "required",
            api_permission_group_id: "required",
            type_id: "required",
        }
        let validation = new Validator(form_data, rules);
        if (validation.passes() && !validation.fails()) {
            queries.update_route_group("get_route_group", form_data)
                .then((result) => {
                    if (result.length > 0) {
                        return queries.update_route_group("get_routes", form_data)
                    } else {
                        throw new Error("api_permission_group_id_not_found")
                    }
                })
                .then((result) => {
                    if (result.length > 0) {
                        return queries.update_route_group("update_route", form_data)
                    } else {
                        throw new Error("routes_not_found")
                    }
                })
                .then((result) => {
                    return callback(response.success("api_permission_group_updated"));
                })
                .catch((err) => callback(common_functions.catch_error(err)));
        } else {
            let errors = validation.errors.errors;
            return callback(response.error("form_field_required", errors));
        }
    }

    update_route_group_code(form_data, callback) {
        let rules = {
            user_type: "required",
            user_id: "required",
            route_id: "required",
            group_code_id: "required",
            status: "required",
           type_id: "required"
        }
        let validation = new Validator(form_data, rules);
        if (validation.passes() && !validation.fails()) {
            queries.update_route_group_code("get_routes", form_data)
                .then((result) => {
                    if (result.length > 0) {
                        return queries.update_route_group_code("get_routes_group_codes", form_data)
                    } else {
                        throw new Error("tenant_type_not_found");
                    }
                })
                .then((result) => {
                    if (result.length > 0) {
                        return queries.update_route_group_code("update_group_codes", {
                            id: result[0].id,
                            status: form_data.status
                        })
                    } else {
                        return queries.update_route_group_code("insert_group_codes", {
                            user_type: form_data.user_type,
                            // user_id: form_data.user_id,
                            tenant_type_id: form_data.type_id,
                            group_code_id: form_data.group_code_id,
                            route_id: form_data.route_id,
                            status: form_data.status
                        })
                    }
                })
                .then((result) => {
                    return callback(response.success("routes_tenant_type_updated_success"));
                })
                .catch((err) => callback(common_functions.catch_error(err)));
        } else {
            let errors = validation.errors.errors;
            return callback(response.error("form_field_required", errors));
        }
    }

    getting_inner_api(query_data, callback) {
        let rules = {
            user_type: "required",
            user_id: "required",
            type_id: "required",
            route_id: "required",
        }
        let validation = new Validator(query_data, rules);
        if (validation.passes() && !validation.fails()) {
            queries.getting_inner_api("get_inner_api", query_data)
                .then((result) => {
                    if (result.length > 0) {
                        return callback(response.success("inner_api_route_found", result));
                    } else {
                        throw new Error("inner_route_api_not_found");
                    }
                })
                .catch((err) => callback(common_functions.catch_error(err)));
        } else {
            let errors = validation.errors.errors;
            return callback(response.error("form_field_required", errors));
        }
    }

    add_inner_api(form_data, callback) {
        let rules = {
            user_type: "required",
            user_id: "required",
            route_id: "required",
            type_id: "required",
            inner_api_path: "required",
        }
        let validation = new Validator(form_data, rules);
        if (validation.passes() && !validation.fails()) {
            queries.add_inner_api("get_inner_api", form_data)
                .then((result) => {
                    if (result.length > 0) {
                        throw new Error("inner_api_already_exist");
                    } else {
                        return queries.add_inner_api("insert", {
                            user_type: form_data.user_type,
                            uesr_id: form_data.user_id,
                            route_id: form_data.route_id,
                            inner_api_path: form_data.inner_api_path
                        })
                    }
                })
                .then(() => {
                    return callback(response.success("inner_api_added"))
                })
                .catch((err) => callback(common_functions.catch_error(err)));
        } else {
            let errors = validation.errors.errors;
            return callback(response.error("form_field_required", errors));
        }
    }

    remove_inner_api(form_data, callback) {
        let rules = {
            user_type: "required",
            user_id: "required",
            type_id: "required",
            inner_api_id: "required",
        }
        let validation = new Validator(form_data, rules);
        if (validation.passes() && !validation.fails()) {
            queries.remove_inner_api("get_inner_api", form_data)
                .then((result) => {
                    if (result.length > 0) {
                        return queries.remove_inner_api("update_inner_api", form_data)

                    } else {
                        throw new Error("inner_api_not_found");
                    }
                })
                .then(() => {
                    return callback(response.success("inner_api_removed"))
                })
                .catch((err) => callback(common_functions.catch_error(err)));
        } else {
            let errors = validation.errors.errors;
            return callback(response.error("form_field_required", errors));
        }
    }

    get_tenant_types(query_data, callback) {
        let return_result = {};
        queries.get_tenant_types("get_types", query_data)
            .then((result) => {
                if (result !== undefined && result.length > 0) {
                    return_result.list = result;
                    return callback(response.success("tenant_types_found", return_result));
                } else {
                    throw new Error("tenant_type_not_found");
                }
            })
            .catch((err) => callback(common_functions.catch_error(err)));
    }

    get_merchant_types(query_data, callback) {
        let return_result = {};
        queries.get_merchant_types("get_types", query_data)
            .then((result) => {
                if (result !== undefined && result.length > 0) {
                    return_result.list = result;
                    return callback(response.success("merchant_types_found", return_result));
                } else {
                    throw new Error("merchant_type_not_found");
                }
            })
            .catch((err) => callback(common_functions.catch_error(err)));
    }

    get_routes(query_data, callback) {
        let rules = {
            user_type: "required",
            user_id: "required",
        };
        let validation = new Validator(query_data, rules);
        if (validation.passes() && !validation.fails()) {
            let is_admin = 0;
            if(query_data.user_type=='merchant'){
                queries.get_routes("get_routes", {
                    type_id: query_data.merchant_type_id,
                    user_type:query_data.user_type
                }).then((result) => {
                    return callback(response.success("route_found", result));
                })
                .catch((err) => callback(common_functions.catch_error(err)));
            }else{
            queries.get_routes("get_tenant", query_data)
                .then((result) => {
                    if(result.length>0)
                    is_admin = result[0].is_admin;
                    return queries.get_routes("get_routes", {
                        group_codes: result[0].group_codes.split(",").concat([null]),
                        type_id: query_data.tenant_type_id,
                        user_type:query_data.user_type
                    })
                })
                .then((result) => {
                    return callback(response.success("route_found", result));
                })
                .catch((err) => callback(common_functions.catch_error(err)));
            }
        } else {
            let errors = validation.errors.errors;
            return callback(response.error("form_field_required", errors));
        }
    }

    add_group(form_data, callback) {
        let rules = {
            name: "required",
            status: "required",
            user_type: "required",
        };
        delete form_data.tenant_id;
        delete form_data.admin_id;
        let validation = new Validator(form_data, rules);
        if (validation.passes() && !validation.fails()) {
            queries.add_group("get_user_type", form_data)
                .then((result) => {
                    if (result.length == 0) {
                        throw new Error("user_type_not_found");
                    } else {
                        return queries.add_group("check_group", form_data);
                    }
                }).then((result) => {
                    if (result.length == 0) {
                        return queries.add_group("insert_group", form_data);
                    } else {
                        throw new Error("group_already_exist");
                    }
                }).then((result) => {
                    if (result.length > 0) {
                        form_data.id = result;
                        callback(response.success("group_inserted", form_data));
                    } else {
                        throw new Error("group_insertion_failed");
                    }
                }).catch((err) => callback(common_functions.catch_error(err)));
        } else {
            let errors = validation.errors.errors;
            return callback(response.error("form_field_required", errors));
        }
    }

    modify_group(form_data, callback) {
        let rules = {
            id: "required",
            name: "required",
            status: "required",
            user_type: "required",
        };
        delete form_data.admin_id;
        let validation = new Validator(form_data, rules);
        if (validation.passes() && !validation.fails()) {
            let data = Object.assign({}, form_data);
            delete data.id;
            queries.modify_group("get_user_type", form_data)
                .then((result) => {
                    if (result.length == 0) {
                        throw new Error("user_type_not_found");
                    } else {
                        return queries.modify_group("check_group", form_data);
                    }
                }).then((result) => {
                    if (result.length == 0) {
                        return queries.modify_group("update_group", {
                            id: form_data.id,
                            data: data
                        });
                    } else {
                        throw new Error("group_already_exist");
                    }
                }).then((result) => {
                    callback(response.success("group_updated"));
                }).catch((err) => callback(common_functions.catch_error(err)));
        } else {
            let errors = validation.errors.errors;
            return callback(response.error("form_field_required", errors));
        }
    }

    get_list(query_data, callback) {
        let rules = {
            user_type: 'required',
        }
        let validation = new Validator(query_data, rules);
        if (validation.passes() && !validation.fails()) {
            queries.get_list("get_user_type", query_data)
                .then((result) => {
                    if (result.length > 0) {
                        return queries.get_list("get_api_groups", query_data)
                    } else {
                        throw new Error("user_type_not_found")
                    }
                })
                .then((result) => {
                    if (result.length > 0) {
                        callback(response.success("group_found", result));
                    } else {
                        throw new Error("group_not_found");
                    }
                })
                .catch((err) => callback(common_functions.catch_error(err)));
        } else {
            let errors = validation.errors.errors;
            return callback(response.error("form_field_required", errors));
        }
    }

    set_status(form_data, callback) {
        let rules = {
            user_type: 'required',
            admin_id: "required",
            group_id: "required",
            status: "required",
        }
        let validation = new Validator(form_data, rules);
        if (validation.passes() && !validation.fails()) {
            queries.set_status("get_user_type", form_data)
                .then((result) => {
                    if (result.length > 0) {
                        return queries.set_status("get_group", form_data);
                    } else {
                        throw new Error("user_type_not_found");
                    }
                })
                .then((result) => {
                    if (result.length > 0) {
                        if (result[0].status == form_data.status) {
                            if (form_data.status == 1) {
                                throw new Error("already_enabled");
                            } else {
                                throw new Error("already_disabled");
                            }
                        } else {
                            return queries.set_status("update_status", form_data);
                        }
                    } else {
                        throw new Error("group_not_found");
                    }
                })
                .then((result) => {
                    callback(response.success("group_status_updated"))
                })
                .catch((err) => callback(common_functions.catch_error(err)));
        } else {
            let errors = validation.errors.errors;
            return callback(response.error("form_field_required", errors));
        }
    }

    /* */
    get_users(query_data, callback) {
        let rules = {
            user_type: "required",
            admin_id: "required",
        };
        let validation = new Validator(query_data, rules);
        if (validation.passes() && !validation.fails()) {
            let table = "";
            let columns = {};
            switch (query_data.user_type) {
                case "admin":
                    table = "admin";
                    columns = {
                        id: "id",
                        name: "name",
                    }
                    break;
                case "tenant":
                    columns = {
                        id: "id",
                        name: "name",
                    }
                    table = "tenants";
                    break;
                case "merchant":
                    table = "merchants";
                    columns = {
                        id: "id",
                        name: "name",
                    }
                    break;
            }
            if (table !== "") {
                knex(table)
                    .select(columns)
                    .then((result) => {
                        if (result.length != 0) {
                            callback(response.success("users_found", result));
                        } else {
                            throw new Error("users_not_found")
                        }
                    })
                    .catch((err) => callback(common_functions.catch_error(err)));
            }
        } else {
            let errors = validation.errors.errors;
            return callback(response.error("form_field_required", errors));
        }
    }

    get_group_list(query_data, callback) {
        let rules = {
            user_type: "required",
            admin_id: "required",
            user_id: "required",
        };
        let validation = new Validator(query_data, rules);
        if (validation.passes() && !validation.fails()) {
            knex("api_groups")
                .select({
                    "id": "api_groups.id",
                    "user_id": "accessible_api_group.user_id",
                    "user_type": "api_groups.user_type",
                    "api_group": "api_groups.name",
                    "assigned": knex.raw("CASE WHEN accessible_api_group.id IS NULL THEN -1 else accessible_api_group.assigned end")
                })
                .leftJoin("accessible_api_group", function () {
                    this.on("accessible_api_group.api_group_id", "=", "api_groups.id")
                        .on("accessible_api_group.user_type", "=", knex.raw("?", query_data.user_type))
                        .on("accessible_api_group.user_id", "=", knex.raw(query_data.user_id))
                })
                .where({
                    "api_groups.user_type": query_data.user_type,
                    "api_groups.status": 1,
                })
                .then((result) => {
                    if (result.length > 0) {
                        callback(response.success("api_group_found", result));
                    } else {
                        throw new Error("api_group_not_found");
                    }
                })
                .catch((err) => callback(common_functions.catch_error(err)));
        } else {
            let errors = validation.errors.errors;
            return callback(response.error("form_field_required", errors));
        }
    }

    assign_routes(form_data, callback) {
        let rules = {
            group_id: "required",
            routes: "required|array",
            user_type: "required",
        };
        switch (form_data.user_type) {
            case 'merchant':
                rules.merchant_id = "required";
                break;
            case 'tenant':
                rules.tenant_id = "required";
                break;
            case 'admin':

        }
        let validation = new Validator(form_data, rules);
        if (validation.passes() && !validation.fails()) {
            let routes = form_data.routes;
            queries.assign_routes("delete_routes", form_data)
                .then((result) => {
                    let data = routes.map((route) => {
                        return {
                            route_id: route,
                            group_id: form_data.group_id,
                            user_type: form_data.user_type,
                            status: form_data.status
                        };
                    });
                    queries.assign_routes("add_routes", data)
                        .then((result) => {
                            return callback(response.success("route_added_success"));
                        })
                })
                .catch((err) => callback(common_functions.catch_error(err)));
        } else {
            let errors = validation.errors.errors;
            return callback(response.error("form_field_required", errors));
        }
    }
    get_assigned_routes(query_data, callback) {
        let rules = {
            user_type: "required",
            group_id: "required",
        };
        let validation = new Validator(query_data, rules);
        if (validation.passes() && !validation.fails()) {
            let return_data = {};
            queries.get_assigned_routes("get_gorup_name", query_data)
                .then((result) => {
                    return_data.group_name = result.length > 0 ? result[0].name : "";
                    return queries.get_assigned_routes("get_list", query_data)
                })
                .then((result) => {
                    if (result.length > 0) {
                        return_data.list = result;
                        callback(response.success("routes_found", return_data));
                    } else {
                        callback(response.error("routes_not_found", return_data));
                    }
                })
                .catch((err) => callback(common_functions.catch_error(err)));
        } else {
            let errors = validation.errors.errors;
            return callback(response.error("form_field_required", errors));
        }
    }

    assign_apis(form_data, callback) {
        let rules = {
            tenant_id: "required",
            group_id: "required",
            apis: "required|array",
            user_type: "required",
        };
        let validation = new Validator(form_data, rules);
        if (validation.passes() && !validation.fails()) {
            let apis = form_data.apis;
            let data = apis.map((api) => {
                return {
                    api_id: api,
                    group_id: form_data.group_id,
                    user_type: form_data.user_type,
                    status: form_data.status
                };
            })
            queries.assign_apis("add_api", data)
                .then((result) => {
                    return callback(response.success("api_added_success"));
                })
                .catch((err) => callback(common_functions.catch_error(err)));
        } else {
            let errors = validation.errors.errors;
            return callback(response.error("form_field_required", errors));
        }
    }
    remove_route(form_data, callback) {
        let rules = {
            user_type: "required",
            assigned_id: "required",
        };
        let validation = new Validator(form_data, rules)
        if (validation.passes() && !validation.fails()) {
            queries.remove_route("remove", form_data)
                .then((result) => {
                    return callback(response.success("route_removed"));
                }).catch((err) => callback(common_functions.catch_error(err)));
        } else {
            let errors = validation.errors.errors;
            return callback(response.error("form_field_required", errors));
        }
    }

    get_assigned_apis(query_data, callback) {
        let rules = {
            user_type: "required",
            group_id: "required",
        };
        let validation = new Validator(query_data, rules);
        if (validation.passes() && !validation.fails()) {
            let return_data = {};
            queries.get_assigned_apis("get_gorup_name", query_data)
                .then((result) => {
                    return_data.group_name = result.length > 0 ? result[0].name : "";
                    return queries.get_assigned_apis("get_list", query_data)
                })
                .then((result) => {
                    if (result.length > 0) {
                        return_data.list = result;
                        callback(response.success("api_found", return_data));
                    } else {
                        callback(response.error("api_not_found", return_data));
                    }
                })
                .catch((err) => callback(common_functions.catch_error(err)));
        } else {
            let errors = validation.errors.errors;

            return callback(response.error("form_field_required", errors));
        }
    }
    get_api_list(query_data, callback) {
        let rules = {
            user_type: "required"
        };
        let validation = new Validator(query_data, rules);
        if (validation.passes() && !validation.fails()) {
            queries.get_api_list("get_list", query_data)
                .then((result) => {
                    if (result.length > 0) {
                        callback(response.success("api_found", result));
                    } else {
                        callback(response.error("api_not_found"));
                    }
                })
                .catch((err) => callback(common_functions.catch_error(err)));
        } else {
            let errors = validation.errors.errors;
            return callback(response.error("form_field_required", errors));
        }
    }

    update_permission_status(query_data, callback) {
        let rules = {
            type_id:"required",
            group_id: "required",
        };
        switch (query_data.user_type) {
            case "merchant":
                query_data.table = "merchant_type_has_group";
                query_data.where = {
                    merchant_type_id: query_data.type_id
                }
                query_data.insert_data = {
                    group_id: query_data.group_id,
                    merchant_type_id: query_data.type_id,
                    status: query_data.status,
                }
                rules.type_id = "required";
                break;
            case "admin":
                query_data.table = "admin_type_has_group";
                query_data.where = { admin_type_id: query_data.type_id }
                rules.type_id = "required";
                query_data.insert_data = {
                    group_id: query_data.group_id,
                    admin_type_id: query_data.type_id,
                    status: query_data.status,
                }
                break;
            case "tenant":
            default:
                query_data.table = "tenant_type_has_group";
                query_data.where = { tenant_type_id: query_data.type_id }
                rules.type_id = "required";
                query_data.insert_data = {
                    group_id: query_data.group_id,
                    tenant_type_id: query_data.type_id,
                    status: query_data.status,
                }
        }
        let validation = new Validator(query_data, rules)
        if (validation.passes() && !validation.fails()) {
            queries.update_permission_status("check_is_exist", query_data)
                .then((result) => {
                    if (result.length > 0) {
                        return queries.update_permission_status("update_status", query_data)
                    } else {
                        return queries.update_permission_status("insert_new", query_data)
                    }
                }).then((result) => {
                    return callback(response.success("Updated"));
                })
                .catch((err) => callback(common_functions.catch_error(err)));
        } else {
            let errors = validation.errors.errors;
            return callback(response.error("form_field_required", errors));
        }
    }
    remove_api(form_data, callback) {
        let rules = {
            user_type: "required",
            assigned_id: "required",
        };
        let validation = new Validator(form_data, rules)
        if (validation.passes() && !validation.fails()) {
            queries.remove_api("remove", form_data)
                .then((result) => {
                    return callback(response.success("api_removed"));
                })
                .catch((err) => callback(common_functions.catch_error(err)));
        } else {
            let errors = validation.errors.errors;
            return callback(response.error("form_field_required", errors));
        }
    }
    
};