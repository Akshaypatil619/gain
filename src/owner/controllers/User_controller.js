const formatter = new (require('../formatters/user.formatter'))();
const validator = new (require('../validators/user.validator'))();
const model = new (require('../models/User_model'))();
const response = require('../response/user.response');
const Validator = require('validatorjs');

module.exports = class User_controller {

    constructor() {}

    async get_property_list(req, res) {
        let return_response = {};

        const formData = formatter.get_property_list(req);
        const rules = validator.get_property_list();

        const validation = new Validator(formData, rules);
        if (validation.passes() && !validation.fails()) {

            return_response = await model.get_property_list(formData);

        } else {
            return_response = response.failed('form_fields_required');
            return_response = validation.errors.errors;
        }

        res.json(return_response);
    }

    async get_building_list(req, res) {
        let return_response = {};

        const formData = formatter.get_building_list(req);
        const rules = validator.get_building_list();

        const validation = new Validator(formData, rules);
        if (validation.passes() && !validation.fails()) {

            return_response = await model.get_building_list(formData);

        } else {
            return_response = response.failed('form_fields_required');
            return_response = validation.errors.errors;
        }

        res.json(return_response);
    }
    async get_all_building_list(req, res) {
        let return_response = {};

        const formData = formatter.get_all_building_list(req);
        const rules = validator.get_all_building_list();

        const validation = new Validator(formData, rules);
        if (validation.passes() && !validation.fails()) {

            return_response = await model.get_all_building_list(formData);

        } else {
            return_response = response.failed('form_fields_required');
            return_response = validation.errors.errors;
        }

        res.json(return_response);
    }
    async getBrandList (req, res) {
        console.log("in brand");
        let return_response = {};

        const formData = formatter.getBrandList(req);
        const rules = validator.getBrandList();

        const validation = new Validator(formData, rules);
        if (validation.passes() && !validation.fails()) {

            return_response = await model.getBrandList(formData);

        } else {
            return_response = response.failed('form_fields_required');
            return_response = validation.errors.errors;
        }

        res.json(return_response);
    }

    async get_all_oam_list(req, res) {
        let return_response = {};

        const formData = formatter.get_all_oam_list(req);
        const rules = validator.get_all_oam_list();

        const validation = new Validator(formData, rules);
        if (validation.passes() && !validation.fails()) {

            return_response = await model.get_all_oam_list(formData);

        } else {
            return_response = response.failed('form_fields_required');
            return_response = validation.errors.errors;
        }

        res.json(return_response);
    }

    async get_property_type(req, res) {
        let return_response = {};

        const formData = formatter.get_property_type(req);
        const rules = validator.get_property_type();

        const validation = new Validator(formData, rules);
        if (validation.passes() && !validation.fails()) {

            return_response = await model.get_property_type(formData);

        } else {
            return_response = response.failed('form_fields_required');
            return_response = validation.errors.errors;
        }

        res.json(return_response);
    }

    async get_unit_list(req, res) {
        let return_response = {};

        const formData = formatter.get_unit_list(req);
        const rules = validator.get_unit_list();

        const validation = new Validator(formData, rules);
        if (validation.passes() && !validation.fails()) {

            return_response = await model.get_unit_list(formData);

        } else {
            return_response = response.failed('form_fields_required');
            return_response = validation.errors.errors;
        }

        res.json(return_response);
    }

    async get_unit_total_list(req, res) {
        let return_response = {};

        const formData = formatter.get_unit_total_list(req);
        const rules = validator.get_unit_total_list();

        const validation = new Validator(formData, rules);
        if (validation.passes() && !validation.fails()) {

            return_response = await model.get_unit_total_list(formData);

        } else {
            return_response = response.failed('form_fields_required');
            return_response = validation.errors.errors;
        }

        res.json(return_response);
    }

    async unit_rent_list(req, res) {
        let return_response = {};

        const formData = formatter.unit_rent_list(req);
        const rules = validator.unit_rent_list();

        const validation = new Validator(formData, rules);
        if (validation.passes() && !validation.fails()) {

            return_response = await model.unit_rent_list(formData);

        } else {
            return_response = response.failed('form_fields_required');
            return_response = validation.errors.errors;
        }

        res.json(return_response);
    }

    async updateUnitType(req, res) {
        let return_response = {};

        const formData = formatter.updateUnitType(req);
        const rules = validator.updateUnitType();

        const validation = new Validator(formData, rules);
        if (validation.passes() && !validation.fails()) {
            return_response = await model.updateUnitType(formData);
        } else {
            return_response = response.failed('form_fields_required');
            return_response = validation.errors.errors;
        }

        res.json(return_response);
    }

    async updateHotSelling(req, res) {
        let return_response = {};

        const formData = formatter.updateHotSelling(req);
        const rules = validator.updateHotSelling();

        const validation = new Validator(formData, rules);
        if (validation.passes() && !validation.fails()) {
            return_response = await model.updateHotSelling(formData);
        } else {
            return_response = response.failed('form_fields_required');
            return_response = validation.errors.errors;
        }
        res.json(return_response);
    }

}