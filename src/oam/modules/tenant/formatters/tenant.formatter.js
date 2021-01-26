'use strict';
module.exports = class tenantFormatter {
    constructor() { }

    list_tenant(req) {
        return {
            tenant_id: req['tenant_id'],
            oam_id: req['oam_id'],
            name: req.query.name,
            email: req.query.email,
            phone: req.query.phone,
            building_name: req.query.building_name,
            building_id: req.query.building_id,
            customer_unique_id: req.query.customer_unique_id,
            limit: parseInt(req.query.limit),
            offset: parseInt(req.query.offset),
            from_date: req.query.start_date,
            to_date: req.query.end_date,
            language_code: req.query.language_code,
            isExport: req.query.isExport,
            reports_name: req.query.reports_name,
            format: req.query.format,
        };
    }
}