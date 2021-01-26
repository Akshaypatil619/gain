

module.exports = class UserValidator {
    constructor() {}

    get_property_list() {
        return {
            oam_id: 'required'
        };
    }

    get_building_list() {
        return {
            oam_id: 'required'
        };
    }
    get_all_building_list() {
        return {
            oam_id: 'required'
        };
    }

    getBrandList() {
        return {
         
        }
    }
	

    get_property_type() {
        return {

        };
    }

    get_unit_list() {
        return {
            building_id: 'required'
        };
    }

    get_unitlist() {
        return {
            building_id: 'required'
        };
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