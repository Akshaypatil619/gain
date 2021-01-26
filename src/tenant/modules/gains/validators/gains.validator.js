'use strict';
module.exports = class gainsValidator { 
    constructor() { }

    syncCustomers() {
        return {};
    }
    syncOAM() {
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
        return {}
    };

    processStatus() {
        return {
            process_id: 'required'
        };
    }
}