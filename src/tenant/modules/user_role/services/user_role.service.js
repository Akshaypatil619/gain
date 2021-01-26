let config = require("../../../../../config/config");
let knex = require("../../../../../config/knex");
let userRoleModel = new (require("../models/" + config.db_driver + "/user_role_model." + config.db_driver));
let responseMessages = require("../responses/user_role.response");
module.exports = class UserRoleService {
    addTenantUserRole(_data) {
        let data = _data.data;
        return userRoleModel.getRoleMaster({
            name: data.name,
            tenant_id: _data.tenant_id
        })
            .then((role_result) => {
                if (role_result.length === 0) {
                    return userRoleModel.addTenantUserRole(data)
                } else {
                    // throw status_code index
                    throw new Error("tenant_user_role_exist");
                }
            }).then((id) => {
                return responseMessages.success("tenant_user_role_added_success", { id: id });
            })
            .catch(function (err) {
                // return error response
                let error = (typeof err.errors != 'undefined') ? err.errors : err.message;
                return responseMessages.failed(responseMessages.hasOwnProperty(err.message) ? err.message : "tenant_user_role_error", error)
            });
    }

    editTenantUserRole(_data) {
        let data = _data.data;
        let role_id = data.role_id;
        delete data.role_id;
        return userRoleModel.updateTenantUserRole({
            role_id: role_id,
            data: data
        })
            .then((id) => {
                return responseMessages.success("tenant_user_role_update_success");
            })
            .catch(function (err) {
                // return error response
                let error = (typeof err.errors != 'undefined') ? err.errors : err.message;
                return responseMessages.failed(responseMessages.hasOwnProperty(err.message) ? err.message : "tenant_user_role_error", error)
            });
    }

    getTenantUserRolesList(_data) {
        let return_result = {};
        _data.columns = {
            role_id: "master_tenant_user_role.id",
            name: "master_tenant_user_role.name",
            description: "master_tenant_user_role.description",
            is_admin: "master_tenant_user_role.is_admin",
            status: knex.raw("if(master_tenant_user_role.status=1,'Active','Inactive')"),
            created_by: "tenant_users.name",
            created_time: "master_tenant_user_role.created_at"
        };
        let obj = userRoleModel.getTenantUserRolesList(_data);
        delete _data.limit;
        delete _data.offset;
        _data.columns = {
            total_records: knex.raw("COUNT(*)")
        }
        let totalRecordObj = userRoleModel.getTenantUserRolesList(_data);
        return obj.then((result) => {
            if (result.length > 0) {
                result = result.map((res) => {
                    return (res.is_admin === 1 ? Object.assign(res, { editable: false }) : Object.assign(res, { editable: true }))
                });
                return_result.tenant_users_role_list = result
                return totalRecordObj;
            } else {
                throw new Error("tenant_user_role_not_found");
            }
        })
            .then((result) => {
                if (result.length > 0) {
                    return_result.tenant_users_role_total_record = result[0].total_records;
                }
                return responseMessages.success("tenant_tenant_user_role_not_found", return_result);

            })
            .catch(function (err) {
                // return error response
                let error = (typeof err.errors != 'undefined') ? err.errors : err.message;
                return responseMessages.failed(responseMessages.hasOwnProperty(err.message) ? err.message : "tenant_user_role_error", error)
            });
    }

    getTenantUserRoleById(_data) {
        return userRoleModel.getTenantUserRoleById(_data)
            .then((result) => {
                if (result.length > 0) {
                    return responseMessages.success("tenant_user_role_list_fetched_success", result);
                } else {
                    throw new Error("tenant_user_role_not_found");
                }
            })
            .catch(function (err) {
                // return error response
                let error = (typeof err.errors != 'undefined') ? err.errors : err.message;
                return responseMessages.failed(responseMessages.hasOwnProperty(err.message) ? err.message : "tenant_user_role_error", error)
            });
    }

    updateStatus(_data) {
        // _data.data.tenant_id = _data.tenant_id
        return userRoleModel.updateRoleStatus({
            role_id: _data.data.role_id,
            data: {
                status: _data.data.status
            }
        })
            .then((id) => {
                return responseMessages.success("tenant_user_role_status_update_success");
            })
            .catch(function (err) {
                // return error response
                let error = (typeof err.errors != 'undefined') ? err.errors : err.message;
                return responseMessages.failed(responseMessages.hasOwnProperty(err.message) ? err.message : "update_tenant_user_role_error", error)
            });
    }

}