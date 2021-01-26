'use strict';
let response = {
   form_fields_required: {
      message: 'Form fields required',
      code: 'OWN_0001'
   },
   tenant_found: {
      message: 'Tenant data Found',
      code: 'OAM_0002'
   },
   tenant_not_found: {
      message: 'Tenant not found',
      code: 'OAM_0003'
   },
   downloading_is_prosses: {
      message: 'Downloading is in prosses',
      code: 'DOWN_0001'
   },
   excel_data_not_found: {
      message: 'Excel data not found',
      code: 'DOWN_0002'
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
