"use strict";
let Push_notification_model = require("../models/Push_notification_model");
let push_notification_model = new Push_notification_model();

module.exports = class Push_notification_controller {
	get_push_notification_provider_master_list(req, res) {
		var query_data = {};
		push_notification_model.get_push_notification_provider_master_list(query_data, function (result) {
			res.json(result);
		});
	}

	add_push_notification_provider(req, res) {
		console.log(req.body);
		var query_data = {};
		query_data['name'] = req.body['provider'];
		query_data['data'] = req.body['data'];
		query_data['tenant_id'] = req.tenant_id;
		query_data['push_notification_provider_master_id'] = req.body['provider_master_id'];
		query_data['platform_name'] = req.body['platform_name'];

		push_notification_model.add_push_notification_provider(query_data, function (result) {
			res.json(result);
		});
	}
	send_push_notification_global(req, res) {
		var body_data = {};
		body_data['tenant_id'] = req['tenant_id'];
		body_data['title'] = req.body['title'];
		body_data['body'] = req.body['body'];

		push_notification_model.send_push_notification_global(body_data, (result) => {
			res.json(result);
		})
	}
	send_push_notification(req, res) {
		var body_data = {};
		body_data['tenant_id'] = req['tenant_id'];
		body_data['customer_id'] = req.body['customer_id']
		body_data['title'] = req.body['title'];
		body_data['body'] = req.body['body'];
		body_data['redirectURL'] = req.body['redirectURL'];
		body_data['image'] = req.body['image'];

		push_notification_model.send_push_notification(body_data, (result) => {
			res.json(result);
		})
	}

	get_notification_template(req, res) {
		var query_data = {};
		query_data['title'] = req.query['search'];
		query_data['activity_id'] = req.query['activity_id'];
		query_data['limit'] = parseInt(req.query['limit']);
		query_data['offset'] = parseInt(req.query['offset']);
		query_data['id'] = req.query['id'];

		push_notification_model.get_notification_template(query_data, (result) => {
			res.json(result);
		});
	}

	add_notification_template(req, res) {
		var body_data = {};
		body_data['body'] = req.body['body'];
		body_data['template_name'] = req.body['template_name'];
		body_data['title'] = req.body['title'];
		body_data['code'] = req.body['code'];
		body_data['status'] = req.body['status'];
		body_data['url'] = req.body['url'];
		body_data['tenant_id'] = req['tenant_id'];
		body_data['activity_id'] = req.body['activity_id'];
		body_data['image'] = req.body['image'];
		body_data['id'] = req.body['id'];
		body_data['data_array'] = req.body['data_array'];

		push_notification_model.add_notification_template(body_data, (result) => {
			res.json(result);
		});
	}


	get_activity_notification_logs(req, res) {
		let query_data = {
			tenant_id: req.tenant_id,
			limit: parseInt(req.query.limit),
			offset: parseInt(req.query.offset),
			search: req.query.search
		};
		push_notification_model.get_activity_notification_logs(query_data, (result) => {
			res.json(result);
		});
	}

	change_push_template_status(req, res) {
		let query_data = {
			push_template_id: req.body.push_template_id,
			push_status: req.body.push_status,
		}
		push_notification_model.change_push_template_status(query_data, (result) => {
			res.json(result);
		});
	}

	get_notification_configuration(req, res) {
		let query_data = {};
		query_data['tenant_id'] = req['tenant_id'];

		push_notification_model.get_notification_configuration(query_data, (result) => {
			res.json(result);
		});
	}

	add_update_notification_config(req, res) {
		let form_data = {}
		form_data['tenant_id'] = req['tenant_id'];
		form_data['frequency'] = req.body.frequency;
		form_data['radius'] = req.body.radius;
		form_data['location_update'] = req.body.location_update;

		push_notification_model.add_update_notification_config(form_data, (result) => {
			res.json(result);
		});
	}

	get_selected_activity_list(req, res) {
		let query_data = {};
		query_data['tenant_id'] = req['tenant_id'];
		query_data['notification_template_id'] = req.params.id;
		push_notification_model.get_selected_activity_list(query_data, function (result) {
			res.json(result);
		});
	}



	get_selected_notification_languages(req, res) {
		let query_data = {};
		query_data['tenant_id'] = req['tenant_id'];
		query_data['notification_template_id'] = req.params.id;
		push_notification_model.get_selected_notification_languages(query_data, function (result) {
			res.json(result);
		});
	}

};