'use strict';
let Validator = require('validatorjs');
let tenant_model = new (require('../models/tenant.mysql'))();
let tenant_formatter = new (require('../formatters/tenant.formatter'))();
let tenant_validator = new (require('../validators/tenant.validator'))();
let tenant_response = require('../responses/tenant.response');
let response_handler = new (require('../../../../core/ResponseHandler'))();
let config = require("../../../../../config/config");
let knex = require("../../../../../config/knex.js");
const CronNotifications = require('../../../../core/cron_notifications.js');

let encription_key = config.encription_key;
tenant_validator.custom_date_rule(Validator);

module.exports = class TenantController {
    constructor() { }

    async add_tenant(req, res) {
        const notif_instance = new CronNotifications();
		await notif_instance.init_templates(req.activity_detail[0].id);
        const form_data = tenant_formatter.add_tenant(req);
        const rules = tenant_validator.add_tenant(form_data);
        const validation = new Validator(form_data, rules);
        if (validation.passes() && !validation.fails()) {

            tenant_model.get_customer_id(form_data.customer_unique_id).then(async custDetails => {

                if (!custDetails.length)
                    return res.json(tenant_response.failed('owner_not_exist'));
                custDetails = custDetails[0];

                if (custDetails.user_type == 'tenant')
                    return res.json(tenant_response.failed('incorrect_user_type'));

                let customer_id = custDetails.id;

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

                const email_sms_data = {
                    logo_url: config['base_url'],email: form_data.email, mobile: form_data.phone,
                    user_name: form_data.first_name + " " + form_data.last_name, language_code: form_data.language_code
                }

                // response_data['email_data'] = email_sms_data;
                // response_data['sms_data'] = email_sms_data;
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
            

                let data = { templateCode: 'CREATECCTENNAT', customerDetails: tenantCustomer, templateDetails };
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
                    notif_instance.send_notifications({ templateCode: 'ADDTENANTOWNER', customerDetails: ownerCustomer, templateDetails })
                                            .then(res => console.log(res)).catch(err => console.log(err));
                }
                return res.json(response_data);

            });

        } else return res.json(tenant_response.failed('form_fields_required', validation.errors.errors));
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
        if (validation.passes() && !validation.fails()) {

            tenant_model.get_customer_id(form_data.customer_unique_id).then(async custDetails => {

                if (!custDetails.length)
                    return res.json(tenant_response.failed('owner_not_exist'));
                custDetails = custDetails[0];

                if (custDetails.user_type == 'tenant')
                    return res.json(tenant_response.failed('incorrect_user_type'));

                let customer_id = custDetails.id;

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
                else if (tenantDetails[0].is_logged_in == 1) return res.json(tenant_response.failed("tenant_already_logged_in"));

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

                const email_sms_data = {
                    logo_url: config['base_url'], email: form_data.email, mobile: form_data.phone,
                    user_name: form_data.first_name + " " + form_data.last_name, language_code: form_data.language_code
                }

                response_data['email_data'] = email_sms_data;
                response_data['sms_data'] = email_sms_data;

                return response_handler.response(req, res, (response_data));

            });

        } else return res.json(tenant_response.failed('form_fields_required', validation.errors.errors));
    };

    async list_tenant(req, res) {
        const form_data = tenant_formatter.list_tenant(req);
        const rules = tenant_validator.list_tenant();
        const validation = new Validator(form_data, rules);
        if (validation.passes() && !validation.fails()) {


            tenant_model.get_customer_id(form_data.customer_unique_id).then(async custDetails => {

                if (!custDetails.length)
                    return res.json(tenant_response.failed('owner_not_exist'));
                custDetails = custDetails[0];

                if (custDetails.user_type == 'tenant')
                    return res.json(tenant_response.failed('incorrect_user_type'));

                let customer_id = custDetails.id;

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

                form_data.customer_id = customer_id;

                const tenant_list = await tenant_model.get_tenant_list(form_data);
                if (!tenant_list.length) return res.json(tenant_response.failed("tenant_not_found"));

                const return_result = { total_records: tenant_list.length, tenant_list };
                return res.json(tenant_response.success("tenant_found", return_result));

            });

        } else {
            return res.json(tenant_response.failed('form_fields_required', validation.errors.errors));
        }
    }

    async delete_tenant(req, res) {
        let form_data = tenant_formatter.delete_tenant(req);
        let rules = tenant_validator.delete_tenant();
        let validation = new Validator(form_data, rules);
        if (validation.passes() && !validation.fails()) {
            let customer = await tenant_model.delete_tenant("customer_exist", form_data);
            if (customer.length > 0) {
                let tenant = await await tenant_model.delete_tenant("get_tenant", form_data);
                if (tenant.length > 0) {
                    form_data['tenant_id'] = tenant[0].id;
                    let deleted_tenant = await tenant_model.delete_tenant("delete_tenant", form_data);
                    if (deleted_tenant > 0) {
                        await tenant_model.delete_tenant("update_unit", form_data)
                        return res.json(tenant_response.success("tenant_deleted"));
                    } else {
                        return res.json(tenant_response.failed("tenant_not_deleted"));
                    }
                } else {
                    return res.json(tenant_response.failed("tenant_not_exist"));
                }
            } else {
                return res.json(tenant_response.failed("owner_not_exist"));
            }
        } else {
            return res.json(tenant_response.failed('form_fields_required', validation.errors.errors));
        }
    }
}

async function format_insert_tenant(record) {
    let userTypeId = await knex('master_user_type').select('id').whereRaw(`master_user_type.code = 'tenant'`);
    let countryId = await knex('countries').select('id').whereRaw(`code = 'UAE'`);
    return {
        customer_unique_id: knex.raw("AES_ENCRYPT('" + (Math.floor(1000000000 + Math.random() * 9000000000)) + "', '" + encription_key + "')"),
        first_name: knex.raw("AES_ENCRYPT('" + record['first_name'] + "', '" + encription_key + "')"),
        last_name: knex.raw("AES_ENCRYPT('" + record['last_name'] + "', '" + encription_key + "')"),
        email: knex.raw("AES_ENCRYPT('" + record['email'] + "', '" + encription_key + "')"),
        phone: knex.raw("AES_ENCRYPT('" + record['phone'] + "', '" + encription_key + "')"),
        tenant_remark: record.tenant_remark,
        unit_id: record.unit_id,
        tenant_joining_date: record.tenant_joining_date,
        tenant_leaving_date: record.tenant_leaving_date,
        user_type_id: Number(userTypeId[0]['id']),
        status: 1,
        // birthday: record.birthday,
        // anniversary: record.anniversary,
        // spouse_name: record.spouse_name,
        // children: record.children,
        country_id: countryId.length > 0 ? countryId[0].id : null
    }
}

async function format_update_tenant(record) {
    return {
        id: record.customer_id,
        first_name: knex.raw("AES_ENCRYPT('" + record['first_name'] + "', '" + encription_key + "')"),
        last_name: knex.raw("AES_ENCRYPT('" + record['last_name'] + "', '" + encription_key + "')"),
        phone: knex.raw("AES_ENCRYPT('" + record['phone'] + "', '" + encription_key + "')"),
        dob: record.dob,
        // country_id: record.country_id,
        tenant_joining_date: record.tenant_joining_date,
        tenant_leaving_date: record.tenant_leaving_date,
        gender: record.gender,
        // birthday: record.birthday,
        // anniversary: record.anniversary,
        // spouse_name: record.spouse_name,
        // children: record.children,
        tenant_remark: record.tenant_remark,
        unit_id: record.unit_id
    }
}