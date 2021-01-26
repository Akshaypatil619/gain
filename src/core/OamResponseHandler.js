let send_mail = require("../../config/send_mail.js");
let knex = require("../../config/knex");
let Common_functions = require("./common_functions");
let common_functions = new Common_functions();
let Common_push_notification_functions = require("./push_notifiction/common_push_notification_function");
let common_push_notification_functions = new Common_push_notification_functions();

module.exports = class OamResponseHandler {
	async response(req, res, result) {
		let client_request = {};
		client_request['body'] = req.body;
		client_request['query'] = req.query;
		req['is_success'] = result.status === true;
		let responseResult = {};
		if (req['is_success']) {
			responseResult['email_data'] = result.email_data;
			responseResult['sms_data'] = result.sms_data;
			 delete result.email_data;
			 delete result.sms_data;
		}

			res.json(result);
		// console.log("\n\n Activity Details", req.activity_detail, "\n\n");
		try {

			if (req['is_success'] === true) {
				let cron_data = {};
				let activity_details;
				if (req.hasOwnProperty('activity_detail') /* && releaseEvents.activity_detail.length > 0*/) {
					cron_data.activity_id = req['activity_detail'][0].id;
					activity_details = req['activity_detail'][0];
				}
				if (activity_details) {
					let activity_details = req['activity_detail'][0];

					// if (activity_details.api_user === "oam") {
						/* if (activity_details.is_sms_activity == 1 && responseResult['sms_data'] !=undefined) {
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
								.where('language_code', responseResult.sms_data.language_code);
							if (sms_template_data_array.length > 0) {
								let sender = 'gaurav';
								for (let i = 0; i < sms_template_data_array.length; i++) {
									let sms_body = this.find_and_replace(sms_template_data_array[i].body, responseResult.sms_data);

									await sms_service.send_message_service({
										sender: sender,
										mobile: responseResult.sms_data.mobile,
										message: sms_body,
									}).then(async (sms_result) => {
										console.log('SMS Sent ! ✉ ', sms_result)
									});
									let sms_log_data = {
										sms_to: responseResult.mobile,
										sms_from: sender,
										template_id: sms_template_data_array[i].id,
										body: sms_template_data_array[i].body,
									};
									await this.sms_log(sms_log_data);
								}
							}
						} */
						if (activity_details.is_sms_activity == 1 && responseResult['sms_data'] !=undefined) {
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
								.where('language_code', responseResult.sms_data.language_code);
							if (sms_template_data_array.length > 0) {
								let sender = 'gaurav';
								for (let i = 0; i < sms_template_data_array.length; i++) {
									let sms_body = this.find_and_replace(sms_template_data_array[i].body, responseResult.sms_data);
									// await sms_service.send_message_service({
									// 	sender: sender,
									// 	mobile: responseResult.sms_data.mobile,
									// 	message: sms_body,
									// }).then(async (sms_result) => {
									// 	console.log('SMS Sent ! ✉ ', sms_result)
									// 	let sms_log_data = {
									// 		sms_to: responseResult.sms_data.mobile,
									// 		sms_from: sms_result.sender,
									// 		template_id: sms_template_data_array[i].id,
									// 		body: sms_template_data_array[i].body,
									// 		sms_status:sms_result.sms_status
									// 	};
									// 	await this.sms_log(sms_log_data);
									// });
								}
							}
						}
						if (activity_details.is_email_activity == 1 && responseResult['email_data'] !=undefined) {
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
								.where('language_code', responseResult.email_data.language_code);
								console.log("email_template_data_arrayemail_template_data_array : ",email_template_data_array);
								if (email_template_data_array.length > 0) {
								try {
									for (let i = 0; i < email_template_data_array.length; i++) {

										let email_subject = this.find_and_replace(email_template_data_array[i].subject, responseResult.email_data);
										let email_body = this.find_and_replace(email_template_data_array[i].body, responseResult.email_data);
										// send_mail.awsEmailSending({
										// 	email: responseResult.email_data.email,
										// 	email_body: email_body,
										// 	email_subject: email_subject,
										// });
										send_mail.sending({
											email: responseResult.email_data.email,
											email_body: email_body,
											email_subject: email_subject,
											template_id: email_template_data_array[i].id
										});
										
									}
								} catch (e) {
									console.log(e);
								}
							}
						}
						if (activity_details.is_push_activity == 1  && responseResult['email_data'] !=undefined) {
							
							common_push_notification_functions.send_push_notification({
								tenant_id: 1,
								activity_id: activity_details.id,
								email_data: responseResult.email_data,
							});
						}

						if (activity_details.is_inapp_notification_activity == 1 && responseResult['email_data'] !=undefined) {
							
							let inapp_notification_columns = { id: 'inapp_notification_templates.id', title: 'languages_for_inapp_notification_templates.title', body: 'languages_for_inapp_notification_templates.body', lang_code: "languages_for_inapp_notification_templates.language_code", screen_to_redirect: "inapp_notification_templates.screen_to_redirect" };
							let inapp_notification_template_data_array = await knex('languages_for_inapp_notification_templates')
								.select(inapp_notification_columns)
								.innerJoin('inapp_notification_templates', 'inapp_notification_templates.id', '=', 'languages_for_inapp_notification_templates.notification_template_id')
								.innerJoin('inapp_notification_template_activities', function () {
									this.on('inapp_notification_template_activities.notification_template_id', '=', 'inapp_notification_templates.id')
										.andOn('inapp_notification_template_activities.status', '=', 1)
								})
								.innerJoin('master_api_permission_modules', function () {
									this.on('master_api_permission_modules.id', '=', 'inapp_notification_template_activities.activity_id')
										.andOn('master_api_permission_modules.status', '=', 1)
								})
								.where('master_api_permission_modules.id', activity_details.id)
								.where('inapp_notification_templates.status', 1)
								.where('language_code', responseResult.email_data.language_code);
								
							if (inapp_notification_template_data_array.length > 0) {
								

								let notifications = [];
								for (let i = 0; i < inapp_notification_template_data_array.length; i++) {
									let notification_body = this.find_and_replace(inapp_notification_template_data_array[i].body, responseResult.email_data ? responseResult : {});
									if (notifications[inapp_notification_template_data_array[i].id] == undefined) {
										notifications[inapp_notification_template_data_array[i].id] = {};
										notifications[inapp_notification_template_data_array[i].id].cms_cust_id = req.body.cms_cust_id ? req.body.cms_cust_id : req.body.customer_id;
										notifications[inapp_notification_template_data_array[i].id].data = {};
									}
									{
										let lang_code = inapp_notification_template_data_array[i].lang_code;
										let noti = inapp_notification_template_data_array[i];
										notifications[inapp_notification_template_data_array[i].id].data[lang_code] = {
											body: notification_body,
											title: noti.title,
											dl_url: noti.screen_to_redirect,
											linking: "internal"
										};
									}
								}
								notifications = notifications.filter(function (el) {
									return el != null;
								});
								for (let i = 0; i < notifications.length; i++) {
									common_functions.store_notification_to_makesense(notifications[i]);
								}
							}
						}
					// }
				}
			}
		} catch (e) {
			console.log("Error : ", e)
		}
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

    find_and_replace(sms_body, data_body) {

        let keys = Object.keys(data_body);
        for (let key in data_body) {
            sms_body = sms_body.replace(new RegExp('{{' + key + '}}', 'g'), (data_body[key] !== null ? (data_body[key] !== undefined ? data_body[key] : "") : ""));
        }

        sms_body.replace("null", "");
        sms_body.replace("undefined", "");
        return sms_body;
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
