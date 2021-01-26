let dateFormat = require('dateformat');
let knex = require("../../../../config/knex.js");
module.exports = class Tenant_user {
    check_login(query_type, data) {
        switch (query_type) {
            case "login":
                return knex.select("*", knex.raw("tenants.id as tenant_id , tenant_users.id as tenant_user_id, tenant_users.name,tenant_users.email"))
                    .where(function () {
                        this.where('tenant_users.email', data.username)
                    })
                    .table("tenants")
                    .join("tenant_users", "tenants.id", "tenant_users.tenant_id");
                break;
            case "get_tenants":
                return knex("tenant_users").select("*");
                break;
            case "insert_token":
                return knex("tenants_login_tokens").insert(data);
        }
    }

    get_module_permissions(query_type, data) {
        switch (query_type) {
            case "get_permissions":
                return knex.select("parent_module_id", "module_name", "permission_modules.id")
                    .join("permission_modules", "permission_modules.id", "=", "admin_module_permissions.module_id ")
                    .where("tenant_id", data.tenant_id)
                    .table("admin_module_permissions")
                break;
        }
    }

    check_operation_permission(query_type, data) {
        switch (query_type) {
            case "check":
                return knex.select("permission_modules.id")
                    .joinRaw("JOIN admin_module_permissions ON FIND_IN_SET(permission_modules.id, (admin_module_permissions.module_id))")
                    .where("admin_module_permissions.tenant_id", data.tenant_id)
                    .where("module_name", data.operation)
                    .table("permission_modules")

                break;
        }
    }

    add_redemption_channel(query_type, data) {
        switch (query_type) {
            case "insert_redemption_channels":
                return knex("tenant_has_redemption_channels")
                    .insert(data);
                break;
        }
    }

    edit_redemption_channel(query_type, data) {
        switch (query_type) {
            case "update":
                return knex("tenant_has_redemption_channels")
                    .where('id', data.redemption_channel_id)
                    .update(data.insert_data);
                break;
        }
    }

    get_redemption_channel(query_type, data) {
        switch (query_type) {
            case "get_channels":
                return knex.select(data.columns)
                    .from("redemption_channel_master");
                break;
        }
    }

   async get_tenant(query_type, data) {
        switch (query_type) {
            case "get_tenant":
            let select = {
                name: 'tenants.name',
                comm_email: 'tenants.comm_email',
                group_codes: knex.raw(" GROUP_CONCAT(DISTINCT master_group_code.name) "),
                comm_contact: 'tenants.comm_contact',
                base_point_rate: 'tenants.base_point_rate',
                selling_point_rate: 'tenants.selling_point_rate',
                aging_mechanism: 'tenants.aging_mechanism',
                is_base_configuration_complete: 'tenants.is_base_configuration_complete',
                program_image: 'tenant_programs.program_image',
                round_off_threshold: 'tenants.round_off_threshold',
                round_off_type: 'tenants.round_off_type',
                currency_code: 'countries.currency_code',
                currency_symbol: 'countries.currency_symbol',
                base_burn_point_rate: 'tenants.base_burn_point_rate',
                base_burn_mechanism: 'tenants.base_burn_mechanism',
                base_max_burn_points_percent: 'tenants.base_max_burn_points_percent',

            }
                return knex.select(select)
                    .where("tenants.id", data.tenant_id)
                    .from("tenants")
                    .join("tenant_has_group_codes", "tenant_has_group_codes.tenant_id", "=", "tenants.id")
                    .join("master_group_code", "master_group_code.id", "=", "tenant_has_group_codes.group_code_id")
                    .leftJoin("tenant_programs", "tenant_programs.tenant_id", "=", "tenants.id")
                    .leftJoin("countries", "countries.id", "=", "tenants.country_id")
                break
        }
    }
    edit_tenant(query_type, data) {
        switch (query_type) {
            case "edit_tenant":
                return knex("tenants")
                    .where('id', data.tenant_id)
                    .update(data.data);
                break;
        }
    }

    get_rule_types(query_type, data) {
        switch (query_type) {
            case "get_rule_types":
                return knex.select(data.columns)
                    .from("master_rule_type");
                break;
        }
    }

    add_tenant_user(query_type, data) {
        switch (query_type) {
            case "get_tenant_user":
                return knex("tenant_users")
                    .select(["email", "phone"])
                    .where("tenant_id", data['tenant_id'])
                    .where(function () {
                        this.where('phone', data.data.phone).orWhere('email', data.email)
                    })
                break;
            case "insert_tenant_user":
                return knex("tenant_users").insert(data, "id");
                break;
        }
    }

    edit_tenant_user(query_type, data) {
        switch (query_type) {
            case "get_tenant_user":
                return knex("tenant_users")
                    .select(["email", "phone"])
                    .where("tenant_id", data['tenant_id'])
                    .where(function () {
                        this.where('phone', data.data.phone).orWhere('email', data.data.email)
                    })
                    .whereNot("id", data.data.tenant_user_id)
                break;
            case "get_tenant_user_id":
                return knex("tenant_users")
                    .select("id")
                    .where("id", data.data.tenant_user_id);
                break;
            case "edit_tenant_user":
                return knex("tenant_users")
                    .where("id", data.id)
                    .update(data);
                break;
        }
    }
    get_tenant_users_list(query_type, data) {
        switch (query_type) {
            case "get_list":
                let now = new Date();
                let obj = knex("tenant_users")
                    .select(data.columns)
                    .leftJoin({
                        "tenant_user_creator": "tenant_users"
                    }, "tenant_user_creator.id", "tenant_users.created_by")
                    .leftJoin("master_tenant_user_role", "master_tenant_user_role.id", "=", "tenant_users.role")
                    .where('tenant_users.tenant_id', data['tenant_id']);
                if (data['search']) {
                    obj.where("tenant_users.name", "like", "%" + data['search'] + "%");
                    obj.orWhere("tenant_users.name", "like", "%" + data['search'] + "%");
                }
                if (data['from_date'] && data['to_date']) {
                    obj.whereBetween('tenant_users.created_at', [data['from_date'], data['to_data']]);
                } else if (data['from_date'] && !data['to_date']) {
                    obj.whereBetween('tenant_users.created_at', [data['from_date'], dateFormat(now, "yyyy-mm-dd 23:59:59")]);
                } else if (!data['from_date'] && data['to_date']) {
                    obj.whereBetween('tenant_users.created_at', ["1970-01-01", data['to_date'] + " 23:59:59"]);
                }
                return obj;
                break;
        }
    }

    get_tenant_user_by_id(query_type, data) {
        switch (query_type) {
            case "get_tenant_user":
                return knex("tenant_users")
                    .select(data.columns)
                    .leftJoin({
                        "tenant_user_creator": "tenant_users"
                    }, "tenant_user_creator.id", "tenant_users.created_by")
                    .leftJoin("master_tenant_user_role", "master_tenant_user_role.id", "=", "tenant_users.role")
                    .where("tenant_users.id", data.tenant_user_id)
                break;
        }
    }

    get_tenant_user_by_id_email(query_type, data) {
        switch (query_type) {
            case "get_tenant_user":
            let columns = {
                role_id: "master_tenant_user_role.id",
                role_name: "master_tenant_user_role.name",
                name: "tenant_users.name",
                email: "tenant_users.email",
                phone: "tenant_users.phone",
                status: knex.raw("if(tenant_users.status=1,'Active','Inactive')"),
                created_by: "tenant_user_creator.name",
                created_time: "tenant_users.created_at"
            };
                return knex("tenant_users")
                    .select(columns)
                    .leftJoin({
                        "tenant_user_creator": "tenant_users"
                    }, "tenant_user_creator.id", "tenant_users.created_by")
                    .leftJoin("master_tenant_user_role", "master_tenant_user_role.id", "=", "tenant_users.role")
                    .where("tenant_users.tenant_id", "=", data.tenant_user_id)
                    .where("tenant_users.email", "=", data.tenant_user_email)
                break;
        }
    }

    update_tenant_userDetails(query_type, data) {
        switch (query_type) {
            case "update":
                return knex("tenant_users")
                    .where('tenant_id', '=', data.userID)
                    .where('email', '=', data.emailId)
                    .update({
                        name: data.name,
                        phone: data.phoneNo
                    })
                break;
        }
    }

    change_password(query_type, data) {
        switch (query_type) {
            case "get_tenant_user":
                return knex("tenant_users")
                    .where('tenant_id', '=', data.id)
                    .where('email', '=', data.emailId)
                    .select('password')
                break;
            case "update_tenant_user":
                return knex("tenant_users")
                    .where('tenant_id', '=', data.id)
                    .where('email', '=', data.emailId)
                    .update({ password: data.hashPswd })
                break;
        }
    }
    get_group_codes(query_type, data) {
        switch (query_type) {
            case "get_group_codes":
                return knex('master_group_code').select("*");
                    break;
        }
    }
    get_tenant_branch_list(query_type, data) {
        switch (query_type) {
            case "get_list":
                return knex('tenant_branches')
                    .where('tenant_id', data['tenant_id'])
                break;
        }
    }

    get_dashboard_graph(query_type, query_data) {
        switch (query_type) {
            case "get_graph_data":
            let columns = {
                date: knex.raw('date(point_ledger.created_at)'),
                total_accrued_points: knex.raw("sum(case when point_ledger.transaction_type='credit' then point_ledger.points else 0 end)"),
                total_redeemed_points: knex.raw("sum(case when point_ledger.transaction_type='debit'  then point_ledger.points else 0 end)"),
            };
                return knex.select(columns)
                    .from("point_ledger")
                    .join("wallet_ledger", "point_ledger.wallet_ledger_id", "wallet_ledger.id")
                    .where('wallet_ledger.tenant_id', query_data['tenant_id'])
                    .whereBetween(knex.raw("date(point_ledger.created_at)"), [query_data.start_date, query_data.end_date])
                    .groupByRaw('month(point_ledger.created_at)')
                    .groupByRaw('year(point_ledger.created_at)')
                break;
        }
    }

    get_dashboard_count(query_type, data) {
        switch (query_type) {
            case "point_data":
                let pointsColumns = {
                    total_accrual_point: knex.raw("sum(case when date(point_ledger.created_at) >=  ?   and date(point_ledger.created_at) <=  ? and point_ledger.transaction_type='credit' then point_ledger.points else 0 end)", [data.query_data.start_date, data.query_data.end_date]),
                    total_redeemed_point: knex.raw("sum(case when date(point_ledger.created_at) >= ?  and date(point_ledger.created_at) <= ? and  point_ledger.transaction_type='debit'   then point_ledger.points else 0 end)", [data.query_data.start_date, data.query_data.end_date]),
                    total_expired_point: knex.raw("sum(case when  date(wallet_ledger.end_date) >=  ? and   date(wallet_ledger.end_date)   <= ? then wallet_ledger.points else 0 end)", [data.query_data.start_date, data.query_data.end_date]),
                };
                return knex.select(pointsColumns)
                    .from("point_ledger")
                    .join("wallet_ledger", "point_ledger.wallet_ledger_id", "wallet_ledger.id")
                    .where('wallet_ledger.tenant_id', data.query_data['tenant_id'])
                break;
            case "customer_data":
                let customersColumns = {
                    total_customers: knex.raw("count(customers.id)"),
                    total_active_customers: knex.raw("count( Distinct customer_login_tokens.customer_id)"),
                };

                return knex.select(customersColumns)
                    .from('customers')
                    .leftJoin('customer_login_tokens', function () {
                        this.on('customer_login_tokens.customer_id', 'customers.id')
                            .onBetween(knex.raw("date(customer_login_tokens.created_at)"), [data.query_data.start_date, data.query_data.end_date])
                    })
                    .where('customers.tenant_id', data.query_data['tenant_id'])
                    .whereBetween(knex.raw("date(customers.created_at)"), [data.query_data.start_date, data.query_data.end_date])

                break;
        }
    }
    unlock_assign_point(query_type, data) {
        switch (query_type) {
            case "get_lock_points":
                return knex("lock_point")
                    .where("id", data.lock_point_id)
                    .update(data.data)
                break;
        }
    }

    point_redeem_tenant(query_type, data) {
        switch (query_type) {
            case "get_customers":
                return knex.select(data.columns)
                    .from('customers')
                    .where("customers.id", data.form_data.customer_id)
                break;
            case "get_redeem_vouchers":
                return knex.select('redeem_voucher_no')
                    .from('redemption_details')
                    .orderBy("redemption_details.id", "desc")
                    .limit(1)
                break;
            case "insert_redeem_transactions":
                return knex("redem_transactions")
                    .insert(data.redeem_transaction_data);
                break;
            case "insert_redemption_details":
                return knex("redemption_details")
                    .insert(data.data_insert)
                break;
        }

    }
}