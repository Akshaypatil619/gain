let response = {
    "EN": {
        "user_not_found": {
            "status":false,
            "message": 'We are sorry. We could not find your account.',
            "code": 'U001'
         },
        "user_found": {
            "status":true,
            "message": 'User found',
            "code": 'U002'
         },
        "form_field_required": {
            "status": false,
            "message": "Please do fill the required fields",
            "code": "CUS_0001"
        },
        "customer_not_found": {
            "status": false,
            "message": "We are sorry. We could not find your account.",
            "code": "CUS_0002"
        },
        "customer_found": {
            "status": true,
            "message": "Customer Found",
            "code": "CUS_0003"
        },
        "invalid_credential": {
            "status": false,
            "message": "Sorry, this email id is not registered with us. Please contact us at support@gain.ae if any issues.",
            "code": "CUS_0004"
        },
        "customer_inactive": {
            "status": false,
            "message": "This account is inactive",
            "code": "CUSINVALID_0004"
        },
        "otp_sent": {
            "status": true,
            "message": "OTP has been sent to your registered mobile number",
            "code": "CUS_0005",
            "values": {}
        },
        "otp_failed": {
            "status": false,
            "message": "OTP not sent",
            "code": "CUS_0006"
        },
        "otp_verified": {
            "status": true,
            "message": "OTP verified successfully",
            "code": "CUS_0007"
        },
        "invalid_otp": {
            "status": false,
            "message": "The OTP you entered is Invalid. Please enter the correct OTP",
            "code": "CUS_0008"
        },
        "otp_expired": {
            "status": false,
            "message": "OTP entered is expired. Please generate a new OTP and try again",
            "code": "CUS_0009"
        },
        "otp_resend": {
            "status": true,
            "message": "OTP resent successfully",
            "code": "CUS_0010",
            "values": {}
        },
        "max_attempt_over": {
            "status": false,
            "message": "You have reached your max attempt",
            "code": "CUS_0011"
        },
        "user_does_not_exist": {
            "status": false,
            "message": "This account doesn’t not exist. Please try again with valid credentials",
            "code": "CUS_0011"
        },
        "invalid_user_type": {
            "status": false,
            "message": "Only owner can set their default property",
            "code": "CUS_0012"
        },
        "unit_not_found": {
            "status": false,
            "message": "Unit not found for this user",
            "code": "CUS_0013"
        },
        "invalid_unit": {
            "status": false,
            "message": "Invalid uint ID provided",
            "code": "CUS_0014"
        },
        "default_unit_updated": {
            "status": true,
            "message": "Default unit updated successfully",
            "code": "CUS_0015"
        },
        "unit_details_found": {
            "status": true,
            "message": "Unit details found",
            "code": "CUS_0016"
        },
        "transaction_added": {
            "status": true,
            "message": "Transaction added successfully",
            "code": "CUS_0017"
        },
        "property_details_not_found": {
            "status": false,
            "message": "Property details not found",
            "code": "CUS_0018"
        },
        "db_error": {
            "status": false,
            "message": "Database error! Kindly show this message to the developer.",
            "code": "CUS_0019"
        },
        "transactions_found": {
            "status": true,
            "message": "Transactions found",
            "code": "CUS_0020"
        },
        "transaction_not_found": {
            "status": false,
            "message": "Transaction not found",
            "code": "CUS_0021"
        },
        "transaction_not_pending": {
            "status": false,
            "message": "Transaction is not in pending status",
            "code": "CUS_0022"
        },
        "transaction_time_exceeded": {
            "status": false,
            "message": "Transaction time exceeded",
            "code": "CUS_0023"
        },
        "transaction_dispute_success": {
            "status": true,
            "message": "Transaction marked as dispute",
            "code": "CUS_0024"
        },
        "coupon_code_not_found": {
            "status": false,
            "message": "Coupon code not found",
            "code": "CUS_0025"
        },
        "coupon_code_found": {
            "status": true,
            "message": "Coupon code found and assigned to customer",
            "code": "CUS_0026"
        },
        "coupon_consumed_success": {
            "status": true,
            "message": "Coupon code consumed successfully",
            "code": "CUS_0026"
        },
        "customer_transaction_not_found": {
            "status": false,
            "message": "Customer transactions not found",
            "code": "CUS_0027"
        },
        "customer_transactions_found": {
            "status": true,
            "message": "Customer transactions found",
            "code": "CUS_0028"
        }
    }
};

module.exports.success = function (key, values, language_code = 'EN') {
    let returnResponse = response[language_code][key] == undefined ? {} : response[language_code][key];
    returnResponse.status = true;
    values ? returnResponse.values = values : "";
    return returnResponse;
}
module.exports.failed = function (key, errors, language_code = 'EN') {
    let returnResponse = response[language_code][key] == undefined ? {} : response[language_code][key];
    returnResponse.status = false;
    errors && errors != key ? returnResponse.error = errors : "";
    return returnResponse;
}

module.exports.catch_error = function (err) {
    let returnResponse = response[err.message] == undefined ? { message: err.message } : response[err.message];
    if (response[err.message] == undefined)
       console.log(err);
    returnResponse.status = false;
    return returnResponse;
 }