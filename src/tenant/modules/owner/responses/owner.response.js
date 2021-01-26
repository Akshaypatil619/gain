'use strict';
let response = {
   form_fields_required: {
      message: 'Form fields required',
      code: 'OWN_0001'
   },
   owner_found: {
      message: 'Owner data Found',
      code: 'OWN_0002'
   },
   owner_not_found: {
      message: 'Owner not found',
      code: 'OWN_0003'
   },
   owner_created: {
      message: 'Owner created successfully',
      code: 'OWN_0004'
   },
   owner_created_failed: {
      message: 'Owner not created',
      code: 'OWN_0005'
   },
   owner_updated: {
      message: 'Owner updated successfully',
      code: 'OWN_0006'
   },
   owner_updated_failed: {
      message: 'Owner not created',
      code: 'OWN_0007'
   },
   owner_exist: {
      message: 'Owner is already exists',
      code: 'OWN_0008'
   },
   invalid_commissions: {
      message: 'Sum of commsion must be less than 100',
      code: 'OWN_0009'
   },
   unit_not_available: {
      message: 'Unit is not available',
      code: 'Unit_0001'
   },
   manual_settlement_success: {
      message: 'Manual settlement successful',
      code: 'OWN_0010'
   },
   no_transaction_to_settle: {
      message: 'No transactions available for settlement',
      code: 'OWN_0011'
   },
   manual_settlement_list_not_found: {
      message: 'Manual settlement list not found',
      code: 'OWN_0012'
   },
   manual_settlement_list_found: {
      message: 'Manual settlement list found',
      code: 'OWN_0013'
   },
   unit_not_available: {
      message: 'Unit not available',
      code: 'OWN_0014'
   },
   unit_list_found: {
      message: 'Unit list found',
      code: 'OWN_0015'
   }
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
