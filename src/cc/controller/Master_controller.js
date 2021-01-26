

const formatter = new (require('../formatters/master.formatter'))();
const validator = new (require('../validator/master.validator'))();
const model = new (require('../model/master.model'))();

const response = require('../response/master.response');
let response_handler = new (require('../../core/ResponseHandler'))();
const Validator = require('validatorjs');



module.exports = class Master_controller {
    constructor() {
    }


    async get_master_list(req, res) {

    
        let return_response = {};

        const formData = formatter.get_master_list(req);
        const rules = validator.get_master_list();

        const validation = new Validator(formData, rules);
        if (validation.passes() && !validation.fails()) {

            return_response = await model.get_master_list(formData);

        } else {
            return_response = response.failed('form_fields_required');
            return_response = validation.errors.errors;
        }

        res.json(return_response);
    }


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

    async get_property_suggession(req, res) {
        let return_response = {};
        const formData = formatter.get_property_suggession(req);
        const rules = validator.get_property_suggession();
        const validation = new Validator(formData, rules);
        if (validation.passes() && !validation.fails()) {
            return_response = await model.get_property_suggession(formData);
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

    async addFamily(req, res) {
        let return_response = {};

        const formData = formatter.addFamily(req);
        const rules = validator.addFamily();
        const validation = new Validator(formData, rules);
        if (validation.passes() && !validation.fails()) {
            return_response = await model.addFamily(formData);
            if(return_response['status']==true){
                return_response['email_data'] = {email: formData.email, mobile: formData.phone, user_name: formData.first_name+" "+formData.last_name, language_code: "EN"  };
                return_response['sms_data'] = {email: formData.email, mobile: formData.phone, user_name: formData.first_name+" "+formData.last_name, language_code: "EN" };
                return response_handler.response(req, res, (return_response));
            } else {
                return response_handler.response(req, res, (return_response));
            }
        } else {
            return_response = response.failed('form_fields_required');
            return_response = validation.errors.errors;
            return response_handler.response(req, res, (return_response));
        }
    }
    async familyList(req, res) {
        let return_response = {};
        const formData = formatter.familyList(req);
        const rules = validator.familyList();
        const validation = new Validator(formData, rules);
        if (validation.passes() && !validation.fails()) {
            return_response = await model.familyList(formData);
        } else {
            return_response = response.failed('form_fields_required');
            return_response = validation.errors.errors;
        }
        res.json(return_response);
    }
    async deleteFamily(req, res) {
        let return_response = {};

        const formData = formatter.deleteFamily(req);
        const rules = validator.deleteFamily();
        const validation = new Validator(formData, rules);
        if (validation.passes() && !validation.fails()) {
            return_response = await model.deleteFamily(formData);
        } else {
            return_response = response.failed('form_fields_required');
            return_response = validation.errors.errors;
        }

        res.json(return_response);
    }




    async consume_promocode(req, res) {

    
        let return_response = {};

        const formData = formatter.consume_promocode(req);
        const rules = validator.consume_promocode();

        const validation = new Validator(formData, rules);
        if (validation.passes() && !validation.fails()) {

            let data = await model.consume_promocode(formData);
            if(data.length>0){
             
             await model.update_promocode(data[0].id);
             return_response = response.success('promocode_success');
            }else{
                return_response = response.failed('promocode_not_exist');

            }

        } else {
            return_response = response.failed('form_fields_required');
            return_response = validation.errors.errors;
        }

        res.json(return_response);
    }

    async get_broker_list(req, res) {

    
        let return_response = {};

        const formData = formatter.get_broker_list(req);
        const rules = validator.get_broker_list();
        const validation = new Validator(formData, rules);
        if (validation.passes() && !validation.fails()) {
            return_response = await model.get_broker_list(formData);
        } else {
            return_response = response.failed('form_fields_required');
            return_response = validation.errors.errors;
        }
        res.json(return_response);
    }
}
