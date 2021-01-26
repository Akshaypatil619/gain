let SNS_model = require("../notification_model/sns");
let sns = new SNS_model();

let messages = require("../../../config/messages.js");
let status_codes = require("../../../config/response_status_codes.js");

let Response_adapter = require("../../core/response_adapter");

let response = new Response_adapter();

let Common_functions = require("../../core/common_functions.js");
let common_functions = new Common_functions();
let Push_notification_common_functions = require("../../core/push_notifiction/common_push_notification_function");
let push_notification_common_functions = new Push_notification_common_functions();

module.exports = class Notification {
    add_notification_provider(query_data, callback) {
        if (query_data.name === 'sns') {
            sns.add_SNS_provider(query_data, (success) => {
                return callback(success);
            });
        }
    }

    broadcast_notification(body_data, callback) {
        push_notification_common_functions.get_notification_provider_data(body_data['tenant_id'], (providerData) => {
            if (providerData.status) {
                if (providerData.data.length > 0) {
                    if (providerData.data[0].name == 'sns') {
                        sns.broadcast_notification(providerData, body_data, (result) => {
                            return callback(result);
                        });
                    }
                } else {
                    return callback(response.response_error(false, status_codes.push_notification_provider_not_found, messages.push_notification_provider_not_found));
                }
            } else {
                callback(common_functions.catch_error(providerData.data));
            }
        });
    }

    send_notification(body_data, callback) {
        push_notification_common_functions.get_notification_provider_data(body_data['tenant_id'], (providerData) => {
            if (providerData.status) {
                if (providerData.data.length > 0) {
                    if (providerData.data[0].name == 'sns') {
                        sns.send_notification(providerData, body_data, (result) => {
                             console.log("sne dnotification information ",result);
                            return callback(result);
                        });
                    }
                } else {
                    return callback(response.response_error(false, status_codes.push_notification_provider_not_found, messages.push_notification_provider_not_found));
                }
            } else {
                callback(common_functions.catch_error(providerData.data));
            }
        });
    }
};