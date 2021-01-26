'use strict';
let Validator = require('validatorjs');
let report_model = new (require('../models/report.mysql'))();
let report_formatter = new (require('../formatters/report.formatter'))();
let report_validator = new (require('../validators/report.validator'))();
let report_response = require('../responses/report.response');

module.exports = class ReportController {
    constructor() { }

    async get_commission_list_data(req, res) {
        let return_result = {};
        let form_data = report_formatter.get_commission_list_data(req);
        let rules = report_validator.get_commission_list_data();
        let validation = new Validator(form_data, rules);
        if (validation.passes() && !validation.fails()) {
            let report_query = report_model.get_commission_list(form_data);
            return_result.total_records = (await report_query).length;
            if (return_result.total_records>0) {
                    return_result.report_list = await report_query
                        .limit(parseInt(form_data['limit']))
                        .offset(parseInt(form_data['offset']));
                    return res.json(report_response.success("report_found", return_result));
            } else {
                return res.json(report_response.failed("report_not_found"));
            }
        } else {
            return res.json(report_response.failed('form_fields_required', validation.errors.errors));
        } 
    }
}
