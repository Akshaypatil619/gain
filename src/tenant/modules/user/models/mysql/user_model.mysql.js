let knex = require("../../../../../../config/knex");
let dateFormat = require('dateformat');
let responseHandler = new (require("../../../../../core/ResponseHandler.js"))();
let send_mail = require("../../../../../../config/send_mail.js");
module.exports = class UserModel {
    /**
     * @description check login query
     * @author Brijesh Kumar Khatri
     * @param {*} data
     * @returns
     */
	checkLogin(data) {
		return knex.select("*", knex.raw("tenant_users.tenant_id as tenant_id , tenant_users.id as tenant_user_id, tenant_users.name,tenant_users.email"))
			.where(function () {
				this.where('tenant_users.email', data.username)
			})
			.table("tenants")
			.join("tenant_users", "tenants.id", "tenant_users.tenant_id");
	}

    /**
     * @description Get tenant user information query
     * @author Brijesh Kumar Khatri
     * @param {*} data
     * @returns
     */
	getTenantUserInfo(data) {
		return knex("tenant_users")
			.select("*")
			.where("id", data.tenant_user_id)
	}

    /**
     * @description save token query
     * @author Brijesh Kumar Khatri
     * @param {*} data
     * @returns
     */
	saveToken(data) {
		return knex("tenants_login_tokens")
			.insert(data);
	}

    /**
     * @description Get user profile query
     * @author Brijesh Kumar Khatri
     * @param {*} data
     * @returns
     */
	getProfile(data) {
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
	}

    /**
     * @description update profile query
     * @author Brijesh Kumar Khatri
     * @param {*} data
     * @returns
     */
	updateProfile(data) {
		return knex("tenants")
			.where('id', data.tenant_id)
			.update(data.data);
	}

    /**
     * @description insert redeemtption channel query
     * @author Brijesh Kumar Khatri
     * @param {*} data
     * @returns
     */
	insertRedemptionChannel(data) {
		return knex("tenant_has_redemption_channels")
			.insert(data);
	}

    /**
     * @description update redemption channel query
     * @author Brijesh Kumar Khatri
     * @param {*} data
     * @returns
     */
	updateRedemptionChannel(data) {
		return knex("tenant_has_redemption_channels")
			.where(data.where)
			.update(data.data);
	}

    /**
     * @description get redemption channel query
     * @author Brijesh Kumar Khatri
     * @param {*} data
     * @returns
     */
	getRedemptionChannel(data) {
		return knex.select(data.columns)
			.from("redemption_channel_master");
	}

    /**
     * @description Get rule types query
     * @author Brijesh Kumar Khatri
     * @param {*} data
     * @returns
     */
	getRuleTypes(data) {
		return knex.select(data.columns)
			.from("master_rule_type")
			.where("status", 1);
	}

    /**
     * @description Get tenant branch list query
     * @author Brijesh Kumar Khatri
     * @param {*} data
     * @returns
     */
	getTenantBranchList(data) {
		return knex('tenant_branches')
			.where('tenant_id', data['tenant_id'])
	}

    /**
     * @description Unlock assign point query
     * @author Brijesh Kumar Khatri
     * @param {*} data
     * @returns
     */
	unlockAssignPoint(data) {
		return knex("lock_point")
			.where("id", data.lock_point_id)
			.update(data.data)
	}

    /**
     * @description get tenant user query
     * @author Brijesh Kumar Khatri
     * @param {*} data
     * @returns
     */
	getTenantUser(data) {
		return knex("tenant_users")
			.select(["email", "phone"])
			.where("tenant_id", data['tenant_id'])
			.where(function () {
				this.where('phone', data.phone).orWhere('email', data.email)
			})
	}

    /**
     * @description add tenant user query
     * @author Brijesh Kumar Khatri
     * @param {*} data
     * @returns
     */
	addTenantUser(data) {
		return knex("tenant_users").insert(data, "id");
	}

	getTenantSettingData(tenant_user_id) {
		return knex("tenants")
			.select({
				base_point_rate: "tenants.base_point_rate",
				burn_point_rate: "tenants.base_burn_point_rate",
				selling_point_rate: "tenants.selling_point_rate",
				min_point: "tenants.min_point",
				conversion_value: "countries.conversion_value",
				currency_code: "countries.currency_code",
				name: "countries.name",
				tenant_id: "tenants.id",
				tenant_user_id: "tenant_users.id",
				branch_id: "tenant_users.branch_id",
				tenant_type_id: "tenants.tenant_type_id",
			})
			.innerJoin('tenant_users', 'tenant_users.tenant_id', '=', 'tenants.id')
			.join("countries", "countries.id", "=", "tenants.country_id")
			.where('tenant_users.id', tenant_user_id);
	}

    /**
     * @description Check tenant user exist query
     * @author Brijesh Kumar Khatri
     * @param {*} data
     * @returns
     */
	checkTenantUserExist(data) {
		return knex("tenant_users")
			.select(["email", "phone"])
			.where("tenant_id", data['tenant_id'])
			.where(function () {
				this.where('phone', data.data.phone).orWhere('email', data.data.email)
			})
			.whereNot("id", data.data.tenant_user_id)
	}

    /**
     * @description get tenant user id
     * @author Brijesh Kumar Khatri
     * @param {*} data
     * @returns
     */
	getTenantUserId(data) {
		return knex("tenant_users")
			.select("id")
			.where("id", data.data.tenant_user_id);
	}

    /**
     * @description edit tenant user
     * @author Brijesh Kumar Khatri
     * @param {*} data
     * @returns
     */
	editTenantUser(data) {
		return knex("tenant_users")
			.where("id", data.id)
			.update(data);
	}

    /**
     * @description get tenant users list
     * @author Brijesh Kumar Khatri
     * @param {*} data
     * @returns
     */
	getTenantUsers(data) {
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

		data.limit ? obj.limit(data['limit']) : "";
		data.limit ? obj.offset(data['offset']) : null;
		obj.orderBy("tenant_users.created_at", "desc")
		return obj;
	}

    /**
     * @description get tenant user by id
     * @author Brijesh Kumar Khatri
     * @param {*} data
     * @returns
     */
	getTenantUserById(data) {
		return knex("tenant_users")
			.select(data.columns)
			.leftJoin({
				"tenant_user_creator": "tenant_users"
			}, "tenant_user_creator.id", "tenant_users.created_by")
			.leftJoin("master_tenant_user_role", "master_tenant_user_role.id", "=", "tenant_users.role")
			.where("tenant_users.id", data.tenant_user_id)
	}

    /**
     * @description get tenant user by email
     * @author Brijesh Kumar Khatri
     * @param {*} data
     * @returns
     */
	getTenantUserByEmail(data) {
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
	}

    /**
     * @description update tenant user details
     * @author Brijesh Kumar Khatri
     * @param {*} data
     * @returns
     */
	updateTenantUserDetails(data) {
		return knex("tenant_users")
			.where('tenant_id', '=', data.tenant_user_id)
			.where('email', '=', data.email)
			.update({
				name: data.name,
				phone: data.phone
			})
	}

    /**
     * @description change password
     * @author Brijesh Kumar Khatri
     * @param {*} data
     * @returns
     */
	changePassword(data) {
		return knex("tenant_users")
			.where('id', data.id)
			.where('email', data.emailId)
			.update({ password: data.hashPswd })
	}

    /**
     * @description get dashboard point count
     * @author Brijesh Kumar Khatri
     * @param {*} data
     * @returns
     */
	getDashboardPointCount(data) {
		let pointsColumns = {
			total_accrual_point: knex.raw("sum(case when date(point_ledger.created_at) >=  ?   and date(point_ledger.created_at) <=  ? and point_ledger.transaction_type='credit' then point_ledger.points else 0 end)", [data.start_date, data.end_date]),
			total_redeemed_point: knex.raw("sum(case when date(point_ledger.created_at) >= ?  and date(point_ledger.created_at) <= ? and  point_ledger.transaction_type='debit'   then point_ledger.points else 0 end)", [data.start_date, data.end_date]),
			total_expired_point: knex.raw("sum(case when  date(wallet_ledger.end_date) >=  ? and   date(wallet_ledger.end_date)   <= ? then wallet_ledger.points else 0 end)", [data.start_date, data.end_date]),
		};
		return knex.select(pointsColumns)
			.from("point_ledger")
			.join("wallet_ledger", "point_ledger.wallet_ledger_id", "wallet_ledger.id")
	}

    /**
     * @description get dashboard customer count
     * @author Brijesh Kumar Khatri
     * @param {*} data
     * @returns
     */
	getDashboardCustomerCount(data) {
		let customersColumns = {
			total_customers: knex.raw("count(customers.id)"),
			total_active_customers: knex.raw("count( Distinct customer_login_tokens.customer_id)"),
		};

		return knex.select(customersColumns)
			.from('customers')
			.leftJoin('customer_login_tokens', function () {
				this.on('customer_login_tokens.customer_id', 'customers.id')
					.onBetween(knex.raw("date(customer_login_tokens.created_at)"), [data.start_date, data.end_date])
			})
			.whereBetween(knex.raw("date(customers.created_at)"), [data.start_date, data.end_date])

	}
	getDashboardPerantCount(data) {

		let parentsColumns = {
			total_parent: knex.raw("count(customers.id)"),
		};

		return knex.select(parentsColumns)
			.from('customers')
			.leftJoin("master_member_type", "master_member_type.id", "=", "customers.id")
			.where("master_member_type.code", "=", 'parent')
			.whereBetween(knex.raw("date(customers.created_at)"), [data.start_date, data.end_date])

	}
	getDashboardStaffCount(data) {
		let staffsColums = {
			total_staff: knex.raw("count(customers.id)"),
		}
		return knex.select(staffsColums)
			.from('customers')
			.leftJoin("master_member_type", "master_member_type.id", "=", "customers.id")
			.where("master_member_type.code", "=", "staff")
			.whereBetween(knex.raw("date(customers.created_at)"), [data.start_date, data.end_date])
	}
    /**
     * @description get dashboard graph
     * @author Brijesh Kumar Khatri
     * @param {*} data
     * @returns
     */
	getDashboardGraph(data) {
		let columns = {
			date: knex.raw('date(point_ledger.created_at)'),
			total_accrued_points: knex.raw("IFNULL(sum(case when point_ledger.transaction_type='credit' then point_ledger.points else 0 end),0)"),
			total_redeemed_points: knex.raw("IFNULL(sum(case when point_ledger.transaction_type='debit'  then point_ledger.points else 0 end),0)"),
		};
			 knex.select(columns)
			.from("point_ledger")
			.join("wallet_ledger", "point_ledger.wallet_ledger_id", "wallet_ledger.id")
			.whereBetween(knex.raw("date(point_ledger.created_at)"), [data.start_date, data.end_date])
			.groupByRaw('month(point_ledger.created_at)')
			.groupByRaw('year(point_ledger.created_at)');
		return knex.select(columns)
			.from("point_ledger")
			.join("wallet_ledger", "point_ledger.wallet_ledger_id", "wallet_ledger.id")
			.whereBetween(knex.raw("date(point_ledger.created_at)"), [data.start_date, data.end_date])
			.groupByRaw('month(point_ledger.created_at)')
			.groupByRaw('year(point_ledger.created_at)');

	}

	sendTemplateMail(data, name) {
		knex("email_templates")
			.select("*")
			.where("template_name", name)
			.limit(1).orderBy("id", "desc")
			.then((template_result) => {
				if (template_result.length > 0) {
					let body = responseHandler.find_and_replace(template_result[0].body, data);
					send_mail.sending({
						email: data.email,
						email_body: body,
						email_subject: template_result[0].subject,
						template_id: template_result[0].id
					});
				}
			});
	}

	overallPoints(data) {
		let columns = {
			ttl_expired_pts: knex.raw("IFNULL(sum(overall_points_report.ttl_expired_pts),0)"),
			ttl_num_of_normal_pts: knex.raw("IFNULL(sum(overall_points_report.ttl_num_of_normal_pts),0)"),
			ttl_num_of_promotion_pts: knex.raw("IFNULL(sum(overall_points_report.ttl_num_of_promotion_pts),0)"),
			ttl_num_of_pts: knex.raw("IFNULL(sum(overall_points_report.ttl_num_of_pts),0)"),
			ttl_pts_will_be_expired: knex.raw("IFNULL(sum(overall_points_report.ttl_pts_will_be_expired),0)"),
			ttl_used_pts: knex.raw("IFNULL(sum(overall_points_report.ttl_used_pts),0)"),
			
		};

		 knex.select(columns)
		.from('overall_points_report')
			// .whereBetween('overall_points_report.created_at', [dateFormat(data['date'], "yyyy-mm-dd 00:00:00"), dateFormat(data['date'], "yyyy-mm-dd 23:59:59")]);
			 .whereBetween(knex.raw("date(overall_points_report.created_at)"), [data.start_date, data.end_date])
			 .groupByRaw('month(overall_points_report.created_at)')
			 .groupByRaw('year(overall_points_report.created_at)');
		return knex.select(columns)
			.from('overall_points_report')
			 .whereBetween(knex.raw("date(overall_points_report.created_at)"), [data.start_date, data.end_date])
			 .groupByRaw('month(overall_points_report.created_at)')
			 .groupByRaw('year(overall_points_report.created_at)');
	}

}