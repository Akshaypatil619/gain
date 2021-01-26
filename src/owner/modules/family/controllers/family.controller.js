"use strict";
let Validator = require('validatorjs');
let FamilyTypeService = require("../services/family.services");
let family_service = new FamilyTypeService();
let formatter = new (require('../formatters/family.formatter'))();
let validator = new (require("../validators/family.validators"));
let response = require("../response/family.response");
let knex = require("../../../../../config/knex");
let config = require("../../../../../config/config");
let encription_key = config.encription_key;
let model = new (require('../models/family_model.mysql'))();

module.exports = class FamilyController {
    /**
     * Constructor
     */
    constructor() { }

    /**
     * Get all family list
     *
     * @param {*} req
     * @param {*} res
     * @returns {Promise<void>}
     */
    async get_family(req, res) {
        let returnResponse = {}
        let formData = formatter.get_family_list(req);
        let rules = validator.get_family_list('get_family');
        let validation = new Validator(formData, rules);
        if (validation.passes() && !validation.fails()) {
            returnResponse = await family_service.get_family_list(formData);
        } else {
            returnResponse = validation.errors.errors;
        }
        return res.json(returnResponse);
    }


    async familyStatusChange(req, res) {
        let returnResponse = {};
        let form_data = family_formatter.familyStatusChange(req);
        let rules = family_validator.familyStatusChange('');
        let validation = new Validator(form_data, rules);
        if (validation.passes() && !validation.fails()) {
            returnResponse = await family_service.familyStatusChange(form_data);
        } else {
            returnResponse = responseMessages.form_field_required;
            returnResponse.errors = validation.errors.errors;
        }
        res.json(returnResponse);
    }
    

    async edit_familyMember(req, res) {
        let form_data = formatter.edit_familyMember(req);
        let rules = validator.edit_familyMember();
        let validation = new Validator(form_data, rules);
        console.log("123",form_data)
        if (validation.passes() && !validation.fails()) {
            let familyMember = await model.edit_familyMember("edit_familyMember_exist", form_data);
            console.log("familyMember",familyMember)
            // if (familyMember.length > 0) {
            //     return res.json(response.failed("familyMember_exist", familyMember));
            // } else {
                form_data.id=familyMember[0].id
                let update_familyMember_data = await format_update_familyMember(form_data);
                console.log("update_familyMember_data",update_familyMember_data)
                if (update_familyMember_data == null) {
                    return res.json(response.failed("invalid_commissions"));
                } else {
                    familyMember = await model.edit_familyMember("edit_familyMember", update_familyMember_data);
                    console.log("familyMember", familyMember)
                    if (familyMember > 0) {
                        let response_data = response.success("familyMember_updated", familyMember);
                        console.log("response_data",response_data)
                        
                        return res.json(response_data)
                        // return response_handler.response(req, res, (response_data));
                    } else {
                        return res.json(response.success("familyMember_updated_failed"));
                    }
                // }
            }
        } else {
            return res.json(response.failed('form_fields_required', validation.errors.errors));
        }
    };

    async list_referral(req, res) {
        console.log("req")
        let return_result = {};
        let form_data = formatter.list_referral(req);
        let rules = validator.list_referral();
        let validation = new Validator(form_data, rules);
        if (validation.passes() && !validation.fails()) {
            return_result.list_referral=await model.list_referral( form_data)
            return_result.total_records=return_result.list_referral.length
            return res.json(response.success("referral_found", return_result));
        } else {
            return res.json(response.failed('form_fields_required', validation.errors.errors));
        }
    }
    
    async addFamily(req, res) {
        let return_response = {};

        const formData = formatter.addFamily(req);
        const rules = validator.addFamily();
        const validation = new Validator(formData, rules);
        if (validation.passes() && !validation.fails()) {
            return_response = await model.addFamily(formData);
        } else {
            return_response = response.failed('form_fields_required');
            return_response = validation.errors.errors;
        }

        res.json(return_response);
    }

    async list_family(req, res) {
        let return_response = {};
        const formData = formatter.list_family(req);
        const rules = validator.list_family();
        const validation = new Validator(formData, rules);
        if (validation.passes() && !validation.fails()) {
            // returnResponse = await family_service.get_master_property_type_List(form_data);
            return_response = await model.list_family(formData);
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

      // async add_familyMember(req, res) {
    //     let return_result = {};
    //     let allowedData =""
    //     let allowed=0
    //     let form_data = family_formatter.add_familyMember(req);
    //     let rules = family_validator.add_familyMember();
    //     let validation = new Validator(form_data, rules);
    //     if (validation.passes() && !validation.fails()) {
    //         let familyMemberExist = await family_model.add_familyMember("add_familyMember_exist", form_data);

    //         if (familyMemberExist.length > 0) {
    //             return res.json(responseMessages.failed("familyMember_exist", return_result));
    //         }else{
    //             let customer_type = await family_model.add_familyMember("customer_type",form_data);
    //             let familyCount = await family_model.add_familyMember("get_family_count",form_data);
    //             if(customer_type[0].type=="Owner"){
    //                 allowedData = await family_model.add_familyMember("get_owner_property_type",form_data);
    //                 if(allowedData.length>0 && allowedData[0].property_type=="Commercial"){
    //                     allowed=3;
    //                 } else if(allowedData.length>0 && allowedData[0].property_type=="Residential"){
    //                     allowed=10;
    //                 }
    //             } else {
    //                 allowedData = await family_model.add_familyMember("get_tenant_property_type",form_data);
    //                 if(allowedData.length>0 && allowedData[0].property_type=="Commercial"){
    //                     allowed=3;
    //                 } else if(allowedData.length>0 && allowedData[0].property_type=="Residential"){
    //                     allowed=10;
    //                 }
    //             }
    //             let insert_familyMember_data = await format_insert_familyMember(form_data);    
    //             if((allowed-familyCount[0].family_count)>0){
    //                 let family = await family_model.add_familyMember("add_familyMember",insert_familyMember_data);
    //                 if(family.length>0){
    //                     await knex("cc_account_summary").insert({customer_id: family[0]});
    //                     return res.json(responseMessages.success("family_created", family)); 
    //                 } else {
    //                     return res.json(responseMessages.failed("family_created_failed"));
    //                 }
    //             } else {
    //                 return res.json(responseMessages.failed("family_threshold"));
    //             }
    //         }
    //     } else {
    //         return res.json(responseMessages.failed('form_fields_required', validation.errors.errors));
    //     }
    // };

    // async get_familyMember(req, res) {
    //     console.log(req.params,"req",req.params.customer_unique_id)
    //     let form_data = formatter.get_familyMember(req);
    //     let rules = validator.get_familyMember();
    //     let validation = new Validator(form_data, rules);
    //     if (validation.passes() && !validation.fails()) {
    //         let familyMember = await model.get_familyMember("get_familyMember", form_data);
    //         console.log("form_data123",familyMember)

    //         if (familyMember.length > 0) {
    //             return res.json(response.success("familyMember_found", familyMember));
    //         } else {
    //             return res.json(response.failed("familyMember_not_found"));
    //         }
    //     } else {
    //         return res.json(response.failed('form_fields_required', validation.errors.errors));
    //     }
    // };
    
    
}



async function format_update_familyMember(record) {
  
        return {
            // customer_unique_id: knex.raw("AES_ENCRYPT('" + record['customer_unique_id'] + "', '" + encription_key + "')"),
            id:record.id, 
            first_name: knex.raw("AES_ENCRYPT('" + record['first_name'] + "', '" + encription_key + "')"),
            last_name: knex.raw("AES_ENCRYPT('" + record['last_name'] + "', '" + encription_key + "')"),
            phone: knex.raw("AES_ENCRYPT('" + record['phone'] + "', '" + encription_key + "')"),
            gender: record.gender,
            referrer_id: record.referrer_id,
            referrer_relation: record.referrer_relation,
            status: 1
        }
    

}




    
