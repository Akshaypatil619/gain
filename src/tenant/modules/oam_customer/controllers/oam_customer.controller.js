'use strict';
let Validator = require('validatorjs');
let oam_model = new (require('../models/oam_customer_model.mysql'))();
let config = require("../../../../../config/config");
let knex = require("../../../../../config/knex.js"); 
let encription_key = config.encription_key;
let response_handler = new (require('../../../../core/ResponseHandler'))();

let oam_Formatter = new (require('../formatters/oam_customer.formatter'))();
let oam_validator = new (require("../validators/oam_customer.validators"));
let oam_response = require("../response/oam_customer.response");

module.exports = class OamController {
    constructor() { }

    async add_oam(req, res) {
        let return_result = {};
        console.log('req',req);
        let form_data = oam_Formatter.add_oam(req);
        let rules = oam_validator.add_oam();
        let validation = new Validator(form_data, rules);
        console.log('validation',validation.passes() && !validation.fails());
        if (validation.passes() && !validation.fails()) {
            console.log('formdata',form_data);
            let oam = await oam_model.add_oam("add_oam_exist",form_data);
            console.log('oam',oam.length>0);
            if (oam.length>0) {
                return res.json(oam_response.failed("oam_exist", return_result));
            } else {
                let insert_oam_data = await format_insert_oam(form_data);
                if(insert_oam_data == null){
                    return res.json(oam_response.failed("invalid_commissions"));
                } else {
                    oam = await oam_model.add_oam("add_oam",insert_oam_data);
                    if(oam.length>0){
                        await knex("cc_account_summary").insert({customer_id: oam[0]});
                        let response_data = oam_response.success("oam_customer_created_successfully", oam); 
                        response_data['email_data'] = {logo_url: config['base_url'],email: form_data.email, mobile: form_data.phone, user_name: form_data.first_name+" "+form_data.last_name, language_code: form_data['language_code']  };
                        response_data['sms_data'] = {logo_url: config['base_url'],email: form_data.email, mobile: form_data.phone, user_name: form_data.first_name+" "+form_data.last_name, language_code: form_data['language_code'] };
                   
                        return response_handler.response(req, res, (response_data));
                    } else {
                        return res.json(oam_response.success("oam_customer_created_fail"));
                    }
                }
            }
        } else {
            return res.json(oam_response.failed('form_fields_required', validation.errors.errors));
        } 
    };

    async get_oam(req, res) {
        let form_data = oam_Formatter.get_oam(req);
        let rules = oam_validator.get_oam();
        let validation = new Validator(form_data, rules);
        if (validation.passes() && !validation.fails()) {
            let oam = await oam_model.get_oam("get_oam",form_data);
            if (oam.length>0) {
                return res.json(oam_response.success("oam_found", oam));
            } else {
                return res.json(oam_response.failed("oam_not_found"));
            }
        } else {
            return res.json(oam_response.failed('form_fields_required', validation.errors.errors));
        } 
    };

    async edit_oam(req, res) {
        let form_data = oam_Formatter.edit_oam(req);
        let rules = oam_validator.edit_oam();
        let validation = new Validator(form_data, rules);
        if (validation.passes() && !validation.fails()) {
            // let oam = await oam_model.edit_oam("edit_oam_exist",form_data);
            // if (oam.length>0) {
            //     return res.json(oam_response.failed("oam_exist", oam));
            // } else {
                let update_oam_data = await format_update_oam(form_data);
                if(update_oam_data == null){
                    return res.json(oam_response.failed("invalid_commissions"));
                } else {
                 let   oam = await oam_model.edit_oam("edit_oam",update_oam_data);
                    if(oam>0){
                        let response_data = oam_response.success("oam_customer_updated_successfully", oam); 
                        response_data['email_data'] = {logo_url: config['base_url'],email: form_data.email, mobile: form_data.phone, user_name: form_data.first_name+" "+form_data.last_name, language_code: form_data['language_code']  };
                        response_data['sms_data'] = {logo_url: config['base_url'],email: form_data.email, mobile: form_data.phone, user_name: form_data.first_name+" "+form_data.last_name, language_code: form_data['language_code'] };
                        return response_handler.response(req, res, (response_data));
                    } else {
                        return res.json(oam_response.success("oam_customer_update_fail"));
                    }
                }
           // }
        } else {
            return res.json(oam_response.failed('form_fields_required', validation.errors.errors));
        } 
    };
  
    async list_oam(req, res) {
        let return_result = {};
        let form_data = oam_Formatter.list_oam(req);
        let rules = oam_validator.list_oam();
        let validation = new Validator(form_data, rules);
        if (validation.passes() && !validation.fails()) {
            let oam_query = oam_model.list_oam("list_oam",form_data);
            return_result.total_records = (await oam_query).length;
            if ((return_result.total_records > 0)) {
                    return_result.oam_list = await oam_query.limit(parseInt(form_data['limit'])).offset(parseInt(form_data['offset']));
                    return res.json(oam_response.success("oam_found", return_result));
            } else {
                return res.json(oam_response.failed("oam_not_found"));
            }
        } else {
            return res.json(oam_response.failed('form_fields_required', validation.errors.errors));
        } 
    }

    async get_all_countries(req, res) {
        let form_data = oam_Formatter.get_all_countries(req);
        let rules = oam_validator.get_all_countries();
        let validation = new Validator(form_data, rules);
        if (validation.passes() && !validation.fails()) {
            let countries = await oam_model.get_all_countries(form_data);
            if (countries.length>0) {
                    return res.json(oam_response.success("country_found", countries));
            } else {
                return res.json(oam_response.failed("country_not_found"));
            }
        } else {
            return res.json(oam_response.failed('form_fields_required', validation.errors.errors));
        } 
    }
}

