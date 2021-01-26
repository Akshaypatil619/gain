
module.exports = class MasterValidator {
    constructor() { }

    get_master_list() {
        return {
            // oam_id: 'required'
        };
    }
    consume_promocode() {
        return {
            promocode: 'required'
        }
    }


    get_hot_selling_properties() {
        return {
            // oam_id: 'required'
        };
    }


    get_property_list() {
        return {
            // oam_id: 'required'
        };
    }

    get_property_suggession() {
        return {
            search: 'required'
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
    unit_rent_list() {
        return {
            customer_unique_id: 'required'
        };
    }

    updateUnitType(req) {
        return {
            customer_unique_id: "required",
            unit_id: "required",
            unit_type: "required",
        }
    }
    syncProperty(req) {
        return {

        }
    };

    syncBuilding(req) {
        return {

        }
    };

    syncUnit(req) {
        return {

        }
    };

    syncBroker(req) {
        return {

        }
    };

    addFamily() {
        return {
            customer_unique_id: 'required',
            first_name: 'required',
            last_name: 'required',
            email: 'required',
            phone: 'required|numeric|digits:9'
        }
    };

    familyList() {
        return {
            customer_unique_id: 'required'
        }
    };

    deleteFamily() {
        return {
            customer_unique_id: 'required',
            family_unique_id: 'required'
        }
    }

    get_broker_list() {
        return {};
    }
}