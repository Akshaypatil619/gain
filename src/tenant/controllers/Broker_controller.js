"use strict";
let Broker_model = require("../models/Broker_model");//class
let broker_model = new Broker_model();

module.exports = class Broker_controller {
    constructor() {
    }

    add_broker(req, res) {
        let form_data = {};
            form_data['name'] = req.body.name;
            form_data['address'] = req.body.address;
            form_data['email'] = req.body.email;
            form_data['orn_number'] = req.body.orn_number;
            form_data['reference_number'] = req.body.reference_number;
            form_data['permit_number'] = req.body.permit_number;
            form_data['phone'] = req.body.phone;
            form_data['role_id'] = req.body.role_id;
            form_data['experience'] = req.body.experience;
            form_data['image'] = (req.files==null || req.files==undefined || req.files=="") ? null : req.files.image;
            form_data['status'] = req.body.status;
            form_data['organization_id'] = req.body.organization_id;
            form_data['languages'] = req.body.languages;
            form_data['building_id'] = req.body.building_id;
            form_data['country_id'] = req.body.country_id;

        broker_model.add_broker(form_data, function (result) {
            res.json(result);
        })
    }

    edit_broker(req, res) {
        let form_data = {};
            form_data['id'] = req.body.id;
            form_data['name'] = req.body.name;
            form_data['address'] = req.body.address;
            form_data['email'] = req.body.email;
            form_data['orn_number'] = req.body.orn_number;
            form_data['reference_number'] = req.body.reference_number;
            form_data['permit_number'] = req.body.permit_number;
            form_data['phone'] = req.body.phone;
            form_data['role_id'] = req.body.role_id;
            form_data['experience'] = req.body.experience;
            form_data['image'] = (req.files==null || req.files==undefined || req.files=="") ? null : req.files.image;
            form_data['status'] = req.body.status;
            form_data['organization_id'] = req.body.organization_id;
            form_data['languages'] = req.body.languages;
            form_data['building_id'] = req.body.building_id;
            form_data['country_id'] = req.body.country_id;
        
        broker_model.edit_broker(form_data, function (result) {
            res.json(result);
        });
    }



    get_broker(req, res) {
        let query_data = {};
        query_data['id'] = req.params.id;
        broker_model.get_broker(query_data, function (result) {
            res.json(result);
        });
    }

    get_broker_list(req, res) {
        let query_data = {};
        query_data['limit'] = parseInt(req.query.limit);
        query_data['offset'] = parseInt(req.query.offset);
        query_data['name'] = req.query.name;
        query_data['email'] = req.query.email;
        query_data['phone'] = req.query.phone;
        query_data['from_date'] = req.query.start_date,
        query_data['to_date'] = req.query.end_date,
        broker_model.get_broker_list(query_data, function (result) {
            res.json(result);
        });
    }
    get_building_list(req, res) {
        broker_model.get_building_list(function (result) {
            res.json(result);
        });
    }
};