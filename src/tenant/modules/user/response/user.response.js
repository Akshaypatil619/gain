let response = {
    form_field_required: {
        message: "Form fields required",
        code: "USR_0001",
    },
    login_failed: {
        message: "Invalid user credential",
        code: "USR_0002",
    },
    password_dose_not_match: {
        message: "Invalid user credential",
        code: "USR_0003",
    },
    deactivate_tenant: {
        message: "Deactivate tenant",
        code: "USR_0004",
    },
    login_success: {
        message: "Login success",
        code: "USR_0005",
    },
    tenant_redemption_channel_create_success: {
        message: "Tenant redemption channel created",
        code: "USR_0006",
    },
    tenant_redemption_channel_error: {
        message: "Tenant redemption channel error",
        code: "USR_0007",
    },
    tenant_redemption_channel_update_success: {
        message: "Tenant redemption channel updated ",
        code: "USR_0008"
    },
    tenant_redemption_channel_found: {
        message: "Tenant redemption channel found.",
        code: "USR_0009"
    },
    tenant_redemption_channel_not_found: {
        message: "Tenant redemption channel found.",
        code: "USR_0010",
    },
    profile_found: {
        message: "Profile found",
        code: "USR_0011",
    },
    profile_not_found: {
        message: "Profile not found",
        code: "USR_0012",
    },
    profile_fetch_error: {
        message: "Profile fetch error",
        code: "USR_0013",
    },
    profile_update_success: {
        message: "Profile update success",
        code: "USR_0014",
    },
    profile_updating_failed: {
        message: "Profile update failed",
        code: "USR_0015",
    },
    rule_type_found: {
        message: "Rule type found",
        code: "USR_0016",
    },
    rule_type_not_found: {
        message: "Rule type not found",
        code: "USR_0017",
    },
    rule_type_fetch_error: {
        message: "Rule type fetch error",
        code: "USR_0018",
    },
    phone_already_exist: {
        message: "Phone exist",
        code: "USR_0019",
    },
    email_already_exist: {
        message: "Email exist",
        code: "USR_0020",
    },
    tenant_user_create_success: {
        message: "Tenant user create success",
        code: "USR_0021",
    },
    add_tenant_error: {
        message: "Add user error",
        code: "USR_0022",
    },
    tenant_user_does_not_exist: {
        message: "Tenant use does not exist",
        code: "USR_0023"
    },
    tenant_user_details_updated_success: {
        message: "Admin user updated successfully",
        code: "USR_0024"
    },
    update_details_error: {
        message: "Update details error",
        code: "USR_0025"
    },
    tenant_user_list_fetched_success: {
        message: "Tenant user list found",
        code: "USR_0026",
    },
    tenant_user_fetch_error: {
        message: "Tenant user fetch error",
        code: "USR_0027",
    },
    tenant_user_found: {
        message: "Tenant user found",
        code: "USR_0028"
    },
    user_details_updated: {
        message: "User details updated",
        code: "USR_0029"
    },
    old_password_incorrect: {
        message: "Old password incorrect",
        code: "USR_003",
    },
    password_changed: {
        message: "Password changed",
        code: "USR_0031",
    },
    password_change_error: {
        message: "Password change error",
        code: "USR_0032",
    },
    tenant_branch_not_found: {
        message: "Tenant branch not found",
        code: "USR_0033",
    },
    tenant_branch_found: {
        message: "Tenant branch found",
        code: "USR_0034",
    },
    tenant_branch_fetch_error: {
        message: "Tenant branch fetch error",
        code: "USR_0035",
    },
    dashboard_data_found: {
        message: "Dashboard data found",
        code: "USR_0036"
    },
    dashboard_data_fetch_error: {
        message: "Dashboard data fetch error",
        code: "USR_0037"
    },
    dashboard_graph_found: {
        message: "Dashboard graph data found",
        code: "USR_0038",
    },
    dashboard_graph_data_fetch_error: {
        message: "Dashboard graph data fetch error",
        code: "USR_0039",
    },
    unlock_point_successfully:{
        message:"Point unlocked",
        code:"USR_004",
    },
unlock_point_error:{
    message:"Unlock point error",
    code:"USR_0041",
},
}

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