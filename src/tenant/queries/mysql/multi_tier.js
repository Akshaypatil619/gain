let dateFormat = require('dateformat');
let knex = require("../../../../config/knex.js");
let now = new Date();
module.exports = class Customer_segments {
    add_multi_tier(query_type, data) {
        switch (query_type) {
            case "get_customer_tier":
                return knex.select()
                    .where("name", data['name'])
                    .where("tenant_id", data['tenant_id'])
                    .table('customer_tiers')
                break;
            case "get_tiers":
                return knex.select(knex.raw('*'))
                    .where("tenant_id", data['tenant_id'])
                    .table('customer_tiers')
                break;
            case "insert":
                return knex("customer_tiers").insert(data);
                break;
            case "add_customer_point_config":
                return knex("customer_tier_point_configurations").insert(data);
                break;
            case "update_login":
                return knex("customer_tiers")
                    .update(data.logic_obj)
                    .where('id', data.customerTierId)
                break
        }
    }
    createNoolsLogic(query_type, data) {
        switch (query_type) {
            case "":
                break;
        }
    }
    edit_multi_tier(query_type, data) {
        switch (query_type) {
            case "update_customer_tiers":
                return knex("customer_tiers")
                    .where("id", data['customer_tier_id'])
                    .update(data.data)
                break;
            case "update_tier_point_configurations":
                return knex("customer_tier_point_configurations")
                    .update({ 'status': 0 })
                    .where("customer_tier_point_configurations.customer_tier_id", data['customer_tier_id']);
                break;
            case "insert_tier_point_configurations":
                return knex("customer_tier_point_configurations").insert(data)
                break;
            case "update_customer_tier":
                return knex("customer_tiers")
                    .update(data.logic_obj)
                    .where('id', data['customer_tier_id'])
                break;
        }
    }
    get_multi_tier_by_id(query_type, data) {
        switch (query_type) {
            case "point_configuration":
                return knex("customer_tier_point_configurations")
                    .join('master_point_type', 'master_point_type.id', 'customer_tier_point_configurations.point_type_id')
                    .select("customer_tier_point_configurations.*", "master_point_type.point_type_name", "master_point_type.is_transferable")
                    .where("customer_tier_point_configurations.customer_tier_id", data['customer_tier_id']);
                break;
            case "get_customer_tier":
                return knex.select("customer_tiers.*")
                    .where("id", data['customer_tier_id'])
                    .where("tenant_id", data['tenant_id'])
                    .from("customer_tiers")
                break;
        }
    }
    get_multi_tiers_list(query_type, data) {
        switch (query_type) {
            case "get_list":
                let columns = {
                    customer_tier_id: "customer_tiers.id",
                    name: "customer_tiers.name",
                    description: "customer_tiers.description",
                    tier_price: "customer_tiers.tier_price",
                    tier_order: "customer_tiers.tier_order",
                    created_at: "customer_tiers.created_at",
                };
                let obj = knex.select(columns)
                    .from("customer_tiers")
                    .where("customer_tiers.tenant_id", "=", data['tenant_id'])

                if (data['search']) {
                    obj.where("customer_tiers.name", "like", "%" + data['search'] + "%");
                }
                if (data['from_date'] && data['to_date']) {
                    obj.whereBetween('customer_tiers.created_at', [data['from_date'], data['to_data']]);
                } else if (data['from_date'] && !data['to_date']) {
                    obj.whereBetween('customer_tiers.created_at', [data['from_date'], dateFormat(now, "yyyy-mm-dd 23:59:59")]);
                } else if (!data['from_date'] && data['to_date']) {
                    obj.whereBetween('customer_tiers.created_at', ["1970-01-01", data['to_date'] + " 23:59:59"]);
                }
                obj.limit(data['limit'])
                    .offset(data['offset'])
                return obj;
                break;
        }
    }
    add_customer_tier_upgrade(query_type, data) {
        switch (query_type) {
            case "upgrade":
                return knex("customer_tier_upgrades")
                    .insert(data);
                break;
        }
    }
    edit_customer_tier_upgrade(query_type, data) {
        switch (query_type) {
            case "modify_upgrade":
                return knex("customer_tier_upgrades")
                    .where("id", data['customer_tier_upgrade_id'])
                    .update(data.data)
                break;
        }
    }
    get_customer_tier_upgrade_by_id(query_type, data) {
        switch (query_type) {
            case "get_tier_upgrade":
                return knex.select('customer_tier_upgrades.*', data.columns)
                    .where("customer_tier_upgrades.id", data['customer_tier_upgrade_id'])
                    .where("customer_tier_upgrades.tenant_id", data['tenant_id'])
                    .from("customer_tier_upgrades")
                    .join(knex.raw("customer_tiers on customer_tiers.id = customer_tier_upgrades.current_tier_id join customer_tiers customer_tiers_alias  on customer_tiers_alias.id = customer_tier_upgrades.upgrade_tier_id "))

                break;
            case "":
                break;
        }
    }
    get_customer_tier_upgrades_list(query_type, data) {
        switch (query_type) {
            case "get_list":
                let obj = knex.select(data.columns)
                    .from("customer_tier_upgrades")
                    .where("customer_tier_upgrades.tenant_id", "=", data['tenant_id'])
                    .join(knex.raw(' customer_tiers on customer_tiers.id = customer_tier_upgrades.current_tier_id join customer_tiers customer_tiers_alias  on customer_tiers_alias.id = customer_tier_upgrades.upgrade_tier_id'));

                if (data['search']) {
                    obj.where("customer_tiers.name", "like", "%" + data['search'] + "%");
                    obj.orWhere("customer_tiers_alias.name", "like", "%" + data['search'] + "%");
                }
                if (data['from_date'] && data['to_date']) {
                    obj.whereBetween('customer_tier_upgrades.created_at', [data['from_date'], data['to_data']]);
                } else if (data['from_date'] && !data['to_date']) {
                    obj.whereBetween('customer_tier_upgrades.created_at', [data['from_date'], dateFormat(now, "yyyy-mm-dd 23:59:59")]);
                } else if (!data['from_date'] && data['to_date']) {
                    obj.whereBetween('customer_tier_upgrades.created_at', ["1970-01-01", data['to_date'] + " 23:59:59"]);
                }
                obj.limit(data['limit'])
                    .offset(data['offset'])
                break;
        }
    }
    get_customer_tier_name_list(query_type, data) {
        switch (query_type) {
            case "get_customer_tier":
                return knex.select(data.columns)
                    .from("customer_tiers")
                    .where('tenant_id', data['tenant_id'])
                break;
        }
    }
    mainFuntion(query_type, data) {
        switch (query_type) {
            case "":
                break;
        }
    }
    tier_cron(query_type, data) {
        switch (query_type) {
            case "product_purchased":
                return knex("customer_product_purchases").select([knex.raw("COUNT(id)")]).whereRaw("customer_id = customers.id");
                break;
            case "voucher_purchased":
                return knex("customer_voucher_purchases").select([knex.raw("COUNT(id)")]).whereRaw("customer_id = customers.id");
                break;
            case "voucher_redeemed":
                return knex("voucher_codes").select([knex.raw("COUNT(id)")]).whereRaw("purchased_customer_id = customers.id").where("voucher_codes.used", "=", 1);
                break;
            case "offer_redeemed":
                return knex("offer_redemptions").select([knex.raw("COUNT(id)")]).whereRaw("customer_id = customers.id");
                break;
            case "transaction_value":
                return knex("customer_transaction").select([knex.raw("COUNT(id)")]).whereRaw("customer_id = customers.id");
                break;
            case "points_redeemed":
                return knex("wallet_ledger").select([knex.raw("COUNT(point_ledger.id)")]).leftJoin("point_ledger", "point_ledger.wallet_ledger_id", "=", "wallet_ledger.id").whereRaw("customer_id = customers.id").where("point_ledger.transaction_type", "=", 'debit');
                break;
            case "points_accured":
                return knex("wallet_ledger").select([knex.raw("COUNT(point_ledger.id)")]).leftJoin("point_ledger", "point_ledger.wallet_ledger_id", "=", "wallet_ledger.id").whereRaw("customer_id = customers.id").where("point_ledger.transaction_type", "=", 'credit');
                break;
            case "expiry_date":
                return knex("customer_upgrades").select([knex.raw("expiry_date")]).whereRaw("customer_id = customers.id").whereRaw("tier_id = customers.tier").where("customer_upgrades.status", "=", 1);
                break;
            case "lapse_policy":
                return knex("customer_upgrades").select([knex.raw("lapse_policy")]).whereRaw("customer_id = customers.id").whereRaw("tier_id = customers.tier").where("customer_upgrades.status", "=", 1);
                break;
            case "get_customer_tier":
                return knex('customer_tiers')
                    .select(['customer_tiers.tier_upgradation_rule', 'customer_tiers.tier_retention_rule'])
                    .where('customer_tiers.tenant_id', '=', data.tenant_id)
                break;
            case "get_customers":
                return knex("customers")
                    .select("customers.id as customer_id", "customers.tier as tier_id", "customer_tiers.time_period as tier_time_period", "customer_tiers.name as tier_name", "customer_tiers.tier_price as tier_price", "customers.tenant_id", data.column)
                    .leftJoin("customer_tiers", "customer_tiers.id", "=", "customers.tier")
                    .where('customers.tenant_id', data['tenant_id'])
                break;
        }
    }

     async get_multi_tiers_count(data)
    {
        var obj=await knex.select("*")
              .table('customer_tiers')
              .where("customer_tiers.tenant_id", "=", data['tenant_id'])

          return obj;
    }
}