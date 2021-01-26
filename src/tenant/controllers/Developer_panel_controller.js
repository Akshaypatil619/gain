"use strict";
let Developer_panel_model = require('../../core/DeveloperPanel/DeveloperPanel.js');
let developer_panel_model = new Developer_panel_model();
let constants = require("../../../config/constants.js");

module.exports = class Developer_panel_controller {
    constructor() {
    }

    get_route_list(req, res, next) {
        let query_data = {
            user_type: "tenant",
            user_id: req.tenant_id,
            tenant_type_id:req.query.tenant_type_id || req['tenant_type_id']
        };
        developer_panel_model.get_route_list(query_data, (result) => {
            res.json(result);
        });
    }

    store_routes(req, res, next) {
        let query_data = {
            user_type: "tenant",
            user_id: req.tenant_id,
            tenant_type_id:req.body.tenant_type_id,
            routes: req.body.routes
        };
        developer_panel_model.store_routes(query_data, (result) => {
            res.json(result);
        });
    }

    enable_disable_route(req,res,next){
        let form_data = {
            user_type:"tenant",
            tenant_type_id:req.body.tenant_type_id,
            route_id:req.body.route_id,
            enabled:req.body.enabled
        };
        developer_panel_model.enable_disable_route(form_data, (result) => {
            res.json(result);
        });
    }

    update_valid_permission_type(req,res,next){
        let query_data = {
            user_type: "tenant",
            user_id: req.tenant_id,
            // tenant_type_id:req.body.tenant_type_id,
            route_id:req.body.route_id,
            valid_permission_type:req.body.valid_permission_type,
        };
        developer_panel_model.update_valid_permission_type(query_data, (result) => {
            res.json(result);
        });
    }

    update_route_group(req, res, next) {
        let query_data = {
            user_type: "tenant",
            user_id: req.tenant_id,
            route_id: req.body.route_id,
            api_permission_group_id: req.body.api_permission_group_id,
            tenant_type_id:req.body.tenant_type_id
        };
        developer_panel_model.update_route_group(query_data, (result) => {
            res.json(result);
        });
    }
   
    update_route_group_code(req, res, next) {
        let form_data = {
            user_type: "tenant",
            user_id: req.tenant_id,
            route_id: req.body.route_id,
            group_code_id: req.body.group_code_id,
            status: req.body.status,
            tenant_type_id:req.body.tenant_type_id
        };
        developer_panel_model.update_route_group_code(form_data, (result) => {
            res.json(result);
        });
    }

    getting_inner_api(req,res,next){
        let form_data = {
            user_type: "tenant",
            user_id: req.tenant_id,
            route_id: req.body.route_id,
            tenant_type_id:req.body.tenant_type_id
        };
        developer_panel_model.getting_inner_api(form_data, (result) => {
            res.json(result);
        });
    }

    get_tenant_types(req,res,next){
        let form_data = {
            user_type: "tenant",
            user_id: req.tenant_id,
        };
        developer_panel_model.get_tenant_types(form_data, (result) => {
            res.json(result);
        });
    }

    get_routes(req,res,nex){
        let form_data = {
            user_type: "tenant",
            user_id: req.tenant_id,
            tenant_type_id:req.tenant_type_id,
        };
        developer_panel_model.get_routes(form_data, (result) => {
            res.json(result);
        });
    }

    add_group(req, res) {
        let form_data = {
            name: req.body.name,
            status: req.body.status,
            user_type: req.body.user_type,
            // tenant_id: req.tenant_id,
            group_code_id: 1//req.body.group_code_id
        };
        form_data.group_code_id = form_data.group_code_id==undefined || form_data.group_code_id==null?0:form_data.group_code_id;
        developer_panel_model.add_group(form_data, (result) => res.json(result));
    }
    modify_group(req, res) {
        let form_data = {
            id: req.body.group_id,
            name: req.body.name,
            status: req.body.status,
            user_type: req.body.user_type,
            // tenant_id: req.tenant_id,
            group_code_id:req.body.group_code_id
        };
        form_data.group_code_id = form_data.group_code_id==undefined || form_data.group_code_id==null?0:form_data.group_code_id;
        developer_panel_model.modify_group(form_data, (result) => res.json(result));
    }

    get_list(req,res){
        
        let query_data = {
            tenant_id:req.tenant_id,
            user_type: req.query.user_type,
            name:req.query.name,
            status: constants.true_status.includes(req.query.status)?1:(constants.false_status.includes(req.query.status)?0:undefined)
        };
        developer_panel_model.get_list(query_data,(result) => res.json(result));
    }

    set_status(req,res){
        let form_data = {
            // tenant_id:req.tenant_id,
            group_id:req.body.group_id,
            user_type:req.body.user_type,
            status:constants.true_status.includes(req.body.status)?1:(constants.false_status.includes(req.body.status)?0:undefined)
        }
        developer_panel_model.set_status(form_data,(result)=>res.json(result));
    }

    /* */
    get_users(req,res){
        let query_data = {
            tenant_id:req.tenant_id,
            user_type:req.query.user_type,
        };
        developer_panel_model.get_users(query_data,(result)=>{
            res.json(result);
        });
    }
    get_group_list(req,res){
        let query_data = {
            tenant_id:req.tenant_id,
            user_type:req.query.user_type,
            user_id:req.query.user_id
        };
        developer_panel_model.get_group_list(query_data,(result)=>{
            res.json(result);
        });
    }

    assign_routes(req,res){
        let form_data = {
            tenant_id:req.tenant_id,
            user_type:'tenant',
            group_id:req.body.group_id,
            routes:req.body.routes,
            status:req.body.status
        };
        if (form_data.routes !== undefined && form_data.routes.constructor !== Array) {
            form_data.routes = form_data.routes.split(",");
        }
        developer_panel_model.assign_routes(form_data,(result)=>{
            res.json(result);
        });
    }
    get_assigned_routes(req,res){
        let query_data = {
            user_type:"tenant",
            group_id:req.query.group_id
        };
        developer_panel_model.get_assigned_routes(query_data,(result)=>{
            res.json(result);
        })
    }
    remove_route(req,res){
        let form_data = {
            user_type:"tenant",
            assigned_id:req.body.assigned_id
        };
        developer_panel_model.remove_route(form_data,(result)=>{
            res.json(result);
        })
    }

    assign_apis(req,res){
        let form_data = {
            tenant_id:req.tenant_id,
            user_type:'tenant',
            group_id:req.body.group_id,
            apis:req.body.apis,
            status:req.body.status
        };
        if (form_data.apis !== undefined && form_data.apis.constructor !== Array) {
            form_data.apis = form_data.apis.split(",");
        }
        developer_panel_model.assign_apis(form_data,(result)=>{
            res.json(result);
        });
    }
    get_assigned_apis(req,res){
        let query_data = {
            user_type:"tenant",
            group_id:req.query.group_id
        };
        developer_panel_model.get_assigned_apis(query_data,(result)=>{
            console.log(result);
            res.json(result);
        })
    }
    remove_api(req,res){
        let form_data = {
            user_type:"tenant",
            assigned_id:req.body.assigned_id
        };
        developer_panel_model.remove_api(form_data,(result)=>{
            res.json(result);
        })
    }
    get_api_list(req,res){
        let query_data = {
            user_type:"tenant",
        };
        developer_panel_model.get_api_list(query_data,(result)=>{
            res.json(result);
        })
    }

    update_permission_status(req,res){
        let data = {};
        data.group_id = req.body.group_id;
        data.type_id = req.body.tenant_type_id;
        data.status = req.body.status;

        developer_panel_model.update_permission_status(data, (result)=>{
            res.json(result)
        })
    }

};