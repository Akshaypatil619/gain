"use strict";
let Cron_model = require("../../core/CronManagement/CronManagement.js");
let cron_model = new Cron_model();

module.exports = class Coupon_code_controller {
    constructor() {
    }

    add_cron(req, res, next) {
        let form_data = {
            user_type: "tenant",
            user_id: req.tenant_id,
            cron_range: req.body.cron_range,
            url: req.body.url,
            name: req.body.name,
            status: req.body.status,
            started:req.body.started
        };
        cron_model.add_cron(form_data, (result) => {
            res.json(result);
        });
    }

    modify_cron(req, res, next) {
        let form_data = {
            cron_id: req.body.cron_id,
            user_type: "tenant",
            user_id: req.tenant_id,
            cron_range: req.body.cron_range,
            url: req.body.url,
            name: req.body.name,
            status: req.body.status,
            started:req.body.started
        };
        cron_model.modify_cron(form_data, (result) => {
            res.json(result);
        });
    }

    cron_list(req, res, next) {
        let query_data = {
            user_type: "tenant",
            user_id: req.tenant_id,
            status: req.query.status,
            name: req.query.name,
            url: req.query.url,
            limit: req.query.limit,
            offset: req.query.offset
        };
        cron_model.cron_list(query_data, (result) => {
            res.json(result);
        });
    }

    cron_detail(req, res, next) {
        let query_data = {
            user_type: "tenant",
            user_id: req.tenant_id,
            cron_id: req.query.cron_id
        };
        cron_model.cron_detail(query_data, (result) => {
            res.json(result);
        });
    }

    action(req, res, next) {
        let query_data = {
            user_type: "tenant",
            user_id: req.tenant_id,
            cron_id: req.body.cron_id,
            action:req.body.action
        };
        cron_model.action(query_data, (result) => {
            res.json(result);
        });
    }

};