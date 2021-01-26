let response = {
   "duplicate_camp": { "status": false, "message": "campaign id already exist", "code": "CUS_0004" } ,
   "duplicate_merchant": { "status": false, "message": "Merchant already exist", "code": "CUS_0004" } ,
   "failed_add_coupon":{"status": false, "message": "failed to add coupon", "code": "CUS_0004"},
   "failed_gen_coupon":{"status": false, "message": "failed to genrate coupon", "code": "CUS_0004"},
   "add_coupon_success":{"status": true, "message": "coupon successfully added", "code": "CUS_0004"},
   "update_coupon_success":{"status": true, "message": "coupon successfully updated", "code": "CUS_0004"},
  "form_fields_required": {"message": 'Form fields required',code: 'OWN_0001'},
   "failed_update_coupon":{"status": false, "message": "failed to update coupon", "code": "CUS_0004"},
   "duplicate_code":{"status": false, "message": "duplicate coupon code found", "code": "CUS_0004"},
   "user_found":{"status": true},
   "merchant_found":{"status": true},
   "prefix_not_found":{"status": false},
   "prefix_found":{"status": true},
   coupon_found: {
    message: 'Coupon data Found',
    code: 'OWN_0002'
 },
 coupon_not_found: {
    message: 'Coupon not found',
    code: 'OWN_0003'
 },

};
module.exports = response;
module.exports.success = function (key, values) {
    let returnResponse = response[key] == undefined ? {} : response[key];
    returnResponse.status = true;
    values ? returnResponse.values = values : "";
    return returnResponse;
}
module.exports.failed = function (key, errors) {
    let returnResponse = response[key] == undefined ? {} : response[key];
    returnResponse.status = false;
    errors && errors != key ? returnResponse.error = errors : "";
    return returnResponse;
}