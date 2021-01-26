"use strict";
let Email_template_model = require("../models/Email_template_model");
let email_template_model = new Email_template_model();

module.exports = class Email_template_controller {
	constructor() { }

	add_email_template(req, res) {
		let form_data = {};

		try {
			form_data['template_name'] = req.body.template_name;
			form_data['data_array'] = req.body.data_array;
			form_data['activity_id'] = req.body.activity_id;
			form_data['template_created_for_user_type'] = req.body.template_created_for_user_type;
			form_data['template_created_by_user_type'] = req.body.template_created_by_user_type;
			form_data['tenant_id'] = req['tenant_id'];
			form_data['status'] = req.body.status;
			form_data['template_code'] = req.body.template_code;

		} catch (e) { }
		email_template_model.add_email_template(form_data, function (result) {
			res.json(result);
		})
	}

	edit_email_template(req, res) {
		let form_data = {};
		form_data['email_template_id'] = req.params.id;
		try {
			form_data['template_name'] = req.body.template_name;
			form_data['data_array'] = req.body.data_array;
			form_data['activity_id'] = req.body.activity_id;
			form_data['template_created_for_user_type'] = req.body.template_created_for_user_type;
			form_data['tenant_id'] = req['tenant_id'];
            form_data['status'] = req.body.status;

		} catch (e) { }
		email_template_model.edit_email_template(form_data, function (result) {
			res.json(result);
		});
	}

	get_email_template_by_id(req, res) {

		let query_data = {};
		query_data['tenant_id'] = req['tenant_id'];
		query_data['email_id'] = req.params.id;
		email_template_model.get_email_template_by_id(query_data, function (result) {
			res.json(result);
		});
	}

	get_email_template_list(req, res) {

		let query_data = {};

		query_data['tenant_id'] = req['tenant_id'];
		query_data['limit'] = parseInt(req.query.limit);
		query_data['offset'] = parseInt(req.query.offset);
		query_data['search'] = req.query.search;

		email_template_model.get_email_template_list(query_data, function (result) {
			res.json(result);
		});
	}


	get_tag_list(req, res) {
		let query_data = {}
		// query_data['tenant_id'] = req['tenant_id'];
		query_data['activity_id'] = req.body.activity;
		// query_data['tag_type'] = req.query.tag_type;
		email_template_model.get_tag_list(query_data, function (result) {
			res.json(result);
		})
	}

	sendEmail(req, res) {
		let form_data = {};
		form_data['tenant_id'] = req['tenant_id'];
		try {
			form_data['to'] = req.body.to;
			form_data['subject'] = req.body.subject;
			form_data['email_data'] = req.body.email_data;
		} catch (e) { }
		form_data['path'] = req.route.path;
		email_template_model.sendEmail(form_data, function (result) {
			res.json(result);
		})
	}

	get_activity_email_logs(req, res) {
		let query_data = {
			tenant_id: req.tenant_id,
			limit: parseInt(req.query.limit),
			offset: parseInt(req.query.offset),
		};
		email_template_model.get_activity_email_logs(query_data, (result) => {
			res.json(result);
		});
	}

	change_email_template_status(req, res) {
		let query_data = {
			email_template_id: req.body.email_template_id,
			status: req.body.status,
		}
		email_template_model.change_email_template_status(query_data, (result) => {
			res.json(result);
		});
	}

	get_selected_activity_list(req, res) {

		let query_data = {};
		query_data['tenant_id'] = req['tenant_id'];
		query_data['email_template_id'] = req.params.id;
		email_template_model.get_selected_activity_list(query_data, function (result) {
			res.json(result);
		});
	}

	get_selected_email_languages(req, res) {

		let query_data = {};
		query_data['tenant_id'] = req['tenant_id'];
		query_data['email_template_id'] = req.params.id;
		email_template_model.get_selected_email_languages(query_data, function (result) {
			res.json(result);
		});
	}

};