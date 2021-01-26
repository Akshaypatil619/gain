"use strict";
let Notification_model = require("../models/Notification_model");
let notification_model = new Notification_model();

module.exports = class Notification_controller {


    get_notification_template(req, res) {
        var query_data = {};
        query_data['title'] = req.query['search'];
        query_data['activity_id'] = req.query['activity_id'];
        query_data['limit'] = parseInt(req.query['limit']);
        query_data['offset'] = parseInt(req.query['offset']);
        query_data['id'] = req.query['id'];

        notification_model.get_notification_template(query_data, (result) => {
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
        body_data['activity_id'] = JSON.parse(req.body['activity_id']);
        body_data['id'] = req.body['id'];
        body_data['data_array'] = JSON.parse(req.body['data_array']);
        body_data['images'] = req.files;

        console.log("fffffffff",body_data,req.files)

        notification_model.add_notification_template(body_data, (result) => {
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
        notification_model.get_activity_notification_logs(query_data, (result) => {
            res.json(result);
        });
    }

    change_push_template_status(req, res) {
        let query_data = {
            push_template_id: req.body.push_template_id,
            push_status: req.body.push_status,
        }
        notification_model.change_push_template_status(query_data, (result) => {
            res.json(result);
        });
    }

    get_notification_configuration(req, res) {
        let query_data = {};
        query_data['tenant_id'] = req['tenant_id'];

        notification_model.get_notification_configuration(query_data, (result) => {
            res.json(result);
        });
    }

    add_update_notification_config(req, res) {
        let form_data = {}
        form_data['tenant_id'] = req['tenant_id'];
        form_data['frequency'] = req.body.frequency;
        form_data['radius'] = req.body.radius;
        form_data['location_update'] = req.body.location_update;



        notification_model.add_update_notification_config(form_data, (result) => {
            res.json(result);
        });
    }

    get_selected_activity_list(req, res) {

        let query_data = {};
        query_data['tenant_id'] = req['tenant_id'];
        query_data['notification_template_id'] = req.params.id;
        notification_model.get_selected_activity_list(query_data, function (result) {
            res.json(result);
        });
    }



    get_selected_notification_languages(req, res) {

        let query_data = {};
        query_data['tenant_id'] = req['tenant_id'];
        query_data['notification_template_id'] = req.params.id;
        notification_model.get_selected_notification_languages(query_data, function (result) {
            res.json(result);
        });
    }

    get_selected_activity_list(req, res) {

        let query_data = {};
        query_data['tenant_id'] = req['tenant_id'];
        query_data['notification_template_id'] = req.params.id;
        notification_model.get_selected_activity_list(query_data, function (result) {
            res.json(result);
        });
    }

    get_selected_notification_languages(req, res) {

        let query_data = {};
        query_data['tenant_id'] = req['tenant_id'];
        query_data['notification_template_id'] = req.params.id;
        notification_model.get_selected_notification_languages(query_data, function (result) {
            res.json(result);
        });
    }

};