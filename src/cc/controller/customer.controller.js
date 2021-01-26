"use strict";
let Validator = require('validatorjs');
let CustomerService = require("../model/customer.services");
let customerFormatter = new (require('../formatters/customer.formatter'))();
let customerValidator = new (require("../validator/customer.validators"));
let responseMessages = require("../response/customer.response");
let User_model = require("../model/User_model");
let customerService = new CustomerService();
let user_model = new User_model();
let TpResponseHandler = require("../../core/TpResponseHandler.js");
let tpResponseHandler = new TpResponseHandler();
const rewards = new (require('../../core/rewards/rewards'))();
let knex = require("../../../config/knex");
let config = require("../../../config/config");

module.exports = class CustomerController {

	constructor() { }

	async processTransaction(req, res) {
		rewards.distribute_rewards();

		res.json({ status: true, message: 'Rewards are getting distributed!' });
	}

	async consumeCoupon(req, res) {
		let returnResponse = {}
		let form_data = customerFormatter.consumeCoupon(req);
		let rules = customerValidator.consumeCoupon();
		let validation = new Validator(form_data, rules);

		if (validation.passes() && !validation.fails()) {
			returnResponse = await customerService.consumeCoupon(form_data);
		} else {
			returnResponse = responseMessages.failed('form_fields_required');
			returnResponse.errors = validation.errors.errors;
		}

		return res.json(returnResponse);
	}

	async getCouponCode(req, res) {
		let returnResponse = {}
		let form_data = customerFormatter.getCouponCode(req);
		let rules = customerValidator.getCouponCode();
		let validation = new Validator(form_data, rules);

		if (validation.passes() && !validation.fails()) {
			returnResponse = await customerService.getCouponCode(form_data);
		} else {
			returnResponse = responseMessages.failed('form_fields_required');
			returnResponse.errors = validation.errors.errors;
		}

		return res.json(returnResponse);
	}

	async disputeTransaction(req, res) {
		let returnResponse = {}
		let form_data = customerFormatter.disputeTransaction(req);
		let rules = customerValidator.disputeTransaction();
		let validation = new Validator(form_data, rules);

		if (validation.passes() && !validation.fails()) {
			returnResponse = await customerService.disputeTransaction(form_data);
		} else {
			returnResponse = responseMessages.failed('form_fields_required');
			returnResponse.errors = validation.errors.errors;
		}

		return res.json(returnResponse);
	}

	async getTransactions(req, res) {
		let returnResponse = {}
		let form_data = {};
		let rules = {};
		let validation = new Validator(form_data, rules);

		if (validation.passes() && !validation.fails()) {
			returnResponse = await customerService.getTransactions(form_data);
		} else {
			returnResponse = responseMessages.failed('form_fields_required');
			returnResponse.errors = validation.errors.errors;
		}

		return res.json(returnResponse);
	}

	async getCustomerTransactions(req, res) {
		let returnResponse = {}
		let form_data = customerFormatter.getCustomerTransactions(req);
		let rules = customerValidator.getCustomerTransactions();
		let validation = new Validator(form_data, rules);

		if (validation.passes() && !validation.fails()) {
			returnResponse = await customerService.getCustomerTransactions(form_data);
		} else {
			returnResponse = responseMessages.failed('form_fields_required');
			returnResponse.errors = validation.errors.errors;
		}

		return res.json(returnResponse);
	}

	async addTransaction(req, res) {
		let returnResponse = {}
		let form_data = customerFormatter.addTransaction(req);
		let rules = customerValidator.addTransaction();
		let validation = new Validator(form_data, rules);

		if (validation.passes() && !validation.fails()) {
			returnResponse = await customerService.addTransaction(form_data);
		} else {
			returnResponse = responseMessages.failed('form_fields_required');
			returnResponse.errors = validation.errors.errors;
		}

		return res.json(returnResponse);
	}

	async getProfile(req, res) {
		let returnResponse = {}
		let form_data = customerFormatter.formatGetProfile(req);
		let rules = customerValidator.validateGetProfile();
		let validation = new Validator(form_data, rules);

		if (validation.passes() && !validation.fails()) {
			returnResponse = await customerService.GetProfile(form_data);
		} else {
			returnResponse = responseMessages.failed('form_fields_required');
			returnResponse.errors = validation.errors.errors;
		}

		return res.json(returnResponse);
	}

	async getUnitList(req, res) {
		const form_data = customerFormatter.getUnitList(req);
		const rules = customerValidator.getUnitList();
		const lang_code = form_data.language_code;
		const validation = new Validator(form_data, rules);

		if (validation.passes() && !validation.fails()) {
			tpResponseHandler.response(req, res, await customerService.getUnitList(form_data));
		} else return tpResponseHandler.response(req, res, responseMessages.failed('form_field_required',
			validation.errors.errors, lang_code));
	}

	async setDefaultUnit(req, res) {
		const form_data = customerFormatter.setDefaultUnit(req);
		const rules = customerValidator.setDefaultUnit();
		const lang_code = form_data.language_code;
		const validation = new Validator(form_data, rules);

		if (validation.passes() && !validation.fails()) {
			tpResponseHandler.response(req, res, await customerService.setDefaultUnit(form_data));
		} else return tpResponseHandler.response(req, res, responseMessages.failed('form_field_required',
			validation.errors.errors, lang_code));
	}


	async customerLogin(req, res) {
		const form_data = customerFormatter.formatCustomerCredentials(req);
		const rules = customerValidator.validateCustomerCredentials();
		const lang_code = form_data.language_code;
		const validation = new Validator(form_data, rules);

		if (validation.passes() && !validation.fails()) {
			const result = await customerService.customerLogin(form_data);
			if (!result.status)
				return tpResponseHandler.response(req, res, result);

			const custDetails = result.values[0];
			const otp_data = {
				customer_id: custDetails.id,
				mobile_number: custDetails.phone,
				email: custDetails.email,
				tenant_id: custDetails.tenant_id,
				type: 'login'
			};

			await user_model.generateOTP(otp_data);

			delete otp_data.tenant_id;
			delete otp_data.type;
			delete otp_data.customer_id;

			const responseData = responseMessages.success('otp_sent', otp_data, lang_code);
			responseData.post_data = { email: custDetails.email, mobile: custDetails.phone };

			// otp_data.otp gets added by reference call
			let emailDate = user_model.getEmailDate().split(" ");
			responseData.post_data.email_data = {logo_url: config['base_url'], user_type: custDetails.user_type, OTP: otp_data.otp, user_name: custDetails.user_name, date: user_model.formatEmailDate(emailDate[0].trim()), time: emailDate[1].trim()};
			responseData.post_data.sms_data = {logo_url: config['base_url'], user_type: custDetails.user_type, OTP: otp_data.otp, user_name: custDetails.user_name, date: user_model.formatEmailDate(emailDate[0].trim()), time: emailDate[1].trim()};
			return tpResponseHandler.response(req, res, responseData);

		} else return tpResponseHandler.response(req, res, responseMessages.failed('form_field_required',
			validation.errors.errors, lang_code));
	}

	async verifyOTP(req, res) {
		const form_data = customerFormatter.formatCustomerOTP(req);
		const rules = customerValidator.validateCustomerOTP();
		const lang_code = form_data.language_code;
		const validation = new Validator(form_data, rules);

		if (validation.passes() && !validation.fails()) {
			const result = await user_model.verifyOTP(form_data);

			if (!result.status)
				return tpResponseHandler.response(req, res, result);

			const custDetails = result.values;

			await user_model.insertCustomerLogs({ customer_id: custDetails.customer_id, device_id: form_data.device_id, 
				fcm_token: form_data.fcm_token, os: form_data.os });

			let updateData = {
				os: form_data.os, device_id: form_data.device_id,
				fcm_token: form_data.fcm_token, last_login_time: knex.raw('now()')
			}

			if (custDetails.is_logged_in == 0) {
				if (custDetails.user_type == 'tenant' || (custDetails.user_type == 'family' && custDetails.referrer_user_type == 'tenant' ))
					updateData.is_logged_in = 1;
			}

			await user_model.updateDeviceDetails(custDetails.customer_id, updateData);

			// user_model.

			delete result.values.customer_id;

			return tpResponseHandler.response(req, res, result);

		} else return tpResponseHandler.response(req, res, responseMessages.failed('form_field_required',
			validation.errors.errors, lang_code));
	}

	async resendOtp(req, res) {
		const form_data = customerFormatter.formatCustomerResendOTP(req);
		const rules = customerValidator.validateCustomerResendOTP();
		const lang_code = form_data.language_code;
		const validation = new Validator(form_data, rules);

		if (validation.passes() && !validation.fails()) {
			const result = await user_model.resendOtp(form_data);
			if (!result.status)
				return tpResponseHandler.response(req, res, result);

			const custDetails = result.values;
			const otp_data = {
				customer_id: custDetails.customer_id,
				mobile_number: custDetails.phone,
				email: custDetails.email,
				cso_id: custDetails.cso_id
			};

			await user_model.generateOTP(otp_data, true);

			delete custDetails.cso_id;

			const responseData = responseMessages.success('otp_resend', otp_data, lang_code);
			responseData.post_data = { email: custDetails.email, mobile: custDetails.phone };
			let emailDate = user_model.getEmailDate().split(" ");
			// otp_data.otp gets added by reference call
			responseData.post_data.email_data = {logo_url: config['base_url'],user_type: custDetails.user_type, OTP: otp_data.otp, user_name: custDetails.user_name , date: user_model.formatEmailDate(emailDate[0].trim()), time: emailDate[1].trim()};
			responseData.post_data.sms_data = {logo_url: config['base_url'],user_type: custDetails.user_type, OTP: otp_data.otp ,user_name: custDetails.user_name, date: user_model.formatEmailDate(emailDate[0].trim()), time: emailDate[1].trim()};

			return tpResponseHandler.response(req, res, responseData);

		} else return tpResponseHandler.response(req, res, responseMessages.failed('form_field_required',
			validation.errors.errors, lang_code));
	}

	delete_fcm_token(req, res) {
		let form_data = {
			customer_id: req.body['customer_id'],
			language_code: req.query.language_code
		}
		user_model.delete_fcm_token(form_data, async (result) => {
			return res.json(result);
		});
	}

	updateTenantCron() {
		return customerService.updateTenantCron()
	}
	
}