"use strict";
let Coupon_code_model = require("../models/Coupon_code_model");
let coupon_code_model = new Coupon_code_model();

module.exports = class Coupon_code_controller {
    constructor() {
    }

    add_coupon_code(req, res) {
        let form_data = {};
        try {
            form_data['coupon_name'] = req.body.coupon_name;
            form_data['coupon_description'] = req.body.coupon_description;
            form_data['start_date'] = new Date(req.body.start_date);
            form_data['end_date'] = new Date(req.body.end_date);
            form_data['merchant_id'] = req.body.merchant_id;
            form_data['coupon_image'] = req.files.coupon_image;
        } catch (e) {
        }
        coupon_code_model.add_coupon_code(form_data, function (result) {
            res.json(result);
        });
    }
    
    edit_coupon_code(req, res) {
       
        let form_data = {};
        form_data['coupon_code_id'] = req.params.id;
        try {
            form_data['coupon_name'] = req.body.coupon_name;
            form_data['coupon_description'] = req.body.coupon_description;
            form_data['merchant_id'] = req.body.merchant_id;
            form_data['start_date'] = new Date(req.body.start_date);
            form_data['end_date'] = new Date(req.body.end_date);
            form_data['image'] = req.files.coupon_image;

        } catch (e) {
        }
        coupon_code_model.edit_coupon_code(form_data, function (result) {
            res.json(result);
        });
    }

    get_coupon_code_by_id(req, res) {
        let query_data = {};
        query_data['tenant_id'] = req['tenant_id'];
        query_data['coupon_code_id'] = req.params.id;
        coupon_code_model.get_coupon_code_by_id(query_data, function (result) {
            res.json(result);
        });
    }

    get_coupon_code_list(req,res){
        let query_data = {};

        query_data['tenant_id'] = req['tenant_id'];
        query_data['limit'] = parseInt(req.query.limit);
        query_data['offset'] = parseInt(req.query.offset);
        query_data['search'] = req.query.search;
        query_data['start_date'] = req.query.from_date;
        query_data['end_date'] = req.query.to_date;
        coupon_code_model.get_coupon_code_list(query_data, function (result) {
            res.json(result);
        });
    }

    get_merchant_list(req, res){
        let query_data = {};
        query_data.tenant_id = req['tenant_id'];
        coupon_code_model.get_merchant_list(query_data, function (result) {
            res.json(result);
        });
    }
}