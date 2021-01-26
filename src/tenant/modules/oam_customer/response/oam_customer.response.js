let response = {
    form_field_required: {
        message: "Form fields required",
        code: "CUS_0001",
    },
    oam_found: {
        message: "OAM found",
        code: "CUS_0002"
    },
    oam_not_found: {
        message: "OAM not found",
        code: "CUS_0002"
    },
    oam_customer_created_successfully: {
        message: "OAM created successfully",
        code: "CUS_0003"
    },
    oam_customer_created_fail: {
        message: "OAM created fail",
        code: "CUS_0003"
    },
    oam_customer_fetch_successfully: {
        message: "OAM fetch successfully",
        code: "CUS_OOO4"
    },
    oam_exist: {
        message: "OAM already exist",
        code: "CUS_0005"
    },
    oam_customer_fetch_error:{
        message: "OAM fetch error",
        code: "CUS_0006" 
    },
    oam_customer_removed_success:{
        message:"OAM removed successfully",
        code:"CUS_0007"
    },
    oam_customer_removed_failed:{
        message:"OAM remove fail",
        code:"CUS_0007"
    },
    oam_customer_updated_successfully: {
        message: "OAM updated successfully",
        code: "CUS_0008"
    },
    oam_customer_update_fail: {
        message: "OAM update fail",
        code: "CUS_0009"
    },
    oam_customer_type_found:{
        message: "OAM found",
        code: "CUS_0010"  
    },
    oam_updated_successfully:{
        message: "OAM Status Updated Successfully",
        code: "CUS_0011"     
    },
    oam_customer_status_update_fail:{
        message: "OAM Status Update Fail",
        code: "CUS_0012" 
    },
    invalid_commissions: {
        message: 'Sum of commsion must be less than 100',
        code: 'CUS_0013'
    },
    oam_exist: {
        message: 'OAM is already exists',
        code: 'CUS_0014'
    },
}

module.exports = response;
module.exports.success = function (key, values) {
   let returnResponse = response[key] == undefined ? {} : response[key];
   returnResponse.status = true;
   values ? returnResponse.values = values : '';
   return returnResponse;
}
module.exports.failed = function (key, errors) {
   let returnResponse = response[key] == undefined ? {} : response[key];
   returnResponse.status = false;
   errors && errors != key ? returnResponse.error = errors : '';
   return returnResponse;
}
module.exports.catch_error = function (err) {
   let returnResponse = response[err.message] == undefined ? { message: err.message } : response[err.message];
   if (response[err.message] == undefined)
      console.log(err);
   returnResponse.status = false;
   return returnResponse;
}