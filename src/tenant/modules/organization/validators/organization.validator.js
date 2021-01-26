'use strict';
module.exports = class OrganizationValidator {
    constructor() { }

    add_organization() {
        return {
            name: "required",
            code: "required",
        };
    }
    edit_organization() {
        return {
            id: "required",
            name: "required",
            code: "required"
        };
    }
    get_organization() {
        return {
            id: "required",
        };
    }
    list_organization() {
        return {};
    }
}