let dateFormat = require('dateformat');
let Validator = require('validatorjs');
let messages = require("../response_codes/third_party_messages");
let status_codes = require("../response_codes/third_party_status_codes");
let Response_adapter = require("../../core/response_adapter");
let config = require("../../../config/config");
let encription_key = config.encription_key;
let knex = require("../../../config/knex.js");
let sendNotification = require("../../core/push_notification");
let response_adapter = new Response_adapter();
const jwt = require('jsonwebtoken');

module.exports = class User_model {


	/**
	 * Get CC Token method
	 * Author: 
	 * @param {*} form_data 
	 * @param {*} callback 
	 */
	async getCCToken(form_data, callback) {
		let language_code = form_data['language_code'];
		delete form_data['language_code'];

		let rules = {
			tp_application_key: "required",
			domain_ip: "required",
		}

		let validation = new Validator(form_data, rules);
		if (validation.passes() && !validation.fails()) {

			delete form_data.tp_application_key;

			const token_data = {
				tp_application_key: form_data.tp_application_key,
				third_party_app_id: form_data.third_party_app_id,
				tenant_id: form_data.tenant_id
			}

			const CC_TOKEN = jwt.sign(token_data, config.cc_token_secret_key,
				{ expiresIn: config.cc_token_expire_time });

			return callback(response_adapter.response_success(true, status_codes.get_tp_application_cc_token_success,
				messages[language_code].get_tp_application_cc_token_success, { CC_TOKEN }));

		}
		else {
			let errors = validation.errors.errors;
			return callback(response_adapter.response_error(false, status_codes.form_field_reqired, messages[language_code].form_field_reqired, errors));
		}
	}

	async generateOTP(data, update = false) {
		const otp = 4578; //otpGenerator.generate(4, { upperCase: false, specialChars: false, alphabets: false });
		data['otp'] = otp;

		if (!update)
			return knex('customer_send_otp').insert(data);
		else return knex('customer_send_otp').update({
			otp, counter: knex.raw('counter + 1')
		}).where('id', data.cso_id);
	}


	insertCustomerLogs(data) {
		return knex('customer_logs').insert(data);
	}

	updateDeviceDetails(customer_id, update_data) {
		return knex('customers').update(update_data)
			.where('id', customer_id);
	}

	async verifyOTP(form_data) {
		const lang_code = form_data.language_code;
		const columns = {
			customer_id: 'customers.id',
			customer_unique_id: knex.raw(`cast(aes_decrypt(customers.customer_unique_id, '${encription_key}') as char(255))`),
			first_name: knex.raw(`cast(aes_decrypt(customers.first_name, '${encription_key}') as char(255))`),
			last_name: knex.raw(`cast(aes_decrypt(customers.last_name, '${encription_key}') as char(255))`),
			email: knex.raw(`cast(aes_decrypt(customers.email, '${encription_key}') as char(255))`),
			phone: knex.raw(`cast(aes_decrypt(customers.phone, '${encription_key}') as char(255))`),
			is_otp_valid: knex.raw(`timestampdiff(second, cso.created_at, now()) <= 900`),
			gender: 'gender',
			dob: 'dob',
			otp: 'cso.otp',
			user_type: 'master_user_type.code',
			is_logged_in: 'customers.is_logged_in',
			referrer_user_type: knex.raw('null')
		};

		let result = await knex('customers').select(columns)
			.join('master_user_type', 'master_user_type.id', 'customers.user_type_id')
			.where(function () {
				this.andWhereRaw(`cast(aes_decrypt(customers.email, '${encription_key}') as char(255)) = '${form_data.input}'`)
					.orWhereRaw(`cast(aes_decrypt(customers.phone, '${encription_key}') as char(255)) = '${form_data.input}'`)
			}).join('customer_send_otp as cso', 'cso.customer_id', 'customers.id')
			.orderBy('cso.created_at', 'desc')
			.limit(1);

		if (!result.length)
			return response_adapter.response_error(false, status_codes.invalid_credential, messages[lang_code].invalid_credential);

		result = result[0];

		if (result.otp != form_data.otp)
			return response_adapter.response_error(false, status_codes.invalid_otp, messages[lang_code].invalid_otp);

		if (!result.is_otp_valid)
			return response_adapter.response_error(false, status_codes.otp_expired, messages[lang_code].otp_expired);

		let customer_id = result.customer_id;
		let family_customer_id = null;
		let referrer_user_type = null;

		if (result.user_type == 'family') {
			family_customer_id = customer_id;

			const referrerDetails = await knex('customers').select({
				referrer_id: 'customers.referrer_id',
				referrer_user_type: 'master_user_type.code'
			}).join('customers as rc', 'rc.id', 'customers.referrer_id')
				.join('master_user_type', 'master_user_type.id', 'rc.user_type_id')
				.where('customers.id', customer_id);

			customer_id = referrerDetails[0].referrer_id;
			referrer_user_type = referrerDetails[0].referrer_user_type;

			result.referrer_user_type = referrer_user_type;
		}

		if (result.is_logged_in == 0 && (result.user_type == 'owner' || (result.user_type == 'family' && referrer_user_type == 'owner'))) {
			/* const unitDetails = await knex('master_unit').select('id')
				.where('status', 1)
				.where('customer_id', customer_id); */

			const columns = {
				address_line_1: 'address_line_1',
				address_line_2: 'address_line_2',
				is_default: 'master_unit.is_default',
				title: 'master_unit.title',
				unit_id: 'master_unit.id',
				building_name: 'master_building.name',
				unit_no: 'master_unit.unit_no',
				area: 'master_property.area',
				emirate_name: 'master_emirate.name'
			};

			let propertyObj = knex('master_property').select(columns)
				.join('master_emirate', 'master_emirate.id', 'master_property.emirate_id')
				.join('master_building', 'master_building.property_id', 'master_property.id')
				.join('master_unit', 'master_unit.building_id', 'master_building.id')
				.orderByRaw('master_unit.is_default desc, master_building.code asc, master_unit.unit_no asc')
			// .whereIn('master_unit.id', unitDetails.map(e => e.id));

			if (result.user_type == 'owner')
				propertyObj.where('master_unit.customer_id', customer_id);
			else if (result.user_type == 'family' && referrer_user_type == 'owner') {

				propertyObj.select({ is_default: knex.raw('case when family_has_unit.id is not null then 1 else 0 end') })
					.leftJoin('family_has_unit', function () {
						this.on('family_has_unit.unit_id', 'master_unit.id')
							.on('family_has_unit.customer_id', family_customer_id)
							.on('family_has_unit.status', 1);
					}).where('master_unit.customer_id', customer_id);
			}

			result.unit_details = await propertyObj;
		}

		if (result.is_logged_in == 0)
			knex('customers').update({ first_login_time: knex.raw('now()') }).where({ id: result.customer_id }).then();

		return response_adapter.response_success(true, status_codes.otp_verified_success, messages[lang_code].otp_verified_success, result);
	}

	async resendOtp(form_data) {
		const lang_code = form_data.language_code;
		const columns = {
			first_name: knex.raw(`cast(aes_decrypt(customers.first_name, '${encription_key}') as char(255))`),
			email: knex.raw(`cast(aes_decrypt(customers.email, '${encription_key}') as char(255))`),
			phone: knex.raw(`cast(aes_decrypt(customers.phone, '${encription_key}') as char(255))`),
			counter: 'cso.counter',
			cso_id: 'cso.id',
			customer_id: 'customers.id',
			user_name: knex.raw("CONCAT(CAST(AES_DECRYPT(customers.first_name,'" + encription_key + "') AS CHAR(255)),' ',CAST(AES_DECRYPT(customers.last_name,'" + encription_key + "') AS CHAR(255)))"),
			user_type: "mut.name"
		};
		let result = await knex('customers').select(columns)
			.where(function () {
				this.andWhereRaw(`cast(aes_decrypt(customers.email, '${encription_key}') as char(255)) = '${form_data.input}'`)
					.orWhereRaw(`cast(aes_decrypt(customers.phone, '${encription_key}') as char(255)) = '${form_data.input}'`)
			})
			// .whereRaw(`cast(aes_decrypt(customers.email, '${encription_key}') as char(255)) = '${form_data.input}'`)
			// .orWhereRaw(`cast(aes_decrypt(customers.phone, '${encription_key}') as char(255)) = '${form_data.input}'`)
			.join('customer_send_otp as cso', 'cso.customer_id', 'customers.id')
			.join('master_user_type as mut', 'mut.id', 'customers.user_type_id')
			.whereRaw(`timestampdiff(second, cso.created_at , now()) <= 900`)
			.orderBy('cso.created_at', 'desc')
			.limit(1);

		if (!result.length)
			return response_adapter.response_error(false, status_codes.otp_expired, messages[lang_code].otp_expired);

		result = result[0];
		if (result.counter >= 4)
			return response_adapter.response_error(false, status_codes.max_attempt_over, messages[lang_code].max_attempt_over)

		return response_adapter.response_success(true, status_codes.otp_resend, messages[lang_code].otp_resend, result);
	}


	async get_notification_list(form_data, callback) {
		let data = form_data;
		let language_code = form_data['language_code'];

		let rules = {
			tenant_id: "required",
			customer_unique_id: "required"
		};

		let col = {
			body: "languages_for_customer_notification.body",
			image: "languages_for_inapp_notification_templates.image",
			language_code: "languages_for_customer_notification.language_code",
			title: "languages_for_customer_notification.title",
			id: "customer_notification.id",
			timestamp: knex.raw("CONVERT_TZ(customer_notification.created_at,'+05:30','+07:00')")
		}

		let validation = new Validator(data, rules);
		if (validation.passes() && !validation.fails()) {

			if (data['delete_ids']) {
				await knex("customer_notification")
					.whereIn('id', data['delete_ids'])
					.update({ is_deleted: 1 });
			}

			if (data['type'] == 'all') {
				await knex("customer_notification")
					.where('customer_id', data['customer_unique_id'])
					.update({ is_deleted: 1 });
			}
			'8098045177'

			let obj = knex('languages_for_customer_notification').select(col)
				// .where('customer_notification.customer_id',knex.select('id').from('customers').whereRaw(`CAST(AES_DECRYPT(customers.customer_unique_id, '${encription_key}') AS CHAR(255)) = '${data.customer_unique_id}'`))  //'customer_notification.customer_id = customers.id'
				.leftJoin('customer_notification', 'customer_notification.id', '=', 'languages_for_customer_notification.customer_notification_id')
				.innerJoin('languages_for_inapp_notification_templates', 'customer_notification.code', '=', 'languages_for_inapp_notification_templates.code')
				// .where('customer_notification.customer_id', data.customer_unique_id)
				.join('customers', "customers.id", '=', 'customer_notification.customer_id')
				.where('customer_notification.is_deleted', 0)
				.where('languages_for_customer_notification.status', 1)
				.where('languages_for_customer_notification.language_code', language_code)
				.andWhereRaw("CAST(AES_DECRYPT(customers.customer_unique_id,'" + encription_key + "') AS CHAR(255)) = '" + data['customer_unique_id'] + "'")
				.groupBy("languages_for_customer_notification.customer_notification_id");

			if (data.timestamp)
				obj.where('customer_notification.created_at', ">", dateFormat(data.timestamp, "yyyy-mm-dd HH:MM:ss"));

			obj.limit(data['limit'])
				.offset(data['offset'])
				.orderBy("customer_notification.created_at", "DESC")
				.then((activity_result) => {

					if (activity_result.length) {
						return callback(response_adapter.response_success(true, status_codes.notification_found, messages[language_code].notification_found, activity_result));

					} else {
						return callback(response_adapter.response_error(false, status_codes.notification_not_found, messages[language_code].notification_not_found));

					}
				}).catch((err) => {
					console.log(err)
				})
		} else {
			let errors = validation.errors.errors;
			return callback(response_adapter.response_error(false, status_codes.form_field_reqired, messages.field_required, errors));
		}
	}



	async updateFcmToken(form_data, callback) {
		let data = {};
		Object.assign(data, form_data);
		let rules = {
			customer_id: "required|numeric",
			fcm_token: "required",
		};
		let language_code = form_data['language_code'];

		//Check Validation
		let validation = new Validator(form_data, rules);
		if (validation.passes() && !validation.fails()) {
			knex("customers").select("customers.*").where("customers.id", data['customer_id'])
				.then((customerResult) => {
					if (customerResult.length > 0) {
						knex("customers").update("customers.fcm_token", data['fcm_token']).where("customers.id", data['customer_id'])
							.then((res) => {
								if (res > 0) {
									return callback(response_adapter.response_error(true, status_codes.token_update_success, messages[language_code].token_update_success));
								} else {
									return callback(response_adapter.response_error(false, status_codes.token_update_failed, messages[language_code].token_update_failed));
								}
							}).catch((err) => {
								let errors = validation.errors.errors;
								return callback(response_adapter.response_error(false, status_codes.form_field_reqired, messages[language_code].form_field_reqired, errors));
							})
					} else {
						return callback(response_adapter.response_success(true, status_codes.customer_not_found, messages[language_code].customer_not_found));
					}
				}).catch((err) => {
					let errors = validation.errors.errors;
					return callback(response_adapter.response_error(false, status_codes.form_field_reqired, messages[language_code].form_field_reqired, errors));
				})

		} else {
			let errors = validation.errors.errors;
			return callback(response_adapter.response_error(false, status_codes.form_field_reqired, messages[language_code].form_field_reqired, errors));
		}
	}


	async send_notification(form_data, callback) {
		let data = {};
		Object.assign(data, form_data);
		let rules = {
			customer_id: "required"
		};
		let language_code = form_data['language_code'];

		console.log("send response", form_data)

		//Check Validation
		let validation = new Validator(form_data, rules);
		if (validation.passes() && !validation.fails()) {
			knex("customers").select("customers.fcm_token").where("customers.id", data['customer_id'])
				.then((customerResult) => {
					if (customerResult.length > 0) {
						var fcm_array = [];
						customerResult.forEach(element => {
							fcm_array.push(element.fcm_token);
						});

						let notification_obj = {
							"notification": {
								"title": "Portugal vs. Denmark",
								"body": "great match!"
							},
							"tokens": fcm_array

						}

						sendNotification.sendNotification(notification_obj, (result) => {

							console.log("send response", result)

							return callback({ status: true, message: "send notification success" });
						})

					} else {
						return callback({ status: false, message: "Customer Not Found" });
					}
				}).catch((err) => {
					let errors = validation.errors.errors;
					return callback({ status: false, message: "Customer Not Found", error: errors });
				})

		} else {
			let errors = validation.errors.errors;
			return callback(response_adapter.response_error(false, status_codes.form_field_reqired, messages[language_code].form_field_reqired, errors));

		}
	}



	async delete_fcm_token(form_data, callback) {
		let language_code = form_data['language_code'];
		let rules = {
			customer_id: "required",
		};

		let validation = new Validator(form_data, rules);
		if (validation.passes() && !validation.fails()) {
			knex("customers")
				.update("fcm_token", '')
				.where("id", form_data['customer_id'])
				.then((fcmToken) => {
					knex("customer_logs")
						.insert({ customer_id: form_data['customer_id'], status: 0 })
						.then((customerLogs) => {
							knex("customers")
								.update({ last_logout_time: knex.raw("CURRENT_TIMESTAMP") })
								.where("customers.id", form_data['customer_id'])
								.then((customerUpdate) => {

								}).catch((err) => {
									console.log("Error customer update : ", err);
								})
							return callback(response_adapter.response_success(true, status_codes.fcm_token_deleted, messages[language_code].fcm_token_deleted));
						}).catch((err) => {
							console.log("Error customerLogs : ", err);
						})
				}).catch((err) => {
					console.log("Error fetchCustomer : ", err);
				})
		} else {
			let errors = validation.errors.errors;
			return callback(response_adapter.response_error(false, status_codes.form_field_reqired, messages.field_required, errors));
		}
	}


	async get_hot_selling_properties(form_data, callback) {
		let data = form_data;
		let language_code = 'EN';

		let col = {
			property_id: 'master_property.id',
			property_code: 'master_property.property_code',
			property_name: 'master_property.property_name',
			latitude: 'master_property.latitude',
			longitude: 'master_property.longitude',
			image_path: knex.raw('GROUP_CONCAT(DISTINCT property_has_images.path)'),
		};

		let obj = knex('master_property').select(col)
			.leftJoin('property_has_images', function () {
				this.on('property_has_images.property_id', 'master_property.id')
					.on('property_has_images.status', 1);
			}).where('master_property.hot_selling', 1)
			.groupBy('master_property.id');

		obj.then((activity_result) => {

			if (activity_result.length) {

				for (const element of activity_result) {
					if (!(element['image_path'] == undefined || element['image_path'] == null || element['image_path'] == "")) {
						element['image_path'] = element['image_path'].split(",").map(e => `${config.url}${e}`);
					}
				}

				return callback(response_adapter.response_success(true, status_codes.hot_selling_properties_found, messages[language_code].hot_selling_properties_found, activity_result));

			} else {
				return callback(response_adapter.response_error(false, status_codes.hot_selling_properties_not_found, messages[language_code].hot_selling_properties_not_found));

			}
		}).catch((err) => {
			console.log(err)
		})

	}

	getEmailDate(){
		return new Date((new Date().getTime() + (new Date().getTimezoneOffset() * 60000)) + (3600000*4)).toLocaleString();
	}
	formatEmailDate(date){
		let today = new Date(date);
		return (((today.getDate()>9) ? today.getDate() : "0"+today.getDate())+"-"+((today.getMonth()>9) ? (today.getMonth()+1) : "0"+(today.getMonth()+1))+"-"+today.getFullYear()).toString();
	}
}

