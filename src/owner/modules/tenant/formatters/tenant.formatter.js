'use strict';
module.exports = class tenantFormatter {
    constructor() { }

    add_tenant(req) {
        return {
            id: req.body.id,
            customer_id: req.owner_id,
            unit_id: req.body.unit_id,
            country_id: req.body.country_id,
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            email: req.body.email,
            phone: req.body.phone,
            // dob: req.body.dob,
            // gender:req.body.gender,
            status:req.body.status,
            tenant_joining_date: req.body.tenant_joining_date,
            tenant_leaving_date: req.body.tenant_leaving_date,
            tenant_remark: req.body.tenant_remark,
            language_code: req.query.language_code,
            birthday: req.body.birthday,
            anniversary: req.body.anniversary,
            spouse_name: req.body.spouse_name,
            children: req.body.children,
        };
    }

    edit_tenant(req) {
        return {
            id: req.body.id,
            customer_id: req.owner_id,
            country_id: req.body.country_id,
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            email: req.body.email,
            phone: req.body.phone,
            unit_id: req.body.unit_id,
            // dob:req.body.dob,
            // gender:req.body.gender,
            status:req.body.status,
            tenant_joining_date: req.body.tenant_joining_date,
            tenant_leaving_date: req.body.tenant_leaving_date,
            tenant_remark: req.body.tenant_remark,
            language_code: req.query.language_code,
            birthday: req.body.birthday,
            anniversary: req.body.anniversary,
            spouse_name: req.body.spouse_name,
            children: req.body.children,
        };
    }

    get_tenant(req) {
        return {
            id: req.params.id,
            language_code: req.query.language_code
        };
    }

    list_tenant(req) {
        return {
            tenant_id: req['tenant_id'],
            customer_id: req['owner_id'],
			name: req.query.name,
			email: req.query.email,
            phone: req.query.phone,
            building_name: req.query.building_name,
            building_id: req.query.building_id,
            oam_id: req.query.oam_id,
            unit_no: req.query.unit_no,
			customer_unique_id: req.query.customer_unique_id,
			limit: parseInt(req.query.limit),
			offset: parseInt(req.query.offset),
			from_date: req.query.start_date,
            to_date: req.query.end_date,
            language_code: req.query.language_code
        };
    }

    list_countries(req) {
        return {};
    }

    list_emirate(req) {
        return {};
    }

    list_building_code(req) {
        return {owner_id: req['owner_id']}
    }
}