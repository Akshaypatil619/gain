"use strict";
let Validator = require('validatorjs');
let MemberTypeService = require("../services/member_type.services");
let memberTypeService = new MemberTypeService();
let memberTypeFormatter = new (require('../formatters/member_type.formatter'))();
let memberTypeValidator = new (require("../validators/member_type.validators"));
let responseMessages = require("../response/member_type.response");
module.exports = class Member_Type_Controller {
    /**
     * Constructor
     */
    constructor() { }
    /**
     * add member_type
     * @param req
     * @param res
     * @returns {Promise<void>}
     */
    async add_member_type(req, res) {
        // returnResponse variable use for returning data to client request
        let returnResponse = {};
        // Format request data
        let form_data = memberTypeFormatter.add_member_type(req);
        let rules = memberTypeValidator.add_member_type('member_type');
        let validation = new Validator(form_data['member_type'], rules);
        // Check validation is passed or failed
        if (validation.passes() && !validation.fails()) {
            returnResponse = await memberTypeService.add_member_type(form_data);
        } else {
            // store return code and message in returnResponse variable
            returnResponse = responseMessages.form_field_required;
            // Getting errors of validation and store in returnResponse variable
            returnResponse.errors = validation.errors.errors;
        }
        // return response to client request
        res.json(returnResponse);
    };

    /**
     * Get all member type list
     *
     * @param {*} req
     * @param {*} res
     * @returns {Promise<void>}
     */
    async get_member_type(req, res) {
        // returnResponse variable use for returning data to client request
        let returnResponse = {}
        // Format request data
        let form_data = memberTypeFormatter.get_member_type(req);
        // Getting ruleActivity Validator
        let rules = memberTypeValidator.get_member_type('member_type');
        // Check and store validation data
        let validation = new Validator(form_data, rules);
        // Check validation is passed or failed
        if (validation.passes() && !validation.fails()) {
            /**
             * Validation success
             */
            returnResponse = await memberTypeService.get_member_type(form_data);
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
     * Edit Member Type
     *
     * @param req
     * @param res
     * @returns {Promise<void>}
     */
    async edit_member_type(req, res) {
        // returnResponse variable use for returning data to client request
        let returnResponse = {}

        // Format request data
        let form_data = memberTypeFormatter.edit_member_type(req);
        // Getting member type validation
        let rules = memberTypeValidator.edit_member_type('member_type');

        // Check and store validation data
        let validation = new Validator(form_data['member_type'], rules);

        // Check validation is passed or failed
        if (validation.passes() && !validation.fails()) {
            /**
             * Validation success
             */
            // call add member service and store response in returnResponse variable
            returnResponse = await memberTypeService.edit_member_type(form_data);
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
  * Get member_type by id
  *
  * @param {*} req
  * @param {*} res
  * @returns {Promise<void>}
  */
 async get_member_type_by_id(req, res) {
    // returnResponse variable use for returning data to client request
    let returnResponse = {}
    // Format request data
    let form_data = memberTypeFormatter.get_member_type_by_id(req);


    // Getting member type validation
    let rules = memberTypeValidator.get_member_type_by_id('member_type');

    // Check and store validation data
    let validation = new Validator(form_data.member_type, rules);
    // Check validation is passed or failed
    if (validation.passes() && !validation.fails()) {
        /**
         * Validation success
         */
        // call add member type service and store response in returnResponse variable
        returnResponse = await memberTypeService.get_member_type_by_id(form_data);
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
     *  Member Type Status
     *
     * @param req
     * @param res
     * @returns {Promise<void>}
     */
    async member_type_status(req, res) {
        // returnResponse variable use for returning data to client request
        let returnResponse = {}

        // Format request data
        let form_data = memberTypeFormatter.member_type_status(req);
        // Getting member type validation
        let rules = memberTypeValidator.member_type_status('member_type');

        // Check and store validation data
        let validation = new Validator(form_data['member_type'], rules);

        // Check validation is passed or failed
        if (validation.passes() && !validation.fails()) {
            /**
             * Validation success
             */
            // call add member service and store response in returnResponse variable
            returnResponse = await memberTypeService.member_type_status(form_data);
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

}
