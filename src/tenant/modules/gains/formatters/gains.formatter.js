'use strict';
let dateFormat = require('dateformat');
module.exports = class gainsFormatter { 
    constructor() { }

    syncCustomers(req) {
        return {};
    }

    syncOAM(req) {
        return {};
    }
    
    syncProperty(req) {
        return {}
    };
    
    syncBuilding(req) {
        return {}
    };


    syncUnit(req) {
        return {}
    };
    syncBroker(req) {
        return {}
    };

    syncTenant(req) {
        return {activity_detail: req.activity_detail}
    };
}