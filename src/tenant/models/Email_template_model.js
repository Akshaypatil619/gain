/************** Load Libraries ****************/
const path = require('path');
let fs = require('fs');
let mkdirp = require('mkdirp');
// let html2jade = require('html2jade');
let Validator = require('validatorjs');

/************** Load Files ****************/
Response_adapter = require("../../core/response_adapter");
Upload_files = require("../../core/upload_files");
let messages = require("../../../config/messages.js");
let status_codes = require("../../../config/response_status_codes.js");
let knex = require("../../../config/knex");
let send_email = require("../../core/mail_service.js");
let CommonFunctions = require("../../core/common_functions");

let Queries = require("../queries/mysql/email_template");

/************** Generate Objects ****************/
let upload_files = new Upload_files();
let response = new Response_adapter();
let common_functions = new CommonFunctions();
//email_template_model;
let queries = new Queries();

module.exports = class email_template_model {
    /************************************
     email Operation Start
     ************************************/

	/* Add  email*/
	async add_email_template(form_data, callback) {

		let data = {};
		Object.assign(data, form_data);

		let rules = {
			template_name: "required",
			data_array: "required",
			activity_id: "required",
			template_created_for_user_type: "required",
			template_code: "required"
		};
		//Check Validation
		let validation = new Validator(data, rules);
		if (validation.passes() && !validation.fails()) {

			let activity_array = data['activity_id'];
			delete data['activity_id'];
			let email_array = data['data_array'];
			delete data['data_array'];
			const existing_template = await knex('email_templates').select('id').where('template_code', data.template_code);
			if (existing_template.length > 0) return callback(response.response_error(false, status_codes.email_template_already_exist, messages.email_template_already_exist));
			
			let email_template_id = await knex("email_templates").insert(data, "id");

			email_array.forEach((item) => {
				item['status'] = 1;
				item['email_template_id'] = email_template_id[0];
				delete item.id;
				delete item.language_name;
			})
			let email_language_result = await knex("languages_for_email_templates").insert(email_array);

			activity_array.forEach(el => {
				el['email_template_id'] = email_template_id[0];
				el['activity_id'] = el.id;
				delete el.itemName;
				delete el.id;
				el['status'] = 1;
			});
			let email_activity_result = await knex("email_template_activities").insert(activity_array);

			if (email_activity_result.length == 0 && email_language_result.length == 0) {
				return callback(response.response_error(false, status_codes.email_template_created_failed, messages.email_template_created_failed, err.message));
			}

			return callback(response.response_success(true, status_codes.email_template_created, messages.email_template_created));
		} else {
			let errors = validation.errors.errors;
			return callback(response.response_error(false, status_codes.form_field_reqired, messages.form_field_reqired, errors));
		}
	}

	/* Modify email */
	async edit_email_template(form_data, callback) {
		let data = {};
		Object.assign(data, form_data);
		delete data.tenant_id;
		delete data.email_template_id;

		let rules = {
			email_template_id: "required",
		};
		//Check Validation
		let validation = new Validator(form_data, rules);
		if (validation.passes() && !validation.fails()) {

			let email_array = data['data_array'];
			delete data['data_array'];
			email_array.forEach(async (item) => {
				await knex("languages_for_email_templates")
					.where('email_template_id', form_data['email_template_id'])
					.andWhere('language_code', item['language_code'])
					.update({ body: item['body'], subject: item['subject'] });
			})

			let activity_data = data['activity_id'];
			let activity_id_array = [];
			let email_template_array = [];
			activity_data.forEach((el) => {
				activity_id_array.push(el['id']);
				email_template_array.push({ activity_id: el['id'], email_template_id: form_data['email_template_id'], status: 1 });
				delete el['id'];
				delete el['itemName'];
				delete el['activity_id'];
			});

			await knex("email_template_activities")
				.where('email_template_id', form_data['email_template_id'])
				.update({ status: 0 });

			await knex("email_template_activities").insert(email_template_array);
			let email_template_data = data;
			delete email_template_data.activity_id;
			let email_template_result = await knex("email_templates")
				.where('id', form_data['email_template_id'])
				.update(email_template_data);
			if (!email_template_result) {
				return callback(response.response_error(false, status_codes.email_template_update_failed, messages.email_template_update_failed, err.message));
			}
			return callback(response.response_success(true, status_codes.email_template_update_success, messages.email_template_update_success));
		} else {
			let errors = validation.errors.errors;
			return callback(response.response_error(false, status_codes.form_field_reqired, messages.form_field_reqired, errors));
		}
	}

	// Get email By ID
	get_email_template_by_id(query_data, callback) {
		let data = {
			email_id: query_data['email_id']
		};
		let rules = {
			email_id: "required"
		};
		let columns = {
			// id:"email_templates.id",
			tag_name: "master_tag.tag_name",
			activity_name: "master_api_permission_modules.name",
			id: "email_templates.activity_id",
			template_created_by_user_type: "email_templates.template_created_by_user_type",
			template_created_for_user_type: "email_templates.template_created_for_user_type",
			template_name: "email_templates.template_name",
			template_code: "email_templates.template_code",
			status: "email_templates.status",
			subject: "email_templates.subject",
			body: "email_templates.body",

		}
		query_data.columns = columns;
		//Check Validation
		let validation = new Validator(data, rules);
		if (validation.passes() && !validation.fails()) {
			queries.get_email_template_by_id("get_email_template", query_data)
				.then((result) => {
					if (result.length > 0) {
						return callback(response.response_success(true, status_codes.email_template_found, messages.email_template_found, (result)));
					} else {
						return callback(response.response_error(false, status_codes.email_template_not_found, messages.email_template_not_found));
					}
				}).catch(function (err) {
					let result = status_codes.check_error_code("DATABASE", err.errno);
					return callback(Object.assign({
						"status": false
					}, result));
				});
		} else {
			let errors = validation.errors.errors;
			return callback(response.response_error(false, status_codes.form_field_reqired, messages.form_field_reqired, errors));
		}
	}

	// Get email List With Filter
	get_email_template_list(query_data, callback) {
		let return_result = {};

		query_data.columns = {
			id: "email_templates.id",
			template_name: "email_templates.template_name",
			template_code: "email_templates.template_code",
			subject: "email_templates.subject",
			body: "email_templates.body",
			status: "email_templates.status"
		};
		let obj = queries.get_email_template_list("get_list", query_data)
		obj.then((t_result) => {
			if (t_result.length > 0) {
				return_result.email_template_total_record = Object.keys(t_result).length;

				obj.limit(query_data['limit'])
					.offset(query_data['offset'])
					.then(async(result) => {
						if (result.length > 0) {
							let activity_list = await queries.get_email_template_list("get_email_activity_list", query_data)
							return_result.email_template_list = result;
							return_result.activity_list = activity_list;
							return callback(response.response_success(true, status_codes.email_template_found, messages.email_template_found, (return_result)));
						} else {
							return callback(response.response_error(false, status_codes.email_template_not_found, messages.email_template_not_found));
						}
					})
			} else {
				return callback(response.response_error(false, status_codes.email_template_not_found, messages.email_template_not_found));
			}
		}).catch(function (err) {
			let result = status_codes.check_error_code("DATABASE", err.errno);
			console.log(err);
			return callback(Object.assign({
				"status": false
			}, result));
		});
	};


	// Get tag List With Filter
	get_tag_list(query_data, callback) {
		var arr = [];
		if(query_data.activity_id){
			query_data.activity_id.forEach((item) => {
				arr.push(item.id);
				delete item.itemName;
			})
		}
		query_data.columns = {
			tag_name: "master_tag.tag_name",
			tag_id: "tag_has_activities.tag_id",
			activity_id: "tag_has_activities.activity_id",
		};
		queries.get_tag_list("get_tag_list", arr)
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

	sendEmail(form_data, callback) {
		send_email.email(form_data, function (data) {
			if (data) {
				return callback(response.response_success(true, status_codes.emai_found, messages.email_found, (data)));
			} else {
				return callback(response.response_error(false, status_codes.email_not_found, messages.email_not_found));
			}
		})
	}

	convertHtmlToJade(htmlData, tenant_id, email_template_id) {
		return new Promise((resolve, reject) => {
			// html2jade.convertHtml(htmlData, {}, function (err, jade) {
			// 	if (err)
			// 		reject(err)
			// 	let templateDir = path.join(global.appRoot, 'uploads/email_templates/' + tenant_id);
			// 	if (!fs.existsSync(templateDir))
			// 		mkdirp.sync(templateDir, (err) => {
			// 			if (err) Promise.reject('Unable to Create Directory')
			// 		});
			// 	fs.writeFileSync(templateDir + "/template_name_" + email_template_id + ".jade", jade);
			// 	resolve();
			// });
		});
	}

	get_activity_email_logs(query_data, callback) {
		let rules = {
			tenant_id: "required",
		};
		//Check Validation
		let validation = new Validator(query_data, rules);
		if (validation.passes() && !validation.fails()) {
			let query = queries.get_activity_email_logs("get_cron_data", {})
			let selectQuery = query.clone();
			let countQuery = query.clone();
			let return_result = {};
			selectQuery.select({
				activity_name: "master_api_permission_modules.name",
				id: "email_sms_cron_data.id",
				email: "email_sms_cron_data.email",
				email_sent: "email_sms_cron_data.email_sent",
				sent_date: "email_sms_cron_data.created_at",
				subject: "email_sms_cron_data.email_subject",
				email_body: "email_sms_cron_data.email_body",
			}).limit(query_data['limit'])
				.offset(query_data['offset']).then((result) => {
					if (result.length > 0) {
						return_result.log_list = result;
						return countQuery.select({
							total_records: "COUNT(*)"
						});
					} else {
						return callback(response.error("email_log_not_found"))
					}
				}).then((count_result) => {
					return_result = Object.assign(count_result[0], return_result);
					return callback(response.success("email_log_found", return_result))
				}).catch((err) => callback(common_functions.catch_error(err)));

		} else {
			let errors = validation.errors.errors;
			return callback(response.response_error(false, status_codes.form_field_reqired, messages.form_field_reqired, errors));
		}
	}

	change_email_template_status(queryData, callback) {
		let data = queryData;
		let rules = {
			email_template_id: "required",
			status: "required"
		};
		//Check Validation
		let validation = new Validator(data, rules);
		if (validation.passes() && !validation.fails()) {
			knex("email_templates")
				.where("id", data.email_template_id)
				.update({
					"status": data.status
				})
				.then((email_update_result) => {
					return callback(response.response_success(true, status_codes.email_template_update_success, messages.email_template_update_success));
				}).catch((err) => callback(common_functions.catch_error(err)));
		} else {
			let errors = validation.errors.errors;
			return callback(response.response_error(false, status_codes.form_field_reqired, messages.form_field_reqired, errors));

		}
	}

	get_selected_activity_list(query_data, callback) {
		query_data.columns = {
			id: "email_template_activities.activity_id",
		};
		queries.get_selected_activity_list("get_selected_activity_list", query_data)
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

	get_selected_email_languages(query_data, callback) {
		query_data.columns = {
			id: "master_languages.id",
			language_name: "master_languages.language_name",
			language_code: "master_languages.language_code",
			subject: "languages_for_email_templates.subject",
			body: "languages_for_email_templates.body",
		};
		queries.get_selected_email_languages("get_selected_email_languages", query_data)
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

    /************************************
     email Operation End
     ************************************/
};