let dateFormat = require('dateformat');
let knex = require("../../../../../../config/knex.js");
;
let now = new Date();
//tenant.customer_model;

module.exports = class Customer {

    add_customer(query_type, data) {
        switch (query_type) {
            case "get_customer":
                return knex.select()
                    .where("email", data['email'])
                    .where("tenant_id", data['tenant_id'])
                    .table('customers')
                break;
            case "insert":
                return knex("customers").insert(data, "id");
                break;
            case "update_extra_fields":
                return knex('customers')
                    .update(data.extra_fields)
                    .where('id', data.customer_id);
                break;
            case "insert_customer_social_profile":
                return knex('customer_social_profile')
                    .insert(data)
                break;
        }
    }
    edit_customer(query_type, data) {
        switch (query_type) {
            case "get_customer":
                knex('customers')
                    .where("email", data['email'])
                    .where("tenant_id", data['tenant_id'])
                    // .table('customers')
                    .whereNot('id', data['customer_id'])
                break;
            case "update":
                return knex("customers")
                    .where("id", data['customer_id'])
                    .update(data);
                break;
            case "update_extra_fields":
                return knex('customers')
                    .update(data.extra_fields)
                    .where('id', data['customer_id']);
                break;
            case "get_customer_social_profile":
                return knex('customer_social_profile')
                    .where('customer_id', data['customer_id'])
                break;
            case "update_customer_social_profile":
                return knex('customer_social_profile')
                    .update(data.customer_social_links)
                    .where('customer_id', data['customer_id']);
                break;
            case "insert_customer_social_links":
                return knex('customer_social_profile').insert(data)
                break;
        }
    }
    get_customer_by_id(query_type, data) {
        let obj = {};        
        switch (query_type) {
            case "get_customer":
                obj = knex.column('customer_social_profile.*',data.customerExtraColuns,data.customerColumns).select()
                    .from('customers')
                    .leftJoin('customer_social_profile', 'customer_social_profile.customer_id', '=', 'customers.id')
                    .leftJoin('countries', 'customers.country', '=', 'countries.id')
                    .leftJoin('customer_tiers', 'customers.tier', '=', 'customer_tiers.id')
                    .leftJoin('customer_upgrades', function () {
                        this.on("customer_upgrades.customer_id", "=", 'customers.id')
                            .on('customer_upgrades.status', 1)
                    })
                    .leftJoin('cc_account_summery', 'cc_account_summery.customer_id', '=', 'customers.id')
                    .leftJoin('master_city', 'master_city.id', '=', 'customers.city')
                    .leftJoin('state_master', 'state_master.id', '=', 'customers.state')
                    .leftJoin('tenant_branches', 'tenant_branches.id', '=', 'customers.tenant_branch_id')
                    .join('tenants', 'tenants.id', 'customers.tenant_id')
                    .where("customers.id", data['customer_id'])
                    .where("tenants.id", data['tenant_id'])
                    .groupBy("customers.id");
                return obj;
                break;
            case "get_customer_cards":
                return knex('customer_has_cards')
                    .select(knex.raw('customer_has_cards.id as customer_card_id,customer_has_cards.*,bank_master.name as bank_name,card_network_master.name as card_network_name'))
                    .leftJoin('bank_master', 'bank_master.id', '=', 'customer_has_cards.bank_id')
                    .leftJoin('card_network_master', 'card_network_master.id', '=', 'customer_has_cards.card_network_id')
                    .where('customer_has_cards.customer_id', data['customer_id'])
                    .where('customer_has_cards.status', 1);
                break;
            case "get_customer_login_token":
                return knex('customer_login_tokens')
                    .select(knex.raw('customer_login_tokens.created_at as lastLogin, customer_login_tokens.agent_type as agentType,customer_login_tokens.updated_at as updateAt '))
                    .where("customer_login_tokens.customer_id", "=", data['customer_id'])
                    .orderBy("customer_login_tokens.created_at", "desc")
                    .limit(1)
                break;
            case "get_voucher_codes":
                return knex('voucher_codes')
                    .select(knex.raw('count(voucher_codes.id) as wowchersRedeemed'))
                    .where("voucher_codes.assined_tenant_id", "=", data['tenant_id'])
                    .where("voucher_codes.purchased_customer_id", "=", data['customer_id'])
                    .where("voucher_codes.used", "=", 1)
                break;
            case "":

                break;
        }
    }
    get_customers_list(query_type, data) {
        let obj;
        switch (query_type) {
            case "get_customers":
                obj = knex.select(data.columns)
                    .from("customers")
                    .leftJoin('customer_social_profile', 'customer_social_profile.customer_id', '=', 'customers.id')
                    .leftJoin('tenant_branches', 'tenant_branches.id', '=', 'customers.tenant_branch_id')
                    .leftJoin("customer_tiers", "customer_tiers.id", "=", "customers.tier")
                    .where("customers.tenant_id",data.tenant_id)
                    .whereRaw(data.filter_by_tenant_or_tenant_branch)
                if (data['search']) {
                    obj.where("customers.first_name", "like", "%" + data['search'] + "%");
                }
                if (data['from_date'] && data['to_date']) {
                    obj.whereBetween('customers.created_at', [data['from_date'], data['to_data']]);
                } else if (data['from_date'] && !data['to_date']) {
                    obj.whereBetween('customers.created_at', [data['from_date'], dateFormat(now, "yyyy-mm-dd 23:59:59")]);
                } else if (!data['from_date'] && data['to_date']) {
                    obj.whereBetween('customers.created_at', ["1970-01-01", data['to_date'] + " 23:59:59"]);
                } else if (data['searchid']) {
                    obj.where("customers.customer_unique_id", "like", "%" + data['searchid'] + "%")
                } else if (data['searchid']) {
                    obj.where(function () {
                        this.where("customers.customer_unique_id", "like", "%" + data['searchid'] + "%");
                    });
                }
                if (data['search']) {
                    obj.where("customers.first_name", "like", "%" + data['search'] + "%");
                }
                data.email !== undefined ? obj.where("customers.email", data.email) : "";
                return obj;
                break;                            
        }
    }
    get_tenant_customers_list(query_type, data) {
        switch (query_type) {
            case "get_tenant_customers":
                let obj = knex.select(data.columns)
                    .from("customers")
                    .leftJoin('customer_social_profile', 'customer_social_profile.customer_id', '=', 'customers.id')
                if (data['search']) {
                    obj.where("customers.first_name", "like", "%" + data['search'] + "%");
                }
                if (data['from_date'] && data['to_date']) {
                    obj.whereBetween('customers.created_at', [data['from_date'], data['to_data']]);
                } else if (data['from_date'] && !data['to_date']) {
                    obj.whereBetween('customers.created_at', [data['from_date'], dateFormat(now, "yyyy-mm-dd 23:59:59")]);
                } else if (!data['from_date'] && data['to_date']) {
                    obj.whereBetween('customers.created_at', ["1970-01-01", data['to_date'] + " 23:59:59"]);
                }
                obj.limit(data['limit'])
                    .offset(data['offset'])
                    .whereNot("customers.id", "=", data.customer_id)
                    .where("customers.tenant_id", "=", data['tenant_id'])
                return obj;
                break;
        }
    }
    // process_customer_cards(query_type, data) {
    //     switch (query_type) {
    //         case "insert":
    //             knex.batchInsert('customer_has_cards', data, 5000);
    //             break;
    //     }
    // }
    remove_customer_card(query_type, data) {
        switch (query_type) {
            case "remove_cards":
                knex('customer_has_cards').update({
                    status: 0
                }).where({
                    id: data['customer_card_id']
                })
                break;
        }
    }
    get_customer_card_type(query_type, data) {
        switch (query_type) {
            case "":
                break;
        }
    }
    comment(query_type, data) {
        switch (query_type) {
            case "insert":
                return knex("customer_comment").insert(data)
                break;
            case "insert_batch":
                return knex.batchInsert('comment_tags', data);
                break;
            case "get_comments":
                return knex('customer_comment')
                    .select(knex.raw("customer_comment.comment as commentName"))
                    .where("customer_comment.id", "=", data)
                break;
        }
    }
    add_tag_inComment(query_type, data) {
        switch (query_type) {
            case "insert_comment_tags":
                return knex.batchInsert('comment_tags', data)
                break;
        }
    }
    add_tag_in_source(query_type, data) {
        switch (query_type) {
            case "insert_tag_master":
                return knex('master_tag').insert(data);
                break;
            case "insert_customer_assigned_source_tags":
                return knex('customer_assigned_source_tags').insert(data);
                break;
        }
    }
    remove_customer_source(query_type, data) {
        switch (query_type) {
            case "update_customer_assigned_source_tags":
                return knex('customer_assigned_source_tags')
                    .update('status', 0)
                    .where("customer_id", data.customer_id)
                    .where("id", data.tag_id)
                break;
        }
    }
    remove_tag_fromComment(query_type, data) {
        switch (query_type) {
            case "update_comment_tags":
                return knex('comment_tags')
                    .update('comment_tags.isDeleted', 1)
                    .where("comment_tags.customer_comment_id", data['commentId'])
                    .where("comment_tags.note_tag_id", data['tagId'])
                break;
        }
    }
    comment_list(query_type, data) {
        switch (query_type) {
            case "get_comment_list":
                let obj = knex.select(data.columns)
                    .from("customer_comment")
                    .leftJoin('customers', 'customers.id', '=', 'customer_comment.customer_id')
                    .leftJoin('tenants', 'tenants.id', '=', 'customer_comment.tenant_id')
                    // .leftJoin('comment_tags', 'comment_tags.customer_comment_id', '=', 'customer_comment.id')
                    .leftJoin(knex.raw('(SELECT customer_comment_id as customer_comment_id, note_tag_id as note_tag_id  from comment_tags where comment_tags.isDeleted = 0) AS comment_tags'),
                        'customer_comment.id', '=', 'comment_tags.customer_comment_id')
                    .leftJoin('master_tag', 'master_tag.id', '=', 'comment_tags.note_tag_id')
                    .where("customer_comment.customer_id", data['customer_id'])
                if (data['search']) {
                    obj.where("customer_comment.comment", "like", "%" + data['search'] + "%");
                }
                obj.limit(data['limit'])
                    .offset(data['offset']);
                return obj;
                break;
        }
    }
    get_customer_assign_tags(query_type, data) {
        switch (query_type) {
            case "get_customer_assigned_source_tags":
               return knex('customer_assigned_source_tags').select(data.columns)
                    .leftJoin('master_tag', function () {
                        this.on("master_tag.id", "=", 'customer_assigned_source_tags.tag_id')
                            .on('master_tag.status', 1)
                    })
                    .where('customer_assigned_source_tags.customer_id', data["customer_id"])
                    .where('customer_assigned_source_tags.status', 1)
                break;
        }
    }
    comment_listByTag(query_type, data) {
        switch (query_type) {
            case "":
                let obj = knex.select(data.columns)
                    .from("customer_comment")
                    .leftJoin('customers', 'customers.id', '=', 'customer_comment.customer_id')
                    .leftJoin('tenants', 'tenants.id', '=', 'customer_comment.tenant_id')
                    .leftJoin('comment_tags', 'comment_tags.customer_comment_id', '=', 'customer_comment.id')
                    .leftJoin('master_tag', 'master_tag.id', '=', 'comment_tags.note_tag_id')
                    .where("customer_comment.customer_id", data['customer_id'])

                if (data['search']) {
                    obj.where("customer_comment.comment", "like", "%" + data['search'] + "%");
                }
                if (data['tags']) {
                    obj.whereIn("comment_tags.note_tag_id", data['tags']);
                }
                obj.limit(data['limit'])
                    .offset(data['offset'])
                return obj;
                break;
        }
    }
    update_comment_starred(query_type, data) {
        switch (query_type) {
            case "update":
                return knex("customer_comment")
                    .update({
                        starred: data["starred"]
                    })
                    .where("customer_comment.id", data['comment_id'])
                break;
        }
    }
    checkUserValidation(query_type, data) {
        switch (query_type) {
            case "":
                return knex.from("customers")
                    .where('customers.email', '=', data['email'])
                    .where('customers.id', '=', data['customer_id'])
                    .update({
                        email_verified: false
                    })
                break;
        }
    }
    customer_bulk_upload(query_type, data) {
        switch (query_type) {
            case "get_customer":
                knex('customers')
                    .where('tenant_id', data.tenant_id)
                    .where('email', data.value)
                break;
        }
    }
    customer_profile_status_change(query_type, data) {
        switch (query_type) {
            case "update_status":
                return knex.from("customers")
                    .where('customers.id', '=', data['customer_id'])
                    .update({
                        status: data.status
                    })
                break;
        }
    }
    fetch_bulk_upload_files(query_type, data) {
        switch (query_type) {
            case "get_files_data":
                let obj = knex.select(data.columns)
                    .from("bulk_process_files")
                    .where("bulk_process_files.tenant_id", "=", data['tenant_id'])

                if (data['search']) {
                    obj.where("bulk_process_files.file_name", "like", "%" + data['search'] + "%");
                }

                if (data['process_type']) {
                    obj.where("bulk_process_files.process_type", "=", data['process_type']);
                }
                if (data['from_date'] && data['to_date']) {
                    obj.whereBetween('bulk_process_files.created_at', [data['from_date'], data['to_data']]);
                } else if (data['from_date'] && !data['to_date']) {
                    obj.whereBetween('bulk_process_files.created_at', [data['from_date'], dateFormat(now, "yyyy-mm-dd 23:59:59")]);
                } else if (!data['from_date'] && data['to_date']) {
                    obj.whereBetween('bulk_process_files.created_at', ["1970-01-01", data['to_date'] + " 23:59:59"]);
                }
                obj.limit(data['limit'])
                    .offset(data['offset']);
                return obj;
                break;
        }
    }
    fetch_bulk_upload_file_data(query_type, data) {
        switch (query_type) {
            case "get_files_data":
                return knex.select(data.columns)
                    .from("bulk_process_file_data")
                    .where("bulk_process_file_data.process_id", data['process_id']);
                break;
        }
    }
    import_customers_cards(query_type, data) {
        switch (query_type) {
            case "get_customer_cards":
                return knex('customer_has_cards')
                    .where('customer_id', value)
                    .where('issuer_identification_number', customer_cards.slice(0, 6))
                    .where('card_number', customer_cards.slice(6, customer_cards.length - 4))
                    .where('last_four_digits', customer_cards.slice(customer_cards.length - 4, customer_cards.length))
                break;
            case "insert":
                return knex('bulk_process_files').insert(data)
                break;
            case "betch_insert_customer_cards":
                return knex.batchInsert('customer_has_cards', data, 5000)
                break;
            case "batch_insert_bulk_process_file_data":
                return knex.batchInsert('bulk_process_file_data', data, 5000);
                break;
        }
    }
    customer_tier_upgrade(query_type, data) {
        switch (query_type) {
            case "update_status":
                return knex("customer_upgrades").update({
                    status: false
                }).where("customer_upgrades.customer_id", data['customer_id'])
                break;
            case "insert":
                return knex("customer_upgrades").insert(data, "id");
                break;
            case "upgrade":
                return knex("customers").where("id", data['customer_id'])
                    .update({
                        tier: data['tier_id']
                    })
                break;
            case "insert_transaction":
                return knex('customer_transaction').insert(data);
                break;
        }
    }
    get_customer_activity(query_type, data) {
        switch (query_type) {
            case "get_activities":
                return knex.select(data.columns)
                    .from("customers")
                    .rightJoin("customer_voucher_purchases", "customer_voucher_purchases.customer_id", "=", "customers.id")
                    .rightJoin("customer_product_purchases", "customer_product_purchases.customer_id", "=", "customers.id")
                    .orderBy("customer_voucher_purchases.created_at", 'desc')
                    .orderBy("customer_product_purchases.created_at", 'desc')
                    .where("customers.id", "=", data['customer_id'])
                    .limit(5)
                break;
        }
    }
    get_history_list(query_type, data) {
        switch (query_type) {
            case "get_history":
                return knex.select(data.columns)
                    .from("customers")
                    .leftJoin("customer_product_purchases", "customer_product_purchases.customer_id", "=", "customers.id")
                    .leftJoin("customer_voucher_purchases", "customer_voucher_purchases.customer_id", "=", "customers.id")
                    .leftJoin("customer_login_tokens", "customer_login_tokens.customer_id", "=", "customers.id")
                    .where("customers.id", data['customer_id'])
                    .orderBy("customer_voucher_purchases.created_at", "desc")
                    .orderBy("customer_product_purchases.product_purchase_date", "desc")
                    .orderBy("customer_login_tokens.created_at", "desc")
                    .orderBy("customer_login_tokens.updated_at", "asc")
                    .limit(1)
                break;
        }
    }
    get_customer_graph_value(query_type, data) {
        switch (query_type) {
            case "get_customer_graph":
                return knex.select(data.columns)
                    .from("customers")
                    .leftJoin("offer_redemptions", "offer_redemptions.customer_id", "=", "customers.id")
                    .leftJoin("wallet_ledger", function () {
                        this.on("customers.tenant_id", "wallet_ledger.tenant_id")
                    })
                    .where("customers.id", data['customer_id'])
                break;
        }
    }
    fetch_dynamic_fields(query_type, data) {
        switch (query_type) {
            case "":
                break;
        }
    }
    filterCustomerFields(query_type, data) {
        switch (query_type) {
            case "":
                break;
        }
    }
    fetchCustomerExtraFields(query_type, data) {
        switch (query_type) {
            case "":
                break;
        }
    }
    get_customer_assign_consent(query_type, data) {
        switch (query_type) {
            case "get_consents":
                
                break;
        }
    }
    customer_downgrade_tier(query_type, data) {
        switch (query_type) {
            case "update_status":
                knex("customer_upgrades").update({
                    status: false
                }).where("customer_upgrades.customer_id", data['customer_id'])
                break;
            case "update":
                return knex("customer_upgrades").insert(data, "id")
                break;
            case "update_tier":
                return knex("customers")
                    .where("id", data['customer_id'])
                    .update({
                        tier: data['tier_id']
                    })
                break;
            case "":
                break;
            case "":
                break;
        }
    }
    get_customer_table_columns(query_type, data) {
        switch (query_type) {
            case "get_columns":
                return knex.select(knex.raw('DISTINCT COLUMN_NAME'))
                    .from("INFORMATION_SCHEMA.COLUMNS")
                    .where("TABLE_NAME", "customers")
                    .whereRaw(" INFORMATION_SCHEMA.COLUMNS.COLUMN_NAME NOT LIKE 'column_%' ")
                break;
        }
    }
    create_dynamic_field(query_type, data) {
        switch (query_type) {
            case "":
                return knex.schema.alterTable('customers', function (t) {
                    // t.increments().primary(); // add
                    // drops previous default value from column, change type to string and add not nullable constraint
                    t.string(data.field_name, data.length).notNullable().after("created_by");
                    // drops both not null contraint and the default value
                    // t.integer('age').alter();
                    // break;
                })
        }
    }
    get_sales_office_list(query_type, data) {
        switch (query_type) {
            case "get_sales_offices":
                let obj = knex.select(data.columns)
                    .from("sales_offices")
                    .where("sales_offices.status", 1)
                // if (data['search']) {
                //     obj.where("consent_master.name", "like", "%" + data['search'] + "%");
                // }
                obj.limit(data['limit'])
                    .offset(data['offset'])
                return obj;
                break;
        }
    }
    get_customer_primary_data(query_type, data) {
        switch (query_type) {
            case "":
                break;
        }
    }
    get_customer_point_transfer_list(query_type, data) {
        switch (query_type) {
            case "get_send_ponints":
                
                break;
            case "get_received_points":
               
                break;
        }
    }
}