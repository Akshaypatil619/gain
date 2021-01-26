'use strict';
let response = { 
   form_fields_required: {
      message: 'Form fields required',
      code: 'CO_0001'
   },
   emirate_not_found: {
      message: 'Emirate not found',
      code: 'CO_0002'
   },
   emirate_found: {
      message: 'Emirate found',
      code: 'CO_0003'
   },
   curriculum_found: {
      message: 'Curriculum found',
      code: 'CO_0004'
   },
   curriculum_not_found: {
      message: 'Curriculum not found',
      code: 'CO_0005'
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
