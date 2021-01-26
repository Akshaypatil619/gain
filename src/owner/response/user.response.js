'use strict';
let response = {
   form_fields_required: {
      message: 'Form fields are required',
      code: 'U001'
   },
   properties_found: {
      message: 'Properties found',
      code: 'U002'
   },
   properties_not_found: {
      message: 'Properties not found',
      code: 'P002'
   },
   property_type_found: {
       message: 'Property type found',
       code: 'U003'
   },
   property_type_not_found: {
      message: 'Property type not found',
      code: 'P003'
  },
   building_found: {
      message: 'Building found',
      code: 'B001'
   },
   building_not_found: {
      message: 'Building not found',
      code: 'B002'
   },
   property_manager_found: {
      message: 'Property Manager found',
      code: 'PM0001'
   },
   property_manager_not_found: {
      message: 'Property Manager not found',
      code: 'PM0002'
   },
   units_found: {
       message: 'Units found',
       code: 'U004'
   },
   units_not_found: {
      message: 'Units not found',
      code: 'U005'
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
  }
}

// module.exports = response;
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
