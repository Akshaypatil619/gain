'use strict';
let Validator = require('validatorjs');
let tenant_model = new (require('../models/tenant.mysql'))();
let tenant_formatter = new (require('../formatters/tenant.formatter'))();
let tenant_validator = new (require('../validators/tenant.validator'))();
let tenant_response = require('../responses/tenant.response');
let response_handler = new (require('../../../../core/ResponseHandler'))();
let config = require("../../../../../config/config");
let knex = require("../../../../../config/knex.js"); 
let encription_key = config.encription_key;
const CronNotifications = require('../../../../core/cron_notifications');

module.exports = class TenantController {
    constructor() { }

    async add_tenant(req, res) {
        const notif_instance = new CronNotifications();
		await notif_instance.init_templates(req.activity_detail[0].id);
        const form_data = tenant_formatter.add_tenant(req);
        const rules = tenant_validator.add_tenant(form_data);
        const validation = new Validator(form_data, rules);
        let customer_id;
        if (validation.passes() && !validation.fails()) {

            tenant_model.get_customer_id(form_data.unit_id).then(async custDetails => {
                if (!custDetails.length)
                    return res.json(tenant_response.failed('owner_not_exist'));
                custDetails = custDetails[0];

                if (custDetails.user_type == 'tenant')
                    return res.json(tenant_response.failed('incorrect_user_type'));

                customer_id = custDetails.id;

                let family_customer_id = null;
                if (custDetails.user_type == 'family') {
                    family_customer_id = customer_id;

                    const referrerDetails = await knex('customers').select({
                        referrer_id: 'customers.referrer_id',
                        referrer_user_type: 'master_user_type.code'
                    }).join('customers as rc', 'rc.id', 'customers.referrer_id')
                        .join('master_user_type', 'master_user_type.id', 'rc.user_type_id')
                        .where('customers.id', customer_id);

                    if (!referrerDetails.length || !referrerDetails[0].referrer_id)
                        return res.json(tenant_response.failed('incorrect_user_type'));

                    customer_id = referrerDetails[0].referrer_id;
                    let referrer_user_type = referrerDetails[0].referrer_user_type;

                    if (referrer_user_type == 'tenant')
                        return res.json(tenant_response.failed('incorrect_user_type'));
                }

                let unitDetails = await tenant_model.get_rent_unit_list(customer_id, form_data.unit_id);
                if (!unitDetails.length) return res.json(tenant_response.failed('unit_not_available'));

                if (unitDetails[0].tenant_staying_dates.length > 0) {
                    const usedDates = unitDetails[0].tenant_staying_dates;

                    const requestedJoiningDate = new Date(form_data.tenant_joining_date);
                    const requestedLeavingDate = new Date(form_data.tenant_leaving_date);

                    let isInvalidDate = false;

                    for (let date of usedDates) {
                        const tenant_joining_date = new Date(date.tenant_joining_date);
                        const tenant_leaving_date = new Date(date.tenant_leaving_date);

                        if (requestedJoiningDate > tenant_joining_date) {
                            if (!(requestedJoiningDate > tenant_leaving_date))
                                isInvalidDate = true;
                        } else if (requestedJoiningDate < tenant_joining_date) {
                            if (!(requestedLeavingDate < tenant_joining_date))
                                isInvalidDate = true;
                        } else isInvalidDate = true;

                        if (isInvalidDate) break;
                    }

                    if (isInvalidDate) return res.json(tenant_response.failed('tenant_staying_date_overlapped'));
                }

                const check_tenant = await tenant_model.add_tenant("add_tenant_exist", form_data);
                if (check_tenant.length > 0) return res.json(tenant_response.failed('tenant_exist'));

                let insert_tenant_data = await format_insert_tenant(form_data);
                await tenant_model.add_tenant('add_tenant', insert_tenant_data);

                let response_data = tenant_response.success("tenant_created");
                // response_data['email_data'] = {logo_url: config['base_url'], email: form_data.email, mobile: form_data.phone, user_name: form_data.first_name + " " + form_data.last_name, language_code: "EN" };
                // response_data['sms_data'] = {logo_url: config['base_url'], email: form_data.email, mobile: form_data.phone, user_name: form_data.first_name + " " + form_data.last_name, language_code: "EN" };
                
                let tenantCustomer = {
                    phone: form_data['phone'],
                    email: form_data['email'],
                    language_code: "EN"
                };
                let templateDetails = {
                    user_name: form_data['first_name']+" "+form_data['last_name'],
                    phone: form_data['phone'],
                    email: form_data['email'],
                    logo_url: config['base_url']
                }; 
            

                let data = { templateCode: 'ADDTENANT', customerDetails: tenantCustomer, templateDetails };
                notif_instance.send_notifications(data)
										.then(res => console.log(res)).catch(err => console.log(err));
                let ownerColumns = {
                    first_name: knex.raw("CAST(AES_DECRYPT(customers.first_name,'"+ encription_key +"') AS CHAR(255))"),
                    last_name: knex.raw("CAST(AES_DECRYPT(customers.last_name,'"+ encription_key +"') AS CHAR(255))"),
                    phone: knex.raw("CAST(AES_DECRYPT(customers.phone,'" + encription_key + "')AS CHAR(255))"),
                    email: knex.raw("CAST(AES_DECRYPT(customers.email,'" + encription_key + "')AS CHAR(255))"),
                };
                let ownerDeails = await knex("master_unit").select(ownerColumns).join("customers", "customers.id", "=", "master_unit.customer_id").where("master_unit.id",form_data['unit_id']);
                if(ownerDeails.length>0){
                    let ownerCustomer = {
                        phone: ownerDeails[0]['phone'],
                        email: ownerDeails[0]['email'],
                        language_code: "EN",
                    };

                    templateDetails['user_name'] = ownerDeails[0]['first_name']+" "+ownerDeails[0]['last_name'];
                    templateDetails['phone'] = ownerDeails[0]['phone'];
                    templateDetails['email'] = ownerDeails[0]['email'];
                    templateDetails['logo_url'] = config['base_url'];
                    notif_instance.send_notifications({ templateCode: 'ADDTTNTOWNER', customerDetails: ownerCustomer, templateDetails })
                                            .then(res => console.log(res)).catch(err => console.log(err));
                }
                return res.json(response_data);

            });

        } else 
        {
            console.log("DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD : ",validation.errors.errors);
            return res.json(tenant_response.failed('form_fields_required', validation.errors.errors));
        }
    }
    async get_tenant(req, res) {
        let form_data = tenant_formatter.get_tenant(req);
        let rules = tenant_validator.get_tenant();
        let validation = new Validator(form_data, rules);
        if (validation.passes() && !validation.fails()) {
            let tenant = await tenant_model.get_tenant("get_tenant", form_data);
            if (tenant.length > 0) {
                return res.json(tenant_response.success("tenant_found", tenant));
            } else {
                return res.json(tenant_response.failed("tenant_not_found"));
            }
        } else {
            return res.json(tenant_response.failed('form_fields_required', validation.errors.errors));
        }
    };

    async edit_tenant(req, res) {
        const form_data = tenant_formatter.edit_tenant(req);
        const rules = tenant_validator.edit_tenant(form_data);
        const validation = new Validator(form_data, rules);
        let customer_id;
        if (validation.passes() && !validation.fails()) {

            tenant_model.get_customer_id(form_data.unit_id).then(async custDetails => {

                if (!custDetails.length)
                    return res.json(tenant_response.failed('owner_not_exist'));
                custDetails = custDetails[0];
                if (custDetails.user_type == 'tenant')
                    return res.json(tenant_response.failed('incorrect_user_type'));

                customer_id = custDetails.id;

                let family_customer_id = null;
                if (custDetails.user_type == 'family') {
                    family_customer_id = customer_id;

                    const referrerDetails = await knex('customers').select({
                        referrer_id: 'customers.referrer_id',
                        referrer_user_type: 'master_user_type.code'
                    }).join('customers as rc', 'rc.id', 'customers.referrer_id')
                        .join('master_user_type', 'master_user_type.id', 'rc.user_type_id')
                        .where('customers.id', customer_id);

                    if (!referrerDetails.length || !referrerDetails[0].referrer_id)
                        return res.json(tenant_response.failed('incorrect_user_type'));

                    customer_id = referrerDetails[0].referrer_id;
                    let referrer_user_type = referrerDetails[0].referrer_user_type;

                    if (referrer_user_type == 'tenant')
                        return res.json(tenant_response.failed('incorrect_user_type'));
                }

                const tenantDetails = await tenant_model.edit_tenant("edit_tenant_exist", form_data);
               
                if (!tenantDetails.length) return res.json(tenant_response.failed("tenant_not_exist"));

                let unitDetails = await tenant_model.get_rent_unit_list(customer_id, form_data.unit_id, tenantDetails[0].id);
                if (!unitDetails.length) return res.json(tenant_response.failed('unit_not_available'));

                if (unitDetails[0].tenant_staying_dates.length > 0) {
                    const usedDates = unitDetails[0].tenant_staying_dates;

                    const requestedJoiningDate = new Date(form_data.tenant_joining_date);
                    const requestedLeavingDate = new Date(form_data.tenant_leaving_date);

                    let isInvalidDate = false;

                    for (let date of usedDates) {
                        const tenant_joining_date = new Date(date.tenant_joining_date);
                        const tenant_leaving_date = new Date(date.tenant_leaving_date);

                        if (requestedJoiningDate > tenant_joining_date) {
                            if (!(requestedJoiningDate > tenant_leaving_date))
                                isInvalidDate = true;
                        } else if (requestedJoiningDate < tenant_joining_date) {
                            if (!(requestedLeavingDate < tenant_joining_date))
                                isInvalidDate = true;
                        } else isInvalidDate = true;

                        if (isInvalidDate) break;
                    }

                    if (isInvalidDate) return res.json(tenant_response.failed('tenant_staying_date_overlapped'));
                }

                form_data.customer_id = tenantDetails[0].id;
                let update_tenant_data = await format_update_tenant(form_data);
                await tenant_model.edit_tenant('edit_tenant', update_tenant_data);


                let response_data = tenant_response.success("tenant_updated");

                response_data['email_data'] = {logo_url: config['base_url'], email: form_data.email, mobile: form_data.phone, user_name: form_data.first_name + " " + form_data.last_name, language_code: "EN" };
                response_data['sms_data'] = {logo_url: config['base_url'], email: form_data.email, mobile: form_data.phone, user_name: form_data.first_name + " " + form_data.last_name, language_code: "EN" };
            

            
                return response_handler.response(req, res, (response_data));

            });

        } else return res.json(tenant_response.failed('form_fields_required', validation.errors.errors));
    };

    
  
    async list_tenant(req, res) {
        let return_result = {};
        let form_data = tenant_formatter.list_tenant(req);
        let rules = tenant_validator.list_tenant();
        let validation = new Validator(form_data, rules);
        if (validation.passes() && !validation.fails()) {
            let tenant_query=tenant_model.list_tenant("list_tenant",form_data);
            return_result.total_records = (await tenant_query).length;
            if ((return_result.total_records > 0)) {
                     let tenant_list = await tenant_query
                        .limit(parseInt(form_data['limit']))
                        .offset(parseInt(form_data['offset']));
                        return_result.tenant_list = tenant_list;
                    return res.json(tenant_response.success("tenant_found", return_result));
            } else {
                return res.json(tenant_response.failed("tenant_not_found"));

            }
        } else {
            return res.json(tenant_response.failed('form_fields_required', validation.errors.errors));
        } 
    }
    async list_building_code(req, res) {
        let form_data = tenant_formatter.list_building_code(req);
        let rules = tenant_validator.list_building_code();
        let validation = new Validator(form_data, rules);
        if (validation.passes() && !validation.fails()) {
            let result = await tenant_model.list_building_code(form_data);
            if (result.length>0) {
                return res.json(tenant_response.success("building_found", result));
            } else {
                return res.json(tenant_response.success("building_not_found"));
            }
        } else {
            return res.json(tenant_response.failed('form_fields_required', validation.errors.errors));
        } 
    }

    async list_property(req, res) {
        let form_data = tenant_formatter.list_property(req);
        let rules = tenant_validator.list_property();
        let validation = new Validator(form_data, rules);
        if (validation.passes() && !validation.fails()) {
            let result = await tenant_model.list_property(form_data);
            if (result.length>0) {
                return res.json(tenant_response.success("property_found", result));
            } else {
                return res.json(tenant_response.success("property_not_found"));
            }
        } else {
            return res.json(tenant_response.failed('form_fields_required', validation.errors.errors));
        } 
    }
}

