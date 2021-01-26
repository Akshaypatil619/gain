/************** Load Libraries ****************/
let Validator = require('validatorjs');
let otpGenerator = require('otp-generator');

/************** Load Files****************/


let messages = require("../../../../cc/response_codes/third_party_messages");
let status_codes = require("../../../../cc/response_codes/third_party_status_codes");
let ResponseHandler = require("../../../../core/ResponseHandler.js");
let Response_adapter = require("../../../../core/response_adapter");
let Common_functions = require("../../../../core/common_functions.js");
let send_mail = require("../../../../../config/send_mail.js");
let defaultLanguage = require("../../../../common/default_language/default_language");
let knex = require("../../../../../config/knex.js");
var newId = require("uuid-pure").newId;

let config = require("../../../../../config/config");
let encription_key = config.encription_key;
let Common_push_notification_functions = require("../../../../core/push_notifiction/common_push_notification_function");
let common_push_notification_functions = new Common_push_notification_functions();

/************** Generate Objects ****************/
let common_functions = new Common_functions();
let response_adapter = new Response_adapter();
let responseHandler = new ResponseHandler();

module.exports = class Customer_model {
	async addCustomer(form_data, callback) {
		let data = {};
		let customerID;
		let language_code = form_data['language_code'];
		delete form_data['language_code'];
		Object.assign(data, form_data);
		delete data.readable_password;

		let rules = {
			first_name: "required|alpha_num|max:50|min:2",
			last_name: "required|alpha_num|max:50|min:2",
			email: "required|email|max:50",
			country_code: "required|alpha_num|max:6|min:2",
			phone: "required|numeric",
			city: "required|numeric",
			gender: "required|alpha_num",
			dob: "required|date",
			nationality_id: "required|numeric"
		};

		// requirement parameter defaults to null
		Validator.register('phone', function (form_data, requirement, attribute) {
			return form_data.match(/^\d{9}$/);
		}, 'Please enter valid :attribute number');
		//Check Validation
		let validation = new Validator(form_data, rules, { required: 'Please enter your :attribute', min: 'Please enter valid :attribute', max: 'Please enter valid :attribute', email: 'Please enter valid :attribute', digits: 'Please enter valid :attribute' });
		if (validation.passes() && !validation.fails()) {

			let objSS = knex.select()
				.whereRaw("CAST(AES_DECRYPT(customers.phone,'rainbowfinance') AS CHAR(255)) = '" + data['phone'] + "'")
				.orWhereRaw("CAST(AES_DECRYPT(customers.email,'rainbowfinance') AS CHAR(255)) = '" + data['email'] + "'")
				.where("tenant_id", form_data['tenant_id'])
				.table('customers');
			objSS.then(async (customers_result) => {
				if (customers_result.length > 0) {
					return callback(response_adapter.response_error(false, status_codes.customer_create_failed, messages[language_code].customer_already_exist));
				} else {
					function getRandomInt(max) {
						return Math.floor(Math.random() * Math.floor(max));
					}
					let membership_no_mpoints = form_data['country_code'] + Math.floor(Math.random() * 10000000000) + getRandomInt(9);
					data['membership_no'] = knex.raw("AES_ENCRYPT('" + membership_no_mpoints + "', 'rainbowfinance')");
					let tier_result = await knex('customer_tiers').select('id').where('tenant_id', form_data.tenant_id).limit(1).orderBy('id', 'asc');
					data['affiliate_token'] = newId(15);
					data['tier_id'] = tier_result[0].id;
					data['isd'] = data['country_code'];
					data['gender'] = data['gender'];
					data['dob'] = data['dob'];
					data['nationality_id'] = data['nationality_id'];
					data['country_id'] = data['country_id'];

					data['first_name'] = knex.raw("AES_ENCRYPT('" + data['first_name'] + "', 'rainbowfinance')");
					data['last_name'] = knex.raw("AES_ENCRYPT('" + data['last_name'] + "', 'rainbowfinance')");
					data['email'] = knex.raw("AES_ENCRYPT('" + data['email'] + "', 'rainbowfinance')");
					data['phone'] = knex.raw("AES_ENCRYPT('" + data['phone'] + "', 'rainbowfinance')");
					data['city'] = data['city'];
					let customer_obj = await knex("customers").insert(data);
					if (typeof customer_obj !== undefined) {
						let res = await defaultLanguage.attributeOperation(form_data);
						// await knex('product_referral').update({
						// 	refrry_id: customer_obj[0]
						// }).where('email', form_data['email']).andWhere('phone', form_data['phone']);
						await global.rule_engine_instance.createMPointsSession({
							customer_id: membership_no_mpoints
						});

						let columns = {
							customer_id: "customers.id",
							name: knex.raw("CONCAT(CAST(AES_DECRYPT(customers.first_name,'rainbowfinance') AS CHAR(255)),' ',CAST(AES_DECRYPT(customers.last_name,'rainbowfinance') AS CHAR(255)))"),
							fname: knex.raw("CAST(AES_DECRYPT(customers.first_name,'rainbowfinance')AS CHAR(255))"),
							lname: knex.raw("CAST(AES_DECRYPT(customers.last_name,'rainbowfinance')AS CHAR(255))"),
							email: knex.raw("CAST(AES_DECRYPT(customers.email,'rainbowfinance')AS CHAR(255))"),
							phoneno: knex.raw("CAST(AES_DECRYPT(customers.phone,'rainbowfinance')AS CHAR(255))"),
							gender: "customers.gender",
							country_code: 'customers.country_code',
							dob: "customers.dob",
							created_at: "customers.created_at",
							os: "customers.os",
							city: "customers.city",
							fcm_token: "customers.fcm_token",
							membership_no: knex.raw("CAST(AES_DECRYPT(customers.membership_no,'rainbowfinance')AS CHAR(255))")
						};
						let cust_res = await knex('customers').select(columns).where('id', customer_obj[0]);
						let city_res = await knex('master_city').select('city_name').where('id', cust_res[0].city);
						// let login_count_res = await knex('login_count').select('logged_in_grand_total').where('customer_id', cust_res[0].customer_id);
						// let count_login = login_count_res.length > 0 ? login_count_res[0].logged_in_grand_total : 0;
						let cust_report = await knex("customer_profile_report").insert({
							customer_id: cust_res[0].customer_id,
							first_name: knex.raw("AES_ENCRYPT('" + cust_res[0].fname + "', 'rainbowfinance')"),
							last_name: knex.raw("AES_ENCRYPT('" + cust_res[0].lname + "', 'rainbowfinance')"),
							isd_code: cust_res[0].country_code,
							mobile_number: knex.raw("AES_ENCRYPT('" + cust_res[0].phoneno + "', 'rainbowfinance')"),
							valid_mobile_phone: cust_res[0].phoneno,
							email_id: knex.raw("AES_ENCRYPT('" + cust_res[0].email + "', 'rainbowfinance')"),
							valid_email: cust_res[0].email,
							dob: cust_res[0].dob,
							province: city_res[0].city_name,
							gender: cust_res[0].gender,
							registration_date: cust_res[0].created_at,
							last_logged_in_time: cust_res[0].created_at,
							os: cust_res[0].os,
							login: 1,
							membership_no: knex.raw("AES_ENCRYPT('" + cust_res[0].membership_no + "', 'rainbowfinance')")
						});

						customerID = customer_obj[0];
						let otp;

						//Send OTP
						let otp_data = {
							country_code: form_data.nationality_id,
							mobile_number: form_data.phone,
							email: form_data.email,
							type: 'registration',
							customer_id: customerID
						};
						await this.generateOTP(otp_data, (res) => {
							if (res['status']) {
								otp = res['values']['OTP'];
								console.log('OTP Sent Successfully.', otp);
							} else {
								console.log('OTP Not Sent.')
							}
						});

						//Send SMS
						// let sms_template_data_array = await knex('languages_for_sms_templates')
						// 	.select('languages_for_sms_templates.body')
						// 	.innerJoin('sms_templates', 'sms_templates.id', '=', 'languages_for_sms_templates.sms_template_id')
						// 	.innerJoin('sms_template_activities', function () {
						// 		this.on('sms_template_activities.sms_template_id', '=', 'sms_templates.id')
						// 			.andOn('sms_template_activities.status', '=', 1)
						// 	})
						// 	.innerJoin('master_api_permission_modules', function () {
						// 		this.on('master_api_permission_modules.name', '=', knex.raw("'Registeration Success'"))
						// 			.andOn('master_api_permission_modules.id', '=', 'sms_template_activities.activity_id')
						// 			.andOn('master_api_permission_modules.status', '=', 1)
						// 	})
						// 	.where('language_code', language_code)

						// if (sms_template_data_array.length > 0) {
						// 	var sms_data = {};

						// 	for (let i = 0; i < sms_template_data_array.length; i++) {
						// 		let sms_body = responseHandler.find_and_replace(sms_template_data_array[i].body, sms_data);
						// 		sms_service.send_message_service({
						// 			sender: 'gaurav',
						// 			mobile: form_data['nationality_id'] + form_data['phone'],
						// 			message: sms_body,
						// 		}).then(async (sms_result) => {
						// 			console.log('----SMS Sent-----', sms_result)
						// 		});
						// 	}
						// }

						//Send Email
						let email_columns = { subject: 'languages_for_email_templates.subject', body: 'languages_for_email_templates.body' };
						let email_template_data_array = await knex('languages_for_email_templates')
							.select(email_columns)
							.innerJoin('email_templates', 'email_templates.id', '=', 'languages_for_email_templates.email_template_id')
							.innerJoin('email_template_activities', function () {
								this.on('email_template_activities.email_template_id', '=', 'email_templates.id')
									.andOn('email_template_activities.status', '=', 1)
							})
							.innerJoin('master_api_permission_modules', function () {
								this.on('master_api_permission_modules.name', '=', knex.raw("'Registeration Success'"))
									.andOn('master_api_permission_modules.id', '=', 'email_template_activities.activity_id')
									.andOn('master_api_permission_modules.status', '=', 1)
							})
							.where('language_code', language_code)
							.where('email_templates.status', 1);
						if (email_template_data_array.length > 0) {
							let email_data = {};
							email_data.Username = form_data['first_name'];

							for (let i = 0; i < email_template_data_array.length; i++) {

								let email_body = responseHandler.find_and_replace(email_template_data_array[i].body, email_data);
								let email_info = {};
								email_info = {
									'email': form_data['email'],
									'email_body': email_body,
									'customer_id': customerID,
									'email_subject': email_template_data_array[i].template_name,
									'sender_user_type': 'tenant',
									'sender_user_id': form_data.tenant_id,
								};

								let emailCronddata = email_info;
								emailCronddata['tenant_id'] = form_data['tenant_id'];
								emailCronddata['activity_id'] = email_template_data_array[i].activity_id;
								emailCronddata['type'] = 'email,';

								await send_mail.sending_mail(email_info, (emailResult) => {
									if (emailResult.status) {
										console.log('Email Sent !')
									}
								});
							}
							return callback(response_adapter.response_success(true, status_codes.customer_create_success, messages[language_code].customer_create_success, { customer_id: customer_obj }));

						} else {
							return callback(response_adapter.response_success(true, status_codes.customer_create_success, messages[language_code].customer_create_success));
						}
					} else {
						return callback(response_adapter.response_error(false, status_codes.customer_create_failed, messages[language_code].customer_already_exist));
					}
				}
			}).catch((err) => callback(common_functions.catch_error(err)));
		} else {
			let errors = validation.errors.errors;
			return callback(response_adapter.response_error(false, status_codes.form_field_reqired, messages[language_code].form_field_reqired, errors));
		}
	}
	async updateCustomer(form_data, callback) {
		let data = {};
		let language_code = form_data['language_code'];
		delete form_data['language_code'];
		Object.assign(data, form_data);
		delete data.readable_password;
		let rules = {
			id: "required",
			// first_name: "required|alpha_num|max:50|min:2",
			// last_name: "required|alpha_num|max:50|min:2",
			// country_code: "required|alpha_num|max:6|min:2",
			// city: "required|numeric",
			// gender: "required|alpha_num",
			// dob: "required|date",
			// nationality_id: "required|numeric"
		};

		// requirement parameter defaults to null
		// Validator.register('phone', function (form_data, requirement, attribute) {
		// 	return form_data.match(/^\d{9}$/);
		// }, 'Please enter valid :attribute number');

		//Check Validation
		let validation = new Validator(form_data, rules, { required: 'Please enter your :attribute', min: 'Please enter valid :attribute', max: 'Please enter valid :attribute', email: 'Please enter valid :attribute' });
		if (validation.passes() && !validation.fails()) {

			// data['isd'] = data['isd'];
			// data['gender'] = data['gender'];
			// data['dob'] = data['dob'];
			// data['nationality_id'] = data['nationality_id'];

			// data['first_name'] = knex.raw("AES_ENCRYPT('" + data['first_name'] + "', '" + encription_key + "')");
			// data['last_name'] = knex.raw("AES_ENCRYPT('" + data['last_name'] + "', '" + encription_key + "')");
			// data['city'] = data['city'];
			// data['country_id'] = data['country_id'];
			data['phone'] = knex.raw("AES_ENCRYPT('" + data['phone'] + "', '" + encription_key + "')");

			// let customer_obj = 98050;

			knex.select('id')
				.from("customers")
				.where("customers.phone", data['phone'])
				.whereNot("customers.id", data['id'])
				.then(async (result) => {
					if (result.length > 0) {
						return callback(response_adapter.response_error(false, status_codes.customer_update_failed, messages[language_code].customer_already_exist));

					} else {
						let columns = {
							phone: "customers.phone",
							name: knex.raw("CAST(AES_DECRYPT(customers.first_name, '" + encription_key + "') AS CHAR(255))"),
							email: knex.raw("CAST(AES_DECRYPT(customers.email, '" + encription_key + "') AS CHAR(255))"),
							country_code: "customers.country_code"
						};
						let existing_record = await knex.select(columns)
							.from("customers")
							.where("customers.id", data['id']);
						if (existing_record[0]['phone'] != data['phone']) {

							//Send SMS
							// let sms_template_data_array = await knex('languages_for_sms_templates')
							// 	.select('languages_for_sms_templates.body')
							// 	.innerJoin('sms_templates', 'sms_templates.id', '=', 'languages_for_sms_templates.sms_template_id')
							// 	.innerJoin('sms_template_activities', function () {
							// 		this.on('sms_template_activities.sms_template_id', '=', 'sms_templates.id')
							// 			.andOn('sms_template_activities.status', '=', 1)
							// 	})
							// 	.innerJoin('master_api_permission_modules', function () {
							// 		this.on('master_api_permission_modules.name', '=', knex.raw("'Registeration Success'"))
							// 			.andOn('master_api_permission_modules.id', '=', 'sms_template_activities.activity_id')
							// 			.andOn('master_api_permission_modules.status', '=', 1)
							// 	})
							// 	.where('language_code', language_code)

							// if (sms_template_data_array.length > 0) {
							// 	var sms_data = {};
							// 	sms_data.Username = form_data['first_name'];
							// 	sms_data.phone = form_data['phone'];

							// 	for (let i = 0; i < sms_template_data_array.length; i++) {
							// 		let sms_body = responseHandler.find_and_replace(sms_template_data_array[i].body, sms_data);
							// 		sms_service.send_message_service({
							// 			sender: 'gaurav',
							// 			mobile: existing_record[0]['country_code'] + existing_record[0]['phone'],
							// 			message: sms_body,
							// 		}).then(async (sms_result) => {
							// 			console.log('---- SMS Sent Successfully ! -----', sms_result)
							// 		});
							// 	}
							// }
						}

						let res = await knex("customers").update(data).where("customers.id", data['id']);
						if (res > 0) {
							await knex("customer_profile_report").update({ isd_code: form_data.country_code, mobile_number: data.phone }).where('customer_id', form_data['id']);
							await knex("customer_transaction_report").update({ country_code: data.country_code, phone: data.phone }).where('customer_id', data['id']);
							return callback(response_adapter.response_error(true, status_codes.customer_update_success, messages[language_code].customer_update_success));
						} else {
							return callback(response_adapter.response_error(false, status_codes.customer_update_failed, messages[language_code].customer_update_failed));
						}
					}
				}).catch((err) => callback(common_functions.catch_error(err)));

		} else {
			let errors = validation.errors.errors;
			return callback(response_adapter.response_error(false, status_codes.form_field_reqired, messages[language_code].form_field_reqired, errors));
		}
	}

	async getCustomerProfile(query_data, callback) {
		let language_code = query_data['language_code'];
		delete query_data['language_code'];
		let rules = {
			customer_id: "required"
		};
		let return_result = {};

		let columns = {

			customer_id: "customers.id",
			// tenant_id: "customers.tenant_id",
			customer_unique_id: knex.raw("CAST(AES_DECRYPT(customers.customer_unique_id,'" + encription_key + "')AS CHAR(255))"),
			// nationality_id: "customers.nationality_id",
			name: knex.raw("CONCAT(CAST(AES_DECRYPT(customers.first_name,'" + encription_key + "') AS CHAR(255)),' ',CAST(AES_DECRYPT(customers.last_name,'" + encription_key + "') AS CHAR(255)))"),
			first_name: knex.raw("CAST(AES_DECRYPT(customers.first_name,'" + encription_key + "')AS CHAR(255))"),
			last_name: knex.raw("CAST(AES_DECRYPT(customers.last_name,'" + encription_key + "')AS CHAR(255))"),
			email: knex.raw("CAST(AES_DECRYPT(customers.email,'" + encription_key + "')AS CHAR(255))"),
			phone: knex.raw("CAST(AES_DECRYPT(customers.phone,'" + encription_key + "') AS CHAR(255))"),
			// gender: knex.raw("IF(customers.gender='M', 'Male','Female')"),
			gender: "customers.gender",
			// city: "master_city.city_name",
			// city: "master_city.city_name",
			// status: "customers.status",
			// customer_status: knex.raw("If(customers.customer_status='insert' OR customers.customer_status='update', 1 , 0)"),
			dob: "customers.dob",
			// dob: knex.raw("DATE_FORMAT(customers.dob, '%d %b %Y')"),
			// country: 'countries.name',
			// country_id: 'customers.country_id',
			// country_code: 'customers.country_code',
			tier: "customer_tiers.name",
			member_since: "customers.created_at",
			tier_name: "customer_tiers.name",
			// city_id: "customers.city"

		};

		let validation = new Validator(query_data, rules);
		if (validation.passes() && !validation.fails()) {
			knex.select(columns)
				.leftJoin('countries', 'countries.id', '=', 'customers.country_id')
				.leftJoin('master_city', 'master_city.id', '=', 'customers.city')
				.leftJoin('customer_tiers', 'customer_tiers.id', '=', 'customers.tier_id')
				.join('tenants', 'tenants.id', 'customers.tenant_id')
				.where("customers.id", query_data['customer_id'])
				.from("customers")
				.then(async (result) => {
					let logs = await knex('customer_logs').select('os', 'created_at').where('customer_id', query_data['customer_id']).orderBy('customer_logs.id', 'desc').limit(1);
					if (logs.length > 0) {
						result[0].os = logs[0].os != null ? logs[0].os : "N/A";
						result[0].last_login_date = logs[0].created_at != null ? logs[0].created_at : "N/A";
					}
					else {
						result[0].os = "N/A";
						result[0].last_login_date = "N/A";
					}
					if (result.length > 0) {
						return callback(response_adapter.response_success(true, status_codes.user_profile_found, messages[language_code].user_profile_found, (result)));
					} else {
						return callback(response_adapter.response_error(false, status_codes.user_profile_found_failed, messages[language_code].user_profile_found_failed));
					}
				}).catch((err) => {
					console.log("errerrerrerrerrerrerrerrerrerr : ", err);
					callback(common_functions.catch_error(err))
				});
		}
		else {
			let errors = validation.errors.errors;
			return callback(response_adapter.response_error(false, status_codes.user_profile_found_failed, messages[language_code].user_profile_found_failed, errors));
		}
	}

	async getCustomerList(query_data, callback) {
		let language_code = query_data['language_code'];
		delete query_data['language_code'];
		let return_result = {};

		let columns = {

			customer_id: "customers.id",
			tenant_id: "customers.tenant_id",
			first_name: knex.raw("CAST(AES_DECRYPT(customers.first_name,'" + encription_key + "')AS CHAR(255))"),
			last_name: knex.raw("CAST(AES_DECRYPT(customers.last_name,'" + encription_key + "')AS CHAR(255))"),
			email: knex.raw("CAST(AES_DECRYPT(customers.email,'" + encription_key + "')AS CHAR(255))"),
			phone: knex.raw("CAST(AES_DECRYPT(customers.phone,'" + encription_key + "')AS CHAR(50))"),
			gender: 'customers.gender',
			city_name: "master_city.city_name",
			status: "customers.status",
			dob: "customers.dob",
			country_name: 'countries.name',
			country_id: 'customers.country_id',
			country_code: 'customers.country_code',
			tier: "customer_tiers.name"

		};

		// let validation = new Validator(query_data, rules);
		// if (validation.passes() && !validation.fails()) {
		knex.select(columns)
			.leftJoin('countries', 'countries.id', '=', 'customers.country_id')
			.leftJoin('master_city', 'master_city.id', '=', 'customers.city')
			.leftJoin('customer_tiers', 'customer_tiers.id', '=', 'customers.tier_id')
			.join('tenants', 'tenants.id', 'customers.tenant_id')
			.from("customers")
			.limit(query_data['limit'])
			.offset(query_data['offset'])
			.then((result) => {
				return_result['customer_list'] = result;
				if (result.length > 0) {
					knex('customers')
						.select(knex.raw('count(*) as total_records'))
						.then((count) => {
							return_result['total_records'] = count[0].total_records;
							return callback(response_adapter.response_success(true, status_codes.user_profile_found, messages[language_code].user_profile_found, (return_result)));
						})
				} else {
					return callback(response_adapter.response_error(false, status_codes.user_profile_found_failed, messages[language_code].user_profile_found_failed));
				}
			}).catch((err) => callback(common_functions.catch_error(err)));
		// }
		// else {
		// 	let errors = validation.errors.errors;
		// 	return callback(response_adapter.response_error(false, status_codes.user_profile_found_failed, messages[language_code].user_profile_found_failed, errors));
		// }
	}
	async updateCustomerStatus(form_data, callback) {
		let language_code = form_data['language_code'];
		delete form_data['language_code'];
		let activityDetails = form_data['activityDetails'];
		delete form_data['activityDetails'];
		let columns = {
			id: "customers.id",
			name: knex.raw("CONCAT(CAST(AES_DECRYPT(customers.first_name,'" + encription_key + "') AS CHAR(255)),' ',CAST(AES_DECRYPT(customers.last_name,'" + encription_key + "') AS CHAR(255)))"),
			email: knex.raw("CAST(AES_DECRYPT(customers.email,'" + encription_key + "') AS CHAR(255))"),
			phone: knex.raw("CAST(AES_DECRYPT(customers.phone,'" + encription_key + "') AS CHAR(255))"),
			fcm_token: "customers.fcm_token"
		}
		let customer = await knex("customers").select(columns).where("customers.id", form_data['id']);
		// , fcm_token: null
		let post_data = {};
		knex("customers").update({ status: form_data['status'] }).where("customers.id", form_data['id'])
			.then(async (res) => {
				if (activityDetails[0].is_notification_activity == 1) {
					if (customer[0].fcm_token) {
						let result_data = await common_push_notification_functions.send_push_notification({ Username: customer[0].name, status: (form_data['status'] == 0) ? "Deactivate" : "Activate", customer_id: customer[0].id, fcm_token: customer[0].fcm_token, language_code: language_code, activity_id: activityDetails[0].id })
					}
				}
				if (form_data['status'] == 0) {
					return callback(response_adapter.response_success(true, status_codes.customer_inactivated, messages[language_code].customer_inactivated, customer[0]));
				} else {
					return callback(response_adapter.response_success(true, status_codes.customer_activated, messages[language_code].customer_activated, customer[0]));
				}
			})
	}
	async generateOTP(form_data, callback) {
		let language_code = form_data['language_code'];
		if (language_code == "" || language_code == null || language_code == undefined) {
			let data = await defaultLanguage.getDefaultLanguage();
			language_code = (data.length > 0) ? data[0].language_code : "EN";
		}
		delete form_data['language_code'];
		let data = {};
		Object.assign(data, form_data);
		let otp = otpGenerator.generate(4, {
			upperCase: false,
			specialChars: false,
			alphabets: false
		});
		data.otp = otp
		let sms_data = {
			mobile: data.country_code + data.mobile_number,
		}

		let rules = {
			mobile_number: "required",
			otp: "required"
		};

		let validation = new Validator(data, rules);
		if (validation.passes() && !validation.fails()) {
			var verify;
			var key;
			form_data['email'] ? verify = form_data['email'] : verify = form_data['mobile_number'];
			form_data['email'] ? encription_key = 'email' : encription_key = 'mobile_number';

			let result = await knex('customer_send_otp').insert(data);
			if (result.length > 0)
				return callback(response_adapter.response_success(true, status_codes.otp_send_success, messages[language_code].otp_send_success, { OTP: data.otp }));
			else
				return callback(response_adapter.response_error(false, status_codes.otp_send_failed, messages[language_code].otp_send_failed));
		} else {
			let errors = validation.errors.errors;
			return callback(response_adapter.response_error(false, status_codes.form_field_reqired, messages[language_code].field_required, errors));
		}
	}




}
