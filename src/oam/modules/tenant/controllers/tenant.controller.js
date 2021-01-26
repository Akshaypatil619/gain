'use strict';
let Validator = require('validatorjs');
let tenant_model = new (require('../models/tenant.mysql'))();
let tenant_formatter = new (require('../formatters/tenant.formatter'))();
let tenant_validator = new (require('../validators/tenant.validator'))();
let tenant_response = require('../responses/tenant.response');
let config = require("../../../../../config/config");
let knex = require("../../../../../config/knex.js");
let encription_key = config.encription_key;
// let excel_model = new (require("../../../../tenant/models/Excel_model"))();

module.exports = class TenantController {
    constructor() { }

    async list_tenant(req, res) {
        let return_result = { total_records: 0, tenant_list: [] };
        let form_data = tenant_formatter.list_tenant(req);
        let rules = tenant_validator.list_tenant();
        let validation = new Validator(form_data, rules);
        if (validation.passes() && !validation.fails()) {
            let columns = {
                // id: "customers.id",
                first_name: knex.raw("CAST(AES_DECRYPT(customers.first_name,'" + encription_key + "') AS CHAR(255))"),
                last_name: knex.raw("CAST(AES_DECRYPT(customers.last_name,'" + encription_key + "') AS CHAR(255))"),
                phone: knex.raw("CAST(AES_DECRYPT(customers.phone,'" + encription_key + "')AS CHAR(255))"),
                email: knex.raw("CAST(AES_DECRYPT(customers.email,'" + encription_key + "')AS CHAR(255))"),
                customer_unique_id: knex.raw("CAST(AES_DECRYPT(customers.customer_unique_id,'" + encription_key + "') AS CHAR(255))"),
                user_type_name: "master_user_type.name",
                tenant_remark: "customers.tenant_remark",
                //  country_name: "countries.name",
                unit_number: "master_unit.unit_no",
                building_name: 'master_building.name',
                tenant_joining_date: "customers.tenant_joining_date",
                tenant_leaving_date: "customers.tenant_leaving_date",
                created_at: knex.raw("DATE_FORMAT(customers.created_at,'%Y-%c-%d  %h:%i:%S %p')"),
            };
            let tenants = tenant_model.list_tenant("list_tenant", columns, form_data);
            let tenatCount = await tenants;
            if (form_data['isExport'] != 'true') {
                return_result.total_records = tenatCount.length;
                if (tenatCount.length > 0) {
                    return_result.tenant_list = await tenants.limit(parseInt(form_data['limit'])).offset(parseInt(form_data['offset']));;
                    return res.json(tenant_response.success("tenant_found", return_result));
                } else {
                    return res.json(tenant_response.failed("tenant_not_found"));
                }
            } else {
                if (tenatCount.length > 0) {
                    let columns_exp = {
                        'First Name': knex.raw("CAST(AES_DECRYPT(customers.first_name,'" + encription_key + "') AS CHAR(255))"),
                        'Last Name': knex.raw("CAST(AES_DECRYPT(customers.last_name,'" + encription_key + "') AS CHAR(255))"),
                        'Phone': knex.raw("CAST(AES_DECRYPT(customers.phone,'" + encription_key + "')AS CHAR(255))"),
                        'Email': knex.raw("CAST(AES_DECRYPT(customers.email,'" + encription_key + "')AS CHAR(255))"),
                        'Unique Id': knex.raw("CAST(AES_DECRYPT(customers.customer_unique_id,'" + encription_key + "') AS CHAR(255))"),
                        'User Type': "master_user_type.name",
                        'Remark': "customers.tenant_remark",
                        // 'Country Name': "countries.name",
                        'Unit Number': "master_unit.unit_no",
                        'Building Name': 'master_building.name',
                        'Joining Date': "customers.tenant_joining_date",
                        'Leaving Date': "customers.tenant_leaving_date",
                        'Created Date': knex.raw("DATE_FORMAT(customers.created_at,'%Y-%c-%d  %h:%i:%S %p')"),
                    };
                    tenants.clearSelect();
                    tenants.select(columns);
                    let export_obj = {
                        query: tenants.toString(),
                        report_name: form_data['reports_name'],
                        tenant_role_id: form_data['tenant_role_id'],
                        format: form_data['format']
                    };
                    // let file_path = await excel_model.dynamicReportExport(export_obj)
                    return res.json(tenant_response.success('downloading_is_prosses'));
                } else return res.json(tenant_response.failed('excel_data_not_found'));

            }

        } else {
            return res.json(tenant_response.failed('form_fields_required', validation.errors.errors));
        }
    }




    async list_countries(req, res) {
        let form_data = tenant_formatter.list_countries(req);
        let rules = tenant_validator.list_countries();
        let validation = new Validator(form_data, rules);
        if (validation.passes() && !validation.fails()) {
            let result = await tenant_model.list_countries("list_countries", form_data);
            if (result.length > 0) {
                return res.json(tenant_response.success("country_found", result));
            } else {
                return res.json(tenant_response.success("country_not_found"));
            }
        } else {
            return res.json(tenant_response.failed('form_fields_required', validation.errors.errors));
        }
    }

}