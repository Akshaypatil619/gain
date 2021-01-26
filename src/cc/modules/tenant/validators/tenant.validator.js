'use strict';
module.exports = class tenantValidator {
    constructor() { }

    add_tenant(formData) {
        return {
            customer_unique_id: "required",
            first_name: "required",
            email: "required",
            phone: "required",
            unit_id: "required",
            tenant_joining_date: "required|date-ymd",
            tenant_leaving_date: `required|date-ymd|after-date:${formData.tenant_joining_date}`
        };
    }

    custom_date_rule(Validator) {
        Validator.register('date-ymd', function (value, requirement, attribute) {
            if (value.match(/\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])/)) {
                return !isNaN(Date.parse(value));
            } else return false;
        }, 'The date should be in yyyy-mm-dd format.');
        Validator.register('after-date', function (value, requirement, attribute) {
            if (!isNaN(Date.parse(value)) && !isNaN(Date.parse(requirement))
                && new Date(value) > new Date(requirement))
                return true;
            else return false;
        }, `The :attribute should be greater than :after-date.`);
    }

    edit_tenant(formData) {
        return {
            tenant_unique_id: "required",
            customer_unique_id: "required",
            first_name: "required",
            phone: "required",
            unit_id: "required",
            tenant_joining_date: "required|date-ymd",
            tenant_leaving_date: `required|date-ymd|after-date:${formData.tenant_joining_date}`
        };
    }
    get_tenant() {
        return {
            id: "required",
        };
    }
    list_tenant() {
        return {
            customer_unique_id: "required"
        };
    }
    delete_tenant() {
        return {
            customer_unique_id: "required",
            tenant_unique_id: "required"
        };
    }
}