/************** Load Libraries ****************/
let Validator = require('validatorjs');

/************** Load Files****************/
let messages = require("../../../config/messages.js");
let status_codes = require("../../../config/response_status_codes.js");
let knex = require("../../../config/knex");
Response_adapter = require("../../core/response_adapter");
let Common_functions = require("../../core/common_functions.js");
let Queries = require("../queries/mysql/sms_template");

/************** Generate Objects ****************/
let common_functions = new Common_functions();
let response = new Response_adapter();
let queries = new Queries();

module.exports = class sms_model {
    /************************************
     sms Operation Start
     ************************************/

	/* Add  sms*/
	add_sms_template(form_data, callback) {
		let data = {};
		Object.assign(data, form_data);
		let rules = {
			template_name: "required",
			template_code: "required",
			activity_id: "required",
			tenant_id: "required",
		};
		//Check Validation
		let validation = new Validator(data, rules);
		if (validation.passes() && !validation.fails()) {
			queries.add_sms_template("get_sms_template", data)
				.then(async (result) => {
					if (result.length > 0) {
						throw new Error("sms_template_already_exist");
					} else {

						let activity_array = data.activity_id;
						delete data.activity_id;
						let sms_array = data['data_array'];
						delete data['data_array'];

						let sms_template_id = await knex("sms_templates").insert(data, "id");

						sms_array.forEach((item) => {
							item['status'] = 1;
							item['sms_template_id'] = sms_template_id[0];
							delete item.id;
							delete item.language_name;
						})
						let sms_language_result = await knex("languages_for_sms_templates").insert(sms_array);

						activity_array.forEach(el => {
							el['sms_template_id'] = sms_template_id[0];
							el['activity_id'] = el.id;
							delete el.itemName;
							delete el.id;
							el['status'] = 1;
						});

						let sms_activity_result = await knex("sms_template_activities").insert(activity_array);
						if (sms_activity_result.length == 0 && sms_language_result.length == 0) {
							return callback(response.response_error(false, status_codes.sms_template_created_failed, messages.sms_template_created_failed, err.message));
						}

						return callback(response.response_success(true, status_codes.sms_template_created, messages.sms_template_created));
					}
				}).then((result) => {
					if (result) {
						return callback(response.response_success(true, status_codes.sms_template_created, messages.sms_template_created));
					}
				}).catch((err) => {
					return callback(response.response_error(false, status_codes.sms_template_created_failed, messages.sms_template_created_failed, err.message));
				});
		} else {
			let errors = validation.errors.errors;
			return callback(response.response_error(false, status_codes.form_field_reqired, messages.form_field_reqired, errors));
		}
	}

	/* Modify sms */
	async edit_sms_template(form_data, callback) {
		let data = {};
		Object.assign(data, form_data);
		// delete data.tenant_id;
		delete data.sms_template_id;
		delete data.activity_id;

		let rules = {
			sms_template_id: "required",
		};
		//Check Validation
		let validation = new Validator(form_data, rules);
		if (validation.passes() && !validation.fails()) {


			let activity_data = form_data.activity_id;
			let activity_id_array = [];
			let sms_template_array = [];

			let sms_array = data['data_array'];
			delete data['data_array'];
			sms_array.forEach(async (item) => {
				await knex("languages_for_sms_templates")
					.where('sms_template_id', form_data['sms_template_id'])
					.andWhere('language_code', item['language_code'])
					.update({ body: item['body'] });
			})

			activity_data.forEach((el) => {
				activity_id_array.push(el['id']);
				sms_template_array.push({ activity_id: el['id'], sms_template_id: form_data['sms_template_id'], status: 1 });
				delete el['id'];
				delete el['itemName'];
				delete el['activity_id'];
			});

			await knex("sms_template_activities")
				.where('sms_template_id', form_data.sms_template_id)
				.update({ status: 0 });

			await knex("sms_template_activities").insert(sms_template_array);
			await queries.edit_sms_template("update", {
				data: data,
				sms_template_id: form_data.sms_template_id,
			})
				.then(function (data) {
					if (typeof data != "undefined")
						return callback(response.response_success(true, status_codes.sms_template_update_success, messages.sms_template_update_success));
				}).catch(function (err) {
					return callback(response.response_error(false, status_codes.sms_template_update_failed, messages.sms_template_update_failed, err.message));
				})
		} else {
			let errors = validation.errors.errors;
			return callback(response.response_error(false, status_codes.form_field_reqired, messages.form_field_reqired, errors));
		}
	}

	// Get sms By ID
	get_sms_template_by_id(query_data, callback) {
		let data = {
			sms_template_id: query_data['sms_template_id']
		};
		let rules = {
			sms_template_id: "required"
		};
		//Check Validation
		let validation = new Validator(data, rules);
		if (validation.passes() && !validation.fails()) {
			queries.get_sms_template_by_id("get_template", query_data)
				.then((result) => {
					if (result.length > 0) {
						return callback(response.response_success(true, status_codes.sms_template_found, messages.sms_template_found, (result)));
					} else {
						return callback(response.response_error(false, status_codes.sms_template_not_found, messages.sms_template_not_found));
					}
				}).catch(function (err) {
					let result = status_codes.check_error_code("DATABASE", err.errno);
					return callback(Object.assign({ "status": false }, result));
				});
		} else {
			let errors = validation.errors.errors;
			return callback(response.response_error(false, status_codes.form_field_reqired, messages.form_field_reqired, errors));
		}
	}

	// Get sms List With Filter
	get_sms_template_list(query_data, callback) {
		let now = new Date();
		let return_result = {};
		let obj = queries.get_sms_template_list("get_list", query_data)
		obj.then((t_result) => {
			if (t_result.length > 0) {
				return_result.sms_template_total_record = Object.keys(t_result).length;
				obj.limit(query_data['limit'])
					.offset(query_data['offset'])
					.then(async(result) => {
						if (result.length > 0) {
							let activity_list = await queries.get_sms_template_list("get_sms_activity", query_data)
							return_result.sms_template_list = result;
							return_result.activity_list = activity_list;
							return callback(response.response_success(true, status_codes.sms_template_found, messages.sms_template_found, (return_result)));
						} else {
							return callback(response.response_error(false, status_codes.sms_template_not_found, messages.sms_template_not_found));
						}
					})
			} else {
				return callback(response.response_error(false, status_codes.sms_template_not_found, messages.sms_template_not_found));
			}
		}).catch(function (err) {
			let result = status_codes.check_error_code("DATABASE", err.errno);
			console.log(err);
			return callback(Object.assign({ "status": false }, result));
		});
	};

	// get sms activity list
	get_sms_activities_list(queryData, callback) {
		queries.get_sms_activities_list("get_sms_activities", {})
			.then((result) => {
				if (result.length > 0) {
					return callback(response.response_success(true, status_codes.sms_activity_found, messages.sms_activity_found, (result)));
				} else {
					return callback(response.response_error(false, status_codes.sms_activity_not_found, messages.sms_activity_not_found));
				}
			}).catch((err) => callback(common_functions.catch_error(err)));

	}

	get_selected_activity_list(query_data, callback) {
		query_data.columns = {
			id: "sms_template_activities.activity_id",
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

	get_selected_sms_languages(query_data, callback) {
		query_data.columns = {
			id: "master_languages.id",
			language_name: "master_languages.language_name",
			language_code: "master_languages.language_code",
			body: "languages_for_sms_templates.body",
		};
		queries.get_selected_sms_languages("get_selected_sms_languages", query_data)
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
     sms Operation End
     ************************************/
};