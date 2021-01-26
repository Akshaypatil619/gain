let dateFormat = require('dateformat');
let knex = require("../../../../config/knex.js");
let now = new Date();
module.exports = class Point {
	fetch_customer_points(query_type, data) {
		switch (query_type) {
			case "fetch_ponits":
				let columns = {
					total_credited_points: knex.raw(" sum(case when point_ledger.transaction_type = 'credit' then point_ledger.points end) "),
					credit_points: knex.raw(" sum(case when point_ledger.transaction_type = 'credit' then point_ledger.points end) "),
					debit_points: knex.raw(" sum(case when point_ledger.transaction_type = 'debit' then point_ledger.points end) "),
					point_type_name: "master_point_type.point_type_label",
					point_type_id: "master_point_type.id",
					is_used: "wallet_ledger.is_used",
				};
				let obj = knex().select('*', columns).from('point_ledger').innerJoin('wallet_ledger', function () {
					this.on('wallet_ledger.id', 'point_ledger.wallet_ledger_id')
						.on('wallet_ledger.is_used', '=', knex.raw('?', 0))
						.on(knex.raw('DATE(wallet_ledger.end_date)'), '>=', knex.raw('?', dateFormat(now, "yyyy-mm-dd")))
						.on('wallet_ledger.customer_id', knex.raw('?', data.customer_id))

					if (data.point_type_id !== null)
						this.on('wallet_ledger.point_type_id', knex.raw('?', data.point_type_id));

				}).innerJoin('master_point_type', function () {
					this.on('master_point_type.id', 'wallet_ledger.point_type_id')
						.on('master_point_type.is_transferable', '=', knex.raw('?', 1))

					if (data.wallet_id !== null)
						this.on('master_point_type.wallet_id', knex.raw('?', data.wallet_id));

				}).where("wallet_ledger.tenant_id", "=", data.tenant_id)
					.groupBy('point_ledger.wallet_ledger_id')
					.orderBy("master_point_type.point_priority", "asc")
				break;
			case "fetch_settings":
				return knex("tenant_settings").select("data")
					.where("status", 1)
					.where("settings_name", 'lock_point_timeout_setting')
					.where("tenant_id", data.tenant_id)
				break;
			case "get_lock_points":
				let column = {
					id: "lock_point.id",
					lock_point: knex.raw("sum(case when lock_point.burn = 0 then lock_point.lock_point end)"),
				}
				return knex("lock_point").select(column)
					.where("lock_point.lock", 1)
					.where("lock_point.burn", 0)
					.where("lock_point.customer_id", data.customer_id)
					.where(knex.raw("UNIX_TIMESTAMP(lock_point.created_at)+" + timeout), ">=", parseInt(new Date() / 1000))
				break;
		}
	}
	debit_points(query_type, data) {
		switch (query_type) {
			case "fetchCreditPoints":
				let columns = {
					point_ledger_id: "point_ledger.id",
					wallet_ledger_id: "point_ledger.wallet_ledger_id",
					credit_points: knex.raw("sum(case when point_ledger.transaction_type = 'credit' then point_ledger.points end)"),
					debit_points: knex.raw("sum(case when point_ledger.transaction_type = 'debit' then point_ledger.points end)"),
				};
				return knex().select(columns)
					.from('point_ledger')
					.join('wallet_ledger', function () {
						this.on('wallet_ledger.id', 'point_ledger.wallet_ledger_id')
							.on('wallet_ledger.is_used', '!=', knex.raw('?', 1))
							.on('wallet_ledger.end_date', '>', knex.raw('?', dateFormat(now, "yyyy-mm-dd 23:59:59")))
							.on('wallet_ledger.customer_id', knex.raw('?', data.customer_id))
						if (data.point_type_id !== null)
							this.on('wallet_ledger.point_type_id', knex.raw('?', data.point_type_id));

					}).innerJoin('master_point_type', function () {
						this.on('master_point_type.id', 'wallet_ledger.point_type_id')
							.on('master_point_type.is_transferable', '=', knex.raw('?', 1))

						if (data.wallet_id !== null)
							this.on('master_point_type.wallet_id', knex.raw('?', data.wallet_id));

					}).where("wallet_ledger.tenant_id", "=", data.tenant_id)
					.groupBy('point_ledger.wallet_ledger_id')
					.orderBy("master_point_type.point_priority", "asc");

				break;
			case "fetch_settings":
				return knex("tenant_settings")
					.select("data")
					.where("tenant_settings.status", 1)
					.where("tenant_settings.settings_name", 'lock_point_timeout_setting')
					.where("tenant_settings.tenant_id", data.tenant_id)
				break;
			case "fetch_lock_points":
				{
					let columns = {
						lock_point: knex.raw("sum(case when lock_point.burn = 0 then lock_point.lock_point end)"),
					}
					return knex("lock_point").select(columns)
						.where("lock_point.lock", 1)
						.where("lock_point.burn", 0)
						.where("lock_point.customer_id", data.customer_id)
						.where(knex.raw("UNIX_TIMESTAMP(lock_point.created_at)+ ? ", timeout), ">=", parseInt(new Date() / 1000))
					break;
				}
			case "update_is_used":
				return knex('wallet_ledger')
					.update('is_used', 1)
					.whereIn('wallet_ledger.id', data.flagLots);
				break;
			case "insert_points":
				return knex("point_ledger")
					.insert(data)
				break;

		}
	}
	extend_validity(query_type, data) {
		switch (query_type) {
			case "":
				break;
		}
	}
	add_point_customer(query_type, data) {
		switch (query_type) {
			case "get_customer_point_config":
				return knex('customers')
					.select({
						aging_mechanism: 'tenants.aging_mechanism',
						point_expiry: 'customer_tier_point_configurations.point_expiry',
					})
					.leftJoin("customer_tier_point_configurations", function () {
						this.on(function () {
							this.on("customers.tier", "customer_tier_point_configurations.customer_tier_id")
							this.on("customer_tier_point_configurations.point_type_id", "=", knex.raw('?', [data.point_type_id]))
						})
					})
					.join('tenants', 'tenants.id', '=', 'customers.tenant_id')
					.where('customers.id', data['customer_id'])
					.where('customer_tier_point_configurations.status', 1);
				break;
			case "insert_wallet_ladger":
				return knex("wallet_ledger")
					.insert(data)
				break;
			case "insert_point_ladger":
				return knex('point_ledger')
					.insert(data);
		}
	}
	point_redeem_customer(query_type, data) {
		switch (query_type) {
			case "":
				break;
		}
	}
	get_point_about_to_expire(query_type, data) {
		switch (query_type) {
			case "get_points":
				let columns = {
					wallet_id: "wallet_ledger.id",
					point_type: "master_point_type.point_type_name",
					points: "wallet_ledger.points",
					end_date: "wallet_ledger.end_date",
					applicable_points_percentage: "master_point_type.applicable_points_percentage",
					point_type_list: knex.raw(" GROUP_CONCAT(DISTINCT master_point_type.point_type_name) "),

				};
				return knex.select(columns)
					.from("wallet_ledger")
					.join("master_point_type", "master_point_type.id", "=", "wallet_ledger.point_type_id")
					.where("wallet_ledger.customer_id", "=", data['customer_id'])
					.where("wallet_ledger.tenant_id", "=", data['tenant_id'])
					.whereRaw("MONTH(wallet_ledger.end_date) = " + currentMonth)
					.whereRaw("Year(wallet_ledger.end_date) = " + currentYear)
					.orderBy("master_point_type.point_priority", "asc");
				break;
		}
	}
	point_transfer(query_type, data) {
		switch (query_type) {
			case "get_tenant_settings":
				return knex("tenant_settings").select("data")
					.where("status", 1)
					.where("settings_name", 'default_point_type_setting')
					.where("tenant_id", data.tenant_id)
				break;
			case "add_transfer_point":
				return knex("customers_point_transfer")
					.insert(data)
		}
	}
}
