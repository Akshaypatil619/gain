'use strict';
module.exports = class reportFormatter {
    constructor() { }

    get_commission_list_data(req) {
        return {
            oam_id: req.oam_id,
            property_name: req.query.property_name,
			building_name: req.query.building_name,
            unit_number: req.query.unit_number,
            owner_email: req.query.owner_email,
			limit: parseInt(req.query.limit),
            offset: parseInt(req.query.offset),
            start_date:req.query.start_date
        };
    }
    get_customer_transaction_list(req){
        return {
            oam_id:req['oam_id'],
            building_id:req.query.building_id,
            user_id:req.query.user_id,
            brand_name:req.query.brand_name,
            unit_id:req.query.unit_id,
            trans_id:req.query.trans_id,
            limit: parseInt(req.query.limit),
            offset: parseInt(req.query.offset),
        }
    };

    unit_report(req){
        return {
            oam_id:req['oam_id'],
            building_id:req.query.building_id,
            property_id:req.query.property_id,
            unit_id:req.query.unit_id,
            limit: parseInt(req.query.limit),
            offset: parseInt(req.query.offset),
        }
    };
}