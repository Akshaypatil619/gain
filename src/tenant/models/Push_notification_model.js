let messages = require("../../../config/messages.js");
let status_codes = require("../../../config/response_status_codes.js");
let knex = require("../../../config/knex.js");
let Common_functions = require("../../core/common_functions.js");
var uuid = require("uuid-pure");


let Notification = require("../notification_model/notification");
let notification = new Notification();

// MODULE LOAD
let Response_adapter = require("../../core/response_adapter");
let Validator = require('validatorjs');
let response = new Response_adapter();
let common_functions = new Common_functions();

module.exports = class Push_notification_model {
	get_push_notification_provider_master_list(query_data, callback) {
		let return_result = {};
		let data = [];
		let now = new Date();
		let obj = knex.select('*').table("push_notification_provider_masters")
		obj.then((t_result) => {
			return_result.total_record = t_result.length;
			if (t_result.length > 0) {
				return_result.provider_masters = t_result;
				return callback(response.response_success(true, status_codes.push_notification_provider_found, messages.push_notification_provider_found, (return_result)));
			} else {
				return callback(response.response_error(false, status_codes.push_notification_provider_not_found, messages.push_notification_provider_not_found));
			}
		}).catch(function (err) {
			console.log(err);
			let result = status_codes.check_error_code("DATABASE", err.errno);
			return callback(Object.assign({
				"status": false
			}, result));
		}).catch(function (err) {
			let result = status_codes.check_error_code("DATABASE", err.errno);
			return callback(Object.assign({
				"status": false
			}, result));
		});


	}

	add_push_notification_provider(query_data, callback) {
		// console.log(query_data);
		let rules = {
			name: "required",
			data: "required",
			tenant_id: "required",
			push_notification_provider_master_id: "required",
			platform_name: "required",
		};
		//Check Validation

		let validation = new Validator(query_data, rules);
		if (validation.passes() && !validation.fails()) {
			// if(query_data['name'] == 'sns') {
			notification.add_notification_provider(query_data, (success) => {
				return callback(success);
			});

			// }
		} else {
			let errors = validation.errors.errors;
			return callback(response.response_error(false, status_codes.form_field_reqired, messages.form_field_reqired, errors));
		}

	}

	send_push_notification_global(body_data, callback) {
		console.log(body_data);
		// push_notification_common_functions.get_notification_provider_data(body_data['tenant_id'], (providerData) => {
		//     console.log(providerData);
		//     if (providerData.status) {
		//         if (providerData.data.length > 0) {
		notification.broadcast_notification(body_data, (result) => {
			return callback(result);
		});
		//         } else {
		//             return callback(response.response_error(false, status_codes.push_notification_provider_not_found, messages.push_notification_provider_not_found));
		//         }
		//     } else {
		//         callback(common_functions.catch_error(providerData.data));
		//     }
		// });

	}

	send_push_notification(body_data, callback) {
		console.log(body_data);
		// push_notification_common_functions.get_notification_provider_data(body_data['tenant_id'], (providerData) => {
		//     console.log(providerData);
		//     if (providerData.status) {
		//         if (providerData.data.length > 0) {
		notification.send_notification(body_data, (result) => {
			return callback(result);
		});
		//         } else {
		//             return callback(response.response_error(false, status_codes.push_notification_provider_not_found, messages.push_notification_provider_not_found));
		//         }
		//     } else {
		//         callback(common_functions.catch_error(providerData.data));
		//     }
		// });

	}

	get_notification_template(query_data, callback) {
		console.log(query_data);
		let return_result = {};
		let col = {
			id: "notification_templates.id",
			title: "notification_templates.title",
			code: "notification_templates.code",
			status: "notification_templates.status",
			push_status: "notification_templates.push_status"
		}

		var obj = knex("notification_templates")
			.select(col)
			.innerJoin("notification_template_activities", "notification_template_activities.notification_template_id", "=", "notification_templates.id")
			.where('notification_template_activities.status', 1)
			// .where('notification_templates.push_status', 1)
			.groupBy("notification_templates.id");


		if (query_data['title']) {
			obj.where('notification_templates.title', 'like', "%" + query_data['title'] + "%");
		}
		if (query_data['id']) {
			obj.where('notification_templates.id', query_data['id']);
		}
		if (query_data['activity_id']) {
			obj.where('notification_template_activities.activity_id', query_data['activity_id']);
		}
		obj.limit(query_data['limit'])
			.offset(query_data['offset']);
		obj.then((result) => {
			console.log(result);
			return_result['notification_template'] = result;
			// if (result.length > 0) {
			var query = knex("notification_templates")
				.select('*')
				.innerJoin("notification_template_activities", "notification_template_activities.notification_template_id", "=", "notification_templates.id")
				.where('notification_template_activities.status', 1)
				// .where('notification_templates.push_status', 1)
				.groupBy("notification_templates.id");

			if (query_data['title']) {
				query.where('notification_templates.title', 'like', "%" + query_data['title'] + "%");
			}
			if (query_data['id']) {
				query.where('notification_templates.id', query_data['id']);
			}
			if (query_data['activity_id']) {
				query.where('notification_template_activities.activity_id', query_data['activity_id']);
			}
			query.then((t_result) => {
				return_result['total_records'] = t_result.length;
				return callback(response.response_success(true, status_codes.data_found, messages.data_found, (return_result)));
			}).catch(function (error) {
				return_result = status_codes.check_error_code("DATABASE", error.errno);
				return callback(Object.assign({
					"status": false
				}, return_result));
			});
			// }
		}).catch((error) => {
			console.log(error);
			let return_result = status_codes.check_error_code("DATABASE", error.errno);
			return callback(Object.assign({
				"status": false
			}, return_result));
		});
	}

	async add_notification_template(body_data, callback) {
		let rule = {
			tenant_id: "required",
			activity_id: "required",
			data_array: "required",
			title: "required",
			code: "required"
		};
		let validation = new Validator(body_data, rule);
		if (validation.passes() && !validation.fails()) {
			if (body_data['id'] != undefined && body_data['id'] != null) {

				let activity_data = body_data.activity_id;
				let activity_id_array = [];
				let notification_template_array = [];
				if (activity_data != undefined && activity_data != null) {
					activity_data.forEach((el) => {
						activity_id_array.push(el['id']);
						notification_template_array.push({ activity_id: el['id'], notification_template_id: body_data['id'], status: 1 });
						delete el['id'];
						delete el['itemName'];
						delete el['activity_id'];
					});
					await knex("notification_template_activities")
						.where('notification_template_id', body_data.id)
						.update({ status: 0 });

					await knex("notification_template_activities").insert(notification_template_array);

				}



				await knex("notification_templates").update({
					body: body_data['body'],
					template_name: body_data['template_name'],
					title: body_data['title'],
					screen_to_redirect: body_data['url'],
					tenant_id: body_data['tenant_id'],
					// activity_id: body_data['activity_id'],
					created_by: body_data['tenant_id'],
					updated_by: body_data['tenant_id'],
					image: body_data['image'],
				}).where('id', body_data['id']).then(async (result) => {

					await knex("languages_for_notification_templates")
						.where('notification_template_id', body_data['id'])
						.update({ status: 0 });
					var code = uuid.newId(10, 10);
					body_data.data_array.forEach(el => {
						el['notification_template_id'] = body_data['id'];
						el['body'] = el.body;
						el['language_code'] = el.language_code;
						el['title'] = el.title;
						delete el.id;
						delete el.language_name;
						el['code'] = code;
						el['status'] = 1;
					});
					await knex("languages_for_notification_templates").insert(body_data.data_array);


					return callback(response.response_success(true, status_codes.notification_template_update_success, messages.notification_template_update_success));
				}).catch((error) => {
					console.log(error);
					return callback(response.response_error(false, status_codes.notification_template_insert_fail, messages.notification_template_insert_fail, error))
				});
			} else {
					knex("notification_templates").select("id")
					.where("title", body_data.title)
					.andWhere("code", body_data.code)
					.andWhere("tenant_id", body_data.tenant_id)
					.then((result) => {
						if (result.length > 0) {
							return callback(response.response_error(false, status_codes.notification_template_already_exist, messages.notification_template_already_exist));
						} else {
							knex("notification_templates").insert({
								template_name: body_data['template_name'],
								title: body_data['title'],
								code: body_data['code'],
								status: body_data['status'],
								screen_to_redirect: body_data['url'],
								tenant_id: body_data['tenant_id'],
								created_by: body_data['tenant_id'],
								updated_by: body_data['tenant_id'],
								image: body_data['image'],
							}).then(async (result) => {
								let activity_array = body_data.activity_id;

								activity_array.forEach(el => {
									el['notification_template_id'] = result[0];
									el['activity_id'] = el.id;
									delete el.itemName;
									delete el.id;
									el['status'] = 1;
								});
								await knex("notification_template_activities").insert(activity_array);
								console.log("code", uuid.newId(10, 10))
								var code = uuid.newId(10, 10);

								body_data.data_array.forEach(el => {
									el['notification_template_id'] = result[0];
									el['body'] = el.body;
									el['language_code'] = el.language_code;
									el['title'] = el.title;
									delete el.id;
									delete el.language_name;
									el['code'] = code;
									el['status'] = 1;
								});
								await knex("languages_for_notification_templates").insert(body_data.data_array);

								return callback(response.response_success(true, status_codes.notification_template_insert_success, messages.notification_template_insert_success));
							}).catch((error) => {
								console.log(error);
								return callback(response.response_error(false, status_codes.notification_template_insert_fail, messages.notification_template_insert_fail, error))
							});
						}
					})
			}
		} else {
			let errors = validation.errors.errors;
			return callback(response.response_error(false, status_codes.form_field_reqired, messages.form_field_reqired, errors));
		}
	}


	get_activity_notification_logs(query_data, callback) {
		let rules = {
			tenant_id: "required",
		};
		//Check Validation
		let validation = new Validator(query_data, rules);
		if (validation.passes() && !validation.fails()) {
			let query = knex("email_sms_cron_data")

			let return_result = {};
			query.select({
				activity_name: "master_api_permission_modules.name",
				id: "email_sms_cron_data.id",
				customer: knex.raw("CAST(AES_DECRYPT(customers.first_name,'credosyssolutions')AS CHAR(255))"),
				customer_id: "customers.customer_unique_id",
				tenant_id: "customers.tenant_id",
				mobile: "email_sms_cron_data.phone",
				push_sent: "email_sms_cron_data.push_sent",
				push_sent_date: "email_sms_cron_data.created_at",
				push_body: "email_sms_cron_data.push_body",
				device_id: "customers.device_id"
			})
			query.leftJoin("master_api_permission_modules", "master_api_permission_modules.id", "=", "email_sms_cron_data.activity_id")
				.leftJoin("customers", "customers.id", "=", "email_sms_cron_data.customer_id")
				.where('email_sms_cron_data.type', 'push')
				.orderBy('email_sms_cron_data.id', 'desc')

			if (query_data['search']) {
				query.whereRaw("CAST(AES_DECRYPT(customers.first_name,'credosyssolutions') AS CHAR(255)) like '%" + query_data['search'] + "%'")
					.orWhere('master_api_permission_modules.name', 'like', '%' + query_data['search'] + '%')
					.orWhere('customers.customer_unique_id', 'like', '%' + query_data['search'] + '%')
			}
			query.then((result) => {
				return_result.total_records = result.length;
				query.limit(query_data['limit'])
					.offset(query_data['offset'])
					.then((t_result) => {
						if (t_result.length > 0) {
							return_result.log_list = t_result;
							return callback(response.success("notification_log_found", return_result))
						} else {
							return_result.log_list = [];
							return_result.total_records = 0;
							return callback(response.error("notification_log_not_found", return_result))
						}
					})
					.catch((err) => callback(common_functions.catch_error(err)))
			}).catch((err) => callback(common_functions.catch_error(err)));

		} else {
			let errors = validation.errors.errors;
			return callback(response.response_error(false, status_codes.form_field_reqired, messages.form_field_reqired, errors));
		}
	}


	change_push_template_status(queryData, callback) {
		let data = queryData;
		let rules = {
			push_template_id: "required",
			push_status: "required"
		};
		//Check Validation
		let validation = new Validator(data, rules);
		if (validation.passes() && !validation.fails()) {
			knex("notification_templates")
				.where("id", data.push_template_id)
				.update({
					"push_status": data.push_status
				})
				.then((push_update_result) => {
					return callback(response.response_success(true, status_codes.push_template_status_update_success, messages.push_template_status_update_success));
				}).catch((err) => callback(common_functions.catch_error(err)));
		} else {
			let errors = validation.errors.errors;
			return callback(response.response_error(false, status_codes.form_field_reqired, messages.form_field_reqired, errors));

		}
	}

	async get_notification_configuration(query_data, callback) {
		let rules = {
			tenant_id: "required",
		};
		let col = {
			frequency: "notification_configuration.frequency",
			radius: "notification_configuration.radius",
			location_update: "notification_configuration.location_update",

		}

		let validation = new Validator(query_data, rules);
		if (validation.passes() && !validation.fails()) {
			let setting_result = await knex("notification_configuration").select(col)
				.where("tenant_id", query_data.tenant_id)
				.where("status", 1);

			if (setting_result.length > 0)
				return callback(response.response_success(true, status_codes.data_found, messages.data_found, setting_result));
			return callback(response.response_error(false, status_codes.data_not_found, messages.data_not_found));

		} else {
			let errors = validation.errors.errors;
			return callback(response.response_error(false, status_codes.form_field_reqired, messages.form_field_reqired, errors));

		}
	}

	async add_update_notification_config(form_data, callback) {
		let data = {};
		Object.assign(data, form_data);
		let rules = {
			frequency: "required",
			location_update: "required",
			radius: "required",
		};
		//Check Validation
		let validation = new Validator(form_data, rules);
		if (validation.passes() && !validation.fails()) {
			let obj = await knex("notification_configuration")
				.where('tenant_id', form_data['tenant_id']);
			if (obj.length == 0) {
				data.status = 1;
				let object = knex("notification_configuration").insert(data);
				object.then((result) => {
					if (result.length > 0)
						return callback(response.response_success(true, status_codes.setting_modified_success, messages.setting_modified_success));
					return callback(response.response_error(false, status_codes.setting_modified_failed, messages.setting_modified_failed, err));
				}).catch((err) => {
					return callback(response.response_error(false, status_codes.setting_modified_failed, messages.setting_modified_failed, err));
				});
			}
			else {
				await knex("notification_configuration")
					.where("tenant_id", form_data['tenant_id'])
					.update({
						frequency: data.frequency,
						location_update: data.location_update,
						radius: data.radius
					})
				return callback(response.response_success(true, status_codes.setting_modified_success, messages.setting_modified_success));
			}
		} else {
			let errors = validation.errors.errors;
			return callback(response.response_error(false, status_codes.form_field_reqired, messages.form_field_reqired, errors));
		}
	}

	get_selected_activity_list(query_data, callback) {
		query_data.columns = {
			id: "notification_template_activities.activity_id",
		};
		let query = knex('notification_template_activities').select(query_data.columns)
			.where('notification_template_activities.notification_template_id', query_data["notification_template_id"])
			.where('notification_template_activities.status', 1);
		query.then(function (result) {
			if (result.length > 0) {
				return callback(response.response_success(true, status_codes.master_tag_found, messages.master_tag_found, (result)));
			} else {
				return callback(response.response_error(false, status_codes.master_tag_not_found, messages.master_tag_not_found));
			}
		}).catch(function (err) {
			let result = status_codes.check_error_code("DATABASE", err.errno);
			return callback(Object.assign({
				"status": false
			}, result));
		});
	}


	get_selected_notification_languages(query_data, callback) {
		let columns = {
			id: "master_languages.id",
			language_name: "master_languages.language_name",
			language_code: "master_languages.language_code",
			body: "languages_for_notification_templates.body",
			title: "languages_for_notification_templates.title",

		};


		knex('languages_for_notification_templates').select(columns)
			.leftJoin("master_languages", "languages_for_notification_templates.language_code", "=", "master_languages.language_code")
			.where('languages_for_notification_templates.notification_template_id', query_data["notification_template_id"])
			.where('languages_for_notification_templates.status', 1)
			.then(function (result) {

				if (result.length > 0) {
					return callback(response.response_success(true, status_codes.master_tag_found, messages.master_tag_found, (result)));
				} else {
					return callback(response.response_error(false, status_codes.master_tag_not_found, messages.master_tag_not_found));
				}
			}).catch(function (err) {
				let result = status_codes.check_error_code("DATABASE", err.errno);
				return callback(Object.assign({
					"status": false
				}, result));
			});
	}
};