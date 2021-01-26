let messages = require("../cc/response_codes/third_party_messages");
let status_codes = require("../cc/response_codes/third_party_status_codes");
let knex = require("../../config/knex.js");
let TpResponseHandler = require("../core/TpResponseHandler.js");
const config = require('../../config/config');

let tpResponseHandler = new TpResponseHandler();
const jwt = require('jsonwebtoken');

module.exports.check_api_validation = function (req, res, next) {
    let tp_application_key = req.header("TP_APPLICATION_KEY");
    let cc_token = req.header("CC_TOKEN");

    if (req._parsedUrl.pathname == '/api/cc/user/getCCToken' &&
        (tp_application_key === "" || tp_application_key === null || tp_application_key === undefined)) {

        let response_result = {
            status: false,
            status_code: status_codes.invalid_tp_application_key,
            message: messages['EN'].invalid_tp_application_key
        };
        tpResponseHandler.response(req, res, response_result);

    } else if (req._parsedUrl.pathname == '/api/cc/user/getCCToken') {
        knex("third_party_applications")
            .select('tenant_id', 'id')
            .where("third_party_applications.tp_application_key", tp_application_key)
            .where("third_party_applications.status", 1)
            .then(function (result) {
                if (result.length > 0) {
                    req['third_party_app_id'] = result[0].id;
                    req['tenant_id'] = result[0].tenant_id;

                    next();

                } else {
                    let response_result = {
                        status: false,
                        status_code: status_codes.invalid_tp_application_key,
                        message: messages['EN'].invalid_tp_application_key
                    };
                    tpResponseHandler.response(req, res, response_result);
                }
            }).catch(function (err) {
                let result = status_codes.check_error_code("DATABASE", err.errno);
                tpResponseHandler.response(req, res, result);
            })
    } else {
        if (cc_token === "" || cc_token === null || cc_token === undefined) {
            let response_result = {
                status: false,
                status_code: status_codes.invalid_cc_token,
                message: messages['EN'].invalid_cc_token
            };
            tpResponseHandler.response(req, res, response_result);
        } else {
            jwt.verify(cc_token, config.cc_token_secret_key, function (err, decoded) {
                if (err) {
                    let response_result;
                    if (err.name == 'TokenExpiredError')
                        response_result = {
                            status: false,
                            status_code: status_codes.cc_token_expire,
                            message: messages['EN'].cc_token_expire
                        };
                    else response_result = {
                        status: false,
                        status_code: status_codes.invalid_cc_token,
                        message: messages['EN'].invalid_cc_token
                    };
                    tpResponseHandler.response(req, res, response_result);
                } else {
                    Object.keys(decoded).forEach(key => {
                        req[key] = decoded[key];
                    });

                    next();
                }
            })
        }
    }
};