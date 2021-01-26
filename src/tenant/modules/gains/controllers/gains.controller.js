'use strict';
let Validator = require('validatorjs');
let gainsService = new (require('../services/gains.service'))();
let property_service = new (require('../services/property.service'))();
let building_service = new (require('../services/building.service'))();
let unit_service = new (require('../services/unit.service'))();
let broker_service = new (require('../services/broker.service'))();
let tenant_service = new (require('../services/tenant.service'))();
let oam_service = new (require('../services/oam.service'))();
let gainsFormatter = new (require('../formatters/gains.formatter'))();
let gainsValidator = new (require('../validators/gains.validator'))();
let gainsResponse = require('../responses/gains.response');

module.exports = class gainsController { 
    constructor() { }

    async syncCustomers(req, res) {
        let returnResponse = {};
        let formData = gainsFormatter.syncCustomers(req);
        let rules = gainsValidator.syncCustomers();
        let validation = new Validator(formData, rules);
        if (validation.passes() && !validation.fails())
            gainsService.syncCustomers(req,res,formData);
        else returnResponse = gainsResponse.failed('form_fields_required', validation.errors.errors);
        
        res.json(gainsResponse.success("file_processing_in_progress"));
        // res.json(returnResponse);
    }

    async syncOAM(req, res) {
        let returnResponse = {};
        let formData = gainsFormatter.syncOAM(req);
        let rules = gainsValidator.syncOAM();
        let validation = new Validator(formData, rules);
        if (validation.passes() && !validation.fails())
        {
            await oam_service.syncOAM(req, res);
            res.json(gainsResponse.success("file_processing_in_progress"));
        }
        else returnResponse = gainsResponse.failed('form_fields_required', validation.errors.errors);

        res.json(returnResponse);
    }
    async syncProperty(req, res) {
        let returnResponse = {};
        let formData = gainsFormatter.syncProperty(req);
        let rules = gainsValidator.syncProperty();
        let validation = new Validator(formData, rules);
        if (validation.passes() && !validation.fails())
        {
            property_service.syncProperty();
            res.json(gainsResponse.success("file_processing_in_progress"));
        }
        else returnResponse = gainsResponse.failed('form_fields_required', validation.errors.errors);

        res.json(returnResponse);
    }


    async syncBuilding(req, res) {
        let returnResponse = {};
        let formData = gainsFormatter.syncBuilding(req);
        let rules = gainsValidator.syncBuilding();
        let validation = new Validator(formData, rules);
        if (validation.passes() && !validation.fails())
        {
            building_service.syncBuilding();
            res.json(gainsResponse.success("file_processing_in_progress"));
        }
        else returnResponse = gainsResponse.failed('form_fields_required', validation.errors.errors);

        res.json(returnResponse);
    }



    async syncUnit(req, res) {
        console.log("req.activity_detai ctrl=",req.activity_detail);    
        let returnResponse = {};
        let formData = gainsFormatter.syncUnit(req);
        let rules = gainsValidator.syncUnit();
        let validation = new Validator(formData, rules);
        if (validation.passes() && !validation.fails())
        {
            unit_service.syncUnit(req, res);
            res.json(gainsResponse.success("file_processing_in_progress"));
            // if (returnResponse instanceof Array && returnResponse.length>0){
            //     await gainsModel.sendWelcomeEmail(req,res,returnResponse);
            // }
        }
        else returnResponse = gainsResponse.failed('form_fields_required', validation.errors.errors);

        res.json(returnResponse);
    }



    async syncBroker(req, res) {
        let returnResponse = {};
        let formData = gainsFormatter.syncBroker(req);
        let rules = gainsValidator.syncBroker();
        let validation = new Validator(formData, rules);
        if (validation.passes() && !validation.fails())
        {
            broker_service.syncBroker();
            res.json(gainsResponse.success("file_processing_in_progress"));
        }
        else returnResponse = gainsResponse.failed('form_fields_required', validation.errors.errors);

        res.json(returnResponse);
    }

    async syncTenant(req, res) {
        let returnResponse = {};
        let formData = gainsFormatter.syncTenant(req);
        let rules = gainsValidator.syncTenant();
        let validation = new Validator(formData, rules);
        if (validation.passes() && !validation.fails()){
            tenant_service.syncTenant(req, res);
            res.json(gainsResponse.success("file_processing_in_progress"));
        }
        else returnResponse = gainsResponse.failed('form_fields_required', validation.errors.errors);
    }


}