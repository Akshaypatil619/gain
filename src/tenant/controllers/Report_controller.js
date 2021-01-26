
"use strict";
let Report_model = require("../models/Report_model");
let report_model = new Report_model();
// var json2xls = require('json2xls');
// let fs = require('fs');
// const path = require('path');

module.exports = class Report_controller {
	constructor() { }

	get_commission_report_list(req, res) {
		console.log("in commigggggggggggggggggggggggggggggggggg",req.query.brand_id);
		let query_data = {
			oam_email: req.query.oam_email,
			oam_name: req.query.oam_name,
			brand_name: req.query.brand_name,
			brand_id: (req.query.brand_id==null || req.query.brand_id==undefined || req.query.brand_id=="") ? [] : (req.query.brand_id.split(',')),
			oam_id: req.query.oam_id,
			building_name: req.query.building_name,
            unit_no: req.query.unit_no,
			limit: parseInt(req.query.limit),
			offset: parseInt(req.query.offset),
		};

		report_model.get_commission_report_list(query_data, function(result) {
			res.json(result);
		});
	}


	get_customer_transaction_list(req, res) {
		let query_data = {
			oam_id:req.query.oam_id,
			building_id:req.query.building_id,
			user_id:req.query.user_id,
			brand_name:req.query.brand_name,
			unit_no:req.query.unit_no,
			limit: parseInt(req.query.limit),
			offset: parseInt(req.query.offset),
		};
		report_model.get_customer_transaction_list(query_data, function(result) {
			res.json(result);
		});
	}

	/* 
	export_report_in_excel(req, res) {
		let query_data = {};
		try {
			query_data['tenant_id'] = req['tenant_id'],
				query_data['developer_setting_data'] = req.body.developer_setting_data,
				query_data['user_report_name'] = req.body.user_report_name,
				query_data['user_customize_cols'] = req.body.user_customize_cols,
				query_data['user_aggregate_columns'] = req.body.user_aggregate_columns,
				query_data['single_filter_group_cols'] = req.body.single_filter_group_cols,
				query_data['date_filter'] = req.body.date_filter,

				query_data['limit'] = req.body.limit,
				query_data['offset'] = req.body.offset,

				//filter cols
				query_data['search'] = req.body.search,
				// query_data['date_time_filter_column'] = req.body.date_time_filter_column,
				query_data['start_date'] = req.body.start_date,
				query_data['end_date'] = req.body.end_date,
				query_data['order'] = req.body.order,
				query_data['isExport'] = req.body.isExport
		} catch (error) {
			console.log(error)
		}

		report_model.create_dynamic_report_by_user(query_data, (result) => {
			res.json(result);
		})
	}
	get_login_report_list(req, res) {
		let query_data = {
			['limit']: parseInt(req.query.limit),
			['offset']: parseInt(req.query.offset),
			['id']: req.query.id,
			['from_date']: req.query.start_date,
			['to_date']: req.query.end_date,
			['os']: req.query.os,
			['users']: req.query.users,
			['email']: req.query.email,
			['isExport']: req.query.isExport,
			['reports_login']: req.query.report_login,
			['logged_in_grand_total']: req.query.logged_in_grand_total,
			['customers_unique_count']: req.query.customers_unique_count,
			['logged_in_customers']: req.query.logged_in_customers,
			['tenant_role_id']: req.query.tenant_role_id,
			['format']: req.query.format,
			['customer_id']: req.query.cusromer_id,
			['phone']: req.query.phone,
			['reports_name']: 'Login_Report',
		};
		report_model.get_login_report_list(query_data, function (result) {
			res.json(result);
		})
	}
	get_email_logs_list(req, res) {
		let data = {
			tenant_id: req['tenant_id'],
			from_date: req.query.start_date,
			to_date: req.query.end_date,
			limit: parseInt(req.query.limit),
			offset: parseInt(req.query.offset),
			// search: req.query.customer_name,
			referrer_customer_id: req.query.referrel_customer_id,
			membership_no: req.query.membership_no,
		}
		report_model.get_email_logs_list(data, function (result) {
			res.json(result);
		})
	}
	get_sms_logs_list(req, res) {
		let data = {
			tenant_id: req['tenant_id'],
			from_date: req.query.start_date,
			to_date: req.query.end_date,
			limit: parseInt(req.query.limit),
			offset: parseInt(req.query.offset),
			// search: req.query.customer_name,
			referrer_customer_id: req.query.referrel_customer_id,
			membership_no: req.query.membership_no,
		}
		report_model.get_sms_logs_list(data, function (result) {
			res.json(result);
		})
	} */

}