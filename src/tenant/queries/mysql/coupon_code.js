let dateFormat = require('dateformat');
let knex = require("../../../../config/knex.js");
let now = new Date();
module.exports = class Country {
    add_coupon_code(query_type, data) {
        switch (query_type) {
            case "update":
                knex("coupon_code")
                    .where("id", data.couponCodeId)
                    .update(data.update_result)
                break;
        }
    }
    edit_coupon_code(query_type, data) {
        switch (query_type) {
            case "update":
                return knex("coupon_code")
                    .where('id', data['coupon_code_id'])
                    .update(data.data)
                break;
            case "update_coupon_code":
                return knex("coupon_code")
                    .where("id", data['coupon_code_id'])
                    .update(data.update_result)
                break;
        }
    }
    get_coupon_code_by_id(query_type, data) {
        switch (query_type) {
            case "get_coupon_code":
                return knex.select(data.columns)
                    .where("id", data['coupon_code_id'])
                    .from("coupon_code")
                break;
        }
    }
    get_coupon_code_list(query_type, data) {
        switch (query_type) {
            case "get_coupon_code_list":
                let obj = knex.select(data.columns)
                    .from("coupon_code")
                    .join("tenants_assigned_merchant", "tenants_assigned_merchant.merchant_id", "=", "coupon_code.merchant_id")
                    .leftJoin("merchants", "coupon_code.merchant_id", "=", "merchants.id")
                    .where("tenants_assigned_merchant.tenant_id", "=", data['tenant_id'])
                    .groupBy("coupon_code.id")

                /*   if (data['search'] || data['coupon_code_search']) {
                      obj.where("merchants.name", "like", "%" + data['search'] + "%")
                         .orWhere("coupon_code.coupon_name", "like", "%" + data['coupon_code_search'] + "%");
                  } */
                if (data['search']) {
                    obj.where("coupon_code.coupon_name", "like", "%" + data['search'] + "%")
                }
                if (data['from_date'] && data['to_date']) {
                    obj.whereBetween('coupon_code.created_at', [data['start_date'], data['end_date']]);
                } else if (data['start_date'] && !data['end_date']) {
                    obj.whereBetween('coupon_code.created_at', [data['start_date'], dateFormat(now, "yyyy-mm-dd 23:59:59")]);
                } else if (!data['start_date'] && data['end_date']) {
                    obj.whereBetween('coupon_code.created_at', ["1970-01-01", data['to_date'] + " 23:59:59"]);
                }
                return obj;
                break;
        }
    }
    get_merchant_list(query_type, data) {
        switch (query_type) {
            case "get_merchant_list":
            let select = {
                id: "merchants.id",
                name: "merchants.name"
            };
                return knex("tenants_assigned_merchant")
                    .select(select)
                    .join("merchants", 'tenants_assigned_merchant.merchant_id', '=', 'merchants.id')
                    .where('tenants_assigned_merchant.tenant_id', data['tenant_id'])
                    .groupBy('id')
                break;
        }
    }
}