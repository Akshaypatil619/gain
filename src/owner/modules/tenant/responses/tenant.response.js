'use strict';
let response = {
   form_fields_required: {
      message: 'Form fields required',
      code: 'OWN_0001'
   },
   tenant_found: {
      message: 'Tenant data Found',
      code: 'OWN_0002'
   },
   tenant_not_found: {
      message: 'Tenant not found',
      code: 'OWN_0003'
   },
   tenant_created: {
      message: 'Tenant created successfully',
      code: 'OWN_0004'
   },
   tenant_created_failed: {
      message: 'Tenant not created',
      code: 'OWN_0005'
   },
   tenant_updated: {
      message: 'Tenant updated successfully',
      code: 'OWN_0006'
   },
   tenant_updated_failed: {
      message: 'Tenant not created',
      code: 'OWN_0007'
   },
   tenant_exist: {
      message: 'This tenant already exists',
      code: 'OWN_0008'
   },
   owner_not_exist: {
      message: 'Owner does not exists',
      code: 'OWN_0009'
   },
   invalid_commissions: {
      message: 'Sum of commsion must be less than 100',
      code: 'OWN_0009'
   },
   unit_not_available: {
      message: 'Unit is not available',
      code: 'Unit_0001'
   },
   country_found: {
      message: 'Country data Found',
      code: 'CON_0002'
   },
   country_not_found: {
      message: 'Country not found',
      code: 'CON_0003'
   },
   emirate_found: {
      message: 'Emirate data Found',
      code: 'EMI_0002'
   },
   emirate_not_found: {
      message: 'Emirate not found',
      code: 'EMI_0003'
   },
   building_found: {
      message: 'Building data Found',
      code: 'BUIL_0002'
   },
   building_not_found: {
      message: 'Building not found',
      code: 'BUIL_0003'
   },
   incorrect_user_type: {
      message: 'Incorrect user type',
      code: 'TNT_1001'
   },
   tenant_staying_date_overlapped: {
      message: 'Tenant staying date overlapped for this unit',
      code: "TNT_1002"
   },
   unit_not_exist_to_this_owner: {
      message: 'This unit does not exist for this owner',
      code: 'OWN_0002'
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
