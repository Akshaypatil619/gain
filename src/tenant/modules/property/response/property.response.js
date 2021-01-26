let response = {
    form_field_required: {
        message: "Form fields required",
        code: "CUS_0001",
    },
    property_not_found: {
        message: "property not found",
        code: "CUS_0002"
    },
    property_found: {
        message: "property found",
        code: "CUS_0003"
    },
    property_created_successfully: {
        message: "property created successfully",
        code: "CUS_0003"
    },
    property_created_fail: {
        message: "property created fail",
        code: "CUS_0003"
    },
    property_fetch_successfully: {
        message: "property fetch successfully",
        code: "CUS_OOO4"
    },
    property_already_exist: {
        message: "property already exist",
        code: "CUS_0005"
    },
    property_fetch_error:{
        message: "property fetch error",
        code: "CUS_0006" 
    },
    property_removed_success:{
        message:"property removed successfully",
        code:"CUS_0007"
    },
    property_removed_failed:{
        message:"property remove fail",
        code:"CUS_0007"
    },
    property_updated_successfully: {
        message: "property updated successfully",
        code: "CUS_0008"
    },
    property_update_fail: {
        message: "property update fail",
        code: "CUS_0009"
    },
    property_found:{
        message: "property found",
        code: "CUS_0010"  
    },
    property_status_updated_successfully:{
        message: "property Status Updated Successfully",
        code: "CUS_0011"     
    },
    property_status_update_fail:{
        message: "property Status Update Fail",
        code: "CUS_0012" 
    },
    property_hot_selling_updated:{
        message: "Property hot selling updated",
        code: "Prop_0001"  
    },
    property_hot_selling_not_updated:{
        message: "Property hot selling not updated",
        code: "Prop_0002"  
    },
    unit_type_updated:{
        message: "Unit Type updated",
        code: "Unit_0001"  
    },
    unit_type_not_updated:{
        message: "Unit Type not updated",
        code: "Unit_0002"  
    },
    update_unit_master_updated:{
        message: "Unit Master updated",
        code: "UnitM_0001"  
    },
    update_unit_master_not_updated:{
        message: "Unit Master not updated",
        code: "UnitM_0002"  
    },
    building_found:{
        message: "Building found",
        code: "Build_0001"  
    },
    building_not_found:{
        message: "Building not found",
        code: "Build_0002"  
    },
    unit_found:{
        message: "Unit found",
        code: "Unit_0001"  
    },
    unit_not_found:{
        message: "Unit not found",
        code: "unit_0002"  
    },
    image_not_found:{
        message: "Image not found",
        code: "unit_0002"  
    },
    building_updated:{
        message: "Building updated",
        code: "build_0001"  
    },
    building_not_updated:{
        message: "Building not updated",
        code: "build_0002"  
    },
    transaction_updated:{
        message: "Transaction updated",
        code: "TXN_0001"  
    },
    transaction_not_updated:{
        message: "Transaction not updated",
        code: "TXN_0002"  
    },
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