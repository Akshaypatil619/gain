'use strict';
let Validator = require('validatorjs');
let unit_master_service = new (require('../services/unit_master.service'))();
let unit_master_formatter = new (require('../formatters/unit_master.formatter'))();
let unit_master_validator = new (require('../validators/unit_master.validator'))();
let unit_master_response = require('../responses/unit_master.response');
module.exports = class UnitMasterController {
    constructor() { }

    async get_all_unit_master(req, res) {
        let returnResponse = {};
        let formData = unit_master_formatter.get_all_unit_master(req);
        let rules = unit_master_validator.get_all_unit_master();
        let validation = new Validator(formData, rules);
        if (validation.passes() && !validation.fails())
            returnResponse = await unit_master_service.get_all_unit_master(formData);
        else returnResponse = unit_master_response.failed('form_fields_required', validation.errors.errors);

        res.json(returnResponse);
    }

    async get_rent_unit_list(req, res) {
        let returnResponse = {};
        let formData = unit_master_formatter.get_rent_unit_list(req);
        let rules = unit_master_validator.get_rent_unit_list();
        let validation = new Validator(formData, rules);
        if (validation.passes() && !validation.fails())
            returnResponse = await unit_master_service.get_rent_unit_list(formData);
        else returnResponse = unit_master_response.failed('form_fields_required', validation.errors.errors);

        res.json(returnResponse);
    }


    async get_owner_unit_list(req, res) {
        let returnResponse = {};
        let formData = unit_master_formatter.get_rent_unit_list(req);
        let rules = unit_master_validator.get_rent_unit_list();
        let validation = new Validator(formData, rules);
        if (validation.passes() && !validation.fails())
            returnResponse = await unit_master_service.get_owner_unit_list(formData);
        else returnResponse = unit_master_response.failed('form_fields_required', validation.errors.errors);

        res.json(returnResponse);
    }
}