"use strict";
let Tenant_user_role_model = require("../models/Tenant_user_role_model");
let tenant_user_role_modal = new Tenant_user_role_model();

module.exports = class Tenant_user_role_controller {
    constructor() {
    }

    add_tenant_user_role(req, res) {
        let formData = {
            tenant_id: req['tenant_id'],
            data: {
                name: req.body.name,
                tenant_id: req['tenant_id'],                    
                description: req.body.description,
                status: req.body.status,
                created_by: req['tenant_user_id']
            }
        };
        tenant_user_role_modal.add_tenant_user_role(formData, (result) => {
            res.json(result);
        })
    }

    edit_tenant_user_role(req, res) {
        let formData = {
            tenant_id: req['tenant_id'],
            data: {
                role_id: req.params.id,
                name: req.body.name,
                description: req.body.description,
                status: req.body.status,
            }
        };
        tenant_user_role_modal.edit_tenant_user_role(formData, (result) => {
            res.json(result);
        })
    }

    get_tenant_user_roles_list(req, res) {
        let queryData = {
            tenant_id: req['tenant_id'],
            merchant_id: req.params.merchant_id,
            limit: parseInt(req.query.limit),
            offset: parseInt(req.query.offset),
            search: req.query.search,
            from_date: req.query.from_date,
            to_date: req.query.to_date
        };
        tenant_user_role_modal.get_tenant_user_roles_list(queryData, (result) => {
            res.json(result);
        });
    }
    get_tenant_user_role_by_id(req,res){
        let queryData = {
            tenant_id: req['tenant_id'],
            role_id:req.params.id
        };
        tenant_user_role_modal.get_tenant_user_role_by_id(queryData, (result) => {
            res.json(result);
        });
    }

    update_status(req, res) {
        let formData = {
            tenant_id: req['tenant_id'],
            data: {
                role_id: req.body.role_id,
                status: req.body.status,
            }
        };
        tenant_user_role_modal.update_status(formData, (result) => {
            res.json(result);
        })
    }
};