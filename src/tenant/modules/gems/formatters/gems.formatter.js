'use strict';
let dateFormat = require('dateformat');
module.exports = class gemsFormatter { 
    constructor() { }

    syncCustomers(req) {
        return {};
    }
    
    processStatus(req) {
        return {
            process_id: req.body.process_id
        };
    }

    customReports(req) {
		req.query['start_date'] ? req.query['start_date'] = dateFormat(req.query['start_date'], "yyyy-mm-dd HH:MM:ss") : null;
		req.query['end_date'] ? req.query['end_date'] = dateFormat(req.query['end_date'], "yyyy-mm-dd HH:MM:ss") : null;
        let date = new Date();
        return {
			tenant_role_id: req.query.tenant_role_id,
            start_date: req.query.start_date ? req.query.start_date : 
            new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1),
            end_date: req.query.end_date ? req.query.end_date : 
            new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1)
        }
	}
	customerDump(req){
		return {
            tenant_role_id: req.query.tenant_role_id
        };
	}
}