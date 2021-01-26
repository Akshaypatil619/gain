'use strict';
let response = {
   process_conflict: {
      message: 'An instance of Flat file process is already running',
      code: 'G_0001'
   },
   flat_file_under_process: {
      message: "Flat file is under process",
      code: 'G_0002'
   },
   no_record_to_sync: {
      message: "No new record available for sync",
      code: 'G_0003'
   },
   sync_customers_found: {
      message: 'Customers found',
      code: 'G_0004'
   },
   process_id_not_found: {
      message: 'Process Id not found',
      code: 'G_0005'
   },
   process_update_success: {
      message: 'Process status update success',
      code: 'G_0006'
   },
   form_fields_required: {
      message: 'Form fields required',
      code: 'G_0007'
   },
   school_not_found: 'School not found',
   product_not_found: 'Product not found',
   customer_already_present: 'Customer already exists',
   customer_not_found: 'Customer not present',
   source_not_found: 'Source not found',
   duplicate_transaction_id: 'Duplicate transaction ID',
   staff_id_already_present: 'Staff ID already exists',
   invalid_date_format: 'Invalid date format',
   invalid_points: 'Points should be greater than zero',
   nationality_not_found:'Nationality not found.',

   login_reports_generated: {
      message: 'Login reports are generated',
      code: 'G_0008'
   },
   fnf_reports_generated: {
      message: 'Friends & Family reports are generated',
      code: 'G_0009'
   },
   customer_reports_generated: {
      message: 'Customer reports are generated',
      code: 'G_0010'
   },
   customer_dump_generated: {
	//   message: 'Customer dump generated successfully',
	  message:"Your request to download is in progress, after it's done you can see it from Download Manager.",
      code: 'G_0011'
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
