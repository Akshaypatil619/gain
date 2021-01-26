'use strict';
module.exports = class OrganizationFormatter {
    constructor() { }

    add_organization(req) {
        return {
            id: req.body.id,
            name: req.body.name,
            code: req.body.code,
            email: req.body.email,
            mobile: req.body.mobile,
            address: req.body.address,
            area:req.body.area,
            emirate_id: req.body.emirate_id,
            country_id: req.body.country_id,
        };
    }

    edit_organization(req) {
        console.log("hhhhhhhh",req.body)
        return {
            id: req.body.id,
            name: req.body.name,
            code: req.body.code,
            email: req.body.email,
            mobile: req.body.mobile,
            address: req.body.address,
            area:req.body.area,
            emirate_id: req.body.emirate_id,
            country_id: req.body.country_id,
        };
    }

    get_organization(req) {
        return {
            id: req.params.id,
        };
    }

    list_organization(req) {
        return {
            name: req.query.name,
            code: req.query.code,
			email: req.query.email,
			mobile: req.query.mobile,
			limit: parseInt(req.query.limit),
			offset: parseInt(req.query.offset),
			from_date: req.query.start_date,
            to_date: req.query.end_date,
        };
    }
}