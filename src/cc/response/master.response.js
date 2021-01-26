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
      code: 'U003'
   },
   property_type_found: {
       message: 'Property type found',
       code: 'U003'
   },
   units_found: {
       message: 'Units found',
       code: 'U004'
   },
   unit_type_updated:{
      message: "Unit Type updated",
      code: "Unit_0001"  
  },
  unit_type_not_updated:{
      message: "Unit Type not updated",
      code: "Unit_0002"  
  },
  family_email_exist: {
   message: "Family email exist",
   code: "FAM_0001"
  },
  family_phone_exist: {
   message: "Family mobile exist",
   code: "FAM_0002"
  },
  family_created: {
   message: "Family created successfully",
   code: "FAM_0003"
  },
  family_created_failed: {
   message: "Family created failed",
   code: "FAM_0004"
  },
  family_found: {
   message: "Family found",
   code: "FAM_0005"
  },
  family_not_found: {
   message: "Family not found",
   code: "FAM_0006"
  },

  referrer_does_not_exist: {
   message: "Referrer does not exist",
   code: "FAM_0007"
  },
  family_does_not_exist: {
   message: "Family does not exist",
   code: "FAM_0008"
  },
  family_parent_does_not_exist: {
   message: "Family parent does not exist",
   code: "FAM_0009"
  },
  family_deleted: {
   message: "Family deleted successfully",
   code: "FAM_0009"
  },
  family_created_failed: {
   message: "Family creation failed",
   code: "FAM_0010"
  },
  family_threshold: {
   message: "You have added maximum no of families",
   code: "FAM_0011"
  },
  customer_not_exists:{
     message: "Owner does not exist",
     code: "OWN_001",
  },
  incorrect_user_type: {
      message: "Incorrect user type",
      code: "MST_1001"
  },
  rent_unit_found: {
      message: "Unit for rent found",
      code: "MST_1002"
  },
  rent_unit_not_found: {
     message: "No unit available for rent",
     code: "MST_1003"
  },
  unit_not_exists: {
      message: "Unit does not exist",
      code: "UNIT_001",
  },
  invalid_unit_combination: {
      message: "This unit is not exist for this owner",
      code: "UNIT_002",
   },
   unit_updated: {
      message: "Unit updated successfully",
      code: "UNIT_003",
   },
   unit_not_updated: {
      message: "Unit is not updated",
      code: "UNIT_004",
   },
   data_found: {
      message: "Data found",
      code: "DATA_0001",
   },
   data_not_found: {
      message: "Data not found",
      code: "DATA_0002",
   },
   broker_found: {
      message: "Brokers for building found",
      code: "B0010",
   },
   broker_not_found: {
      message: "Brokers for building fnot ound",
      code: "B0011",
   },
  property_already_present: {message:'Property already exists'},
  property_code_not_exist:{message:'property Type code not exist'},
  property_elevation_code_not_exist:{message:'Property elevation code not exist'},
  oam_code_not_exist:{message:'oam code not exist'},
  country_code_not_exist:{message:'Country code not exist'},
  emirate_code_not_exist:{message:'Emirate code not exist'},
  building_already_present: {message:'Building already exists'},
  record_not_found:{message:'Record Not Found'},
  building_code_not_exist: {message:'Building code not exist'},
  broker_code_not_exist:{message:'Broker code not exist'},
  furnishing_code_not_exist:{message:'Furnish code not exist'},
  unit_already_exist:{message:'Unit already exist'},
  broker_already_exist:{message:'Broker already exist'},
  promocode_not_exist:{message:'promocode does not exist'},
  promocode_success:{message:'promocode used successfully'}

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
