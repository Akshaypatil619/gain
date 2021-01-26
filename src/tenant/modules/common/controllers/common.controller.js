'use strict';
let Validator = require('validatorjs');
let commonService = new (require('../services/common.service'))();
let commonFormatter = new (require('../formatters/common.formatter'))();
let commonValidator = new (require('../validators/common.validator'))();
let commonResponse = require('../responses/common.response');
module.exports = class commonController { 
    constructor() { }

    async getEmirateList(req, res) {
        let returnResponse = {};
        let formData = commonFormatter.getCommonList(req);
        let rules = commonValidator.getCommonList();
        let validation = new Validator(formData, rules);
        if (validation.passes() && !validation.fails())
            returnResponse = await commonService.getEmirate(formData);
        else returnResponse = commonResponse.failed('form_fields_required', validation.errors.errors);

        res.json(returnResponse);
    }

    async getCurriculumlist(req, res) {
        let returnResponse = {};
        let formData = commonFormatter.getCommonList(req);
        let rules = commonValidator.getCommonList();
        let validation = new Validator(formData, rules);
        if (validation.passes() && !validation.fails())
            returnResponse = await commonService.getCurriculum(formData);
        else returnResponse = commonResponse.failed('form_fields_required', validation.errors.errors);

        res.json(returnResponse);
    }
}