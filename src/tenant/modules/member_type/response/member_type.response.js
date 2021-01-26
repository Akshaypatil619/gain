let response = {
    form_field_required: {
        message: "Form fields required",
        code: "CUS_0001",
    },
    member_type_not_found: {
        message: "member type not found",
        code: "CUS_0002"
    },
    member_type_created_successfully: {
        message: "member type created successfully",
        code: "CUS_0003"
    },
    member_type_created_fail: {
        message: "member type created fail",
        code: "CUS_0003"
    },
    member_type_fetch_successfully: {
        message: "member type fetch successfully",
        code: "CUS_OOO4"
    },
    member_type_already_exist: {
        message: "member type already exist",
        code: "CUS_0005"
    },
    member_type_fetch_error:{
        message: "member type fetch error",
        code: "CUS_0006" 
    },
    member_type_removed_success:{
        message:"member type removed successfully",
        code:"CUS_0007"
    },
    member_type_removed_failed:{
        message:"member type remove fail",
        code:"CUS_0007"
    },
    member_type_updated_successfully: {
        message: "member type updated successfully",
        code: "CUS_0008"
    },
    member_type_update_fail: {
        message: "member type update fail",
        code: "CUS_0009"
    },
    member_type_found:{
        message: "member type found",
        code: "CUS_0010"  
    },
    member_type_status_updated_successfully:{
        message: "Member Type Status Updated Successfully",
        code: "CUS_0011"     
    },
    member_type_status_update_fail:{
        message: "Member Type Status Update Fail",
        code: "CUS_0012" 
    }
}
module.exports = response;
module.exports.success = function (key, values) {
    let returnResponse = response[key] == undefined ?{}:response[key];
    returnResponse.status = true;
    values ? returnResponse.values = values : "";
    return returnResponse;
}
module.exports.failed = function (key, errors) {
    let returnResponse = response[key] == undefined ?{}:response[key];
    returnResponse.status = false;
    errors && errors!=key ? returnResponse.error = errors : "";
    return returnResponse;
}