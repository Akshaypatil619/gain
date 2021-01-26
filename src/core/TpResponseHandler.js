let knex = require("../../config/knex");
let send_mail = require("../../config/send_mail.js");
module.exports = class TpResponseHandler {

    async response(req, res, result) {
     
        let client_request = {};
        client_request['body'] = req.body;
        client_request['query'] = req.query;
        let data = {
            cc_token: req.header("cc_token"),
            method_type: req.method,
            method_name: req.url.split("/").length == 2 ? req.url.split("/")[1] : req.url.split("/")[2],
            web_service_name: req.url,
            request: JSON.stringify(Object.assign(client_request)),
            response_status: result.status,
            response: JSON.stringify(result)
        };

        knex("third_party_transactions")
            .insert(data).then();

        req['is_success'] = result.status === true;
        let responseResult;
        if (req['is_success']) {
            responseResult = result.post_data;
            delete result.post_data;
        }
        res.json(result);

        
        try {

            if (req['is_success'] === true) {
                let cron_data = {};
                let activity_details;
                if (req.hasOwnProperty('activity_detail')) {
                    cron_data.activity_id = req['activity_detail'][0].id;
                    activity_details = req['activity_detail'][0];
                }

                if (activity_details !== null && activity_details !== undefined) {
                    let activity_details = req['activity_detail'][0];

                    if (activity_details.api_user === "cc" || activity_details.api_user === "tenant") {

                        /*  if (activity_details.is_sms_activity == 1) {

                            let sms_template_data_array = await knex('languages_for_sms_templates')
                                .select({ id: 'sms_templates.id', body: 'languages_for_sms_templates.body' })
                                .innerJoin('sms_templates', 'sms_templates.id', '=', 'languages_for_sms_templates.sms_template_id')
                                .innerJoin('sms_template_activities', function () {
                                    this.on('sms_template_activities.sms_template_id', '=', 'sms_templates.id')
                                        .andOn('sms_template_activities.status', '=', 1)
                                })
                                .innerJoin('master_api_permission_modules', function () {
                                    this.on('master_api_permission_modules.id', '=', 'sms_template_activities.activity_id')
                                        .andOn('master_api_permission_modules.status', '=', 1)
                                })
                                .where('master_api_permission_modules.id', activity_details.id)
                                .where('sms_templates.status', 1)
                                .where('language_code', req.query.language_code);
    
                          
                            if (sms_template_data_array.length > 0) {
                                let sender = 'gaurav';
                                for (let i = 0; i < sms_template_data_array.length; i++) {
                                    let sms_body = this.find_and_replace(sms_template_data_array[i].body, responseResult.sms_data);
                                    // console.log('----- SMS Not Sending ------', sms_body);

                                    await sms_service.send_message_service({
                                        sender: sender,
                                        mobile: responseResult.mobile,
                                        message: sms_body,
                                    }).then(async (sms_result) => {
                                        console.log('SMS Sent ! ✉ ', sms_result)

                                     
                                  
                                    let sms_log_data = {
                                        sms_to: responseResult.mobile,
                                        sms_from: sms_result.sender,
                                        template_id: sms_template_data_array[i].id,
                                        body: sms_template_data_array[i].body,
                                        sms_status:sms_result.sms_status
                                    };
                                    console.log("sms_log_data=",sms_log_data);

                                    await this.sms_log(sms_log_data);
                                });
                                }
                            }
                        }  */
                       
                       
                        if (activity_details.is_email_activity == 1) {

                            let email_columns = { id: 'email_templates.id', subject: 'languages_for_email_templates.subject', body: 'languages_for_email_templates.body' };
                            let email_template_data_array = await knex('languages_for_email_templates')
                                .select(email_columns)
                                .innerJoin('email_templates', 'email_templates.id', '=', 'languages_for_email_templates.email_template_id')
                                .innerJoin('email_template_activities', function () {
                                    this.on('email_template_activities.email_template_id', '=', 'email_templates.id')
                                        .andOn('email_template_activities.status', '=', 1)
                                })
                                .innerJoin('master_api_permission_modules', function () {
                                    this.on('master_api_permission_modules.id', '=', 'email_template_activities.activity_id')
                                        .andOn('master_api_permission_modules.status', '=', 1)
                                })
                                .where('master_api_permission_modules.id', activity_details.id)
                                .where('email_templates.status', 1)
                                .where('language_code', req.query.language_code);
                            if (email_template_data_array.length > 0) {
                                for (let i = 0; i < email_template_data_array.length; i++) {

                                    let email_body = this.find_and_replace(email_template_data_array[i].body, responseResult.email_data);
                                    console.log("email_bodyemail_bodyemail_bodyemail_bodyemail_body : ",email_body);
                                    let email_info = {};
                                    email_info = {
                                        'email': responseResult.email,
                                        'email_body': email_body,
                                        'email_subject': email_template_data_array[i].subject,
                                        'sender_user_type': 'tenant',
                                        'sender_user_id': req.tenant_id,
                                        template_id: email_template_data_array[i].id
                                    };
                                    await send_mail.sending(email_info, (emailResult) => {
                                        if (emailResult.status) {
                                            console.log('Email Sent !')
                                        }
                                    });
                                    // let email_log_data = {
                                    //     to_email: responseResult.email,
                                    //     from_email: config.from_email,
                                    //     template_id: email_template_data_array[i].id,
                                    //     subject: email_template_data_array[i].subject,
                                    //     body: email_template_data_array[i].body,
                                    // };
                                    // await this.email_log(email_log_data);
                                }
                            }
                        }
                    }
                }
            }
        } catch (e) {
            console.log("Error : ", e)
        }
    }

    find_and_replace(sms_body, data_body) {
        for (let key in data_body) {
            sms_body = sms_body.replace(new RegExp('{{' + key + '}}', 'g'), (data_body[key] !== null ? (data_body[key] !== undefined ? data_body[key] : "") : ""));
        }

        sms_body.replace("null", "");
        sms_body.replace("undefined", "");
        return sms_body;
    }

    store_cron_data(cron_data) {
        console.log(cron_data);
        knex("email_sms_cron_data")
            .insert(cron_data)
            .then(() => {
                console.log("Cron data store success");
            }).catch((e) => {
                console.log("Cron data error:" + e);
            });
    }

    email_log(data) {
        knex("email_logs")
            .insert(data)
            .then(() => {
                console.log('Email logs stored successfully ✉');
            }).catch((e) => {
                console.log("Email logs error:" + e);
            });
    }

    sms_log(data) {
        knex("sms_logs")
            .insert(data)
            .then(() => {
                console.log('SMS logs stored successfully ✉');
            }).catch((e) => {
                console.log("SMS logs error:" + e);
            });
    }
};