'use strict';
let Validator = require('validatorjs');
let owner_model = new (require('../models/owner.mysql'))();
let owner_formatter = new (require('../formatters/owner.formatter'))();
let owner_validator = new (require('../validators/owner.validator'))();
let owner_response = require('../responses/owner.response');
let response_handler = new (require('../../../../core/ResponseHandler'))();
let config = require("../../../../../config/config");
let knex = require("../../../../../config/knex.js"); 
let encription_key = config.encription_key;

module.exports = class OwnerController {
    constructor() { }

    async add_owner(req, res) {
        let return_result = {};
        let form_data = owner_formatter.add_owner(req);
        let rules = owner_validator.add_owner();
        let validation = new Validator(form_data, rules);
        if (validation.passes() && !validation.fails()) {
            let owner = await owner_model.add_owner("add_owner_exist",form_data);
            if (owner.length>0) {
                return res.json(owner_response.failed("owner_exist", return_result));
            } else {
                let insert_owner_data = await format_insert_owner(form_data);
                if(insert_owner_data == null){
                    return res.json(owner_response.failed("invalid_commissions"));
                } else {
                    let availableUnit = await owner_model.add_owner("check_unit",form_data); 
                    if(availableUnit.length>0){
                        owner = await owner_model.add_owner("add_owner",insert_owner_data);
                        if(owner.length>0){
                            await knex("master_unit").update({unit_type: "none", customer_id: owner[0]}).where("master_unit.id",form_data['unit_id']);
                            await knex("cc_account_summary").insert({customer_id: owner[0]});
                            let response_data = owner_response.success("owner_created", owner); 
                            response_data['email_data'] = {logo_url: config['base_url'],email: form_data.email, mobile: form_data.phone, user_name: form_data.first_name+" "+form_data.last_name, language_code: form_data['language_code']  };
                            response_data['sms_data'] = {logo_url: config['base_url'],email: form_data.email, mobile: form_data.phone, user_name: form_data.first_name+" "+form_data.last_name, language_code: form_data['language_code'] };
                            return response_handler.response(req, res, (response_data));
                        } else {
                            return res.json(owner_response.success("owner_created_failed"));
                        }
                    } else {
                        return res.json(owner_response.failed("unit_not_available"));
                    }    
                }
            }
        } else {
            return res.json(owner_response.failed('form_fields_required', validation.errors.errors));
        } 
    };

    async get_owner(req, res) {
        let form_data = owner_formatter.get_owner(req);
        let rules = owner_validator.get_owner();
        let validation = new Validator(form_data, rules);
        if (validation.passes() && !validation.fails()) {
            let owner = await owner_model.get_owner("get_owner",form_data);
            if (owner.length>0) {
                return res.json(owner_response.success("owner_found", owner));
            } else {
                return res.json(owner_response.failed("owner_not_found"));
            }
        } else {
            return res.json(owner_response.failed('form_fields_required', validation.errors.errors));
        } 
    };

    async edit_owner(req, res) {
        let form_data = owner_formatter.edit_owner(req);
        let rules = owner_validator.edit_owner();
        let validation = new Validator(form_data, rules);
        if (validation.passes() && !validation.fails()) {
            let owner = await owner_model.edit_owner("edit_owner_exist",form_data);
            if (owner.length>0) {
                return res.json(owner_response.failed("owner_exist", owner));
            } else {
                let update_owner_data = await format_update_owner(form_data);
                if(update_owner_data == null){
                    return res.json(owner_response.failed("invalid_commissions"));
                } else {
                    // let availableUnit = await owner_model.add_owner("check_unit",form_data); 
                    // if(availableUnit.length>0){
                        owner = await owner_model.edit_owner("edit_owner",update_owner_data);
                        if(owner>0){
                            await knex("master_unit").update({unit_type: "none", customer_id: form_data['id']}).where("master_unit.id",form_data['unit_id']);
                            let response_data = owner_response.success("owner_updated", owner); 
                            response_data['email_data'] = {logo_url: config['base_url'],email: form_data.email, mobile: form_data.phone, user_name: form_data.first_name+" "+form_data.last_name, language_code: form_data['language_code']  };
                            response_data['sms_data'] = {logo_url: config['base_url'],email: form_data.email, mobile: form_data.phone, user_name: form_data.first_name+" "+form_data.last_name, language_code: form_data['language_code'] };
                            return response_handler.response(req, res, (response_data));
                        } else {
                            return res.json(owner_response.success("owner_updated_failed"));
                        }
                    // } else {
                    //     return res.json(owner_response.failed("unit_not_available"));
                    // }    
                }
            }
        } else {
            return res.json(owner_response.failed('form_fields_required', validation.errors.errors));
        } 
    };
  
    async list_owner(req, res) {
        console.log("in list owner");
        let return_result = {};
        let form_data = owner_formatter.list_owner(req);
        let rules = owner_validator.list_owner();
        let validation = new Validator(form_data, rules);
        if (validation.passes() && !validation.fails()) {
            return_result.total_records = (await owner_model.list_owner("list_owner",form_data)).length;
            if ((return_result.total_records > 0) && Number(form_data.limit)>0) {
                    return_result.owner_list = await owner_model.list_owner("list_owner",form_data)
                        .limit(parseInt(form_data['limit']))
                        .offset(parseInt(form_data['offset']));
                    return res.json(owner_response.success("owner_found", return_result));
            } else {
                return res.json(owner_response.failed("owner_not_found"));

            }
        } else {
            return res.json(owner_response.failed('form_fields_required', validation.errors.errors));
        } 
    }

    async get_owner_tenant(req, res) {
        let form_data = owner_formatter.get_owner_tenant(req);
        let rules = owner_validator.get_owner_tenant();
        let validation = new Validator(form_data, rules);
        if (validation.passes() && !validation.fails()) {
            let result = await owner_model.get_owner_tenant("get_owner_tenant",form_data)
            if (result.length>0) {
                    return res.json(owner_response.success("owner_found", result));
            } else {
                return res.json(owner_response.failed("owner_not_found"));
            }
        } else {
            return res.json(owner_response.failed('form_fields_required', validation.errors.errors));
        } 
    }

    async add_manual_settlement(req, res) {
        const form_data = owner_formatter.add_manual_settlement(req);
        const rules = owner_validator.add_manual_settlement();
        const validation = new Validator(form_data, rules);
        if (validation.passes() && !validation.fails()) {
            const result = await owner_model.add_manual_settlement(form_data);
            if (result.status)
                return res.json(owner_response.success('manual_settlement_success'));
            else return res.json(owner_response.failed(result.message));
        } else {
            return res.json(owner_response.failed('form_fields_required', validation.errors.errors));
        }
    }

    async manual_settlement_list(req, res) {
        const form_data = owner_formatter.manual_settlement_list(req);
        const rules = owner_validator.manual_settlement_list();
        const validation = new Validator(form_data, rules);
        if (validation.passes() && !validation.fails()) {
            const result = await owner_model.manual_settlement_list(form_data);
            if (!result.length) return res.json(owner_response.failed('manual_settlement_list_not_found'));

            let returnResponse = { total_records: result.length, manual_settlement_list: null };
            if (form_data.limit)
                returnResponse.manual_settlement_list = result.slice(form_data.offset, form_data.offset + form_data.limit);
            
            return res.json(owner_response.success('manual_settlement_list_found', returnResponse));
        } else {
            return res.json(owner_response.failed('form_fields_required', validation.errors.errors));
        }
    }

    async get_all_units(req, res) {
        const result = await owner_model.get_all_units();
        if (!result.length) return res.json(owner_response.failed('unit_not_available'));

        return res.json(owner_response.success('unit_list_found', { total_records: result.length, unit_list: result }));
    }
}

