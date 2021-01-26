let Validator = require('validatorjs');

/************** Load Files****************/
let messages = require("../../../config/messages.js");
let status_codes = require("../../../config/response_status_codes.js");
let Response_adapter = require("../../core/response_adapter");
Upload_files = require("../../core/upload_files");
let Queries = require("../queries/mysql/permission_module");

/************** Generate Objects ****************/
let response_adapter = new Response_adapter();
let queries = new Queries();

module.exports = class Permission_module_model {
	constructor() { }

	add_permission_module(form_data, callback) {
		let rules = {
			name: "required",
			method: "required",
			path: "required",
			api_user: "required",
			is_email_activity: "required",
			is_sms_activity: "required",
			is_push_activity: "required",
			is_notification_activity: "required",
			is_inapp_notification_activity: "required",
			status: "required",
			active: "required",
			disabled: "required"
		};
		//Check Validation
		let validation = new Validator(form_data, rules);
		if (validation.passes() && !validation.fails()) {
			queries.add_permission_module("checkExist", form_data)
				.then(async (result) => {
					if (result.length == 0) {
						let permission_module_result = await queries.add_permission_module("add_module", form_data);
						return callback(response_adapter.response_success(true, status_codes.permisssion_module_insert_success, messages.permisssion_module_insert_success, result));
					}
					else {
						return callback(response_adapter.response_error(false, status_codes.permisssion_module_insert_failed, messages.permisssion_module_insert_failed, err.message));
					}
				}).catch((err) => {
					return callback(response_adapter.response_error(false, status_codes.permisssion_module_already_exist, messages.permisssion_module_already_exist, err.message));
				});
		} else {
			let errors = validation.errors.errors;
			return callback(response_adapter.response_error(false, status_codes.form_field_reqired, messages.form_field_reqired, errors));
		}
	}

	permission_module_list(query_data, callback) {
		let return_result = {};
		let obj = queries.permission_module_list("get_list", query_data)
		obj.then((t_result) => {
			return_result.permission_module_total_record = Object.keys(t_result).length;
			obj.limit(query_data['limit'])
				.offset(query_data['offset'])
				.then((result) => {
					if (result.length > 0) {
						return_result.permission_module_list = result;
						return callback(response_adapter.response_success(true, status_codes.permisssion_module_found, messages.permisssion_module_found, (return_result)));
					} else {
						return callback(response_adapter.response_error(false, status_codes.permisssion_module_not_found, messages.permisssion_module_not_found));
					}
				})
		}).catch(function (err) {
			let result = status_codes.check_error_code("DATABASE", err.errno);
			return callback(Object.assign({
				"status": false
			}, result));
		});

	}

	get_permission_module_byId(query_data, callback) {
		console.log(query_data);
		let data = {
			id: query_data['id']
		};
		let rules = {
			id: "required"
		};
		//Check Validation
		let validation = new Validator(data, rules);
		if (validation.passes() && !validation.fails()) {
			queries.get_permission_module_byId("get_permission_module", query_data)
				.then((result) => {
					console.log(result);
					if (result.length > 0) {
						result['data'] = result[0];
						return callback(response_adapter.response_success(true, status_codes.permisssion_module_found, messages.permisssion_module_found, (result)));
					} else {
						return callback(response_adapter.response_error(false, status_codes.permisssion_module_not_found, messages.permisssion_module_not_found));
					}
				}).catch(function (err) {
					let result = status_codes.check_error_code("DATABASE", err.errno);
					return callback(Object.assign({
						"status": false
					}, result));
				});
		} else {
			let errors = validation.errors.errors;
			return callback(response_adapter.response_error(false, status_codes.form_field_reqired, messages.form_field_reqired, errors));
		}
	}


	edit_permission_module(form_data, callback) {
		let data = {};
		Object.assign(data, form_data);
		delete data.id;
		let rules = {
			id: "required",
			// tag_type: "required",
			// user_type: "required",
			// status: "required",
		};

		//Check Validation
		let validation = new Validator(form_data, rules);
		if (validation.passes() && !validation.fails()) {

			queries.edit_permission_module("update_permission_module", {
				id: form_data.id,
				obj: data
			})
				.then(function (id) {
					return callback(response_adapter.response_success(true, status_codes.permisssion_module_update_success, messages.permisssion_module_update_success));
				}).catch(function (err) {
					return callback(response_adapter.response_error(false, status_codes.permisssion_module_update_failed, messages.permisssion_module_update_failed, err.message));
				});
		} else {
			let errors = validation.errors.errors;
			return callback(response_adapter.response_error(false, status_codes.form_field_reqired, messages.form_field_reqired, errors));
		}
	}

	change_activity_status(queryData, callback) {
		let data = {};
		Object.assign(data, queryData);
		let rules = {
			id: "required"
			// push_status: "required"
		};
		delete data.id;
		if (data['is_email_activity'] == undefined) {
			delete data.is_email_activity;
		}
		if (data['is_sms_activity'] == undefined) {
			delete data.is_sms_activity;
		}
		if (data['is_push_activity'] == undefined) {
			delete data.is_push_activity;
		}
		if (data['is_notification_activity'] == undefined) {
			delete data.is_notification_activity;
		}

		//Check Validation
		let validation = new Validator(queryData, rules);
		if (validation.passes() && !validation.fails()) {

			queries.change_activity_status("update_permission_module_activity", {
				id: queryData.id,
				obj: data
			})
				.then(function (id) {
					return callback(response_adapter.response_success(true, status_codes.activity_status_update_success, messages.activity_status_update_success));
				}).catch(function (err) {
					return callback(response_adapter.response_error(false, status_codes.activity_status_update_failed, messages.activity_status_update_failed, err.message));
				});
		} else {
			let errors = validation.errors.errors;
			return callback(response_adapter.response_error(false, status_codes.form_field_reqired, messages.form_field_reqired, errors));
		}
	}
}