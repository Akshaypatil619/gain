"use strict";
const knex = require('../../config/knex');
const sendMail = require('../../config/send_mail');
const pushNotification = require('./push_notification');
const commonFunctions = new (require('./common_functions'))();

class CronNotifications {
    constructor() {
        this.templates = {}
    }

    init_templates(activity_id) {
        return knex('master_api_permission_modules')
            .select('id', 'is_email_activity', 'is_push_activity', 'is_notification_activity')
            .where('id', activity_id)
            .where('status', 1)
            .then(async activity => {
                if (activity.length == 0) throw new Error('activity not found');
                activity = activity[0];

                if (activity.is_email_activity == 1) {
                    const emailTemplates = await knex('email_templates as et')
                        .select('lfet.subject', 'lfet.body', 'lfet.language_code', 'lfet.id', 'et.template_code')
                        .join('email_template_activities as eta', function () {
                            this.on('eta.email_template_id', 'et.id')
                                .on('eta.status', 1);
                        }).join('languages_for_email_templates as lfet', function () {
                            this.on('lfet.email_template_id', 'et.id')
                                .on('lfet.status', 1);
                        }).where('eta.activity_id', activity.id);

                    if (emailTemplates.length > 0)
                        this.generate_template_obj('email', emailTemplates);

                }

                if (activity.is_push_activity == 1) {
                    const pushTemplates = await knex('notification_templates as nt')
                        .select('lfnt.title', 'lfnt.body', 'lfnt.language_code', 'nt.template_code', 'nt.linking', 'nt.link')
                        .join('notification_template_activities as nta', function () {
                            this.on('nta.notification_template_id', 'nt.id')
                                .on('nta.status', 1);
                        }).join('languages_for_notification_templates as lfnt', function () {
                            this.on('lfnt.notification_template_id', 'nt.id')
                                .on('lfnt.status', 1);
                        }).where('nta.activity_id', activity.id);

                    if (pushTemplates.length > 0)
                        this.generate_template_obj('push', pushTemplates);
                }

                if (activity.is_notification_activity == 1) {
                    const inAppTemplates = await knex('inapp_notification_templates as iant')
                        .select('lfiant.title', 'lfiant.body', 'lfiant.language_code', 'iant.template_code', 
                        'iant.screen_to_redirect', 'iant.linking', 'iant.link')
                        .join('inapp_notification_template_activities as ianta', function () {
                            this.on('ianta.notification_template_id', 'iant.id')
                                .on('ianta.status', 1);
                        }).join('languages_for_inapp_notification_templates as lfiant', function () {
                            this.on('lfiant.notification_template_id', 'iant.id')
                                .on('lfiant.status', 1);
                        }).where('ianta.activity_id', activity.id);

                    if (inAppTemplates.length > 0)
                        this.generate_template_obj('inApp', inAppTemplates);
                }

            });
    }

    generate_template_obj(type, templates) {
        for (const template of templates) {
            const templateCode = template.template_code;
            if (!this.templates[templateCode])
                this.templates[templateCode] = {};

            if (this.templates[templateCode][type]) {

                this.templates[templateCode][type][template.language_code] = template;

            } else {
                this.templates[templateCode][type] = {
                    [template.language_code]: template
                }
            }
        }
    }

    send_notifications({ templateCode = null, customerDetails, templateDetails } = {}) {
        return new Promise((resolve, reject) => {
            const errors = [];
            let template = null;

            if (templateCode) {
                if (this.templates[templateCode])
                    template = this.templates[templateCode];
                else return reject('template_code not found');
            } else if (!templateCode) {
                if (Object.keys(this.templates).length == 1)
                    template = this.templates[Object.keys(this.templates)[0]];
                else return reject('template_code ambiguous');
            }

            // console.log("\n\n",template);
            if (template.email) {
                try {

                    const email = customerDetails.email;
                    if (!email) throw 'customer email not found';

                    const emailTemplate = template.email[customerDetails.language_code];
                    if (!emailTemplate) throw 'language for email template not found';
					const subject_body = this.find_and_replace(emailTemplate.subject, templateDetails);
					const email_body = this.find_and_replace(emailTemplate.body, templateDetails);
                    console.log("email_bodyemail_bodyemail_bodyemail_body : ",subject_body, email_body);
                    sendMail.sending({
                        email: templateDetails.email,
                        email_body: email_body,
                        email_subject: subject_body,
                        template_id: emailTemplate.id
                    });
                    // sendMail.awsEmailSending({
                    //     email_subject: subject_body,
                    //     email, email_body
                    // });

                } catch (err) { errors.push(err) }


            }

            if (template.push) {
                try {

                    const fcm_token = customerDetails.fcm_token;
                    if (!fcm_token) throw 'fcm token not found';

                    const pushTemplate = template.push[customerDetails.language_code];
                    if (!pushTemplate) throw 'language for push notification template not found';
                    const title = this.find_and_replace(pushTemplate.title, Object.assign(customerDetails, templateDetails));
					const body = this.find_and_replace(pushTemplate.body, Object.assign(customerDetails, templateDetails));
                    // pushNotification.sendNotification({
                    //     notification: {
                    //         title: title,
                    //         body: body
                    //     }, data: {
                    //         linking: pushTemplate.linking,
                    //         link: pushTemplate.link
                    //     }, tokens: fcm_array
					// }, _ => { })
					let fcm_array = [];
					fcm_array.push(fcm_token);
					let notification_obj = {
                        "notification": {
                            "title": title,
                            "body": body,
                            "image":pushTemplate.image?pushTemplate.image:""
                        },
                        "data":{
                            "title": title,
                            "body": body,
                            "notification_route_type":pushTemplate.linking?pushTemplate.linking:"",
                            "notification_url":pushTemplate.link?pushTemplate.link:"",
                            "image_url":pushTemplate.image?pushTemplate.image:""
                        },
                        "tokens": fcm_array
                    }

					pushNotification.sendNotification(notification_obj, (result) => {
                        return ({status : true, message :"send notification success"});
                    })

                } catch (err) { errors.push(err) }

            }

            if (template.inApp) {

                try {

                    const cms_cust_id = customerDetails.cms_cust_id;
                    if (!cms_cust_id) throw 'cms customer id for inApp notification template not found';

                    let notificationObj = { cms_cust_id, data: {} };

                    for (const langCode of Object.keys(template.inApp)) {
                        const inAppTemplate = template.inApp[langCode];

                        const body = this.find_and_replace(inAppTemplate.body, templateDetails);

                        notificationObj.data[langCode] = {
                            body,
                            title: inAppTemplate.title,
                            dl_url: inAppTemplate.link,
                            linking: inAppTemplate.linking
                        }
                    }

                    commonFunctions.store_notification_to_makesense(notificationObj);

                } catch (err) { errors.push(err) }

            }

            if (errors.length > 0) reject(errors)
            else resolve();

        });
    }

    find_and_replace(templateBody, dataBody) {
        // let keys = Object.keys(dataBody);
        for (let key in dataBody) {
            templateBody = templateBody.replace(new RegExp('{{' + key + '}}', 'g'), (dataBody[key] !== null ? (dataBody[key] !== undefined ? dataBody[key] : "") : ""));
        }

        templateBody.replace("null", "");
        templateBody.replace("undefined", "");
        return templateBody;
    }
}

module.exports = CronNotifications;