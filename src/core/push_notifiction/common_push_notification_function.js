let knex = require("../../../config/knex.js");

// MODULE LOAD
let sendNotification = require("../push_notification");

module.exports = class Common_push_notification_functions {
    get_notification_provider_data(tenant_id, callback) {
        knex("push_notification_providers")
            .select('*')
            .where("tenant_id", tenant_id)
            .then((providerData) => {
                if (providerData.length > 0) {
                    providerData[0].data = JSON.parse(providerData[0].data);
                }
                return callback({
                    status: true,
                    data: providerData
                });
            }).catch((error) => {
                return callback({
                    status: false,
                    data: error
                });
            });
    }

    get_notification_default_topic(tenant_id, callback) {
        knex("push_notification_topics").select('*')
            .where("tenant_id", tenant_id)
            .where("type", 'global')
            .where("status", 1)
            .then((topicResult) => {
                return callback({
                    status: true,
                    data: topicResult
                });
            }).catch((error) => {
                return callback({
                    status: false,
                    data: error
                });
            });
    }

    get_customer_data(data, callback) {
        knex("customers").select('*')
            .where("tenant_id", data.tenant_id)
            .where("id", data.customer_id)
            .where("status", 1)
            .then((userResult) => {
                return callback({
                    status: true,
                    data: userResult
                });
            }).catch((error) => {
                return callback({
                    status: false,
                    data: error
                });
            });
    }

    insert_notification_history(data) {
        knex("notification_history").insert(data).then((insertedData) => {
            return callback({
                status: true,
                data: insertedData
            });
        }).catch((error) => {
            return callback({
                status: false,
                data: error
            });
        });
    }

    // send_notification(req, keyValueObject, result) {
    //     // req['email_sms_data'] = {};
    //     // if (typeof result.values != 'undefined') {
    //     //     if ((typeof result.values.email_sms_data != 'undefined')) {
    //     //         req['email_sms_data'] = result.values.email_sms_data;
    //     //         delete result.values.email_sms_data;
    //     //     }
    //     // }
    //     // req['email_sms_data']['member_name'] = req['first_name'] + " " + req['last_name'];

    //     // let activity_details = req['activity_detail'][0];
    //     let activity_details = 'reset_password';
    //     knex("notification_templates")
    //         .select("*")
    //         // .where("activity_code", activity_details.activity_code)
    //         .where("activity_code", activity_details)
    //         .where("push_status", 1)
    //         .where('tenant_template', 1)
    //         .then((template_result) => {
    //             if (template_result.length > 0) {
    //                 let body = this.find_and_replace(template_result[0].body, keyValueObject);
    //                 let notification_body_data = {};
    //                 notification_body_data = {
    //                     'customer_id': req['customer_id'],
    //                     'tenant_id': req['tenant_id'],
    //                     'title': template_result[0].title,
    //                     'body': body,
    //                 }
    //                 notification.send_notification(notification_body_data, (result) => {
    //                     /* for  log purpose start */
    //                     if (result.status == true) {
    //                         let notifi_log_cron_data = {};
    //                         notifi_log_cron_data = {
    //                             // 'activity_id': req['activity_detail'][0].id,
    //                             'activity_id': 11,
    //                             'type': 'push',
    //                             'customer_id': req['customer_id'],
    //                             'tenant_id': req['tenant_id'],
    //                             'email': req['email'],
    //                             'phone': req['country_code'] + req['mobile_number'],
    //                             'push_body': body,
    //                             'email_subject': template_result[0].title,
    //                             'push_sent': 1,
    //                         }
    //                         this.store_cron_data(notifi_log_cron_data);
    //                     } else {
    //                         let notifi_log_cron_data = {};
    //                         notifi_log_cron_data = {
    //                             // 'activity_id': req['activity_detail'][0].id,
    //                             'activity_id': 11,
    //                             'type': 'push',
    //                             'customer_id': req['customer_id'],
    //                             'tenant_id': req['tenant_id'],
    //                             'email': req['email'],
    //                             'phone': req['country_code'] + req['mobile_number'],
    //                             'push_body': body,
    //                             'email_subject': template_result[0].title,
    //                             'push_sent': 0,
    //                         }
    //                         this.store_cron_data(notifi_log_cron_data);
    //                     }

    //                 });
    //             }
    //         }).catch((err) => {
    //             console.log(err);
    //         });
    // }

    // store_cron_data(cron_data) {
    //     knex("email_sms_cron_data")
    //         .insert(cron_data)
    //         .then(() => {
    //             console.log("Cron data store success");
    //         }).catch((e) => {
    //             console.log("Cron data error:" + e);
    //         });
    // }
    find_and_replace(sms_body, data_body) {
        for (let key in data_body) {
            sms_body = sms_body.replace(new RegExp('{{' + key + '}}', 'g'), (data_body[key] !== null ? (data_body[key] !== undefined ? data_body[key] : "") : ""));
        }

        sms_body.replace("null", "");
        sms_body.replace("undefined", "");
        return sms_body;
    }

    async Process_in_app_notification(data) {
        let col = {
            code: "languages_for_inapp_notification_templates.code",
            notification_id: "languages_for_inapp_notification_templates.notification_template_id",
            body: 'languages_for_inapp_notification_templates.body',
            title: 'languages_for_inapp_notification_templates.title',
            language_code: 'languages_for_inapp_notification_templates.language_code'
        }
        try {

            let inapp_template = await knex('inapp_notification_template_activities').select(col)
                .innerJoin('languages_for_inapp_notification_templates', 'languages_for_inapp_notification_templates.notification_template_id', '=', 'inapp_notification_template_activities.notification_template_id')
                .innerJoin('inapp_notification_templates', 'inapp_notification_templates.id', '=', 'inapp_notification_template_activities.notification_template_id')
                .where('inapp_notification_template_activities.activity_id', data.activity_id)
                .where('inapp_notification_template_activities.status', 1)
                .where('inapp_notification_templates.push_status', 1)
                .where('languages_for_inapp_notification_templates.status', 1)
            // .where('languages_for_inapp_notification_templates.language_code', data.language_code)
            // .groupBy("languages_for_inapp_notification_templates.code");
            if (inapp_template.length > 0) {
                for (let i = 0; i < inapp_template.length; i++) {

                    let customer_notification = await knex("customer_notification").insert(
                        {
                            customer_id: data.customer_id,
                            code: inapp_template[i].code,
                            notification_id: inapp_template[i].notification_id
                        }
                    )

                    let notif_body = this.find_and_replace(inapp_template[i].body, data);

                    let inapp_notif_obj = {
                        customer_notification_id: customer_notification[0],
                        body: notif_body,
                        title: inapp_template[i].title,
                        language_code: inapp_template[i].language_code,
                        status: 1
                    };

                    await knex("languages_for_customer_notification").insert(inapp_notif_obj);

                } return ({ status: true, message: "Notification added Successfully" })

            } else {
                return ({ status: false, message: "Notification Not Found" })
            }

        } catch (e) {
            console.log('Error : ', e);
            return ({ status: false, message: "Notification Not Found" })
        }
    }


    async send_push_notification(data) {
        try {
            let data_array = await knex('languages_for_notification_templates')
                .select({ id: 'languages_for_notification_templates.id', body: 'languages_for_notification_templates.body', title: "languages_for_notification_templates.title" })
                .innerJoin('notification_template_activities', function () {
                    this.on('notification_template_activities.notification_template_id', '=', 'languages_for_notification_templates.notification_template_id')
                        .andOn('notification_template_activities.status', '=', 1)
                })
                .innerJoin('notification_templates', function () {
                    this.on('notification_templates.id', '=', 'languages_for_notification_templates.notification_template_id')
                        .andOn('notification_templates.push_status', '=', 1)
                })
                .where('languages_for_notification_templates.status', 1)
                .where('notification_template_activities.activity_id', data.activity_id)
                .where('languages_for_notification_templates.language_code', data.language_code);
            // console.log('------* Push Notifi^n *------', data_array)

            if (data_array.length > 0) {

                let fcm_array = [];
                fcm_array.push(data.fcm_token);
                for (let i = 0; i < data_array.length; i++) {
                    let notification_body = this.find_and_replace(data_array[i].body, data);
                    let notification_obj = {
                        "notification": {
                            "title": data_array[i].title,
                            "body": notification_body,
                        },
                        "tokens": fcm_array
                    }

                    sendNotification.sendNotification(notification_obj, (result) => {
                        console.log("send response", result)
                        return ({ status: true, message: "send notification success" });
                    })

                }
            } else {
                return ({ status: false, message: "Notification Not Found" })
            }

        } catch (e) {
            console.log('Error : ', e);
            return ({ status: false, message: "Notification Not Found" })
        }
    }
};