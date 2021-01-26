

module.exports = class UserFormatter {
    constructor() { }

    get_property_list(req) {
        return {
            owner_id: req.owner_id,
            emirate_id: req.query.emirate_id,
            property_name: req.query.property_name,
            oam_id: req.query.oam_id,
            property_type_id: req.query.property_type_id,
            address: req.query.address,
            area: req.query.area,
            building_name: req.query.building_name,
            building_id: req.query.building_id,
            unit_no: req.query.unit_no,
            limit: req.query.limit ? parseInt(req.query.limit) : null,
            offset: req.query.offset ? parseInt(req.query.offset) : null
        }
    }

    get_building_list(req) {
        return {
            owner_id: req.owner_id,
            building_id: req.query.building_id,
            broker_name: req.query.broker_name,
            unit_no: req.query.unit_no,
            limit: req.query.limit ? parseInt(req.query.limit) : null,
            offset: req.query.offset ? parseInt(req.query.offset) : null
        }
    }
    get_all_building_list(req) {
        return {
            owner_id: req.owner_id
        }
    }

    getBrandList(req) {
        return {
            trans_id: req.trans_id
        }
    }
    get_all_oam_list(req) {
        return {
            owner_id: req.owner_id
        }
    }

    get_property_type(req) {
        return {

        };
    }

    get_unit_list(req) {
        return {
            owner_id: req.owner_id,
            property_id: req.query.property_id,
            building_name: req.query.building_name,
            unit_no: req.query.unit_no,
            title: req.query.title,
            type: req.query.type,
            limit: req.query.limit ? parseInt(req.query.limit) : null,
            offset: req.query.offset ? parseInt(req.query.offset) : null
        }
    }
    get_unit_total_list(req) {
        return {
            owner_id: req.owner_id,
            unit_no: req.query.unit_no,
            title: req.query.title,
            type: req.query.type,
            limit: req.query.limit ? parseInt(req.query.limit) : null,
            offset: req.query.offset ? parseInt(req.query.offset) : null
        }
    }

    unit_rent_list(req) {
        return {owner_id: req['owner_id']}
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