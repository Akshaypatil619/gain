'use strict';
module.exports = class schoolFormatter {
    constructor() { }

    get_all_unit_master(req) {
        return {
           
            name: req.query.name,
            customer_unique_id: req.query.customer_unique_id,
            unit_no:req.query.unit_no,
            owner_email_id:req.query.owner_email_id,
            limit: parseInt(req.query.limit),
			offset: parseInt(req.query.offset),
			from_date: req.query.start_date,
            to_date: req.query.end_date,
            
        }
    }

    get_rent_unit_list(req, type) {
        return {}
    }
}