/************** Load Libraries ****************/
let uuid = require('uuid');
let Validator = require('validatorjs');

/************** Load Files****************/
let messages = require("../../../config/messages.js");
let status_codes = require("../../../config/response_status_codes.js");
let knex = require("../../../config/knex");
let Upload_files = require("../../core/upload_files");
let upload_files = new Upload_files();
Response_adapter = require("../../core/response_adapter");
let Queries = require("../queries/mysql/broker");

/************** Generate Objects ****************/
let response = new Response_adapter();
let queries = new Queries();

module.exports = class broker_model {

	/* Add  broker*/
	async add_broker(form_data, callback) {
		let data = {};
		let broker_building= [];
		let update_result;
		let fileData = form_data['image'];
		delete form_data['image'];
		let buildings = (form_data['building_id']==undefined || form_data['building_id']==null || form_data['building_id'] == "") ? null : form_data['building_id'].split(",");
		delete form_data['building_id'];
		Object.assign(data, form_data);
		let rules = {
			name: "required",
			address: "required",
			email: "required",
			phone: "required",
			orn_number: "required",
			role_id: "required",
			experience: "required",
			//	image_path: "required",
			status: "required",
			languages: "required",
		};
		//Check Validation
		let validation = new Validator(data, rules);
		if (validation.passes() && !validation.fails()) {
			let result = await queries.add_broker("get_broker", data)
			if (result.length > 0) {
				return callback(response.response_error(false, status_codes.broker_template_exist, messages.broker_template_exist));
			} else {
				let broker_id = await knex("master_broker").insert(data)
				if (broker_id.length > 0) {
					buildings.forEach(element => {
						broker_building.push({broker_id: broker_id[0], building_id: Number(element)});
					});
					await knex("building_has_brokers").insert(broker_building);
					if (fileData != null) {
						let image_file = [{
							path: "./uploads/images/broker",
							file_name: uuid.v1() + fileData.name,
							file: fileData,
							return_file_name: 'image'
						}];
						upload_files.upload_Multiple_Files(image_file, async function (err, files) {
							if (err) {
								console.log("Error : ", err);
							} else {
								update_result =  {
									image: files['image'],
								};
								await knex("master_broker").update("master_broker.image_path", update_result.image).where("master_broker.id", broker_id[0]);
								return callback(response.response_success(true, status_codes.broker_template_created, messages.broker_template_created));
							}
						});
						
					} else {
						return callback(response.response_success(true, status_codes.broker_template_created, messages.broker_template_created));
					}
				} else {
					return callback(response.response_error(false, status_codes.broker_template_created_failed, messages.broker_template_created_failed));
				}
			}
		} else {
			let errors = validation.errors.errors;
			return callback(response.response_error(false, status_codes.form_field_reqired, messages.form_field_reqired, errors));
		}
	}




	/* Modify sms */
	async edit_broker(form_data, callback) {
		let data = {};
		let update_result;
		let broker_building= [];
		let fileData = form_data['image'];
		delete form_data['image'];
		let buildings = (form_data['building_id']==undefined || form_data['building_id']==null || form_data['building_id'] == "") ? null : form_data['building_id'].split(",");
		delete form_data['building_id'];
		Object.assign(data, form_data);
		let rules = {
			id: "required",
		};
		let validation = new Validator(form_data, rules);
		if (validation.passes() && !validation.fails()){
			await queries.edit_broker("update", {
				data: data,
				id: data.id,
			}).then(async function (data) {
				if (typeof data != "undefined") {
					buildings.forEach(element => {
						broker_building.push({broker_id: form_data.id, building_id: Number(element)});
					});
					await knex("building_has_brokers").update("building_has_brokers.status",0).where("building_has_brokers.broker_id",form_data['id']);
					await knex("building_has_brokers").insert(broker_building);
					if (fileData != null) {
						let image_file = [{
							path: "./uploads/images/broker",
							file_name: uuid.v1() + fileData.name,
							file: fileData,
							return_file_name: 'image'
						}];
						upload_files.upload_Multiple_Files(image_file, async function (err, files) {
							if (err) {
								console.log("Error : ", err);
							} else {
								update_result = await {
									image: files['image'],
								};
								await knex("master_broker").update("master_broker.image_path", update_result.image).where("master_broker.id", form_data.id)
							}
						});
						 return callback(response.response_success(true, status_codes.broker_template_update_success, messages.broker_template_update_success));
					} else {
						return callback(response.response_success(true, status_codes.broker_template_update_success, messages.broker_template_update_success));
					}
				} else {
					return callback(response.response_error(false, status_codes.broker_template_update_failed, messages.broker_template_update_failed));
				}
			}).catch(function (err) {
				return callback(response.response_error(false, status_codes.broker_template_update_failed, messages.broker_template_update_failed, err.message));
			})
		} else {
			let errors = validation.errors.errors;
			return callback(response.response_error(false, status_codes.form_field_reqired, messages.form_field_reqired, errors));
		}
	}
 


	// Get broker List With Filter
	get_broker_list(query_data, callback) {
		let now = new Date();

		let return_result = {};
		let obj = queries.get_broker_list("get_list", query_data)

		obj.then((t_result) => {
			if (t_result.length > 0) {
				return_result.total_records = t_result.length;
				obj.limit(query_data['limit'])
					.offset(query_data['offset'])
					.then(async (result) => {
						if (result.length > 0) {
							return_result.broker_list = result;
							return callback(response.response_success(true, status_codes.broker_template_found, messages.broker_template_found, (return_result)));
						} else {
							return callback(response.response_error(false, status_codes.broker_template_not_found, messages.broker_template_not_found));
						}
					})
			} else {
				return callback(response.response_error(false, status_codes.broker_template_not_found, messages.broker_template_not_found));
			}
		}).catch(function (err) {
			let result = status_codes.check_error_code("DATABASE", err.errno);
			console.log(err);
			return callback(Object.assign({ "status": false }, result));
		});
	};

	// Get broker List With Filter
	get_building_list(callback) {
		return queries.get_building_list()
		.then((result) => {
			if (result.length > 0) {
				return callback(response.response_success(true, status_codes.data_found, messages.data_found, result));
			} else {
				return callback(response.response_error(false, status_codes.data_not_found, messages.data_not_found));
			}
		}).catch(function (err) {
			let result = status_codes.check_error_code("DATABASE", err.errno);
			console.log(err);
			return callback(Object.assign({ "status": false }, result));
		});
	};


	// Get sms By ID
	get_broker(query_data, callback) {
		let rules = {
			id: "required"
		};
		let validation = new Validator(query_data, rules);
		if (validation.passes() && !validation.fails()) {
			queries.get_broker("get_template", query_data)
				.then((result) => {
					if (result.length > 0) {
						return callback(response.response_success(true, status_codes.broker_template_found, messages.broker_template_found, (result)));
					} else {
						return callback(response.response_error(false, status_codes.broker_template_not_found, messages.broker_template_not_found));
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
};