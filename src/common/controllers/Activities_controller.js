"use strict";
let Activities_model = require("../models/Activities_model");
let activitiesModel = new Activities_model();

module.exports = class Activities_controller {
    get_activity_list(req, res) {
        let query_data = {
            tenant_id: req['tenant_id'],
            search: req.query.search,
        };
        activitiesModel.get_activity_list(query_data, function (result) {
            res.json(result);
        })
    }

    fetch_all_rule_activities(req,res,next){
        let query_data = {};
        query_data['tenant_id'] = req['tenant_id'];
        query_data['limit'] = parseInt(req.query.limit);
        query_data['offset'] = parseInt(req.query.offset);
        query_data['search'] = req.query.search;
        query_data['activity_id'] = req.query.activity_id;   
        query_data['type'] = req.query.type;        
        
        activitiesModel.fetch_all_rule_activities(query_data, function (result) {
            res.json(result);
        });
    }

    add_activity(req, res) {
        let form_data = {};
        form_data['tenant_id'] = req['tenant_id'];
        form_data['name'] = req.body.activity_name;
        form_data['code'] = req.body.code;
        form_data['activity_type'] = req.body.type;

        activitiesModel.add_activity(form_data, function (result) {
            res.json(result);
        });
    }
     

    edit_activity(req, res) {
        let form_data = {};
        form_data['tenant_id'] = req['tenant_id'];
        form_data['name'] = req.body.activity_name;
        form_data['code'] = req.body.code;
        form_data['activity_type'] = req.body.type;
        form_data['activity_id'] = req.query.id;

        activitiesModel.edit_activity(form_data, function (result) {
            res.json(result);
        });
    }
    

};