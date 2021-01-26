let messages = require("../../config/messages.js");
let status_codes = require("../../config/response_status_codes.js");

module.exports = class Response_adapter {
    response_success(status, status_code, message, values) {
        let return_val = {
            status: status,
            status_code: status_code,
            message: message,
        };
        if (values !== null && values !== undefined && values !== "") {
            return_val['values'] = values;
        }

        return return_val;
    }

    response_error(status, status_code, message, errors) {
        let return_val = {
            status: status,
            status_code: status_code,
            message: message,
        };
        if (errors !== null && errors !== undefined && errors !== "") {
            return_val['errors'] = errors;
        }
        return return_val;
    }

    success(status_keys,values){
        let return_val = {
            status: true,
            status_code: status_codes[status_keys],
            message: messages[status_keys],
        };
        if (values !== null && values !== undefined && values !== "") {
            return_val['values'] = values;
        }

        return return_val;
    }
    error(status_keys,errors){
        let return_val = {
            status: false,
            status_code: status_codes[status_keys],
            message: messages[status_keys],
        };
        if (errors !== null && errors !== undefined && errors !== "") {
            return_val['errors'] = errors;
        }

        return return_val;
    }
};