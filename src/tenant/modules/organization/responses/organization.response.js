'use strict';
let response = {
   form_fields_required: {
      message: 'Form fields required',
      code: 'ORG_0001'
   },
   organization_found: {
      message: 'Organization data Found',
      code: 'ORG_0002'
   },
   organization_not_found: {
      message: 'Organization not found',
      code: 'ORG_0003'
   },
   organization_created: {
      message: 'Organization created successfully',
      code: 'ORG_0004'
   },
   organization_created_failed: {
      message: 'Organization not created',
      code: 'ORG_0005'
   },
   organization_updated: {
      message: 'Organization updated successfully',
      code: 'ORG_0006'
   },
   organization_updated_failed: {
      message: 'Organization not created',
      code: 'ORG_0007'
   },
   // organization_exist: {
   //    message: 'Organization updated successfully',
   //    code: 'ORG_0008'
   // }
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
