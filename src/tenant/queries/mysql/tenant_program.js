let dateFormat = require('dateformat');
let knex = require("../../../../config/knex.js");
let now = new Date();
module.exports = class Tenant_program {
    add_tenant_program(query_type, data) {
        switch (query_type) {
            case "get_program":
                return knex("tenant_programs")
                    .select('id')
                    .where("program_name", data['program_name'])
                break;
            case "insert":
                return knex("tenant_programs").insert(data, "id");
                break;
            case "update":
                return knex("tenant_programs")
                    .where("id", data.program_id)
                    .update(data.update_result)
        }
    }
    edit_tenant_program(query_type, data) {
        switch (query_type) {
            case "get_program":
                return knex("tenant_programs").select('id')
                    .where("program_name", data['program_name'])
                    .whereNot('id', data['program_id'])
                break;
            case "update_tenant_program":
                return knex("tenant_programs")
                    .where('id', data['program_id'])
                    .update(data.data);
                return
            case "update":
                return knex("tenant_programs")
                    .where("id", data['program_id'])
                    .update(data.update_result)
                break;
        }
    }
    get_tenant_program_by_id(query_type, data) {
        switch (query_type) {
            case "get_tenant_program":
                let columns = {
                    program_id: "tenant_programs.id",
                    program_name: "tenant_programs.program_name",
                    program_description: "tenant_programs.program_description",
                    start_date: "tenant_programs.start_date",
                    end_date: "tenant_programs.end_date",
                    program_image: "tenant_programs.program_image",
                    group_codes: knex.raw(" GROUP_CONCAT(master_group_code.name) "),
                    country_name: "countries.name",
                };
                let obj = knex.select(columns)
                    .from("tenants")
                    .leftJoin("tenant_programs", "tenant_programs.tenant_id", "=", "tenants.id")
                    .join("countries", "countries.id", "=", "tenants.country_id")
                    .join("tenant_has_group_codes", "tenant_has_group_codes.tenant_id", "=", "tenants.id")
                    .join("master_group_code", "master_group_code.id", "=", "tenant_has_group_codes.group_code_id")

                if (typeof data['program_id'] != 'undefined') {
                    obj.where("tenant_programs.id", data['program_id'])
                } else {
                    obj.where("tenants.id", data['tenant_id'])
                }
                return obj;
                break;
        }
    }
    get_program_info_tree(query_type, data) {
        switch (query_type) {
            case "get_program":
                let columns = {
                    program_id: "tenant_programs.id",
                    program_name: "tenant_programs.program_name",
                    program_description: "tenant_programs.program_description",
                    program_image: "tenant_programs.program_image",
                    country_name: "countries.name",
                };
                return knex.select(columns)
                    .from("tenants")
                    .leftJoin("tenant_programs", "tenant_programs.tenant_id", "=", "tenants.id")
                    .join("countries", "countries.id", "=", "tenants.country_id")
                    .where("tenants.id", data['tenant_id'])
                break;
            case "get_tenant_branch":
                let branch_columns = {
                    branch_name: "tenant_branches.branch_name",
                    branch_id: "tenant_branches.id",
                    total_customers: knex.raw(" Count( Distinct customers.id) "),
                    total_active_customers: knex.raw(" Count( Distinct customer_login_tokens.customer_id) "),
                    total_vouchers_redeemed: knex.raw(" Count( Distinct voucher_codes.id) "),
                    total_offers_redeemed: knex.raw(" Count( Distinct offer_redemptions.id) "),
                    total_products_purchased: knex.raw(" tenant_products.total_products_purchased "),
                    total_product_earnings: ' tenant_products.total_product_earnings',
                    total_voucher_earnings: 'tenant_vouchers.total_voucher_earnings ',
                }
                let inactiveLimit = new Date(now.getTime() - 604800 * 1000);
                return knex().select(branch_columns).from('tenant_branches')
                    .join('customers', 'customers.tenant_branch_id', 'tenant_branches.id')
                    .joinRaw(' left join (select Count(customer_product_purchases.id) as total_products_purchased, SUM(customer_product_purchases.product_purchase_rate) as total_product_earnings, customers.tenant_branch_id from customer_product_purchases left join customers on customers.id = customer_product_purchases.customer_id group by customers.tenant_branch_id) tenant_products on tenant_products.tenant_branch_id = tenant_branches.id')
                    .joinRaw(' left join (select SUM(customer_voucher_purchases.voucher_purchase_rate) as total_voucher_earnings, customers.tenant_branch_id from customer_voucher_purchases left join customers on customers.id = customer_voucher_purchases.customer_id group by customers.tenant_branch_id) tenant_vouchers on tenant_vouchers.tenant_branch_id = tenant_branches.id')
                    .leftJoin('voucher_codes', function () {
                        this.on('voucher_codes.purchased_customer_id', 'customers.id')
                            .on('voucher_codes.used', 1)
                    })
                    .leftJoin('customer_login_tokens', function () {
                        this.on('customer_login_tokens.customer_id', 'customers.id')
                            .on('customer_login_tokens.created_at', '>', knex.raw('?', dateFormat(inactiveLimit, "yyyy-mm-dd HH:MM:ss")))
                    })
                    .leftJoin('offer_redemptions', 'offer_redemptions.customer_id', 'customers.id')
                    .where('tenant_branches.tenant_id', data['tenant_id'])
                    .groupBy('tenant_branches.id')
        }
    }



    get_languages_list(query_type, data) {
        switch (query_type) {
            case "get_language":
                let columns = {
                    id: "master_languages.id",
                    language_name: "master_languages.language_name",
                    language_code: "master_languages.language_code",
                };
                let obj = knex.select(columns)
                    .from("master_languages")
                return obj;
                break;
        }
    }


    add_program_language(query_type, data) {
        switch (query_type) {
            case "insert_program_languages":
                return knex("program_languages").insert(data, "id");
                break;
        }
    }

    get_program_languages_id(query_type, data) {
        switch (query_type) {
            case "get_program_languages":
                return knex().select("*").from('program_languages')
                break;
        }
    }

    edit_program_language(query_type, data) {
        switch (query_type) {
            case "update_program_languages":
                return knex("program_languages")
                    .where("program_languages.id", data['id'])
                    .update(data)
                break;

        }
    }

}


