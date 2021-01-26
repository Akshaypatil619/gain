let dateFormat = require('dateformat');
let knex = require("../../../../config/knex.js");
let now = new Date();
module.exports = class Product {
    get_product_by_id(query_type, data) {
        switch (query_type) {
            case "get_product":
                knex.select("*")
                    .where("id", data.product_id)
                    .from("products")
                break;
        }
    }
    get_products_list(query_type, data) {
        let obj = {};
        switch (query_type) {
            case "get_list":
                let columns = {
                    product_id: "products.id",
                    name: "products.name",
                    created_at: "products.created_at",
                    country_name: "countries.name",
                    categories: knex.raw('GROUP_CONCAT(DISTINCT tenant_has_categories.label)'),
                    sub_categories: knex.raw('GROUP_CONCAT( DISTINCT sub.label)'),
                    product_price_for_tenant: "tenants_assigned_products.product_price_for_tenant",
                    product_price_for_customers: "tenants_assigned_products.product_price_for_tenant_users",
                    tenants_product_status: 'tenants_assigned_products.tenants_product_status',
                    tenants_assigned_products_id: 'tenants_assigned_products.id',
                    deal_brought: 'customer_product_purchase.deal_brought',
                    total_earning: 'customer_product_purchase.total_earning',
                    recommend_status: 'manage_group_codes.status',
                    start_date: 'tenants_assigned_products.start_date',
                    end_date: 'tenants_assigned_products.end_date',
                    product_type_name: 'product_types.name'
                };

                obj = knex.select(columns)
                    .from("products")
                    .join("tenants_assigned_products", "tenants_assigned_products.product_id", "=", "products.id")
                    .leftJoin('product_has_categories', function () {
                        this.on('product_has_categories.product_id', 'products.id')
                            .on('product_has_categories.status', 1)
                    })
                    .leftJoin('product_has_sub_categories', function () {
                        this.on('product_has_sub_categories.product_id', 'products.id')
                            .on('product_has_sub_categories.status', 1)
                    })
                    .leftJoin('tenant_has_categories', function () {
                        this.on('tenant_has_categories.cat_sub_cat_id', 'product_has_categories.category_id')
                            // .on('tenant_has_categories.cat_sub_cat_status', 1)
                            .on('tenant_has_categories.type', knex.raw('?', 'category'))
                            .on('tenant_has_categories.tenant_id', data.tenant_id)
                    })
                    .leftJoin('tenant_has_categories as sub', function () {
                        this.on('sub.cat_sub_cat_id', 'product_has_sub_categories.sub_category_id')
                            // .on('sub.cat_sub_cat_status', 1)
                            .on('sub.type', knex.raw('?', 'sub_category'))
                            .on('sub.tenant_id', data.tenant_id)
                    })
                    .leftJoin('manage_group_codes', function () {
                        this.on('manage_group_codes.group_code_id', 'products.id')
                            .on('manage_group_codes.type', knex.raw('?', 'products'))
                    })

                    .innerJoin('countries', function () {
                        this.on('countries.id', 'products.country_id')
                    })
                    .innerJoin('product_types', function () {
                        this.on('product_types.id', 'products.product_type')
                    })
                    .where("tenants_assigned_products.tenant_id", "=", data['tenant_id'])
                    .where("tenants_assigned_products.status", "=", 1)
                    .groupBy("tenants_assigned_products.id");
                if (data['search']) {
                    obj.where("products.name", "like", "%" + data['search'] + "%");
                }

                if (data['customer_id'] && data['customer_id'] !== undefined) {
                    columns['is_purchased'] = 'customer_product_purchase.deal_brought';

                    obj.leftJoin(knex.raw(" (SELECT COUNT(customer_product_purchases.id) AS deal_brought, customer_product_purchases.tenant_assigned_product_id, Sum(customer_product_purchases.product_purchase_rate) AS total_earning," +
                        " customer_product_purchases.product_id FROM customer_product_purchases " +
                        " INNER JOIN tenants_assigned_products " +
                        " ON tenants_assigned_products.id = customer_product_purchases.tenant_assigned_product_id " +
                        " INNER JOIN customers on customers.id = customer_product_purchases.customer_id WHERE " + data.filter_by_tenant_or_tenant_branch +
                        " AND customers.id = " + data['customer_id'] +
                        " group by tenants_assigned_products.id ) customer_product_purchase"),
                        'customer_product_purchase.tenant_assigned_product_id', '=', 'tenants_assigned_products.id')
                } else {
                    obj.leftJoin(knex.raw(" (SELECT COUNT(customer_product_purchases.id) AS deal_brought, customer_product_purchases.tenant_assigned_product_id, Sum(customer_product_purchases.product_purchase_rate) AS total_earning," +
                        " customer_product_purchases.product_id FROM customer_product_purchases " +
                        " INNER JOIN tenants_assigned_products " +
                        " ON tenants_assigned_products.id = customer_product_purchases.tenant_assigned_product_id " +
                        " INNER JOIN customers on customers.id = customer_product_purchases.customer_id WHERE " + data.filter_by_tenant_or_tenant_branch +
                        " group by tenants_assigned_products.id ) customer_product_purchase"),
                        'customer_product_purchase.tenant_assigned_product_id', '=', 'tenants_assigned_products.id')
                }

                if (data['from_date'] && data['to_date']) {
                    obj.whereBetween('products.created_at', [data['from_date'], data['to_data']]);
                } else if (data['from_date'] && !data['to_date']) {
                    obj.whereBetween('products.created_at', [data['from_date'], dateFormat(now, "yyyy-mm-dd 23:59:59")]);
                } else if (!data['from_date'] && data['to_date']) {
                    obj.whereBetween('products.created_at', ["1970-01-01", data['to_date'] + " 23:59:59"]);
                }
                return obj;
                break;
        }
    }
    modify_tenant_product(query_type, data) {
        switch (query_type) {
            case "update_assigned_products":
                return knex.table('tenants_assigned_products')
                    .update(data.data)
                    .where("id", "=", data.tenants_assigned_products_id)
                break;
        }
    }
    get_customers_products_list(query_type, data) {
        let obj = {};
        switch (query_type) {
            case "get_list":
                let columns = {
                    product_id: "products.id",
                    name: "products.name",
                    country_id: "products.country_id",
                    product_type: "products.product_type",
                    target_audience: "products.target_audience",
                    product_type_name: "product_types.name",
                    country_name: "countries.name",
                    product_price_for_customers: 'tenants_assigned_products.product_price_for_tenant_users',
                    customer_product_purchases: 'customer_product_purchases.id',
                    action: "customer_product_purchases.action",
                    discount_value: "customer_product_purchases.discount_value",
                    tenants_assigned_products_id: 'tenants_assigned_products.id',
                    purchase_count: knex.raw(" COUNT (DISTINCT customer_product_purchases.id )"),
                    product_purchase_date: "customer_product_purchases.product_purchase_date",
                    product_purchase_rate: "customer_product_purchases.product_purchase_rate",
                    start_date: "customer_product_purchases.start_date",
                    end_date: "customer_product_purchases.end_date",
                    image: "products.image",
                };
                obj = knex.select(columns)
                    .from("products")
                    .leftJoin('product_has_categories', function () {
                        this.on('product_has_categories.product_id', 'products.id')
                            .on('product_has_categories.status', 1)
                    })
                    .leftJoin('product_has_sub_categories', function () {
                        this.on('product_has_sub_categories.product_id', 'products.id')
                            .on('product_has_sub_categories.status', 1)
                    })
                    .leftJoin('tenant_has_categories', function () {
                        this.on('tenant_has_categories.cat_sub_cat_id', 'product_has_categories.category_id')
                            .on('tenant_has_categories.cat_sub_cat_status', 1)
                            .on('tenant_has_categories.type', knex.raw('?', 'category'))
                            .on('tenant_has_categories.tenant_id', data.tenant_id)
                    })
                    .leftJoin('tenant_has_categories as sub', function () {
                        this.on('sub.cat_sub_cat_id', 'product_has_sub_categories.sub_category_id')
                            .on('sub.cat_sub_cat_status', 1)
                            .on('sub.type', knex.raw('?', 'sub_category'))
                            .on('sub.tenant_id', data.tenant_id)
                    })
                    .join("countries", "countries.id", "=", "products.country_id")
                    .join("product_types", "product_types.id", "=", "products.product_type")
                    .join("tenants_assigned_products", "tenants_assigned_products.product_id", "=", "products.id")
                    .innerJoin('customer_product_purchases', function () {
                        this.on('customer_product_purchases.tenant_assigned_product_id', 'tenants_assigned_products.id')
                            .on('customer_product_purchases.product_id', 'products.id')
                            .on('customer_product_purchases.action', knex.raw("?", "Purchase"))
                    })
                    .innerJoin('customers', function () {
                        this.on('customers.id', 'customer_product_purchases.customer_id')
                            .on('customers.tenant_id', data['tenant_id'])
                    })
                    .where("tenants_assigned_products.tenant_id", "=", data['tenant_id'])
                    .where("products.status", "=", 1)
                    .where("tenants_assigned_products.tenants_product_status", "=", 1);

                if (data['search']) {
                    obj.where("products.name", "like", "%" + data['search'] + "%");
                }


                if (data['customer_id'] && data['customer_id'] !== undefined) {
                    obj.where("customers.id", data['customer_id']);
                }

                if (data['fetch_purchased'] && data['fetch_purchased'] == 1) {
                    obj.whereRaw(" customer_product_purchases.id IS NOT NULL ");
                }

                if (data['from_date'] && data['to_date']) {
                    obj.whereBetween('tenants_assigned_products.created_at', [data['from_date'], data['to_data']]);
                } else if (data['from_date'] && !data['to_date']) {
                    obj.whereBetween('tenants_assigned_products.created_at', [data['from_date'], dateFormat(now, "yyyy-mm-dd 23:59:59")]);
                } else if (!data['from_date'] && data['to_date']) {
                    obj.whereBetween('tenants_assigned_products.created_at', ["1970-01-01", data['to_date'] + " 23:59:59"]);
                }
                return obj;
                break;
        }
    }
    get_purchased_products(query_type, data) {
        switch (query_type) {
            case "get_purchased_products":
                let columns = {
                    product_id: "products.id",
                    name: "products.name",
                    country_id: "products.country_id",
                    product_type: "products.product_type",
                    target_audience: "products.target_audience",
                    product_type_name: "product_types.name",
                    country_name: "countries.name",
                    product_price_for_customers: 'tenants_assigned_products.product_price_for_tenant_users',
                    customer_product_purchases: 'customer_product_purchases.id',
                    action: "customer_product_purchases.action",
                    gift_email: "customer_product_purchases.gift_email",
                    discount_value: "customer_product_purchases.discount_value",
                    promocode_id: "promocodes.id",
                    promocode: "promocodes.code"
                };
                return knex.select(columns)
                    .from("products")
                    .leftJoin('product_has_categories', function () {
                        this.on('product_has_categories.product_id', 'products.id')
                            .on('product_has_categories.status', 1)
                    })
                    .leftJoin('product_has_sub_categories', function () {
                        this.on('product_has_sub_categories.product_id', 'products.id')
                            .on('product_has_sub_categories.status', 1)
                    })
                    .leftJoin('tenant_has_categories', function () {
                        this.on('tenant_has_categories.cat_sub_cat_id', 'product_has_categories.category_id')
                            .on('tenant_has_categories.cat_sub_cat_status', 1)
                            .on('tenant_has_categories.type', knex.raw('?', 'category'))
                            .on('tenant_has_categories.tenant_id', data.tenant_id)
                    })
                    .leftJoin('tenant_has_categories as sub', function () {
                        this.on('sub.cat_sub_cat_id', 'product_has_sub_categories.sub_category_id')
                            .on('sub.cat_sub_cat_status', 1)
                            .on('sub.type', knex.raw('?', 'sub_category'))
                            .on('sub.tenant_id', data.tenant_id)
                    })
                    .joinRaw('left join customers ON customers.id=' + data['customer_id'])
                    .join("countries", "countries.id", "=", "products.country_id")
                    .join("product_types", "product_types.id", "=", "products.product_type")
                    .join("tenants_assigned_products", "tenants_assigned_products.product_id", "=", "products.id")
                    .where("tenants_assigned_products.tenant_id", "=", data['tenant_id'])
                    .where("products.status", "=", 1)
                    .where("customer_product_purchases", "Purchase")
                    .where("tenants_assigned_products.tenants_product_status", "=", 1)
                    .joinRaw(" left join customer_product_purchases on ( (customer_product_purchases.product_id = products.id AND customer_product_purchases.customer_id = " + data['customer_id'] + " and customer_product_purchases.end_date > '" + dateFormat(now, 'yyyy-mm-dd\'T\'23:59:59') + "') OR (customer_product_purchases.gift_email = customers.email  AND customer_product_purchases.tenant_id='" + data.tenant_id + "')) ")
                    .leftJoin("redeem_promocode", "redeem_promocode.uuid", "=", "customer_product_purchases.promocode_unique_id")
                    .leftJoin("promocodes", "promocodes.id", "=", "redeem_promocode.promocode_id")
                    .groupBy("customer_product_purchases.id")
                break;
        }
    }
    get_gifted_product(query_type, data) {
        switch (query_type) {
            case "":
                break;
        }
    }
    purchase_product(query_type, data) {
        switch (query_type) {
            case "get_product":
                return knex.select("customer_product_purchases.id")
                    .table('customer_product_purchases')
                    .where('customer_product_purchases.product_id', '=', data['product_id'])
                    .where('customer_product_purchases.customer_id', '=', data['customer_id'])
                    .where('customer_product_purchases.end_date', '>', dateFormat(now, "yyyy-mm-dd\'T\'HH:MM:sso"))
                    .where("customer_product_purchases.action", "Purchase")
                    .where("customer_product_purchases.tenant_assigned_product_id", '=', data['tenant_assigned_product_id'])
                break;
            case "purchase_product":
                return knex("customer_product_purchases")
                    .insert(data);
                break;
            case "insert_transaction":
                return knex('customer_transaction')
                    .insert(data)
                break;
        }
    }
    fetch_purchased_products_customers(query_type, data) {
        switch (query_type) {
            case "fetch_products":
                let columns = {
                    product_id: "products.id",
                    customer_id: "customers.id",
                    product_name: "products.name",
                    purchase_date: "customer_product_purchases.product_purchase_date",
                    product_status: "products.status",
                    purchased_by: "customers.first_name",
                    tenant_assigned_product_id: "tenants_assigned_products.id",
                };
                let filter_by_tenant_or_tenant_branch = data.filter_by_tenant_or_tenant_branch.split("=");
                let obj = knex.select(columns)
                    .from("tenants_assigned_products")
                    .innerJoin("products", "products.id", "=", "tenants_assigned_products.product_id")
                    .innerJoin("customer_product_purchases", "tenants_assigned_products.id", "=", "customer_product_purchases.tenant_assigned_product_id")
                    .innerJoin('customers', function () {
                        this.on('customers.id', 'customer_product_purchases.customer_id')
                            .on('customers.tenant_id', data['tenant_id'])
                    })
                    .where("tenants_assigned_products.id", "=", data['tenant_assigned_product_id'])
                    .where("tenants_assigned_products.tenant_id", "=", filter_by_tenant_or_tenant_branch[1])
                    .groupBy("tenants_assigned_products.id")
                    .groupBy("customers.id");

                if (data['search']) {
                    obj.where("customers.first_name", "like", "%" + data['search'] + "%");
                }

                if (data['from_date'] && data['to_date']) {
                    obj.whereBetween('customer_product_purchases.created_at', [data['from_date'], data['to_data']]);
                } else if (data['from_date'] && !data['to_date']) {
                    obj.whereBetween('customer_product_purchases.created_at', [data['from_date'], dateFormat(now, "yyyy-mm-dd 23:59:59")]);
                } else if (!data['from_date'] && data['to_date']) {
                    obj.whereBetween('customer_product_purchases.created_at', ["1970-01-01", data['to_date'] + " 23:59:59"]);
                }
                return obj;
                break;
        }
    }
    get_brg_products_list(query_type, data) {
        switch (query_type) {
            case "get_customer":
                return knex("customers")
                    .where("id", data.customer_id)
                    .where("tenant_id", data.tenant_id)
                break;
            case "get_purchased_product":
                return knex("customer_product_purchases")
                    .select({
                        transaction_id: "customer_product_purchases.transaction_id",
                        product_id: "customer_product_purchases.product_id",
                        product_purchase_date: "customer_product_purchases.product_purchase_date",
                        name: "customer_product_purchases.product_name",
                        // product_price:"customer_product_purchases.product_price",
                        // promocode_unique_id:"customer_product_purchases.promocode_unique_id",
                        // discount_value:"customer_product_purchases.discount_value",
                        country_name: "countries.name",
                        product_type_name: "product_types.name",
                        product_purchase_rate: "customer_product_purchases.product_purchase_rate",
                        product_type: "customer_product_purchases.product_type",
                        start_date: "customer_product_purchases.start_date",
                        end_date: "customer_product_purchases.end_date",
                        image: "products.image"
                    })
                    .join("products", "products.id", "=", "customer_product_purchases.product_id")
                    .join("product_types", "products.product_type", "=", "product_types.id")
                    .join("countries", "countries.id", "=", "products.country_id")
                    .where("customer_product_purchases.action", "Purchase")
                    .where("customer_id", data.customer_id);
                break;
            case "get_products":
                let columns = {
                    product_id: "products.id",
                    name: "products.name",
                    created_at: "products.created_at",
                    country_name: "countries.name",
                    product_type_name: "product_types.name",
                    categories: knex.raw("GROUP_CONCAT(DISTINCT tenant_has_categories.label)"),
                    sub_categories: knex.raw("GROUP_CONCAT( DISTINCT sub.label)"),
                    product_price_for_tenant: "tenants_assigned_products.product_price_for_tenant",
                    product_price_for_customers: "tenants_assigned_products.product_price_for_tenant_users",
                    tenants_product_status: 'tenants_assigned_products.tenants_product_status',
                    tenants_assigned_products_id: 'tenants_assigned_products.id',
                    start_date: 'tenants_assigned_products.start_date',
                    end_date: 'tenants_assigned_products.end_date',
                    is_purchased: knex.raw(" (SELECT COUNT(id) FROM customer_product_purchases WHERE (customer_product_purchases.product_id = products.id AND customer_product_purchases.customer_id = ? AND action ='Purchase'))"),
                };
                let obj = knex.select(columns)
                    .from("products")
                    .join("tenants_assigned_products", "tenants_assigned_products.product_id", "=", "products.id")
                    .leftJoin('product_has_categories', function () {
                        this.on('product_has_categories.product_id', 'products.id')
                            .on('product_has_categories.status', 1)
                    })
                    .leftJoin('product_has_sub_categories', function () {
                        this.on('product_has_sub_categories.product_id', 'products.id')
                            .on('product_has_sub_categories.status', 1)
                    })
                    .leftJoin('tenant_has_categories', function () {
                        this.on('tenant_has_categories.cat_sub_cat_id', 'product_has_categories.category_id')
                            .on('tenant_has_categories.cat_sub_cat_status', 1)
                            .on('tenant_has_categories.type', knex.raw('?', 'category'))
                            .on('tenant_has_categories.tenant_id', data.tenant_id)
                    })
                    .leftJoin('tenant_has_categories as sub', function () {
                        this.on('sub.cat_sub_cat_id', 'product_has_sub_categories.sub_category_id')
                            .on('sub.cat_sub_cat_status', 1)
                            .on('sub.type', knex.raw('?', 'sub_category'))
                            .on('sub.tenant_id', data.tenant_id)
                    })
                    .join("product_types", "products.product_type", "=", "product_types.id")
                    .join("countries", "countries.id", "=", "products.country_id")
                    .where("tenants_assigned_products.tenant_id", "=", data['tenant_id'])
                    .where("tenants_assigned_products.status", "=", 1)
                    .groupBy("products.id");
                if (data['search']) {
                    obj.where("products.name", "like", "%" + data['search'] + "%");
                }
                if (data['from_date'] && data['to_date']) {
                    obj.whereBetween('products.created_at', [data['from_date'], data['to_data']]);
                } else if (data['from_date'] && !data['to_date']) {
                    obj.whereBetween('products.created_at', [data['from_date'], dateFormat(now, "yyyy-mm-dd 23:59:59")]);
                } else if (!data['from_date'] && data['to_date']) {
                    obj.whereBetween('products.created_at', ["1970-01-01", data['to_date'] + " 23:59:59"]);
                }
                obj.then((t_result) => {
                    return_result.products_total_record = Object.keys(t_result).length;
                })
                obj.limit(data['limit'])
                    .offset(parseInt(data['offset']));
                break;
        }
    }
}