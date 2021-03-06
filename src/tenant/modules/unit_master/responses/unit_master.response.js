'use strict';
let response = {
   form_fields_required: {
      message: 'Form fields required',
      code: 'UM_0001'
   },
   unit_master_found: {
      message: 'Unit master data Found',
      code: 'UM_0002'
   },
   unit_master_not_found: {
      message: 'Unit master not found',
      code: 'UM_0003'
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