async function format_insert_owner(record){
    if((Number(record['oam_commission'])+Number(record['owner_commission'])+Number(record['gain_commission']))>100){
        return null
    } else {
        // let tierId = await knex('customer_tiers').select('id').limit(1);
        let userTypeId = await knex('master_user_type').select('id').where('master_user_type.name',"Owner");
        return {
            customer_unique_id: knex.raw("AES_ENCRYPT('" + (Math.floor(1000000000 + Math.random() * 9000000000)) + "', '" + encription_key + "')"),
            first_name: knex.raw("AES_ENCRYPT('" + record['first_name'] + "', '" + encription_key + "')"),
            last_name: knex.raw("AES_ENCRYPT('" + record['last_name'] + "', '" + encription_key + "')"),
            email: knex.raw("AES_ENCRYPT('" + record['email'] + "', '" + encription_key + "')"),
            phone: knex.raw("AES_ENCRYPT('" + record['phone'] + "', '" + encription_key + "')"),
            user_type_id: Number(userTypeId[0]['id']),
            status: 1,
            birthday: record.birthday,
            anniversary: record.anniversary,
            spouse_name: record.spouse_name,
            children: record.children,
            fav_cuisine:record.fav_cuisine,
            fav_hotel:record.fav_hotel,
            fav_travel_destination:record.fav_travel_destination,
            annual_household_income:record.annual_household_income,
            children_age: record.children_age,
            brand_suggestion:record.brand_suggestion
        }
    }
}

async function format_update_owner(record){
    return {
        id:record.id,
        first_name: knex.raw("AES_ENCRYPT('" + record['first_name'] + "', '" + encription_key + "')"),
        last_name: knex.raw("AES_ENCRYPT('" + record['last_name'] + "', '" + encription_key + "')"),
        phone: knex.raw("AES_ENCRYPT('" + record['phone'] + "', '" + encription_key + "')"),
        status: 1,
        birthday: record.birthday,
        anniversary: record.anniversary,
        spouse_name: record.spouse_name,
        children: record.children,

        fav_cuisine:record.fav_cuisine,
        fav_hotel:record.fav_hotel,
        fav_travel_destination:record.fav_travel_destination,
        annual_household_income:record.annual_household_income,
        children_age: record.children_age,
        brand_suggestion:record.brand_suggestion
    }
}