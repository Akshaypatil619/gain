let root_folder = "../../../../../";
let Validator = require("validatorjs");
let userRoleFormatter = new (require("../formatters/user_role.formatter"));
let userRoleValidators = new (require("../validators/user_role.validator"));
let userRoleService = new (require("../services/user_role.service"));
let responseMessages = require("../responses/user_role.response");
module.exports = class UserRoleController {

    async addTenantUserRole(req, res) {
        console.log("ooooooo",req.body)
        // returnResponse variable use for returning data to client request
        let returnResponse = {};

        // Format request data
        let form_data = userRoleFormatter.addTenantUserRole(req);

        // Getting customer validation
        let rules = userRoleValidators.addTenantUserRole('');

        // Check and store validation data
        let validation = new Validator(form_data['data'], rules);

        // Check validation is passed or failed
        if (validation.passes() && !validation.fails()) {

            // call add customer service and store response in returnResponse variable
            returnResponse = await userRoleService.addTenantUserRole(form_data);

        } else {

            // store return code and message in returnResponse variable
            returnResponse = responseMessages.form_field_required;

            // Getting errors of validation and store in returnResponse variable
            returnResponse.errors = validation.errors.errors;
        }

        // return response to client request
        res.json(returnResponse);
    }

    async editTenantUserRole(req, res) {
        // returnResponse variable use for returning data to client request
        let returnResponse = {};

        // Format request data
        let form_data = userRoleFormatter.editTenantUserRole(req);

        // Getting customer validation
        let rules = userRoleValidators.editTenantUserRole('');

        // Check and store validation data
        let validation = new Validator(form_data['data'], rules);

        // Check validation is passed or failed
        if (validation.passes() && !validation.fails()) {

            // call add customer service and store response in returnResponse variable
            returnResponse = await userRoleService.editTenantUserRole(form_data);

        } else {

            // store return code and message in returnResponse variable
            returnResponse = responseMessages.form_field_required;

            // Getting errors of validation and store in returnResponse variable
            returnResponse.errors = validation.errors.errors;
        }

        // return response to client request
        res.json(returnResponse);
    }

    async getTenantUserRolesList(req, res) {
        // returnResponse variable use for returning data to client request
        let returnResponse = {};

        // Format request data
        let form_data = userRoleFormatter.getTenantUserRolesList(req);

        // Getting customer validation
        let rules = userRoleValidators.getTenantUserRolesList('');

        // Check and store validation data
        let validation = new Validator(form_data, rules);

        // Check validation is passed or failed
        if (validation.passes() && !validation.fails()) {

            // call add customer service and store response in returnResponse variable
            returnResponse = await userRoleService.getTenantUserRolesList(form_data);

        } else {

            // store return code and message in returnResponse variable
            returnResponse = responseMessages.form_field_required;

            // Getting errors of validation and store in returnResponse variable
            returnResponse.errors = validation.errors.errors;
        }

        // return response to client request
        res.json(returnResponse);
    }

    async getTenantUserRoleById(req, res) {
        // returnResponse variable use for returning data to client request
        let returnResponse = {};

        // Format request data
        let form_data = userRoleFormatter.getTenantUserRoleById(req);

        // Getting customer validation
        let rules = userRoleValidators.getTenantUserRoleById('');

        // Check and store validation data
        let validation = new Validator(form_data, rules);

        // Check validation is passed or failed
        if (validation.passes() && !validation.fails()) {

            // call add customer service and store response in returnResponse variable
            returnResponse = await userRoleService.getTenantUserRoleById(form_data);

        } else {

            // store return code and message in returnResponse variable
            returnResponse = responseMessages.form_field_required;

            // Getting errors of validation and store in returnResponse variable
            returnResponse.errors = validation.errors.errors;
        }

        // return response to client request
        res.json(returnResponse);
    }

    async updateStatus(req, res) {
        // returnResponse variable use for returning data to client request
        let returnResponse = {};

        // Format request data
        let form_data = userRoleFormatter.updateStatus(req);

        // Getting customer validation
        let rules = userRoleValidators.updateStatus('');

        // Check and store validation data
        let validation = new Validator(form_data['data'], rules);

        // Check validation is passed or failed
        if (validation.passes() && !validation.fails()) {

            // call add customer service and store response in returnResponse variable
            returnResponse = await userRoleService.updateStatus(form_data);

        } else {

            // store return code and message in returnResponse variable
            returnResponse = responseMessages.form_field_required;

            // Getting errors of validation and store in returnResponse variable
            returnResponse.errors = validation.errors.errors;
        }

        // return response to client request
        res.json(returnResponse);
    }
}