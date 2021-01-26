
'use strict';
let userResponse = {
    form_fields_required: {
        message: 'Form fields are required',
        code: 'TU_0001'
    },
    oam_user_not_found: {
        message: 'oam User not found',
        code: 'TU_0003'
    },

    oam_user_found: {
        message: 'oam User found',
        code: 'TU_0004'
    },
    current_password_does_not_match: {
        message: 'Current password does not match',
        code: 'TU_0006'
    },
    password_updated: {
        message: 'Password updated successfully',
        code: 'TU_0007'
    },
    data_updated: {
        message: 'Profile updated successfully',
        code: 'TU_0008'
    },
    data_not_updated: {
        message: 'data_not_updated',
        code: 'TU_0009'
    },
    phone_number_already_exist: {
        message: 'phone_number_already_exist',
        code: 'TU_0010'
    },
    media_inserted: {
        status: true,
        message: "Media Inserted Successfully",
        code: "TU_0011"
    },
    media_not_inserted: {
        status: true,
        message: "Media Not Inserted Successfully",
        code: "TU_0012"
    },

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
    if (response[err.message] == undefined)
        console.log(err);
    returnResponse.status = false;
    return returnResponse;
}
