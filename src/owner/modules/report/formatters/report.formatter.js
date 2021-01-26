'use strict';
module.exports = class reportFormatter {
    constructor() { }

    get_commission_list_data(req) {
        return {
            owner_id: req.owner_id,
            property_id: req.query.property_id,
			building_id: req.query.building_id,
            unit_number: req.query.unit_number,
            owner_email: req.query.owner_email,
			limit: parseInt(req.query.limit),
            offset: parseInt(req.query.offset),
            start_date:req.query.start_date
        };
    }
}