async function format_insert_tenant(record){
    let userTypeId = await knex('master_user_type').select('id').where('master_user_type.name',"Tenant");
    return {
        customer_unique_id: knex.raw("AES_ENCRYPT('" + (Math.floor(1000000000 + Math.random() * 9000000000)) + "', '" + encription_key + "')"),
        first_name: knex.raw("AES_ENCRYPT('" + record['first_name'] + "', '" + encription_key + "')"),
        last_name: knex.raw("AES_ENCRYPT('" + record['last_name'] + "', '" + encription_key + "')"),
        email: knex.raw("AES_ENCRYPT('" + record['email'] + "', '" + encription_key + "')"),
        phone: knex.raw("AES_ENCRYPT('" + record['phone'] + "', '" + encription_key + "')"),
        tenant_remark:record.tenant_remark,
        unit_id:record.unit_id,
        tenant_joining_date:record.tenant_joining_date,
        tenant_leaving_date:record.tenant_leaving_date,
        user_type_id: Number(userTypeId[0]['id']),
        status: 1,
        birthday: record.birthday,
        anniversary: record.anniversary,
        spouse_name: record.spouse_name,
        children: record.children,
        fav_cuisine: record.fav_cuisine,
        fav_hotel: record.fav_hotel,
        fav_travel_destination: record.fav_travel_destination,
        annual_household_income: record.annual_household_income,
        children_age: record.children_age,
        brand_suggestion: record.brand_suggestion
    }
}

async function format_update_tenant(record){
    return {
        id:record.id,
        first_name: knex.raw("AES_ENCRYPT('" + record['first_name'] + "', '" + encription_key + "')"),
        last_name: knex.raw("AES_ENCRYPT('" + record['last_name'] + "', '" + encription_key + "')"),
        phone: knex.raw("AES_ENCRYPT('" + record['phone'] + "', '" + encription_key + "')"),
        tenant_remark:record.tenant_remark,
        tenant_joining_date:record.tenant_joining_date,
        tenant_leaving_date:record.tenant_leaving_date,
        status: 1,
        birthday: record.birthday,
        anniversary: record.anniversary,
        spouse_name: record.spouse_name,
        children: record.children,
        fav_cuisine: record.fav_cuisine,
        fav_hotel: record.fav_hotel,
        fav_travel_destination: record.fav_travel_destination,
        annual_household_income: record.annual_household_income,
        children_age: record.children_age,
        brand_suggestion: record.brand_suggestion
    }
}