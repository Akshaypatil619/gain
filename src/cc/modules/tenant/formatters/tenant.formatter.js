'use strict';
module.exports = class tenantFormatter {
    constructor() { }

    add_tenant(req) {
        return {
            id: req.body.id,
            unit_id: req.body.unit_id,
            customer_unique_id: req.body.customer_unique_id,
            // country_id: req.body.country_id,
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            email: req.body.email,
            phone: req.body.phone,
            dob: req.body.dob,
            tenant_joining_date: req.body.tenant_joining_date,
            tenant_leaving_date: req.body.tenant_leaving_date,
            tenant_remark: req.body.tenant_remark,
            gender:req.body.gender,
            birthday: req.body.birthday,
            anniversary: req.body.anniversary,
            spouse_name: req.body.spouse_name,
            children: req.body.children,
            language_code: req.query.language_code
        };
    }

    edit_tenant(req) {
        return {
            tenant_unique_id: req.body.tenant_unique_id,
            customer_unique_id: req.body.customer_unique_id,
            unit_id: req.body.unit_id,
            // country_id: req.body.country_id,
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            email: req.body.email,
            phone: req.body.phone,
            dob:req.body.dob,
            tenant_joining_date: req.body.tenant_joining_date,
            tenant_leaving_date: req.body.tenant_leaving_date,
            tenant_remark: req.body.tenant_remark,
            gender:req.body.gender,
            birthday: req.body.birthday,
            anniversary: req.body.anniversary,
            spouse_name: req.body.spouse_name,
            children: req.body.children,
            language_code: req.query.language_code
        };
    }

    get_tenant(req) {
        return {
            id: req.query.id,
            language_code: req.query.language_code
        };
    }

    list_tenant(req) {
        return {
			name: req.query.name,
			email: req.query.email,
			phone: req.query.phone,
			customer_unique_id: req.query.customer_unique_id,
			limit: parseInt(req.query.limit),
			offset: parseInt(req.query.offset),
			from_date: req.query.start_date,
            to_date: req.query.end_date,
            language_code: req.query.language_code
        };
    }

    delete_tenant(req) {
        return {
            customer_unique_id: req.body.customer_unique_id,
            tenant_unique_id: req.body.tenant_unique_id
        };
    }
}