'use strict';
let Validator = require('validatorjs');
let organization_model = new (require('../models/organization.mysql'))();
let organization_formatter = new (require('../formatters/organization.formatter'))();
let organization_validator = new (require('../validators/organization.validator'))();
let organization_response = require('../responses/organization.response');
let config = require("../../../../../config/config");

module.exports = class OrganizationController {
    constructor() { }

    async add_organization(req, res) {
        let return_result = {};
        let form_data = organization_formatter.add_organization(req);
        let rules = organization_validator.add_organization();
        let validation = new Validator(form_data, rules);
        if (validation.passes() && !validation.fails()) {
            let organization = await organization_model.add_organization("add_organization_exist",form_data);
            if (organization.length>0) {
                return res.json(organization_response.failed("organization_exist", return_result));
            } else {
                organization = await organization_model.add_organization("add_organization",form_data);
                if(organization){
                    return res.json(organization_response.success("organization_created"));
                } else {
                    return res.json(organization_response.failed("organization_created_failed"));
                }
            }
        } else {
            return res.json(organization_response.failed('form_fields_required', validation.errors.errors));
        } 
    };

    async get_organization(req, res) {
        let form_data = organization_formatter.get_organization(req);
        let rules = organization_validator.get_organization();
        let validation = new Validator(form_data, rules);
        if (validation.passes() && !validation.fails()) {
            let organization = await organization_model.get_organization("get_organization",form_data);
            if (organization.length>0) {
                return res.json(organization_response.success("organization_found", organization));
            } else {
                return res.json(organization_response.failed("organization_not_found"));
            }
        } else {
            return res.json(organization_response.failed('form_fields_required', validation.errors.errors));
        } 
    };

    async edit_organization(req, res) {
        let form_data = organization_formatter.edit_organization(req);
        let rules = organization_validator.edit_organization();
        let validation = new Validator(form_data, rules);
        if (validation.passes() && !validation.fails()) {
            let organization = await organization_model.edit_organization("edit_organization_exist",form_data);
            if (organization = undefined && organization.length>0) {
                console.log("oooooooo",organization.length)
                return res.json(organization_response.success("organization_updated", organization));
            } else {
                organization = await organization_model.edit_organization("edit_organization",form_data);
                if(organization>0){
                  
                    let response_data = await organization_response.success("organization_updated", organization); 
                    return res.json(organization_response.success("organization_updated"));
                } else {
                    return res.json(organization_response.failed("organization_updated_failed"));
                }
            }
        } else {
            return res.json(organization_response.failed('form_fields_required', validation.errors.errors));
        } 
    };
  
    async list_organization(req, res) {
        let return_result = {};
        let form_data = organization_formatter.list_organization(req);
        let rules = organization_validator.list_organization();
        let validation = new Validator(form_data, rules);
        if (validation.passes() && !validation.fails()) {
            return_result.total_records = (await organization_model.list_organization("list_organization",form_data)).length;
            if ((return_result.total_records > 0)) {
                     let organization_list = await organization_model.list_organization("list_organization",form_data)
                        .limit(parseInt(form_data['limit']))
                        .offset(parseInt(form_data['offset']));
                        return_result.organization_list = organization_list;
                    return res.json(organization_response.success("organization_found", return_result));
            } else {
                return res.json(organization_response.failed("organization_found", return_result));
            }
        } else {
            return res.json(organization_response.failed('form_fields_required', validation.errors.errors));
        } 
    }
}
