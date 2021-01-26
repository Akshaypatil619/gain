let Validator = require('validatorjs');
let UserService = require("../services/user.service");
let userService = new UserService();
let userFormatter = new (require('../formatters/user.formatter'))();
let userValidators = new (require("../validators/user.validator"));
let responseMessages = require("../response/user.response");
let ResponseHandler = require("../../../../core/ResponseHandler.js");
let TpResponseHandler = require("../../../../core/TpResponseHandler.js");
let tpResponseHandler = new TpResponseHandler();

module.exports = class UserController {
    /**
     * @description Check login
     * @author Brijesh Kumar Khatri
     * @param {*} req
     * @param {*} res
     */
	async checkLogin(req, res) {

		// returnResponse variable use for returning data to client request
		let returnResponse = {};

		// Format request data
		let form_data = userFormatter.checkLogin(req);

		// Get validation
		let rules = userValidators.checkLogin();

		// Check and store validation data
		let validation = new Validator(form_data, rules);

		// Check validation is passed or failed
		if (validation.passes() && !validation.fails()) {

			// call check login service and store response in returnResponse variable
			returnResponse = await userService.checkLogin(form_data);
		} else {

			// store return code and message in returnResponse variable
			returnResponse = responseMessages.form_field_required;

			// Getting errors of validation and store in returnResponse variable
			returnResponse.errors = validation.errors.errors;
		}

		// return response to client request
		res.json(returnResponse);
	}

	// async generateApiToken(req, res) {
	//     // returnResponse variable use for returning data to client request
	//     let returnResponse = {};

	//     // Format request data
	//     let form_data = userFormatter.generateApiToken(req);

	//     // Get validation
	//     let rules = userValidators.generateApiToken();

	//     // Check and store validation data
	//     let validation = new Validator(form_data, rules);

	//     // Check validation is passed or failed
	//     if (validation.passes() && !validation.fails()) {

	//         // call add customer service and store response in returnResponse variable
	//         returnResponse = await userService.generateApiToken(form_data);
	//     } else {

	//         // store return code and message in returnResponse variable
	//         returnResponse = responseMessages.form_field_required;

	//         // Getting errors of validation and store in returnResponse variable
	//         returnResponse.errors = validation.errors.errors;
	//     }

	//     // return response to client request
	//     res.json(returnResponse);
	// }

	// async getModulePermissions(req, res) {
	//     // returnResponse variable use for returning data to client request
	//     let returnResponse = {};

	//     // Format request data
	//     let form_data = userFormatter.getModulePermissions(req);

	//     // Get validation
	//     let rules = userValidators.getModulePermissions();

	//     // Check and store validation data
	//     let validation = new Validator(form_data, rules);

	//     // Check validation is passed or failed
	//     if (validation.passes() && !validation.fails()) {

	//         // call add customer service and store response in returnResponse variable
	//         returnResponse = await userService.getModulePermissions(form_data);
	//     } else {

	//         // store return code and message in returnResponse variable
	//         returnResponse = responseMessages.form_field_required;

	//         // Getting errors of validation and store in returnResponse variable
	//         returnResponse.errors = validation.errors.errors;
	//     }

	//     // return response to client request
	//     res.json(returnResponse);
	// }

	// async activateOrDeactivateTenantUser(req, res) {
	//     // returnResponse variable use for returning data to client request
	//     let returnResponse = {};

	//     // Format request data
	//     let form_data = userFormatter.activateOrDeactivateTenantUser(req);

	//     // Get validation
	//     let rules = userValidators.activateOrDeactivateTenantUser();

	//     // Check and store validation data
	//     let validation = new Validator(form_data, rules);

	//     // Check validation is passed or failed
	//     if (validation.passes() && !validation.fails()) {

	//         // call add customer service and store response in returnResponse variable
	//         returnResponse = await userService.activateOrDeactivateTenantUser(form_data);
	//     } else {

	//         // store return code and message in returnResponse variable
	//         returnResponse = responseMessages.form_field_required;

	//         // Getting errors of validation and store in returnResponse variable
	//         returnResponse.errors = validation.errors.errors;
	//     }

	//     // return response to client request
	//     res.json(returnResponse);
	// }

	async addRedemptionChannel(req, res) {
		// returnResponse variable use for returning data to client request
		let returnResponse = {};

		// Format request data
		let form_data = userFormatter.addRedemptionChannel(req);

		// Get validation
		let rules = userValidators.addRedemptionChannel();

		// Check and store validation data
		let validation = new Validator(form_data, rules);

		// Check validation is passed or failed
		if (validation.passes() && !validation.fails()) {

			// call add redemption channel service and store response in returnResponse variable
			returnResponse = await userService.addRedemptionChannel(form_data);
		} else {

			// store return code and message in returnResponse variable
			returnResponse = responseMessages.form_field_required;

			// Getting errors of validation and store in returnResponse variable
			returnResponse.errors = validation.errors.errors;
		}

		// return response to client request
		res.json(returnResponse);
	}

	async editRedemptionChannel(req, res) {
		// returnResponse variable use for returning data to client request
		let returnResponse = {};

		// Format request data
		let form_data = userFormatter.editRedemptionChannel(req);

		// Get validation
		let rules = userValidators.editRedemptionChannel();

		// Check and store validation data
		let validation = new Validator(form_data, rules);

		// Check validation is passed or failed
		if (validation.passes() && !validation.fails()) {

			// call edit redemption channel service and store response in returnResponse variable
			returnResponse = await userService.editRedemptionChannel(form_data);
		} else {

			// store return code and message in returnResponse variable
			returnResponse = responseMessages.form_field_required;

			// Getting errors of validation and store in returnResponse variable
			returnResponse.errors = validation.errors.errors;
		}

		// return response to client request
		res.json(returnResponse);
	}

	async getRedemptionChannel(req, res) {
		// returnResponse variable use for returning data to client request
		let returnResponse = {};

		// Format request data
		let form_data = userFormatter.getRedemptionChannel(req);

		// Get validation
		let rules = userValidators.getRedemptionChannel();

		// Check and store validation data
		let validation = new Validator(form_data, rules);

		// Check validation is passed or failed
		if (validation.passes() && !validation.fails()) {

			// call get redemption channel service and store response in returnResponse variable
			returnResponse = await userService.getRedemptionChannel(form_data);
		} else {

			// store return code and message in returnResponse variable
			returnResponse = responseMessages.form_field_required;

			// Getting errors of validation and store in returnResponse variable
			returnResponse.errors = validation.errors.errors;
		}

		// return response to client request
		res.json(returnResponse);
	}

	async getProfile(req, res) {
		// returnResponse variable use for returning data to client request
		let returnResponse = {};

		// Format request data
		let form_data = userFormatter.getProfile(req);

		// Get validation
		let rules = userValidators.getProfile();

		// Check and store validation data
		let validation = new Validator(form_data, rules);

		// Check validation is passed or failed
		if (validation.passes() && !validation.fails()) {

			// call get profile service and store response in returnResponse variable
			returnResponse = await userService.getProfile(form_data);
		} else {

			// store return code and message in returnResponse variable
			returnResponse = responseMessages.form_field_required;

			// Getting errors of validation and store in returnResponse variable
			returnResponse.errors = validation.errors.errors;
		}

		// return response to client request
		res.json(returnResponse);
	}

	async editProfile(req, res) {
		// returnResponse variable use for returning data to client request
		let returnResponse = {};

		// Format request data
		let form_data = userFormatter.editProfile(req);

		// Get validation
		let rules = userValidators.editProfile();

		// Check and store validation data
		let validation = new Validator(form_data, rules);

		// Check validation is passed or failed
		if (validation.passes() && !validation.fails()) {

			// call edit profile service and store response in returnResponse variable
			returnResponse = await userService.editProfile(form_data);
		} else {

			// store return code and message in returnResponse variable
			returnResponse = responseMessages.form_field_required;

			// Getting errors of validation and store in returnResponse variable
			returnResponse.errors = validation.errors.errors;
		}

		// return response to client request
		res.json(returnResponse);
	}

	async getRuleTypes(req, res) {
		// returnResponse variable use for returning data to client request
		let returnResponse = {};

		// Format request data
		let form_data = userFormatter.getRuleTypes(req);

		// Get validation
		let rules = userValidators.getRuleTypes();

		// Check and store validation data
		let validation = new Validator(form_data, rules);

		// Check validation is passed or failed
		if (validation.passes() && !validation.fails()) {

			// call get rule types service and store response in returnResponse variable
			returnResponse = await userService.getRuleTypes(form_data);
		} else {

			// store return code and message in returnResponse variable
			returnResponse = responseMessages.form_field_required;

			// Getting errors of validation and store in returnResponse variable
			returnResponse.errors = validation.errors.errors;
		}

		// return response to client request
		res.json(returnResponse);
	}

	async addTenantUser(req, res) {
		// returnResponse variable use for returning data to client request
		let returnResponse = {};

		// Format request data
		let form_data = userFormatter.addTenantUser(req);

		// Get validation
		let rules = userValidators.addTenantUser();

		// Check and store validation data
		let validation = new Validator(form_data, rules);

		// Check validation is passed or failed
		if (validation.passes() && !validation.fails()) {

			// call add tenant user service and store response in returnResponse variable
			returnResponse = await userService.addTenantUser(form_data);
		} else {

			// store return code and message in returnResponse variable
			returnResponse = responseMessages.form_field_required;

			// Getting errors of validation and store in returnResponse variable
			returnResponse.errors = validation.errors.errors;
		}

		// return response to client request
		tpResponseHandler.response(req, res, returnResponse);
	}

	async editTenantUser(req, res) {
		// returnResponse variable use for returning data to client request
		let returnResponse = {};

		// Format request data
		let form_data = userFormatter.editTenantUser(req);

		// Get validation
		let rules = userValidators.editTenantUser();

		// Check and store validation data
		let validation = new Validator(form_data.data, rules);

		// Check validation is passed or failed
		if (validation.passes() && !validation.fails()) {

			// call edit tenant user service and store response in returnResponse variable
			returnResponse = await userService.editTenantUser(form_data);
		} else {

			// store return code and message in returnResponse variable
			returnResponse = responseMessages.form_field_required;

			// Getting errors of validation and store in returnResponse variable
			returnResponse.errors = validation.errors.errors;
		}

		// return response to client request
		res.json(returnResponse);
	}

	async getTenantUsersList(req, res) {
		// returnResponse variable use for returning data to client request
		let returnResponse = {};

		// Format request data
		let form_data = userFormatter.getTenantUsersList(req);

		// Get validation
		let rules = userValidators.getTenantUsersList();

		// Check and store validation data
		let validation = new Validator(form_data, rules);

		// Check validation is passed or failed
		if (validation.passes() && !validation.fails()) {

			// call get tenant user list service and store response in returnResponse variable
			returnResponse = await userService.getTenantUsersList(form_data);
		} else {

			// store return code and message in returnResponse variable
			returnResponse = responseMessages.form_field_required;

			// Getting errors of validation and store in returnResponse variable
			returnResponse.errors = validation.errors.errors;
		}

		// return response to client request
		res.json(returnResponse);
	}

	async getTenantUserById(req, res) {
		// returnResponse variable use for returning data to client request
		let returnResponse = {};

		// Format request data
		let form_data = userFormatter.getTenantUserById(req);

		// Get validation
		let rules = userValidators.getTenantUserById();

		// Check and store validation data
		let validation = new Validator(form_data, rules);

		// Check validation is passed or failed
		if (validation.passes() && !validation.fails()) {

			// call get tenant user by id service and store response in returnResponse variable
			returnResponse = await userService.getTenantUserById(form_data);
		} else {

			// store return code and message in returnResponse variable
			returnResponse = responseMessages.form_field_required;

			// Getting errors of validation and store in returnResponse variable
			returnResponse.errors = validation.errors.errors;
		}

		// return response to client request
		res.json(returnResponse);
	}

	async getTenantUserByEmail(req, res) {
		// returnResponse variable use for returning data to client request
		let returnResponse = {};

		// Format request data
		let form_data = userFormatter.getTenantUserByEmail(req);

		// Get validation
		let rules = userValidators.getTenantUserByEmail();

		// Check and store validation data
		let validation = new Validator(form_data, rules);

		// Check validation is passed or failed
		if (validation.passes() && !validation.fails()) {

			// call get tenant user by email service and store response in returnResponse variable
			returnResponse = await userService.getTenantUserByEmail(form_data);
		} else {

			// store return code and message in returnResponse variable
			returnResponse = responseMessages.form_field_required;

			// Getting errors of validation and store in returnResponse variable
			returnResponse.errors = validation.errors.errors;
		}

		// return response to client request
		res.json(returnResponse);
	}

	async updateTenantUserDetails(req, res) {
		console.log("kkkkkkkkkkkkk",req.body)

		// returnResponse variable use for returning data to client request
		let returnResponse = {};

		// Format request data
		let form_data = userFormatter.updateTenantUserDetails(req);

		// Get validation
		let rules = userValidators.updateTenantUserDetails();

		// Check and store validation data
		let validation = new Validator(form_data, rules);

		// Check validation is passed or failed
		if (validation.passes() && !validation.fails()) {

			// call update tenant user details service and store response in returnResponse variable
			returnResponse = await userService.updateTenantUserDetails(form_data);
		} else {

			// store return code and message in returnResponse variable
			returnResponse = responseMessages.form_field_required;

			// Getting errors of validation and store in returnResponse variable
			returnResponse.errors = validation.errors.errors;
		}

		// return response to client request
		res.json(returnResponse);
	}

	async changePassword(req, res) {
		// returnResponse variable use for returning data to client request
		let returnResponse = {};

		// Format request data
		let form_data = userFormatter.changePassword(req);

		// Get validation
		let rules = userValidators.changePassword();

		// Check and store validation data
		let validation = new Validator(form_data, rules);

		// Check validation is passed or failed
		if (validation.passes() && !validation.fails()) {
				 
			// call change password service and store response in returnResponse variable
			returnResponse = await userService.changePassword(form_data);
		} else {

			// store return code and message in returnResponse variable
			returnResponse = responseMessages.form_field_required;

			// Getting errors of validation and store in returnResponse variable
			returnResponse.errors = validation.errors.errors;
		}

		// return response to client request
		res.json(returnResponse);
	}

	async getGroupCodes(req, res) {
		// returnResponse variable use for returning data to client request
		let returnResponse = {};

		// Format request data
		let form_data = userFormatter.getGroupCodes(req);

		// Get validation
		let rules = userValidators.getGroupCodes();

		// Check and store validation data
		let validation = new Validator(form_data, rules);

		// Check validation is passed or failed
		if (validation.passes() && !validation.fails()) {

			// call get group codes service and store response in returnResponse variable
			returnResponse = await userService.getGroupCodes(form_data);
		} else {

			// store return code and message in returnResponse variable
			returnResponse = responseMessages.form_field_required;

			// Getting errors of validation and store in returnResponse variable
			returnResponse.errors = validation.errors.errors;
		}

		// return response to client request
		res.json(returnResponse);
	}

	async getTenantBranchList(req, res) {
		// returnResponse variable use for returning data to client request
		let returnResponse = {};

		// Format request data
		let form_data = userFormatter.getTenantBranchList(req);

		// Get validation
		let rules = userValidators.getTenantBranchList();

		// Check and store validation data
		let validation = new Validator(form_data, rules);

		// Check validation is passed or failed
		if (validation.passes() && !validation.fails()) {

			// call get tenant branch list service and store response in returnResponse variable
			returnResponse = await userService.getTenantBranchList(form_data);
		} else {

			// store return code and message in returnResponse variable
			returnResponse = responseMessages.form_field_required;

			// Getting errors of validation and store in returnResponse variable
			returnResponse.errors = validation.errors.errors;
		}

		// return response to client request
		res.json(returnResponse);
	}

	async getDashboardCount(req, res) {
		// returnResponse variable use for returning data to client request
		let returnResponse = {};

		// Format request data
		let form_data = userFormatter.getDashboardCount(req);

		// Get validation
		let rules = userValidators.getDashboardCount();

		// Check and store validation data
		let validation = new Validator(form_data, rules);

		// Check validation is passed or failed
		if (validation.passes() && !validation.fails()) {

			// call get dashboard count service and store response in returnResponse variable
			returnResponse = await userService.getDashboardCount(form_data);
		} else {

			// store return code and message in returnResponse variable
			returnResponse = responseMessages.form_field_required;

			// Getting errors of validation and store in returnResponse variable
			returnResponse.errors = validation.errors.errors;
		}

		// return response to client request
		res.json(returnResponse);
	}

	async getDashboardGraph(req, res) {
		// returnResponse variable use for returning data to client request
		let returnResponse = {};

		// Format request data
		let form_data = userFormatter.getDashboardGraph(req);

		// Get validation
		let rules = userValidators.getDashboardGraph();

		// Check and store validation data
		let validation = new Validator(form_data, rules);

		// Check validation is passed or failed
		if (validation.passes() && !validation.fails()) {

			// call get dashboard graph service and store response in returnResponse variable
			returnResponse = await userService.getDashboardGraph(form_data);
		} else {

			// store return code and message in returnResponse variable
			returnResponse = responseMessages.form_field_required;

			// Getting errors of validation and store in returnResponse variable
			returnResponse.errors = validation.errors.errors;
		}

		// return response to client request
		res.json(returnResponse);
	}

	async test(req, res) {
		// returnResponse variable use for returning data to client request
		let returnResponse = {};

		// Format request data
		let form_data = userFormatter.test(req);

		// Get validation
		let rules = userValidators.test();

		// Check and store validation data
		let validation = new Validator(form_data, rules);

		// Check validation is passed or failed
		if (validation.passes() && !validation.fails()) {

			// call get test service and store response in returnResponse variable
			returnResponse = await userService.test(form_data);
		} else {

			// store return code and message in returnResponse variable
			returnResponse = responseMessages.form_field_required;

			// Getting errors of validation and store in returnResponse variable
			returnResponse.errors = validation.errors.errors;
		}

		// return response to client request
		res.json(returnResponse);
	}

	async unlockAssignPoint(req, res) {
		// returnResponse variable use for returning data to client request
		let returnResponse = {};

		// Format request data
		let form_data = userFormatter.unlockAssignPoint(req);

		// Get validation
		let rules = userValidators.unlockAssignPoint();

		// Check and store validation data
		let validation = new Validator(form_data, rules);

		// Check validation is passed or failed
		if (validation.passes() && !validation.fails()) {

			// call unlock assign point service and store response in returnResponse variable
			returnResponse = await userService.unlockAssignPoint(form_data);
		} else {

			// store return code and message in returnResponse variable
			returnResponse = responseMessages.form_field_required;

			// Getting errors of validation and store in returnResponse variable
			returnResponse.errors = validation.errors.errors;
		}

		// return response to client request
		res.json(returnResponse);
	}

	async pointRedeemTenant(req, res) {
		// returnResponse variable use for returning data to client request
		let returnResponse = {};

		// Format request data
		let form_data = userFormatter.pointRedeemTenant(req);

		// Get validation
		let rules = userValidators.pointRedeemTenant();

		// Check and store validation data
		let validation = new Validator(form_data, rules);

		// Check validation is passed or failed
		if (validation.passes() && !validation.fails()) {

			// call point redeem tenant service and store response in returnResponse variable
			returnResponse = await userService.pointRedeemTenant(form_data);
		} else {

			// store return code and message in returnResponse variable
			returnResponse = responseMessages.form_field_required;

			// Getting errors of validation and store in returnResponse variable
			returnResponse.errors = validation.errors.errors;
		}

		// return response to client request
		res.json(returnResponse);
	}

	async getEmailTrackDetails(req, res) {
		// returnResponse variable use for returning data to client request
		let returnResponse = {};

		// Format request data
		let form_data = userFormatter.getEmailTrackDetails(req);

		// Get validation
		let rules = userValidators.getEmailTrackDetails();

		// Check and store validation data
		let validation = new Validator(form_data, rules);

		// Check validation is passed or failed
		if (validation.passes() && !validation.fails()) {

			// call get email track details service and store response in returnResponse variable
			returnResponse = await userService.getEmailTrackDetails(form_data);
		} else {

			// store return code and message in returnResponse variable
			returnResponse = responseMessages.form_field_required;

			// Getting errors of validation and store in returnResponse variable
			returnResponse.errors = validation.errors.errors;
		}

		// return response to client request
		res.json(returnResponse);
	}

	async overallPoints(req, res) {
		let returnResponse = {};
		let form_data = userFormatter.overallPoints(req);
		let rules = userValidators.overallPoints();
		let validation = new Validator(form_data, rules);

		if (validation.passes() && !validation.fails()) {
			returnResponse = await userService.overallPoints(form_data);
		} else {
			returnResponse = responseMessages.form_field_required;
			returnResponse.errors = validation.errors.errors;
		}
		res.json(returnResponse);
	}
}