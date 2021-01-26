'use strict';
module.exports = class ownerFormatter {
    constructor() { }

    add_owner(req) {
        return {
            id: req.body.id,
            unit_id: req.body.unit_id,
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            email: req.body.email,
            phone: req.body.phone,
            oam_name: req.query.oam_name,
            birthday: req.body.birthday,
            anniversary: req.body.anniversary,
            spouse_name: req.body.spouse_name,
            children: req.body.children,
            language_code: req.query.language_code,
            fav_cuisine: req.body.fav_cuisine,
            fav_hotel: req.body.fav_hotel,
            fav_travel_destination: req.body.fav_travel_destination,
            annual_household_income: req.body.annual_household_income,
            children_age: req.body.children_age,
            brand_suggestion: req.body.brand_suggestion

        };
    }

    edit_owner(req) {
        return {
            id: req.body.id,
            unit_id: req.body.unit_id,
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            email: req.body.email,
            oam_name: req.query.oam_name,
            phone: req.body.phone,
            language_code: req.query.language_code,
            birthday: req.body.birthday,
            anniversary: req.body.anniversary,
            spouse_name: req.body.spouse_name,
            children: req.body.children,

            fav_cuisine: req.body.fav_cuisine,
            fav_hotel: req.body.fav_hotel,
            fav_travel_destination: req.body.fav_travel_destination,
            annual_household_income: req.body.annual_household_income,
            children_age: req.body.children_age,
            brand_suggestion: req.body.brand_suggestion
        };
    }

    get_owner(req) {
        return {
            id: req.params.id,
            language_code: req.query.language_code
        };
    }

    list_owner(req) {
        console.log("req.query=", req.query);
        return {
            tenant_id: req['tenant_id'],
            name: req.query.name,
            email: req.query.email,
            phone: req.query.phone,
            oam_name:req.query.oam_name,
            property_id: req.query.property_id,
            oam_id: req.query.oam_id,
            building_id: req.query.building_id,
			customer_unique_id: req.query.customer_unique_id,
			limit: parseInt(req.query.limit),
			offset: parseInt(req.query.offset),
			from_date: req.query.start_date,
            to_date: req.query.end_date,
            language_code: req.query.language_code,


            building_name: req.query.building_name,
            unit_no: req.query.unit_no


        };
    }
    get_owner_tenant(req) {
        return {};
    }

    add_manual_settlement(req) {
        return {
            unit_id: req.body.unit_id,
            settlement_reason: req.body.settlement_reason
        }
    }

    manual_settlement_list(req) {
        return {
            property_name: req.query.property_name,
            property_manager: req.query.property_manager,
            unit_number: req.query.unit_number,
            owner_name: req.query.owner_name,
            limit: req.query.limit ? parseInt(req.query.limit) : 10,
            offset: req.query.offset ? parseInt(req.query.offset) : 0
        }
    }
}