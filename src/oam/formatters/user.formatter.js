

module.exports = class UserFormatter {
    constructor() { }

    get_property_list(req) {
        return {
            oam_id: req.oam_id,
            emirate_id: req.query.emirate_id,
            property_name: req.query.property_name,
            property_type_id: req.query.property_type_id,
            address: req.query.address,
            area: req.query.area,
            limit: req.query.limit ? parseInt(req.query.limit) : null,
            offset: req.query.offset ? parseInt(req.query.offset) : null
        }
    }

    get_building_list(req) {
        return {
            oam_id: req.oam_id,
            property_id: req.query.property_id,
            building_id: req.query.building_id,
            broker_name: req.query.broker_name,
            limit: req.query.limit ? parseInt(req.query.limit) : null,
            offset: req.query.offset ? parseInt(req.query.offset) : null
        }
    }

    get_all_building_list(req) {
        return {
            oam_id: req.oam_id,
        }
    }

    getBrandList(req) {
        return {
        
        }
    }
    get_property_type(req) {
        return {

        };
    }

    get_unit_list(req) {
        console.log("iiiii",req.query)
        return {
            building_id: req.query.building_id,
            title: req.query.title,
            unit_no: req.query.unit_no,
            owner_email_id: req.query.owner_email_id,
            type: req.query.type,
            limit: req.query.limit ? parseInt(req.query.limit) : null,
            offset: req.query.offset ? parseInt(req.query.offset) : null
        }
    }

    get_unitlist(req) {
        return {
            building_id: req.query.building_id,
            title: req.query.title,
            unit_no: req.query.unit_no,
            owner_email_id: req.query.owner_email_id,
            type: req.query.type,
            limit: req.query.limit ? parseInt(req.query.limit) : null,
            offset: req.query.offset ? parseInt(req.query.offset) : null
        }
    }
    updateHotSelling(req) {
        return {
            id: req.body.id,
            hot_selling: req.body.hot_selling,
        }
    }
    updateUnitType(req) {
        if(req.body.unit_type=="rent" || req.body.unit_type=="sale"){
            if(req.body.unit_type=="rent"){
                return {
                    id: req.body.id,
                    unit_type: req.body.unit_type,
                    rent_amount: req.body.amount,
                }
            } else {
                return {
                    id: req.body.id,
                    unit_type: req.body.unit_type,
                    sale_amount: req.body.amount,
                }
            }
        } else {
            return {
                id: req.body.id,
                unit_type: req.body.unit_type,
            }
        }
        
    }
}