"use strict";
let Sms_model = require("../models/Sms_template_model");
let sms_model = new Sms_model();

module.exports = class Sms_controller {
    constructor() {
    }

    add_sms_template(req, res) {
        let form_data = {};
        form_data['tenant_id'] = req['tenant_id'];
        try {
            form_data['template_name'] = req.body.template_name;
            form_data['template_code'] = req.body.template_code;
            form_data['activity_id'] = req.body.activity_id;
            form_data['data_array'] = req.body.data_array;
            form_data['tenant_id'] = req['tenant_id'];
            form_data['status'] = req.body.status;
        } catch (e) {
        }
        sms_model.add_sms_template(form_data, function (result) {
            res.json(result);
        })
    }

    edit_sms_template(req, res) {
        let form_data = {};
        form_data['sms_template_id'] = req.params.id;
        try {
            form_data['template_name'] = req.body.template_name;
            form_data['template_code'] = req.body.template_code;
            form_data['activity_id'] = req.body.activity_id;
            form_data['data_array'] = req.body.data_array;
            form_data['status'] = req.body.status;
        } catch (e) {
        }
        form_data['tenant_id'] = req['tenant_id'];
        sms_model.edit_sms_template(form_data, function (result) {
            res.json(result);
        });
    }

    get_sms_template_by_id(req, res) {
        let query_data = {};
        query_data['tenant_id'] = req['tenant_id'];
        query_data['sms_template_id'] = req.params.id;
        sms_model.get_sms_template_by_id(query_data, function (result) {
            res.json(result);
        });
    }

    get_sms_template_list(req, res) {
        let query_data = {};

        query_data['tenant_id'] = req['tenant_id'];
        query_data['limit'] = parseInt(req.query.limit);
        query_data['offset'] = parseInt(req.query.offset);
        query_data['search'] = req.query.search;

        sms_model.get_sms_template_list(query_data, function (result) {
            res.json(result);
        });
    }

    get_sms_activities_list(req, res) {
        let query_data = {};
        sms_model.get_sms_activities_list(query_data, (result) => res.json(result));
    }

    get_selected_activity_list(req, res) {

        let query_data = {};
        query_data['tenant_id'] = req['tenant_id'];
        query_data['sms_template_id'] = req.params.id;
        sms_model.get_selected_activity_list(query_data, function (result) {
            res.json(result);
        });
    }

    get_selected_sms_languages(req, res) {

        let query_data = {};
        query_data['tenant_id'] = req['tenant_id'];
        query_data['sms_template_id'] = req.params.id;
        sms_model.get_selected_sms_languages(query_data, function (result) {
            res.json(result);
        });
    }
};