"use strict";

let User_model = require("../../cc/model/User_model");
let TpResponseHandler = require("../../core/TpResponseHandler.js");

let user_model = new User_model();
let tpResponseHandler = new TpResponseHandler();

module.exports = class User_controller {
    constructor() {
    }


    /**
    * Get CC_Token method
    * Author :
    * @param {*} req 
    * @param {*} res 
    * @param {*} next 
    */
    getCCToken(req, res, next) {
        let form_data = {};
        form_data['tenant_id'] = req['tenant_id'];
        form_data['tp_application_key'] = req.header("TP_APPLICATION_KEY");
        form_data['domain_ip'] = req.header("host");
        form_data['third_party_app_id'] = req.third_party_app_id;
        form_data['language_code'] = 'EN';
        user_model.getCCToken(form_data, (result) => tpResponseHandler.response(req, res, result))
    }

    /**
     * Send OTP Service 
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    generateOTP(req, res, next) {
        let form_data = {
            tenant_id: req.tenant_id,
            country_code: req.body.country_code,
            language_code: req.query.language_code,
            mobile_number: req.body.mobile_number,
            email: req.body.email,
            type: req.body.type,
            verify_by: req.body.verify_by,
        };
        user_model.generateOTP(form_data, (result) => tpResponseHandler.response(req, res, result));

    }
    /**
     * Verify OTP Service 
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    verifyOTP(req, res, next) {
        let form_data = {
            tenant_id: req.tenant_id,
            otp: req.body.otp,
            country_code: req.body.country_code,
            mobile_number: req.body.mobile_number,
            language_code: req.query.language_code,
            email: req.body.email,
            verify_by: req.body.verify_by,
            type: req.body.type

        };

        user_model.verifyOTP(form_data, (result) => {
            res.json(result);
        });
    }


    get_notification_list(req, res) {

        let form_data = {};
        form_data['tenant_id'] = req['tenant_id'];
        form_data['limit'] = parseInt(req.body.limit);
        form_data['offset'] = parseInt(req.body.offset);
        form_data['customer_unique_id'] = req.body.customer_unique_id;
        form_data['timestamp'] = req.body.timestamp;
        form_data['language_code'] = req.query.language_code;
        form_data['delete_ids'] = req.body.delete_ids;
        form_data['type'] = req.body.type;

        user_model.get_notification_list(form_data, (result) => {
            res.json(result);
        });
    }


    updateFcmToken(req, res) {
        let form_data = {};
        form_data['tenant_id'] = req['tenant_id'];
        form_data['customer_id'] = req.body.customer_id;
        form_data['fcm_token'] = req.body.fcm_token;
        form_data['language_code'] = req.query.language_code;
        user_model.updateFcmToken(form_data, function (result) {
            res.json(result);
        });
    }

    send_notification(req, res) {
        let form_data = {};
        form_data['tenant_id'] = req['tenant_id'];
        form_data['customer_id'] = req.body.customer_id;
        form_data['language_code'] = req.query.language_code;

        user_model.send_notification(form_data, function (result) {
            res.json(result);
        });
    }

    delete_otp_cron(req, res) {
        let form_data = {};
        form_data['date'] = req.body.date;
        form_data['language_code'] = req.query.language_code;
        user_model.delete_otp_cron(form_data, function (result) {
            res.json(result);
        });
    }


    async get_hot_selling_properties(req, res) {

        let return_response = {};

        user_model.get_hot_selling_properties(req, (result) => {
            res.json(result);
        });
    }

};