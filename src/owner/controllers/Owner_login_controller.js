"use strict";
let Validator = require('validatorjs');

let ownerFormatter = new (require('../formatters/owner.formatter'))();
let ownerValidator = new (require("../validators/owner.validators"));
let responseMessages = require("../response/owner_login.response");
let Owner_login_model = require("../models/Owner_login_model");
let config = require("../../../config/config");
let OamResponseHandler = require("../../core/OamResponseHandler.js");
let ownerResponseHandler = new OamResponseHandler();
let owner_login_model = new Owner_login_model();
module.exports = class Owner_login_controller {
    constructor() { }
	async check_login(req, res, next) {  
		const form_data = ownerFormatter.check_login(req);
		console.log("form_data=",form_data);
		const rules = ownerValidator.check_login();     
        owner_login_model.check_login(form_data, async function (result) {
			if (result.status ==false && (result.code==21101 || result.code==21100)){
				console.log("result=",result);
				return ownerResponseHandler.response(req, res, result);
			} else {
				const custDetails = result.values[0];
				if(form_data['password']==null){
					const otp_data = {
						customer_id: custDetails.owner_id,
						mobile_number: custDetails.phone,
						email: custDetails.email,
						tenant_id: custDetails.tenant_id,
						type: 'login'
					};
					await owner_login_model.generateOTP(otp_data);
					delete otp_data.tenant_id;
					delete otp_data.type;
					otp_data['mobile_number'] = custDetails.country_code+otp_data['mobile_number'];
					otp_data['is_verified'] = custDetails.is_verified;
					otp_data['token'] = custDetails.token;
					otp_data['first_name'] = custDetails.first_name;
					otp_data['last_name'] = custDetails.last_name;
					otp_data['address_line1'] = custDetails.address_line1;
					otp_data['address_line2'] = custDetails.address_line2;
					let unitinfo= await owner_login_model.getUnitInfo(custDetails.owner_id);
					otp_data["unit_details"]=unitinfo;
					let emailDate = owner_login_model.getEmailDate().split(" ");
					const responseData = responseMessages.success('otp_sent', otp_data, form_data['language_code']);
					responseData.email_data = {logo_url: config['base_url'],user_type: custDetails.user_type,email: custDetails.email, OTP: otp_data.otp, user_name: custDetails.first_name+" "+custDetails.last_name, language_code: form_data['language_code'], date: owner_login_model.formatEmailDate(emailDate[0].trim()), time: emailDate[1].trim() };
					responseData.sms_data = {logo_url: config['base_url'],user_type: custDetails.user_type, mobile: custDetails.phone, OTP: otp_data.otp, user_name: custDetails.first_name+" "+custDetails.last_name, language_code: form_data['language_code'], date: owner_login_model.formatEmailDate(emailDate[0].trim()), time: emailDate[1].trim() };
					if(result['values'][0]['is_verified']==0){
						return ownerResponseHandler.response(req, res, responseData);
					} else {
						return res.json(responseData);
					}
				} else {
					if(result['values'][0]['is_verified']==0){
						return ownerResponseHandler.response(req, res, result);
					} else {
						return res.json(result);
					}
				}
			}
		});
    }
  
	async verifyOwnerOTP(req, res) {
		const form_data = ownerFormatter.formatOwnerOTP(req);
		const rules = ownerValidator.validateOwnerOTP();
		const validation = new Validator(form_data, rules);
		if (validation.passes() && !validation.fails()) {
				const result = await owner_login_model.verifyOwnerOTP(form_data);
			if (!result.status)
				return ownerResponseHandler.response(req, res, result);
			return ownerResponseHandler.response(req, res, result);
		} else return ownerResponseHandler.response(req, res, responseMessages.failed('form_field_required',
			validation.errors.errors, form_data['language_code']));
	}
	async resendOtp(req, res) {
		const form_data = ownerFormatter.formatOwnerResendOTP(req);
		const rules = ownerValidator.validateOwnerResendOTP();
		const validation = new Validator(form_data, rules);
		if (validation.passes() && !validation.fails()) {
			const result = await owner_login_model.resendOtp(form_data);
			if (!result.status)
				return ownerResponseHandler.response(req, res, result);

			const custDetails = result.values;
			let emailDate = owner_login_model.getEmailDate().split(" ");
			result['email_data'] = {logo_url: config['base_url'],user_user_type: custDetails.user_type,email: custDetails.email, OTP: custDetails.otp, user_name: custDetails.first_name+" "+custDetails.last_name, language_code: form_data['language_code'], date: owner_login_model.formatEmailDate(emailDate[0].trim()), time: emailDate[1].trim()  };
			result['sms_data'] = {logo_url: config['base_url'],user_user_type: custDetails.user_type,mobile: custDetails.phone, OTP: custDetails.otp, user_name: custDetails.first_name+" "+custDetails.last_name, language_code: form_data['language_code'], date: owner_login_model.formatEmailDate(emailDate[0].trim()), time: emailDate[1].trim() };

			return ownerResponseHandler.response(req, res, result);

		} else return oamResponseHandler.response(req, res, responseMessages.failed('form_field_required',
			validation.errors.errors, form_data['language_code']));
	}
	async savePassword(req, res) {
		const form_data = ownerFormatter.formatSavePassword(req);
		const rules = ownerValidator.validateSavePassword();
		const validation = new Validator(form_data, rules);
		if (validation.passes() && !validation.fails()) {
			let result = await owner_login_model.savePassword(form_data);
			const custDetails = result['values'][0];
			let emailDate = owner_login_model.getEmailDate().split(" ");
			result.email_data = {logo_url: config['base_url'],user_type: custDetails.user_type,email: custDetails.email, password: custDetails.password, user_name: custDetails.first_name+" "+custDetails.last_name, language_code: form_data['language_code'], date: owner_login_model.formatEmailDate(emailDate[0].trim()), time: emailDate[1].trim()  };
			result.sms_data = {logo_url: config['base_url'],user_type: custDetails.user_type,mobile: custDetails.phone, password: custDetails.password, user_name: custDetails.first_name+" "+custDetails.last_name, language_code: form_data['language_code'], date: owner_login_model.formatEmailDate(emailDate[0].trim()), time: emailDate[1].trim() };
			return ownerResponseHandler.response(req, res, result);
		} else return  ownerResponseHandler.response(req, res,validation.errors.errors, form_data['language_code']);
	}
	
	async resetPassword(req, res) {
		const form_data = ownerFormatter.formatResetPassword(req);
		const rules = ownerValidator.validateResetPassword();
		const validation = new Validator(form_data, rules);
		if (validation.passes() && !validation.fails()) {
			let result = await owner_login_model.resetPassword(form_data);
			const custDetails = result['values'][0];
			let emailDate = owner_login_model.getEmailDate().split(" ");
			result.email_data = {logo_url: config['base_url'],user_type: custDetails.user_type,email: custDetails.email, password: custDetails.password, user_name: custDetails.first_name+" "+custDetails.last_name, language_code: form_data['language_code'], date: owner_login_model.formatEmailDate(emailDate[0].trim()), time: emailDate[1].trim()  };
			result.sms_data = {logo_url: config['base_url'],user_type: custDetails.user_type,mobile: custDetails.phone, password: custDetails.password, user_name: custDetails.first_name+" "+custDetails.last_name, language_code: form_data['language_code'], date: owner_login_model.formatEmailDate(emailDate[0].trim()), time: emailDate[1].trim() };
			return ownerResponseHandler.response(req, res, result);
		} else return  ownerResponseHandler.response(req, res,validation.errors.errors, form_data['language_code']);
	}
	async generateOTPForgotPassword(req, res) {
		const form_data = ownerFormatter.generateOTPForgotPassword(req);
		const rules = ownerValidator.generateOTPForgotPassword();
		const validation = new Validator(form_data, rules);
		if (validation.passes() && !validation.fails()) {
			let result = await owner_login_model.generateOTPForgotPassword(form_data);
			if(result.status==true){
				let custDetails = result['values'];
				let emailDate = owner_login_model.getEmailDate().split(" ");
				result['email_data'] = {logo_url: config['base_url'],user_type: custDetails.user_type,otp: custDetails.otp,user_name: custDetails.user_name,email: custDetails.email, language_code: req.query['language_code'], date: owner_login_model.formatEmailDate(emailDate[0].trim()), time: emailDate[1].trim()};
				result['sms_data'] = {logo_url: config['base_url'],user_type: custDetails.user_type,otp:custDetails.otp, user_name: custDetails.user_name,mobile: custDetails.mobile_number, language_code: req.query['language_code'], date: owner_login_model.formatEmailDate(emailDate[0].trim()), time: emailDate[1].trim() };
				return ownerResponseHandler.response(req, res, result);
			} else {
				return ownerResponseHandler.response(req, res, result);
			}
		} else return  ownerResponseHandler.response(req, res,validation.errors.errors, form_data['language_code']);
	}

	
};



