'use strict';
module.exports = class ownerValidator {
    constructor() { }

    add_owner() {
        return {
            first_name: "required",
            email: "required",
            phone: "required"
        };
    }
    edit_owner() {
        return {
            id: "required",
            first_name: "required",
            phone: "required"
        };
    }
    get_owner() {
        return {
            id: "required",
        };
    }
    list_owner() {
        return {};
    }
    get_owner_tenant() {
        return {};
    }

    add_manual_settlement() {
        return {
            unit_id: 'required',
            settlement_reason: 'required'
        }
    }

    manual_settlement_list() {
        return {}
    }
}