"use strict";
let APIPermissionManagement = require("../../core/APIPermissions/APIPermissionManagement.js");
let api_permission_management = new APIPermissionManagement();

module.exports = class Accrual_earning_point_rule_controller {
    constructor() {
    }
    get_permissions_list(req, res, next) {
        let query_data = {
            user_type: "tenant",
            role_id : req.query.role_id,
            tenant_type_id:req.tenant_type_id
        };
        api_permission_management.get_permissions_list(query_data, (result) => {
            res.json(result);
        });
    }

    update_permission_list(req, res, next) {
        let query_data = {
            user_type: "tenant",
            role_id: req.body.role_id,
            api_permission_group_id: req.body.api_permission_group_id,
            permission: req.body.permission,
            tenant_type_id:req.tenant_type_id
        };
        api_permission_management.update_permission_list(query_data, (result) => {
            res.json(result);
        });
    }

    check_toekn(req,res,next){
        let query_data = {
            user_type: "tenant",
            role_id: req.query.role_id,
            token:req.query.token,
            tenant_type_id:req.tenant_type_id
        };
        api_permission_management.check_toekn(query_data, (result) => {
            res.json(result);
        });
    }
};