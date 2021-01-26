let messages = require("../../../config/messages.js");
let status_codes = require("../../../config/response_status_codes.js");
let Response_adapter = require("../../core/response_adapter");
let Queries = require("../queries/mysql/report");
let response = new Response_adapter();
let queries = new Queries();

module.exports = class Report_model {
	constructor() { }

	async get_commission_report_list(query_data, callback) {
		let return_result = {};
		query_data['brandId'] = "";
		if(query_data['brand_id'].length>0){
			query_data['brand_id'].forEach((element,index) => {
				query_data['brandId'] += "'"+element+"',";
			});
		} else {
			query_data['brandId'] = null;
		}
		if(query_data['brandId'] !=null){
			query_data['brand_id'] = query_data['brandId'].substring(0, query_data['brandId'].length-1).trim();
		} else {
			query_data['brand_id'] = null;
		}
		let commission_query = queries.get_commission_list(query_data);
		return_result.total_records = (await commission_query).length;
		if ((return_result.total_records > 0)) {
			return_result.report_list = await commission_query
				.limit(parseInt(query_data['limit']))
				.offset(parseInt(query_data['offset']));
			return callback(response.response_success(true, status_codes.report_found, messages.report_found, return_result));
		} else {
			return callback(response.response_error(false, status_codes.report_not_found, messages.report_not_found, return_result));
		}
	}

	


	async get_customer_transaction_list(query_data, callback) {
		let return_result = {};
		console.log("10*",query_data);
		let rslt = await queries.get_customer_transaction_list(query_data);
		
		return_result.report_list = rslt;
		return_result.total_records = rslt.length;

		if (rslt.length > 0) {
			return_result.report_list = await queries.get_customer_transaction_list(query_data)
				.limit(parseInt(query_data['limit']))
				.offset(parseInt(query_data['offset']));
		
			return callback(response.response_success(true, status_codes.report_found, messages.report_found, return_result));
		} else {
			return callback(response.response_success(true, status_codes.report_found, messages.report_found, return_result));
		}
	}

	/* 
		get_login_report_list(query_data, callback) {
			let columns = {
				id: "login_count.id",
				os: "login_count.os",
				users: knex.raw("CAST(AES_DECRYPT(login_count.users,'rainbowfinance') AS CHAR(255))"),
				email: knex.raw("CAST(AES_DECRYPT(login_count.email,'rainbowfinance') AS CHAR(255))"),
				logged_in_grand_total: "login_count.logged_in_grand_total",
				customers_unique_count: "login_count.customers_unique_count",
				logged_in_customers: "login_count.logged_in_customers",
				date: "login_count.date",
				last_logged_time: knex.raw("CASE WHEN (login_count.last_loggedin_time) IS NULL THEN 'N/A' ELSE login_count.last_loggedin_time END"),
				phone: knex.raw("CAST(AES_DECRYPT(login_count.phone,'rainbowfinance') AS CHAR(255))"),
			};
			query_data.columns = knex.raw('count(login_count.id) as total_records');
	
			let return_result = {};
			let obj = queries.get_login_report_list("get_login_report_list", query_data)
			if (query_data['isExport'] != 'true') {
				obj.then((t_result) => {
					if (t_result.length > 0) {
						return_result.total_records = t_result.length;
						obj.clearSelect();
						obj.select(columns);
						if (query_data.limit) {
							obj.limit(parseInt(query_data['limit']))
							obj.offset(parseInt(query_data['offset']))
						}
						obj.then((result) => {
							if (result.length > 0) {
								return_result.report_list = result;
								//return_result.login_type_list = result;
								return callback(response.response_success(true, status_codes.report_found, messages.report_found, return_result));
							} else {
								return callback(response.response_error(false, status_codes.report_not_found, messages.report_not_found));
							}
						})
					} else return callback(response.response_error(false, status_codes.report_not_found, messages.report_not_found));
				}).catch((err) => callback(err))
			} else {
				obj.then((t_result) => {
					if (t_result.length > 0) {
	
						obj.clearSelect();
						obj.select(columns);
						let export_obj = {
							query: obj.toString(),
							report_name: query_data['reports_name'],
							report_login: query_data['reports_login'],
							tenant_role_id: query_data['tenant_role_id'],
							format: query_data['format'],
						};
						excel_model.dynamicReportExport(export_obj)
						return callback(response.response_success(status_codes.downloading_is_prosses, messages.downloading_is_prosses));
	
					} else return response.response_success(false, status_codes.excel_data_not_found, messages.excel_data_not_found);
				})
			}
		}
	
		get_email_logs_list(query_data, callback) {
			let return_result = {};
			let obj = queries.get_email_logs_list("get_email_logs_list", query_data)
			obj.then((t_result) => {
				if (t_result.length > 0) {
					return_result.total_record = Object.keys(t_result).length;
					return obj
						.orderByRaw("(SELECT NULL)")
						.limit(query_data['limit'])
						.offset(query_data['offset'])
	
				} else {
					throw new Error("email_logs_not_found");
				}
			}).then((result) => {
				if (result.length > 0) {
					return_result.data = result;
					return callback(response.response_success(true, status_codes.email_logs_found, messages.email_logs_found, (return_result)));
				} else {
					return callback(response.response_error(false, status_codes.email_logs_not_found, messages.email_logs_not_found));
				}
			}).catch((err) => callback(common_functions.catch_error(err)));
		}
	
		get_sms_logs_list(query_data, callback) {
			let return_result = {};
			let obj = queries.get_sms_logs_list("get_sms_logs_list", query_data)
			obj.then((t_result) => {
				if (t_result.length > 0) {
					return_result.total_record = Object.keys(t_result).length;
					return obj
						.orderByRaw("(SELECT NULL)")
						.limit(query_data['limit'])
						.offset(query_data['offset'])
	
				} else {
					throw new Error("sms_logs_not_found");
				}
			}).then((result) => {
				if (result.length > 0) {
					return_result.data = result;
					return callback(response.response_success(true, status_codes.sms_logs_found, messages.sms_logs_found, (return_result)));
				} else {
					return callback(response.response_error(false, status_codes.sms_logs_not_found, messages.sms_logs_not_found));
				}
			}).catch((err) => callback(common_functions.catch_error(err)));
		} */
}

