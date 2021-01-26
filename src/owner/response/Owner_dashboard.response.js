
'use strict';
let userResponse = {
    form_fields_required: {
        message: 'Form fields are required',
        code: 'TU_0001'
    },
    Oam_user_not_found: {
        message: 'Oam User not found',
        code: 'TU_0003'
    },
    Oam_user_found: {
        message: 'Oam User found',
        code: 'TU_0004'
    },
    password_does_not_match: {
        message: 'password_does_not_match',
        code: 'TU_0006'
     },
     password_updated: {
        message: 'password_updated',
        code: 'TU_0007'
     },
     dashboard_data_found: {
         message: 'Dashboard data found',
         code: 'TU_0008'
     }

}
module.exports = { userResponse };


module.exports.success = function (key, values) {
    let returnResponse = userResponse[key] == undefined ? {} : userResponse[key];
    returnResponse.status = true;
    values ? returnResponse.values = values : '';
    return returnResponse;
}
module.exports.failed = function (key, errors) {
    let returnResponse = userResponse[key] == undefined ? {} : userResponse[key];
    returnResponse.status = false;
    errors && errors != key ? returnResponse.error = errors : '';
    return returnResponse;
}
module.exports.catch_error = function (err) {
    let returnResponse = userResponse[err.message] == undefined ? { message: err.message } : userResponse[err.message];
    if (userResponse[err.message] == undefined)
        console.log(err);
    returnResponse.status = false;
    return returnResponse;
}
