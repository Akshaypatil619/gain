"use strict";
const root_folder = "../../../../../";
let Validator = require('validatorjs');
let CustomerService = require("../services/customers.services");
let customerService = new CustomerService();
let customerFormatter = new (require('../formatters/customers.formatter'))();
let customerValidators = new (require("../validators/customers.validators"));
let responseMessages = require("../response/customer.response");
var generator = require('generate-password');
// let CustomerCCService = require("../../../../cc/modules/customer/services/customer.services");
let Customer_model = require("../services/customer_model");
var bcrypt = require('bcryptjs');
let TpResponseHandler = require("../../../../core/TpResponseHandler.js");
let tpResponseHandler = new TpResponseHandler();
const saltRounds = 10;

let customer_model = new Customer_model();
// let customerCCService = new CustomerCCService();

module.exports = class CustomersController {

    /**
     * Constructor
     */
	constructor() { }

	addCustomer(req, res, next) {
		let form_data = {};
		form_data['tenant_id'] = req['tenant_id'];
		form_data['first_name'] = req.body.first_name;
		form_data['last_name'] = req.body.last_name;
		form_data['email'] = req.body.email;
		form_data['country_code'] = req.body.country_code;
		form_data['country_id'] = req.body.country_id;
		form_data['phone'] = req.body.phone;
		form_data['city'] = req.body.city;
		form_data['gender'] = req.body.gender;
		form_data['dob'] = req.body.dob;
		form_data['nationality_id'] = req.body.nationality_id;
		form_data['language_code'] = req.query.language_code;
		form_data['os'] = 'Admin';

		var salt = bcrypt.genSaltSync(saltRounds);
		let password = generator.generate({
			length: 6,
			numbers: true
		});
		form_data['readable_password'] = password;
		form_data['password'] = bcrypt.hashSync(password, salt);
		customer_model.addCustomer(form_data, function (result) {
			// if (result['status'] == true) {
			// 	customerCCService.createCustomerAccountCCSummary(form_data).then((res) => { })
			// }
			res.json(result);
		});
	}

	getCustomerProfile(req, res, next) {
		let form_data = {
			customer_id: req.params['customer_id'],
			language_code: req.query.language_code
		};
		customer_model.getCustomerProfile(form_data, function (result) {
			res.json(result);
		});
	}


	getCustomerList(req, res, next) {
		let form_data = {}
		form_data['offset'] = Number(req.query['offset']);
		form_data['limit'] = Number(req.query['limit']);
		form_data['language_code'] = req.query.language_code;
		customer_model.getCustomerList(form_data, function (result) {
			res.json(result);
		});
	}

	updateCustomer(req, res, next) {
		let form_data = {};
		form_data['tenant_id'] = req['tenant_id'];
		// form_data['id'] = req.body.customer_id
		// form_data['first_name'] = req.body.first_name;
		// form_data['last_name'] = req.body.last_name;
		// form_data['country_code'] = req.body.country_code;
		// form_data['country_id'] = req.body.country_id;
		// form_data['city'] = req.body.city;
		// form_data['gender'] = req.body.gender;
		// form_data['dob'] = req.body.dob;
		// form_data['customer_status'] = "update";
		// form_data['nationality_id'] = req.body.nationality_id;
		form_data['id'] = req.body.customer_id,
			form_data['nationality_id'] = req.body.nationality_id,
			form_data['phone'] = req.body.phone;
		form_data['country_code'] = req.body.country_code;
		form_data['city'] = req.body.city;
		form_data['language_code'] = req.query.language_code;
		var salt = bcrypt.genSaltSync(saltRounds);
		let password = generator.generate({
			length: 6,
			numbers: true
		});
		form_data['readable_password'] = password;
		form_data['password'] = bcrypt.hashSync(password, salt);

		customer_model.updateCustomer(form_data, function (result) {
			res.json(result);
		});
	}

	updateCustomerStatus(req, res, next) {
		let form_data = {
			id: req.body.customer_id,
			status: req.body.status,
			language_code: req.query.language_code,
			activityDetails: req['activity_detail']
		};
		customer_model.updateCustomerStatus(form_data, function (result) {
			let email_data = {
				Username: result['values'].name,
				status: (req.body.status==0) ? "Deactivate" : "Activate"
			}
			let post_data = {
				email: result['values'].email,
				mobile: result['values'].phone,
				email_data: email_data
			};
			result['post_data'] = post_data;
			tpResponseHandler.response(req, res, result);
		});
	}
    /**
     * Add customer
     *
     * @param req
     * @param res
     * @returns {Promise<void>}
     */
	async addCustomers(req, res) {
		// returnResponse variable use for returning data to client request
		let returnResponse = {};

		// Format request data
		let form_data = customerFormatter.addCustomer(req);
		// Getting customer validation
		let rules = customerValidators.addCustomer('customer');

		// Check and store validation data
		let validation = new Validator(form_data['customer'], rules);

		// Check validation is passed or failed
		if (validation.passes() && !validation.fails()) {

			// call add customer service and store response in returnResponse variable
			returnResponse = await customerService.addCustomer(form_data);
		} else {

			// store return code and message in returnResponse variable
			returnResponse = responseMessages.form_field_required;

			// Getting errors of validation and store in returnResponse variable
			returnResponse.errors = validation.errors.errors;
		}

		// return response to client request
		res.json(returnResponse);
	}

    /**
     * Edit Customer
     *
     * @param req
     * @param res
     * @returns {Promise<void>}
     */
	async editCustomer(req, res) {
		// returnResponse variable use for returning data to client request
		let returnResponse = {}
		// Format request data
		let form_data = customerFormatter.editCustomer(req);
		// Getting customer validation
		let rules = customerValidators.editCustomer('customer');
		// Check and store validation data
		let validation = new Validator(form_data['customer'], rules);
		// Check validation is passed or failed
		if (validation.passes() && !validation.fails()) {
            /**
             * Validation success
             */
			// call add customer service and store response in returnResponse variable
			returnResponse = await customerService.editCustomer(form_data);
		} else {
            /*
                //Validation fail
            */
			// store return code and message in returnResponse variable
			returnResponse = responseMessages.form_field_required;
			// Getting errors of validation and store in returnResponse variable
			returnResponse.errors = validation.errors.errors;
		}
		// return response to client request
		res.json(returnResponse);
	}

    /**
     * Get customer by id
     *
     * @param {*} req
     * @param {*} res
     * @returns {Promise<void>}
     */
	async getCustomerByID(req, res) {
		console.log("through id searchsssssssssssss", req.body);
		// returnResponse variable use for returning data to client request
		let returnResponse = {}
		// Format request data
		let form_data = customerFormatter.getCustomerByID(req);
		// Getting customer validation
		let rules = customerValidators.getCustomerByID();
		// Check and store validation data
		let validation = new Validator(form_data, rules);
		// Check validation is passed or failed
		if (validation.passes() && !validation.fails()) {
            /**
             * Validation success
             */
			// call add customer service and store response in returnResponse variable
			returnResponse = await customerService.getCustomerByID(form_data);
			console.log("returnResponsereturnResponsereturnResponse : ", returnResponse);
		} else {
            /*
                //Validation fail
            */
			// store return code and message in returnResponse variable
			returnResponse = responseMessages.form_field_required;
			// Getting errors of validation and store in returnResponse variable
			returnResponse.errors = validation.errors.errors;
		}
		// return response to client request
		return res.json(returnResponse);
	}


    /**
     *
     *
     * @param {*} req
     * @param {*} res
     */
	async getCustomersList(req, res) {
		let returnResponse = {}
		let form_data = customerFormatter.getCustomersList(req);
		let rules = customerValidators.getCustomersList('customer');
		let validation = new Validator(form_data, rules);
		if (validation.passes() && !validation.fails()) {
			returnResponse = await customerService.getCustomersList(form_data);
		} else {
			returnResponse = responseMessages.form_field_required;
			returnResponse.errors = validation.errors.errors;
		}
		res.json(returnResponse);
	}

	async getTenantCustomersList(req, res) {
		// returnResponse variable use for returning data to client request
		let returnResponse = {}
		// Format request data
		let form_data = customerFormatter.getTenantCustomersList(req);
		// query_data.filter_by_tenant_or_tenant_branch = common_functions.query_filter_by_tenant_or_tenant_branch(req['tenant_id'], req['tenant_branch_id']);

		// Getting customer validation
		let rules = customerValidators.getTenantCustomersList('customer');
		// Check and store validation data
		let validation = new Validator(form_data, rules);
		// Check validation is passed or failed
		if (validation.passes() && !validation.fails()) {
            /**
             * Validation success
             */
			// call add customer service and store response in returnResponse variable
			returnResponse = await customerService.getTenantCustomersList(form_data);
		} else {
            /*
                //Validation fail
            */
			// store return code and message in returnResponse variable
			returnResponse = responseMessages.form_field_required;
			// Getting errors of validation and store in returnResponse variable
			returnResponse.errors = validation.errors.errors;
		}
		// return response to client request
		res.json(returnResponse);
	}

    /**
     *
     *
     * @param {*} req
     * @param {*} res
     */
	async processCustomerCards(req, res) {

		// returnResponse variable use for returning data to client request
		let returnResponse = {}
		// Format request data
		let form_data = customerFormatter.processCustomerCards(req);
		// query_data.filter_by_tenant_or_tenant_branch = common_functions.query_filter_by_tenant_or_tenant_branch(req['tenant_id'], req['tenant_branch_id']);

		// Getting customer validation
		let rules = customerValidators.processCustomerCards('cardData');
		// Check and store validation data
		let validation = new Validator(form_data, rules);
		// Check cardData validation is passed or failed
		if (validation.passes() && !validation.fails()) {
            /**
             * Validation success
             */
			let insertData = [];
			let errors;
			for (let card of form_data['card_data']) {
				let rules = customerValidators.processCustomerCards('cardValidation');
				let validation = new Validator(card, rules);
				if (validation.passes() && !validation.fails()) {
					insertData.push({
						tenant_id: form_data['tenant_id'],
						customer_id: form_data['customer_id'],
						bank_id: card['bank_id'],
						card_network_id: card['card_network_id'],
						issuer_identification_number: card['issuer_identification_number'],
						// card_number: common_functions.ENCRYPT_WITH_AES(card['card_number']),
						card_number: card['card_number'],
						last_four_digits: card['last_four_digits'],
						month: card['month'],
						year: card['year'],
						created_by: form_data['created_by'],
					});
				} else {
					errors = validation.errors.errors;
					errors['card_number'] = card['issuer_identification_number'] + " " + card['card_number'] + " " + card['last_four_digits'];
					break;
				}
			}
			if (errors) {
                /*
                //Validation fail
            */
				// store return code and message in returnResponse variable
				returnResponse = responseMessages.form_field_required;
				// Getting errors of validation and store in returnResponse variable
				returnResponse.errors = validation.errors.errors;
			} else {
				// call add customer service and store response in returnResponse variable
				returnResponse = await customerService.processCustomerCards(insertData);
			}
		} else {
            /*
                //Validation fail
            */
			// store return code and message in returnResponse variable
			returnResponse = responseMessages.form_field_required;
			// Getting errors of validation and store in returnResponse variable
			returnResponse.errors = validation.errors.errors;
		}
		// return response to client request
		res.json(returnResponse);
	}

    /**
     *
     *
     * @param {*} req
     * @param {*} res
     */
	async removeCustomerCard(req, res) {
		// returnResponse variable use for returning data to client request
		let returnResponse = {}
		// Format request data
		let form_data = customerFormatter.removeCustomerCard(req);
		// query_data.filter_by_tenant_or_tenant_branch = common_functions.query_filter_by_tenant_or_tenant_branch(req['tenant_id'], req['tenant_branch_id']);

		// Getting customer validation
		let rules = customerValidators.removeCustomerCard('customer');
		// Check and store validation data
		let validation = new Validator(form_data, rules);
		// Check validation is passed or failed
		if (validation.passes() && !validation.fails()) {
            /**
             * Validation success
             */
			// call add customer service and store response in returnResponse variable
			returnResponse = await customerService.removeCustomerCard(form_data);
		} else {
            /*
                //Validation fail
            */
			// store return code and message in returnResponse variable
			returnResponse = responseMessages.form_field_required;
			// Getting errors of validation and store in returnResponse variable
			returnResponse.errors = validation.errors.errors;
		}
		// return response to client request
		res.json(returnResponse);

	}

    /**
     *
     *
     * @param {*} req
     * @param {*} res
     */
	async getCustomerCardType(req, res) {
		// returnResponse variable use for returning data to client request
		let returnResponse = {}
		// Format request data
		let form_data = customerFormatter.getCustomerCardType(req);
		// query_data.filter_by_tenant_or_tenant_branch = common_functions.query_filter_by_tenant_or_tenant_branch(req['tenant_id'], req['tenant_branch_id']);

		// Getting customer validation
		let rules = customerValidators.getCustomerCardType('customer');
		// Check and store validation data
		let validation = new Validator(form_data, rules);
		// Check validation is passed or failed
		if (validation.passes() && !validation.fails()) {
            /**
             * Validation success
             */
			// call add customer service and store response in returnResponse variable
			returnResponse = await customerService.getCustomerCardType(form_data);
		} else {
            /*
                //Validation fail
            */
			// store return code and message in returnResponse variable
			returnResponse = responseMessages.form_field_required;
			// Getting errors of validation and store in returnResponse variable
			returnResponse.errors = validation.errors.errors;
		}
		// return response to client request
		res.json(returnResponse);
	}

    /**
     *
     *
     * @param {*} req
     * @param {*} res
     */
	async comment(req, res) {
		// returnResponse variable use for returning data to client request
		let returnResponse = {}
		// Format request data
		let form_data = customerFormatter.comment(req);
		// query_data.filter_by_tenant_or_tenant_branch = common_functions.query_filter_by_tenant_or_tenant_branch(req['tenant_id'], req['tenant_branch_id']);

		// Getting customer validation
		let commentRules = customerValidators.comment('comment');
		let tagDataRules = customerValidators.comment('tagData');
		// Check and store validation data
		let commentValidation = new Validator(form_data.comment, commentRules);
		let tagDataValidation = new Validator(form_data.tagData, tagDataRules);
		// Check validation is passed or failed
		if (commentValidation.passes() && tagDataValidation.passes() && !commentValidation.fails() && !tagDataValidation.fails()) {
            /**
             * Validation success
             */
			// call add customer service and store response in returnResponse variable
			returnResponse = await customerService.comment(form_data);
		} else {
            /*
                //Validation fail
            */
			// store return code and message in returnResponse variable
			returnResponse = responseMessages.form_field_required;
			// Getting errors of validation and store in returnResponse variable
			console.log("TagDataValidation", tagDataValidation.errors);
			console.log("CommentValidation", commentValidation.errors);
			returnResponse.errors = {};
			returnResponse.errors = Object.assign(returnResponse.errors, (commentValidation.errors ? commentValidation.errors.errors : {}));
			returnResponse.errors = Object.assign(returnResponse.errors, (tagDataValidation.errors ? tagDataValidation.errors.errors : {}));
		}
		// return response to client request
		res.json(returnResponse);
	}
    /**
     *
     *
     * @param {*} req
     * @param {*} res
     */
	async commentList(req, res) {
		// returnResponse variable use for returning data to client request
		let returnResponse = {};

		// Format request data
		let form_data = customerFormatter.commentList(req);

		// Getting customer validation
		let rules = customerValidators.commentList('');

		// Check and store validation data
		let validation = new Validator(form_data, rules);

		// Check validation is passed or failed
		if (validation.passes() && !validation.fails()) {

			// call add customer service and store response in returnResponse variable
			returnResponse = await customerService.commentList(form_data);
		} else {

			// store return code and message in returnResponse variable
			returnResponse = responseMessages.form_field_required;

			// Getting errors of validation and store in returnResponse variable
			returnResponse.errors = validation.errors.errors;
		}

		// return response to client request
		res.json(returnResponse);
	}
    /**
     *
     *
     * @param {*} req
     * @param {*} res
     */
	async getCustomerAssignTags(req, res) {
		// returnResponse variable use for returning data to client request
		let returnResponse = {};

		// Format request data
		let form_data = customerFormatter.getCustomerAssignTags(req);

		// Getting customer validation
		let rules = customerValidators.getCustomerAssignTags('');

		// Check and store validation data
		let validation = new Validator(form_data, rules);

		// Check validation is passed or failed
		if (validation.passes() && !validation.fails()) {

			// call add customer service and store response in returnResponse variable
			returnResponse = await customerService.getCustomerAssignTags(form_data);
		} else {

			// store return code and message in returnResponse variable
			returnResponse = responseMessages.form_field_required;

			// Getting errors of validation and store in returnResponse variable
			returnResponse.errors = validation.errors.errors;
		}

		// return response to client request
		res.json(returnResponse);
	}
    /**
     *
     *
     * @param {*} req
     * @param {*} res
     */
	async commentListByTag(req, res) {
		// returnResponse variable use for returning data to client request
		let returnResponse = {};

		// Format request data
		let form_data = customerFormatter.commentListByTag(req);

		// Getting customer validation
		let rules = customerValidators.commentListByTag('');

		// Check and store validation data
		let validation = new Validator(form_data, rules);

		// Check validation is passed or failed
		if (validation.passes() && !validation.fails()) {

			// call add customer service and store response in returnResponse variable
			returnResponse = await customerService.commentListByTag(form_data);
		} else {

			// store return code and message in returnResponse variable
			returnResponse = responseMessages.form_field_required;

			// Getting errors of validation and store in returnResponse variable
			returnResponse.errors = validation.errors.errors;
		}

		// return response to client request
		res.json(returnResponse);
	}

    /**
     *
     *
     * @param {*} req
     * @param {*} res
     */
	async updateCommentStarred(req, res) {
		// returnResponse variable use for returning data to client request
		let returnResponse = {};

		// Format request data
		let form_data = customerFormatter.updateCommentStarred(req);

		// Getting customer validation
		let rules = customerValidators.updateCommentStarred('');

		// Check and store validation data
		let validation = new Validator(form_data, rules);

		// Check validation is passed or failed
		if (validation.passes() && !validation.fails()) {

			// call add customer service and store response in returnResponse variable
			returnResponse = await customerService.updateCommentStarred(form_data);
		} else {

			// store return code and message in returnResponse variable
			returnResponse = responseMessages.form_field_required;

			// Getting errors of validation and store in returnResponse variable
			returnResponse.errors = validation.errors.errors;
		}

		// return response to client request
		res.json(returnResponse);
	}

    /**
     *
     *
     * @param {*} req
     * @param {*} res
     */
	async checkUserValidation(req, res) {
		// returnResponse variable use for returning data to client request
		let returnResponse = {};

		// Format request data
		let form_data = customerFormatter.checkUserValidation(req);

		// Getting customer validation
		let rules = customerValidators.checkUserValidation('');

		// Check and store validation data
		let validation = new Validator(form_data, rules);

		// Check validation is passed or failed
		if (validation.passes() && !validation.fails()) {

			// call add customer service and store response in returnResponse variable
			returnResponse = await customerService.checkUserValidation(form_data);
		} else {

			// store return code and message in returnResponse variable
			returnResponse = responseMessages.form_field_required;

			// Getting errors of validation and store in returnResponse variable
			returnResponse.errors = validation.errors.errors;
		}

		// return response to client request
		res.json(returnResponse);
	}

	customer_bulk_upload(req, res) {
		let form_data = {};
		try {
			form_data['customer_bulk_upload_file'] = req.files.customer_bulk_upload_file;
			form_data['file_name'] = req.files.customer_bulk_upload_file['name'];
			form_data['tenant_branch_id'] = req.body.tenant_branch_id;
			form_data['tenant_id'] = req['tenant_id'];
			form_data['created_by'] = req['tenant_id'];
		} catch (e) {
			console.log(e)
		}
		customerService.customer_bulk_upload(form_data, function (result) {
			res.json(result);
		})
	}

    /**
     *
     *
     * @param {*} req
     * @param {*} res
     */
	async customerProfileStatusChange(req, res) {
		// returnResponse variable use for returning data to client request
		let returnResponse = {};

		// Format request data
		let form_data = customerFormatter.customerProfileStatusChange(req);

		// Getting customer validation
		let rules = customerValidators.customerProfileStatusChange('');

		// Check and store validation data
		let validation = new Validator(form_data, rules);

		// Check validation is passed or failed
		if (validation.passes() && !validation.fails()) {

			// call add customer service and store response in returnResponse variable
			returnResponse = await customerService.customerProfileStatusChange(form_data);
		} else {

			// store return code and message in returnResponse variable
			returnResponse = responseMessages.form_field_required;

			// Getting errors of validation and store in returnResponse variable
			returnResponse.errors = validation.errors.errors;
		}

		// return response to client request
		res.json(returnResponse);
	}

    /**
     *
     *
     * @param {*} req
     * @param {*} res
     */
	async fetchBulkUploadFiles(req, res) {
		// returnResponse variable use for returning data to client request
		let returnResponse = {};

		// Format request data
		let form_data = customerFormatter.fetchBulkUploadFiles(req);

		// Getting customer validation
		let rules = customerValidators.fetchBulkUploadFiles('');

		// Check and store validation data
		let validation = new Validator(form_data, rules);

		// Check validation is passed or failed
		if (validation.passes() && !validation.fails()) {

			// call add customer service and store response in returnResponse variable
			returnResponse = await customerService.fetchBulkUploadFiles(form_data);
		} else {

			// store return code and message in returnResponse variable
			returnResponse = responseMessages.form_field_required;

			// Getting errors of validation and store in returnResponse variable
			returnResponse.errors = validation.errors.errors;
		}

		// return response to client request
		res.json(returnResponse);
	}

	async fetchBulkUploadFileData(req, res) {
		// returnResponse variable use for returning data to client request
		let returnResponse = {};

		// Format request data
		let form_data = customerFormatter.fetchBulkUploadFileData(req);

		// Getting customer validation
		let rules = customerValidators.fetchBulkUploadFileData('');

		// Check and store validation data
		let validation = new Validator(form_data, rules);

		// Check validation is passed or failed
		if (validation.passes() && !validation.fails()) {

			// call add customer service and store response in returnResponse variable
			returnResponse = await customerService.fetchBulkUploadFileData(form_data);
		} else {

			// store return code and message in returnResponse variable
			returnResponse = responseMessages.form_field_required;

			// Getting errors of validation and store in returnResponse variable
			returnResponse.errors = validation.errors.errors;
		}

		// return response to client request
		res.json(returnResponse);
	}

    /**
     *
     *
     * @param {*} req
     * @param {*} res
     */
	import_customers_cards(req, res) {
		let form_data = {};
		try {
			form_data['customer_cards_bulk_upload'] = req.files.customer_data_upload_file;
			form_data['file_name'] = req.files.customer_data_upload_file['name'];
			form_data['tenant_id'] = req['tenant_id'];
			form_data['created_by'] = req['tenant_id'];
		} catch (e) {
			console.log(e)
		}
		customerService.import_customers_cards(form_data, function (result) {
			res.json(result);
		})
	}

    /**
     *
     *
     * @param {*} req
     * @param {*} res
     */
	async customerTierUpgrade(req, res) {
		// returnResponse variable use for returning data to client request
		let returnResponse = {};

		// Format request data
		let form_data = customerFormatter.customerTierUpgrade(req);

		// Getting customer validation
		let rules = customerValidators.customerTierUpgrade('');

		// Check and store validation data
		let validation = new Validator(form_data, rules);

		// Check validation is passed or failed
		if (validation.passes() && !validation.fails()) {

			// call add customer service and store response in returnResponse variable
			returnResponse = await customerService.customerTierUpgrade(form_data);
		} else {

			// store return code and message in returnResponse variable
			returnResponse = responseMessages.form_field_required;

			// Getting errors of validation and store in returnResponse variable
			returnResponse.errors = validation.errors.errors;
		}

		// return response to client request
		res.json(returnResponse);
	}

    /**
     *
     *
     * @param {*} req
     * @param {*} res
     */
	async getCustomerActivity(req, res) {
		// returnResponse variable use for returning data to client request
		let returnResponse = {};

		// Format request data
		let form_data = customerFormatter.getCustomerActivity(req);

		// Getting customer validation
		let rules = customerValidators.getCustomerActivity('');

		// Check and store validation data
		let validation = new Validator(form_data, rules);

		// Check validation is passed or failed
		if (validation.passes() && !validation.fails()) {

			// call add customer service and store response in returnResponse variable
			returnResponse = await customerService.getCustomerActivity(form_data);
		} else {

			// store return code and message in returnResponse variable
			returnResponse = responseMessages.form_field_required;

			// Getting errors of validation and store in returnResponse variable
			returnResponse.errors = validation.errors.errors;
		}

		// return response to client request
		res.json(returnResponse);
	}

    /**
     *
     *
     * @param {*} req
     * @param {*} res
     */
	async getHistoryList(req, res) {
		// returnResponse variable use for returning data to client request
		let returnResponse = {};

		// Format request data
		let form_data = customerFormatter.getHistoryList(req);

		// Getting customer validation
		let rules = customerValidators.getHistoryList('');

		// Check and store validation data
		let validation = new Validator(form_data, rules);

		// Check validation is passed or failed
		if (validation.passes() && !validation.fails()) {

			// call add customer service and store response in returnResponse variable
			returnResponse = await customerService.getHistoryList(form_data);
		} else {

			// store return code and message in returnResponse variable
			returnResponse = responseMessages.form_field_required;

			// Getting errors of validation and store in returnResponse variable
			returnResponse.errors = validation.errors.errors;
		}

		// return response to client request
		res.json(returnResponse);
	}

    /**
     *
     *
     * @param {*} req
     * @param {*} res
     */
	async getCustomerGraphValue(req, res) {
		// returnResponse variable use for returning data to client request
		let returnResponse = {};

		// Format request data
		let form_data = customerFormatter.getCustomerGraphValue(req);

		// Getting customer validation
		let rules = customerValidators.getCustomerGraphValue('');

		// Check and store validation data
		let validation = new Validator(form_data, rules);

		// Check validation is passed or failed
		if (validation.passes() && !validation.fails()) {

			// call add customer service and store response in returnResponse variable
			returnResponse = await customerService.getCustomerGraphValue(form_data);
		} else {

			// store return code and message in returnResponse variable
			returnResponse = responseMessages.form_field_required;

			// Getting errors of validation and store in returnResponse variable
			returnResponse.errors = validation.errors.errors;
		}

		// return response to client request
		res.json(returnResponse);
	}

    /**
     *
     *
     * @param {*} req
     * @param {*} res
     */
	async getCustomerTableColumns(req, res) {
		// returnResponse variable use for returning data to client request
		let returnResponse = {};

		// Format request data
		let form_data = customerFormatter.getCustomerTableColumns(req);

		// Getting customer validation
		let rules = customerValidators.getCustomerTableColumns('');

		// Check and store validation data
		let validation = new Validator(form_data, rules);

		// Check validation is passed or failed
		if (validation.passes() && !validation.fails()) {

			// call add customer service and store response in returnResponse variable
			returnResponse = await customerService.getCustomerTableColumns(form_data);
		} else {

			// store return code and message in returnResponse variable
			returnResponse = responseMessages.form_field_required;

			// Getting errors of validation and store in returnResponse variable
			returnResponse.errors = validation.errors.errors;
		}

		// return response to client request
		res.json(returnResponse);


		let query_data = {};
		try {
			query_data['tenant_id'] = req['tenant_id'];
		} catch (error) {
			console.log(error)
		}
		customerService.get_customer_table_columns(query_data, (result) => {
			res.json(result);
		})
	}

    /**
     *
     *
     * @param {*} req
     * @param {*} res
     */
	async getCustomerAssignConsent(req, res) {
		// returnResponse variable use for returning data to client request
		let returnResponse = {};

		// Format request data
		let form_data = customerFormatter.getCustomerAssignConsent(req);

		// Getting customer validation
		let rules = customerValidators.getCustomerAssignConsent('');

		// Check and store validation data
		let validation = new Validator(form_data, rules);

		// Check validation is passed or failed
		if (validation.passes() && !validation.fails()) {

			// call add customer service and store response in returnResponse variable
			returnResponse = await customerService.getCustomerAssignConsent(form_data);
		} else {

			// store return code and message in returnResponse variable
			returnResponse = responseMessages.form_field_required;

			// Getting errors of validation and store in returnResponse variable
			returnResponse.errors = validation.errors.errors;
		}

		// return response to client request
		res.json(returnResponse);
	}

    /**
     *
     *
     * @param {*} req
     * @param {*} res
     */
	async customerDowngradeTier(req, res) {
		// returnResponse variable use for returning data to client request
		let returnResponse = {};

		// Format request data
		let form_data = customerFormatter.customerDowngradeTier(req);

		// Getting customer validation
		let rules = customerValidators.customerDowngradeTier('');

		// Check and store validation data
		let validation = new Validator(form_data, rules);

		// Check validation is passed or failed
		if (validation.passes() && !validation.fails()) {

			// call add customer service and store response in returnResponse variable
			returnResponse = await customerService.customerDowngradeTier(form_data);
		} else {

			// store return code and message in returnResponse variable
			returnResponse = responseMessages.form_field_required;

			// Getting errors of validation and store in returnResponse variable
			returnResponse.errors = validation.errors.errors;
		}

		// return response to client request
		res.json(returnResponse);
	}

    /**
     *
     *
     * @param {*} req
     * @param {*} res
     */
	async createDynamicField(req, res) {
		// returnResponse variable use for returning data to client request
		let returnResponse = {};

		// Format request data
		let form_data = customerFormatter.createDynamicField(req);

		// Getting customer validation
		let rules = customerValidators.createDynamicField('');

		// Check and store validation data
		let validation = new Validator(form_data, rules);

		// Check validation is passed or failed
		if (validation.passes() && !validation.fails()) {

			// call add customer service and store response in returnResponse variable
			returnResponse = await customerService.createDynamicField(form_data);
		} else {

			// store return code and message in returnResponse variable
			returnResponse = responseMessages.form_field_required;

			// Getting errors of validation and store in returnResponse variable
			returnResponse.errors = validation.errors.errors;
		}

		// return response to client request
		res.json(returnResponse);
	}

    /**
     *
     *
     * @param {*} req
     * @param {*} res
     */
	async getSalesOfficeList(req, res) {
		// returnResponse variable use for returning data to client request
		let returnResponse = {};

		// Format request data
		let form_data = customerFormatter.getSalesOfficeList(req);

		// Getting customer validation
		let rules = customerValidators.getSalesOfficeList('');

		// Check and store validation data
		let validation = new Validator(form_data, rules);

		// Check validation is passed or failed
		if (validation.passes() && !validation.fails()) {

			// call add customer service and store response in returnResponse variable
			returnResponse = await customerService.getSalesOfficeList(form_data);
		} else {

			// store return code and message in returnResponse variable
			returnResponse = responseMessages.form_field_required;

			// Getting errors of validation and store in returnResponse variable
			returnResponse.errors = validation.errors.errors;
		}

		// return response to client request
		res.json(returnResponse);
	}

    /**
     *
     *
     * @param {*} req
     * @param {*} res
     */
	get_customer_primary_data(req, res) {
		let query_data = {
			tenant_id: req['tenant_id'],
		};
		customerService.get_customer_primary_data(query_data, function (result) {
			res.json(result);
		});
	}

    /**
     *
     *
     * @param {*} req
     * @param {*} res
     */
	async getCustomerPointTransferList(req, res) {
		// returnResponse variable use for returning data to client request
		let returnResponse = {};

		// Format request data
		let form_data = customerFormatter.getCustomerPointTransferList(req);

		// Getting customer validation
		let rules = customerValidators.getCustomerPointTransferList('');

		// Check and store validation data
		let validation = new Validator(form_data, rules);

		// Check validation is passed or failed
		if (validation.passes() && !validation.fails()) {

			// call add customer service and store response in returnResponse variable
			returnResponse = await customerService.getCustomerPointTransferList(form_data);
		} else {

			// store return code and message in returnResponse variable
			returnResponse = responseMessages.form_field_required;

			// Getting errors of validation and store in returnResponse variable
			returnResponse.errors = validation.errors.errors;
		}

		// return response to client request
		res.json(returnResponse);
	}

    /**
     *
     *
     * @param {*} req
     * @param {*} res
     */
	async addTagInComment(req, res) {
		// returnResponse variable use for returning data to client request
		let returnResponse = {};

		// Format request data
		let form_data = customerFormatter.addTagInComment(req);

		// Getting customer validation
		let rules = customerValidators.addTagInComment('');

		// Check and store validation data
		let validation = new Validator(form_data, rules);

		// Check validation is passed or failed
		if (validation.passes() && !validation.fails()) {

			// call add customer service and store response in returnResponse variable
			returnResponse = await customerService.addTagInComment(form_data);
		} else {

			// store return code and message in returnResponse variable
			returnResponse = responseMessages.form_field_required;

			// Getting errors of validation and store in returnResponse variable
			returnResponse.errors = validation.errors.errors;
		}

		// return response to client request
		res.json(returnResponse);
	}

    /**
     *
     *
     * @param {*} req
     * @param {*} res
     */
	async removeTagFromComment(req, res) {
		// returnResponse variable use for returning data to client request
		let returnResponse = {};

		// Format request data
		let form_data = customerFormatter.removeTagFromComment(req);

		// Getting customer validation
		let rules = customerValidators.removeTagFromComment('');

		// Check and store validation data
		let validation = new Validator(form_data, rules);

		// Check validation is passed or failed
		if (validation.passes() && !validation.fails()) {

			// call add customer service and store response in returnResponse variable
			returnResponse = await customerService.removeTagFromComment(form_data);
		} else {

			// store return code and message in returnResponse variable
			returnResponse = responseMessages.form_field_required;

			// Getting errors of validation and store in returnResponse variable
			returnResponse.errors = validation.errors.errors;
		}

		// return response to client request
		res.json(returnResponse);
	}

    /**
     *
     *
     * @param {*} req
     * @param {*} res
     */
	async addTagInSource(req, res) {
		// returnResponse variable use for returning data to client request
		let returnResponse = {};

		// Format request data
		let form_data = customerFormatter.addTagInSource(req);

		// Getting customer validation
		let rules = customerValidators.addTagInSource('');

		// Check and store validation data
		let validation = new Validator(form_data, rules);

		// Check validation is passed or failed
		if (validation.passes() && !validation.fails()) {

			// call add customer service and store response in returnResponse variable
			returnResponse = await customerService.addTagInSource(form_data);
		} else {

			// store return code and message in returnResponse variable
			returnResponse = responseMessages.form_field_required;

			// Getting errors of validation and store in returnResponse variable
			returnResponse.errors = validation.errors.errors;
		}

		// return response to client request
		res.json(returnResponse);
	}

    /**
     *
     *
     * @param {*} req
     * @param {*} res
     */
	async removeCustomerSource(req, res) {
		// returnResponse variable use for returning data to client request
		let returnResponse = {};

		// Format request data
		let form_data = customerFormatter.removeCustomerSource(req);
		console.log(form_data);

		// Getting customer validation
		let rules = customerValidators.removeCustomerSource('');

		// Check and store validation data
		let validation = new Validator(form_data, rules);

		// Check validation is passed or failed
		if (validation.passes() && !validation.fails()) {

			// call add customer service and store response in returnResponse variable
			returnResponse = await customerService.removeCustomerSource(form_data);
		} else {

			// store return code and message in returnResponse variable
			returnResponse = responseMessages.form_field_required;

			// Getting errors of validation and store in returnResponse variable
			returnResponse.errors = validation.errors.errors;
		}

		// return response to client request
		res.json(returnResponse);
	}

};
