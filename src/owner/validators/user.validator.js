

module.exports = class UserValidator {
    constructor() {}

    get_property_list() {
        return {
            owner_id: 'required'
        };
    }
    get_building_list() {
        return {
            owner_id: 'required'
        };
    }

    get_all_building_list() {
        return {
            owner_id: 'required'
        };
    }

    getBrandList() {
        return {
            trans_id: 'required'
        };
    }

    get_all_oam_list() {
        return {
            owner_id: 'required'
        };
    }
    get_property_type() {
        return {

        };
    }

    get_unit_list() {
        return {
            property_id: 'required'
        };
    }
    get_unit_total_list() {
        return {
        };
    }
    
    unit_rent_list(){
        return {}
    }
    updateUnitType(req) {
        return {
            id: "required",
            unit_type: "required",
        }
    }
    
    updateHotSelling(req) {
        return {
            id: "required",
            hot_selling: "required",
        }
    }
}