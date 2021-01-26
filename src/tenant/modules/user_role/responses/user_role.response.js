let response = {
    form_field_required: {
        message: "Form fields required",
        code: "USR_ROLE_0001",
    },
    tenant_user_role_exist: {
        message: "Tenant user role exist",
        code: "USR_ROLE_0002",
    },
    tenant_user_role_added_success: {
        message: "Tenant user role added.",
        code: "USR_ROLE_0003",
    },
    tenant_user_role_error: {
        message: "Tenant user role error",
        code: "USR_ROLE_0004",
    },
    tenant_user_role_update_success: {
        message: "Tenant user rule updated",
        code: "USR_ROLE_0005",
    },
    tenant_user_role_not_found: {
        message: "Tenant user role not found",
        code: "USR_ROLE_0006",
    },
    tenant_tenant_user_role_not_found: {
        message: "Tenant user role not found",
        code: "USR_ROLE_0007",
    },
    tenant_user_role_list_fetched_success: {
        message: "Tenant user role list fetched",
        code: "USR_ROLE_0008",
    },
    tenant_user_role_status_update_success: {
        message: "Tenant user role status updated",
        code: "USR_ROLE_0009",
    },
};

module.exports = response;
module.exports.success = function (key, values) {
    let returnResponse = response[key] == undefined ? {} : response[key];
    returnResponse.status = true;
    values ? returnResponse.values = values : "";
    return returnResponse;
}
module.exports.failed = function (key, errors) {
    let returnResponse = response[key] == undefined ? {} : response[key];
    returnResponse.status = false;
    errors && errors != key ? returnResponse.error = errors : "";
    return returnResponse;
}