async function format_insert_oam(record){
    console.log('record',record);
    if((Number(record['oam_commission'])+Number(record['owner_commission'])+Number(record['gain_commission']))>100){
        return null
    } else {
        // let tierId = await knex('customer_tiers').select('id').limit(1);
        let userTypeId = await knex('master_user_type').select('id').where('master_user_type.name',"oam");
        return {
            customer_unique_id: knex.raw("AES_ENCRYPT('" + (Math.floor(1000000000 + Math.random() * 9000000000)) + "', '" + encription_key + "')"),
            company_name: knex.raw("AES_ENCRYPT('" + record['company_name'] + "', '" + encription_key + "')"),
            // last_name: knex.raw("AES_ENCRYPT('" + record['last_name'] + "', '" + encription_key + "')"),
            email: knex.raw("AES_ENCRYPT('" + record['email'] + "', '" + encription_key + "')"),
            phone: knex.raw("AES_ENCRYPT('" + record['phone'] + "', '" + encription_key + "')"),
            country_id:record.country_id,
            // dob:record.dob,
            // gender:record.gender,
            oam_commission: record.oam_commission,
            owner_commission: record.owner_commission,
            gain_commission: record.gain_commission,
            tenant_discount:record.owner_commission,
            manager: record.manager,
            user_type_id: Number(userTypeId[0]['id']),
            status: 1
        }
    }
}

async function format_update_oam(record){
    if((Number(record['oam_commission'])+Number(record['owner_commission'])+Number(record['gain_commission']))>100){
        return null
    } else {
        return {
            id:record.id,
            company_name: knex.raw("AES_ENCRYPT('" + record['company_name'] + "', '" + encription_key + "')"),
            // last_name: knex.raw("AES_ENCRYPT('" + record['last_name'] + "', '" + encription_key + "')"),
            phone: knex.raw("AES_ENCRYPT('" + record['phone'] + "', '" + encription_key + "')"),
            // dob:record.dob,
            country_id:record.country_id,
            // gender:record.gender,
            oam_commission: record.oam_commission,
            owner_commission: record.owner_commission,
            gain_commission: record.gain_commission,
            tenant_discount: record.owner_commission,
            manager: record.manager,
            status: 1
        }
    }
}