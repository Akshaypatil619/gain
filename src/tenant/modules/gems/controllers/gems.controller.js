'use strict';
let Validator = require('validatorjs');
let gemsService = new (require('../services/gems.service'))();
let gemsFormatter = new (require('../formatters/gems.formatter'))();
let gemsValidator = new (require('../validators/gems.validator'))();
let gemsResponse = require('../responses/gems.response');
module.exports = class gemsController { 
    constructor() { }

    async syncCustomers(req, res) {
        let returnResponse = {};
        let formData = gemsFormatter.syncCustomers(req);
        let rules = gemsValidator.syncCustomers();
        let validation = new Validator(formData, rules);
        if (validation.passes() && !validation.fails())
            returnResponse = await gemsService.syncCustomers(formData);
        else returnResponse = gemsResponse.failed('form_fields_required', validation.errors.errors);

        res.json(returnResponse);
    }

    async getPendingCustomers(req, res) {
        let returnResponse = {};
        let formData = {};
        let rules = {};
        let validation = new Validator(formData, rules);
        if (validation.passes() && !validation.fails())
            returnResponse = await gemsService.getPendingCustomers(formData);
        else returnResponse = gemsResponse.failed('form_fields_required', validation.errors.errors);

        res.json(returnResponse);
    }

    async updateProcessStatus(req, res) {
        let returnResponse = {};
        let formData = gemsFormatter.processStatus(req);
        let rules = gemsValidator.processStatus();
        let validation = new Validator(formData, rules);
        if (validation.passes() && !validation.fails())
            returnResponse = await gemsService.updateProcessStatus(formData);
        else returnResponse = gemsResponse.failed('form_fields_required', validation.errors.errors);

        res.json(returnResponse);
    }

    async migrateCustomers(req, res) {
        let returnResponse = {};
        let formData = {};
        let rules = {};
        let validation = new Validator(formData, rules);
        if(validation.passes() && !validation.fails())
            returnResponse = await gemsService.migrateCustomers(formData);
        else returnResponse = gemsResponse.failed('form_fields_required', validation.errors.errors);

        res.json(returnResponse);
    }

    async processPoints(req, res) {
        let returnResponse = {};
        returnResponse = await gemsService.processPoints();

        res.json(returnResponse);
    }

    async customerReports(req, res) {
        let formData = gemsFormatter.customReports(req);
        res.json(await gemsService.customerReports(formData));
    }

    async fnfReports(req, res) {
        let formData = gemsFormatter.customReports(req);
        res.json(await gemsService.fnfReports(formData));
    }

    async loginReports(req, res) {
        let formData = gemsFormatter.customReports(req);
        res.json(await gemsService.loginReports(formData))
    }

    async customerDump(req, res) {
		let formData = gemsFormatter.customerDump(req);
        res.json(await gemsService.customerDump(formData));
    }
}