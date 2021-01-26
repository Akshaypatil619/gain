var newId = require("uuid-pure").newId;
let dateFormatter = require("../../../../common/date_format/date.formatter");
module.exports = class CronFormatter {

    getCustomersList(req) {
        return {
            date: dateFormatter.formatSqlDate(req.query.date),
            language_code: req.query.language_code
        };
	}
	
	transactionsList(req) {
        return {
            date: dateFormatter.formatSqlDate(req.query.date),
            language_code: req.query.language_code
        };
	}
	
	statementList(req) {
        return {
            date: dateFormatter.formatSqlDate(req.query.date),
            language_code: req.query.language_code
        };
    }
    getCustomersReferralList(req) {
        return {
            date: dateFormatter.formatSqlDate(req.query.date),
            language_code: req.query.language_code
        };
    }
    getProductReferralList(req) {
        return {
            date: dateFormatter.formatSqlDate(req.query.date),
            language_code: req.query.language_code
        };
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
    syncTenant(req) {
        return {activity_detail: req.activity_detail}
    };
   
    getBrandList(req) {
        return {
        
        }
    }
}
