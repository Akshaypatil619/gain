"use strict";
let Validator = require('validatorjs');
let cronFormatter = new (require('../formatters/cron.formatter'))();
let cronValidators = new (require("../validators/cron.validators"));
let responseMessages = require("../response/cron.response");
const model = new (require('../models/cron_model'))();

 let property_service = new (require('../../gains/services/property.service'))();
 let building_service = new (require('../../gains/services/building.service'))();
 let unit_service = new (require('../../gains/services/unit.service'))();

 let tenant_service = new (require('../../gains/services/tenant.service'))();


module.exports = class CronController {

    constructor() { }

    async syncProperty(req, res) {
        let returnResponse = {};
        let formData = cronFormatter.syncProperty(req);
        let rules = cronValidators.syncProperty();
        let validation = new Validator(formData, rules);
        if (validation.passes() && !validation.fails()) {
            returnResponse = await property_service.syncProperty();
            console.log("in r=", returnResponse);
        }
        else returnResponse =responseMessages.form_field_required;

        res.json(returnResponse);
    }


    async syncBuilding(req, res) {
        let returnResponse = {};
        let formData = cronFormatter.syncBuilding(req);
        let rules = cronValidators.syncBuilding();
        let validation = new Validator(formData, rules);
        if (validation.passes() && !validation.fails()) {
            returnResponse = await building_service.syncBuilding();

        }
        else returnResponse =responseMessages.form_field_required;

        res.json(returnResponse);
    }



    async syncUnit(req, res) {
        let returnResponse = {};
        let formData = cronFormatter.syncUnit(req);
        let rules = cronValidators.syncUnit();
        let validation = new Validator(formData, rules);
        if (validation.passes() && !validation.fails()) {
            returnResponse = await unit_service.syncUnit(req, res);
            // if (returnResponse instanceof Array && returnResponse.length > 0) {
            //     await gainsModel.sendWelcomeEmail(req, res, returnResponse);
            // }
        }
        else returnResponse = responseMessages.form_field_required;

        res.json(returnResponse);
    }



    async syncTenant(req, res) {
        let returnResponse = {};
        let formData = cronFormatter.syncTenant(req);
        let rules = cronValidators.syncTenant();
        let validation = new Validator(formData, rules);
        if (validation.passes() && !validation.fails()){
            returnResponse = await tenant_service.syncTenant(req, res);
            res.json(returnResponse);
          
        }
        else returnResponse =responseMessages.form_field_required;
    }
    async getBrandList (req, res) {
        console.log("in brand zzz",req.query);
        let return_response = {};

        const formData = cronFormatter.getBrandList(req);
        const rules = cronValidators.getBrandList();

        const validation = new Validator(formData, rules);
        if (validation.passes() && !validation.fails()) {

            return_response = await model.getBrandList(formData);

        } else {
            return_response = response.failed('form_fields_required');
            return_response = validation.errors.errors;
        }

        res.json(return_response);
    }

};
