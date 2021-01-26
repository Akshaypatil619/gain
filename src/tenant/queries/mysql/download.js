let dateFormat = require('dateformat');
let knex = require("../../../../config/knex.js");
let now = new Date();
module.exports = class Deal_voucher {
    get_download_list(query_type, data) {
		let obj;
        switch (query_type) {
            case "get_download_list":
				 obj = knex("cc_download").select("*")
				.where("cc_download.tenant_role_id", data['tenant_role_id'])
                    // .where("cc_download.tenant_id", data['tenant_id'])
                    .orderBy('created_at', 'desc');
                if (data['search']) {
                    obj.where("cc_download.report_name", "like", "%" + data['search'] + "%");
                }
                if (data['from_date'] && data['to_date']) {
                    obj.whereBetween('cc_download.created_at', [dateFormat(data['from_date'], "yyyy-mm-dd 00:00:00"), dateFormat(data['to_date'], "yyyy-mm-dd 23:59:59")]);
                } else if (data['from_date'] && !data['to_date']) {
                    obj.whereBetween('cc_download.created_at', [dateFormat(data['from_date'], "yyyy-mm-dd"), dateFormat(now, "yyyy-mm-dd 23:59:59")]);
                } else if (!data['from_date'] && data['to_date']) {
                    obj.whereBetween('cc_download.created_at', ["1970-01-01", [dateFormat(data['to_date'], "yyyy-mm-dd 23:59:59")]]);
                }
                // obj.orderBy('cc_download.created_at','DESC')
                obj.limit(data['limit'])
					.offset(data['offset'])
                return obj;
                break;
            case "get_total_counts":
                 obj= knex("cc_download").select({
                    total_record: knex.raw("COUNT(*) ")
				}).where("cc_download.tenant_role_id", data['tenant_role_id'])
				if (data['search']) {
                    obj.where("cc_download.report_name", "like", "%" + data['search'] + "%");
                }
				if (data['from_date'] && data['to_date']) {
                    obj.whereBetween('cc_download.created_at', [dateFormat(data['from_date'], "yyyy-mm-dd 00:00:00"), dateFormat(data['to_date'], "yyyy-mm-dd 23:59:59")]);
                } else if (data['from_date'] && !data['to_date']) {
                    obj.whereBetween('cc_download.created_at', [dateFormat(data['from_date'], "yyyy-mm-dd"), dateFormat(now, "yyyy-mm-dd 23:59:59")]);
                } else if (!data['from_date'] && data['to_date']) {
                    obj.whereBetween('cc_download.created_at', ["1970-01-01", [dateFormat(data['to_date'], "yyyy-mm-dd 23:59:59")]]);
				}
				return obj;
                break;
        }
    }
}