"use strict";
let Validator = require('validatorjs');
let oamFormatter = new (require('../formatters/oam.formatter'))();
let oamValidator = new (require("../validators/oam.validators"));
let responseMessages = require("../response/oam_login.response");
let Oam_login_model = require("../models/Oam_login_model");
let config = require("../../../config/config");
let OamResponseHandler = require("../../core/OamResponseHandler.js");
let oamResponseHandler = new OamResponseHandler();
let oam_login_model = new Oam_login_model();
module.exports = class Oam_login_controller {
    constructor() { }
	async check_login(req, res, next) {
		const form_data = oamFormatter.check_login(req);
		const rules = oamValidator.check_login();     
        oam_login_model.check_login(form_data, async function (result) {
			if (result.status ==false && (result.code==21101 || result.code==21100)){
				return oamResponseHandler.response(req, res, result);
			} else {
				const custDetails = result.values[0];
				if(form_data['password']==null){
					const otp_data = {
						customer_id: custDetails.oam_id,
						mobile_number: custDetails.phone,
						email: custDetails.email,
						tenant_id: custDetails.tenant_id,
						type: 'login'
					};
					await oam_login_model.generateOTP(otp_data);
					delete otp_data.tenant_id;
					delete otp_data.type;
					otp_data['is_verified'] = custDetails.is_verified;
					otp_data['mobile_number'] = custDetails.country_code+otp_data['mobile_number'];
					otp_data['token'] = custDetails.token;
					otp_data['first_name'] = custDetails.first_name;
					otp_data['last_name'] = custDetails.last_name;
					otp_data['address_line1'] = custDetails.address_line1;
					otp_data['address_line2'] = custDetails.address_line2;
					let emailDate = oam_login_model.getEmailDate().split(" ");
					const responseData = responseMessages.success('otp_sent', otp_data, form_data['language_code']);
					responseData.email_data = {logo_url: config['base_url'],user_type: custDetails.user_type, email: custDetails.email, OTP: otp_data.otp, user_name: custDetails.first_name+" "+custDetails.last_name, language_code: form_data['language_code'], date: oam_login_model.formatEmailDate(emailDate[0].trim()), time: emailDate[1].trim() };
					responseData.sms_data = {logo_url: config['base_url'],user_type: custDetails.user_type, mobile: custDetails.phone, OTP: otp_data.otp, user_name: custDetails.first_name+" "+custDetails.last_name, language_code: form_data['language_code'], date: oam_login_model.formatEmailDate(emailDate[0].trim()), time: emailDate[1].trim() };
					if(result['values'][0]['is_verified']==0){
						return oamResponseHandler.response(req, res, responseData);
					} else {
						return res.json(responseData);
					}
				} else {
					if(result['values'][0]['is_verified']==0){
						return oamResponseHandler.response(req, res, result);
					} else {
						return res.json(result);
					}
				}
			}
		});
    }
    async oam_login(req, res) {
		const form_data = oamFormatter.oam_login(req);
		const rules = oamValidator.oam_login();
		const validation = new Validator(form_data, rules);
		if (validation.passes() && !validation.fails()) {
			const result = await oam_login_model.oam_login(form_data);
            if (!result.status)
				return oamResponseHandler.response(req, res, result);
			const custDetails = result.values[0];
			const otp_data = {
				customer_id: custDetails.id,
				mobile_number: custDetails.phone,
				email: custDetails.email,
				tenant_id: custDetails.tenant_id,
				type: 'login'
			};

			await oam_login_model.generateOTP(otp_data);

			delete otp_data.tenant_id;
			delete otp_data.type;
			let emailDate = oam_login_model.getEmailDate().split(" ");
			const responseData = responseMessages.success('otp_sent', otp_data, form_data['language_code']);
			responseData['values'].email_data = {logo_url: config['base_url'],user_type: custDetails.user_type,email: custDetails.email, OTP: otp_data.otp, user_name: custDetails.first_name+" "+custDetails.last_name, language_code: form_data['language_code'], date: oam_login_model.formatEmailDate(emailDate[0].trim()), time: emailDate[1].trim()  };
			responseData['values'].sms_data = {logo_url: config['base_url'],user_type: custDetails.user_type, mobile: custDetails.phone, OTP: otp_data.otp, language_code: form_data['language_code'], date: oam_login_model.formatEmailDate(emailDate[0].trim()), time: emailDate[1].trim()  };

			return oamResponseHandler.response(req, res, responseData);

		} else return oamResponseHandler.response(req, res, responseMessages.failed('form_field_required',
			validation.errors.errors, form_data['language_code']));
	}

	async verifyOAMOTP(req, res) {
		const form_data = oamFormatter.formatOAMOTP(req);
		const rules = oamValidator.validateAOMOTP();
		const validation = new Validator(form_data, rules);
		if (validation.passes() && !validation.fails()) {
				const result = await oam_login_model.verifyOAMOTP(form_data);
				console.log("resultresultresultresultK : ",result);
			if (!result.status)
				return oamResponseHandler.response(req, res, result);
			return oamResponseHandler.response(req, res, result);
		} else return oamResponseHandler.response(req, res, responseMessages.failed('form_field_required',
			validation.errors.errors, form_data['language_code']));
	}
	async resendOtp(req, res) {
		const form_data = oamFormatter.formatOAMResendOTP(req);
		const rules = oamValidator.validateOAMResendOTP();
		const validation = new Validator(form_data, rules);
		if (validation.passes() && !validation.fails()) {
			const result = await oam_login_model.resendOtp(form_data);
			if (!result.status)
				return oamResponseHandler.response(req, res, result);

			const custDetails = result.values;
			// const otp_data = {
			// 	customer_id: custDetails.customer_id,
			// 	mobile_number: custDetails.phone,
			// 	email: custDetails.email,
			// 	cso_id: custDetails.cso_id
			// };

			// await oam_login_model.generateOTP(otp_data, true);

			// delete custDetails.cso_id;

			// const responseData = responseMessages.success('otp_resend', otp_data);

			// otp_data.otp gets added by reference call
			let emailDate = oam_login_model.getEmailDate().split(" ");
			result['email_data'] = {logo_url: config['base_url'],user_type: custDetails.user_type,email: custDetails.email, OTP: custDetails.otp, user_name: custDetails.first_name+" "+custDetails.last_name, language_code: form_data['language_code'], date: oam_login_model.formatEmailDate(emailDate[0].trim()), time: emailDate[1].trim()   };
			result['sms_data'] = {logo_url: config['base_url'],user_type: custDetails.user_type,mobile: custDetails.phone, OTP: custDetails.otp, user_name: custDetails.first_name+" "+custDetails.last_name, language_code: form_data['language_code'], date: oam_login_model.formatEmailDate(emailDate[0].trim()), time: emailDate[1].trim()  };

			return oamResponseHandler.response(req, res, result);

		} else return oamResponseHandler.response(req, res, responseMessages.failed('form_field_required',
			validation.errors.errors, form_data['language_code']));
	}
	async savePassword(req, res) {
		const form_data = oamFormatter.formatSavePassword(req);
		const rules = oamValidator.validateSavePassword();
		const validation = new Validator(form_data, rules);
		if (validation.passes() && !validation.fails()) {
			let result = await oam_login_model.savePassword(form_data);
			const custDetails = result['values'][0];
			let emailDate = oam_login_model.getEmailDate().split(" ");
			result.email_data = {logo_url: config['base_url'],user_type: custDetails.user_type,email: custDetails.email, password: custDetails.password, user_name: custDetails.first_name+" "+custDetails.last_name, language_code: form_data['language_code'], date: oam_login_model.formatEmailDate(emailDate[0].trim()), time: emailDate[1].trim()   };
			result.sms_data = {logo_url: config['base_url'],user_type: custDetails.user_type,mobile: custDetails.phone, password: custDetails.password, user_name: custDetails.first_name+" "+custDetails.last_name, language_code: form_data['language_code'], date: oam_login_model.formatEmailDate(emailDate[0].trim()), time: emailDate[1].trim()  };
			return oamResponseHandler.response(req, res, result);
		} else return  oamResponseHandler.response(req, res,validation.errors.errors, form_data['language_code']);
	}
	
	async resetPassword(req, res) {
		console.log("password",req.body)

		const form_data = oamFormatter.formatResetPassword(req);
		const rules = oamValidator.validateResetPassword();
		const validation = new Validator(form_data, rules);
		if (validation.passes() && !validation.fails()) {
			let result = await oam_login_model.resetPassword(form_data);
			const custDetails = result['values'][0];
			let emailDate = oam_login_model.getEmailDate().split(" ");
			result.email_data = {logo_url: config['base_url'],user_type: custDetails.user_type,email: custDetails.email, password: custDetails.password, user_name: custDetails.first_name+" "+custDetails.last_name, language_code: form_data['language_code'], date: oam_login_model.formatEmailDate(emailDate[0].trim()), time: emailDate[1].trim()  };
			result.sms_data = {logo_url: config['base_url'],user_type: custDetails.user_type,mobile: custDetails.phone, password: custDetails.password, user_name: custDetails.first_name+" "+custDetails.last_name, language_code: form_data['language_code'], date: oam_login_model.formatEmailDate(emailDate[0].trim()), time: emailDate[1].trim() };
			return oamResponseHandler.response(req, res, result);
		} else return  oamResponseHandler.response(req, res,validation.errors.errors, form_data['language_code']);
	}

	async generateOTPForgotPassword(req, res) {
		const form_data = oamFormatter.generateOTPForgotPassword(req);
		const rules = oamValidator.generateOTPForgotPassword();
		const validation = new Validator(form_data, rules);
		if (validation.passes() && !validation.fails()) {
			let result = await oam_login_model.generateOTPForgotPassword(form_data);
			if(result.status==true){
				let custDetails = result['values'];
				let emailDate = oam_login_model.getEmailDate().split(" ");
				result['email_data'] = {logo_url: config['base_url'],user_type: custDetails.user_type,OTP: custDetails.otp,user_name: custDetails.user_name,email: custDetails.email, language_code: req.query['language_code'], date: oam_login_model.formatEmailDate(emailDate[0].trim()), time: emailDate[1].trim()   };
				result['sms_data'] = {logo_url: config['base_url'],user_type: custDetails.user_type,OTP:custDetails.otp, user_name: custDetails.user_name,mobile: custDetails.mobile_number, language_code: req.query['language_code'], date: oam_login_model.formatEmailDate(emailDate[0].trim()), time: emailDate[1].trim()  };
				return oamResponseHandler.response(req, res, result);
			} else {
				return oamResponseHandler.response(req, res, result);
			}
		} else return  oamResponseHandler.response(req, res,validation.errors.errors, form_data['language_code']);
	}
};



