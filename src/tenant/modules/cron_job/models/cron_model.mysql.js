let knex = require("../../../../../config/knex");
let config = require("../../../../../config/config");
let encription_key = config.encription_key;

module.exports = class CronModel {


	getCustomersList(data) {
		let columns = {
			customer_id: knex.raw("CAST(AES_DECRYPT(customers.membership_no,'" + encription_key + "')AS CHAR(255))"),
			status: "customers.customer_status",
			name: knex.raw("CONCAT(CAST(AES_DECRYPT(customers.first_name,'"+ encription_key +"') AS CHAR(255)),' ',CAST(AES_DECRYPT(customers.last_name,'"+ encription_key +"') AS CHAR(255)))"),
			first_name: knex.raw("CAST(AES_DECRYPT(customers.first_name,'"+ encription_key +"') AS CHAR(255))"),
			last_name: knex.raw("CAST(AES_DECRYPT(customers.last_name,'"+ encription_key +"') AS CHAR(255))"),
			isd_code: "customers.isd",
			mobile_number: knex.raw("CAST(AES_DECRYPT(customers.phone,'"+ encription_key +"') AS CHAR(255))"),
			email_id: knex.raw("CAST(AES_DECRYPT(customers.email,'"+ encription_key +"') AS CHAR(255))"),
			dob: knex.raw("DATE_FORMAT(customers.dob, '%d/%m/%Y')"),
			income: knex.raw('?', null),
			province: knex.raw('?', null),
			country: "countries.name",
			nationality: "master_nationality.name",
			nationality_id: knex.raw("IF((CHAR_LENGTH(customers.nationality_id)=9 || CHAR_LENGTH(customers.nationality_id)=12), customers.nationality_id, '')"),
			gender: "customers.gender",
			registration_date: knex.raw("DATE_FORMAT(customers.created_at, '%d/%m/%Y %r')"),

		}
		let obj = knex("customers")
			.select(columns)
			.leftJoin('countries', 'countries.id', '=', 'customers.country_id')
			.leftJoin('master_nationality', 'master_nationality.id', '=', 'customers.nationality_id')
			.where('customers.status', 1)
			.andWhere(knex.raw('customers.customer_status !="delete"'));
		if (data['date'] == "") {
			obj.andWhere(knex.raw("DATE(DATE_ADD(customers.created_at, INTERVAL 1 DAY))=CURRENT_DATE()"));
			obj.orWhere(knex.raw("DATE(DATE_ADD(customers.updated_at, INTERVAL 1 DAY))=CURRENT_DATE()"));
		} else {
			obj.andWhere(knex.raw("DATE(DATE_ADD(customers.created_at, INTERVAL 0 DAY))='" + data['date'] + "'"));
			obj.orWhere(knex.raw("DATE(DATE_ADD(customers.updated_at, INTERVAL 0 DAY))='" + data['date'] + "'"));
		}
		return obj;
	}

	transactionsList(data) {
		let columns = {
			customer_id: knex.raw("CAST(AES_DECRYPT(customers.membership_no,'" + encription_key + "')AS CHAR(255))"),
			channel_name: "customer_transaction.channel_name",
			activity_code: "master_activity.code",
			activity_name: "master_activity.name",
			transaction_id: "customer_transaction.transaction_id",
			transaction_amount: knex.raw("IFNULL(customer_transaction.amount, 0)"),
			transaction_type: "customer_transaction.transaction_type",
			conversion_rate: knex.raw('?', 0.001),
			points: knex.raw("IFNULL(customer_transaction.points, 0)"),
			payment_type: "customer_transaction.payment_method",
			category_name: knex.raw('?', null),
			sub_category_name: knex.raw('?', null),
			brand_name: knex.raw('?', null),
			denomination: knex.raw('?', null),
			transaction_date_time: knex.raw("DATE_FORMAT(customer_transaction.transaction_date, '%d/%m/%Y %H:%i:%s')"),
		}

		let obj = knex("customer_transaction")
			.select(columns)
			.innerJoin('customers', 'customers.id', '=', 'customer_transaction.customer_id')
			.innerJoin('master_activity', 'master_activity.id', '=', 'customer_transaction.activity_id')
			.where('customer_transaction.status', 1)
			.groupBy('customer_transaction.customer_id');

		if (data['date'] == "") {
			obj.andWhere(knex.raw("DATE(DATE_ADD(customer_transaction.created_at, INTERVAL 1 DAY))=CURRENT_DATE()"));
			obj.orWhere(knex.raw("DATE(DATE_ADD(customer_transaction.updated_at, INTERVAL 1 DAY))=CURRENT_DATE()"));
		} else {
			obj.andWhere(knex.raw("DATE(DATE_ADD(customer_transaction.created_at, INTERVAL 0 DAY))='" + data['date'] + "'"));
			obj.orWhere(knex.raw("DATE(DATE_ADD(customer_transaction.updated_at, INTERVAL 0 DAY))='" + data['date'] + "'"));
		}
		return obj;
	}

	statementList(m, y) {
		let month, year;
		let year_param_1, year_param_2, year_param_3;

		month = m ? m : 'month(CURRENT_DATE - INTERVAL 1 month)';
		year = y ? y : 'year(CURRENT_DATE - INTERVAL 1 month)';
		year_param_1 = year_param_2 = year_param_3 = year;

		let expiry_one_month, expiry_two_month, expiry_three_month;
		if (m && y) {
			expiry_one_month = m + 1;
			expiry_two_month = m + 2;
			expiry_three_month = m + 3;
			if (m == 12) {
				expiry_one_month = 1;
				expiry_two_month = 2;
				expiry_three_month = 3;
				year_param_1 += 1;
				year_param_2 += 1;
				year_param_3 += 1;
			} else if (m == 11) {
				expiry_two_month = 1;
				expiry_three_month = 2;
				year_param_2 += 1;
				year_param_3 += 1;
			} else if (m == 10) {
				expiry_three_month = 1;
				year_param_3 += 1;
			}
		} else {
			expiry_one_month = 'month(CURRENT_DATE + INTERVAL 1 month)';
			expiry_two_month = 'month(CURRENT_DATE + INTERVAL 2 month)';
			expiry_three_month = 'month(CURRENT_DATE + INTERVAL 3 month)';
			year_param_1 = 'year(CURRENT_DATE + INTERVAL 1 month)';
			year_param_2 = 'year(CURRENT_DATE + INTERVAL 2 month)';
			year_param_3 = 'year(CURRENT_DATE + INTERVAL 3 month)';
		}

		let columns = {
			customer_id: knex.raw("CAST(AES_DECRYPT(customers.membership_no,'" + encription_key + "')AS CHAR(255))"),
			opening_balance: knex.raw("SUBSTRING_INDEX(group_concat(case when MONTH(customer_transaction.updated_at) = " + month + " and YEAR(customer_transaction.updated_at) = " + year + " then opening_balance else 0 end ORDER BY customer_transaction.id ASC), ',', 1) "),
			points_earned: knex.raw("sum(case when customer_transaction.transaction_type = 'credit' AND Month(customer_transaction.transaction_date) = " + month + " and year(customer_transaction.updated_at) = " + year + " then customer_transaction.points else 0 end)"),
			points_redeemed: knex.raw("sum(case when customer_transaction.transaction_type = 'debit' AND Month(customer_transaction.transaction_date) = " + month + " and year(customer_transaction.updated_at) = " + year + " then customer_transaction.points else 0 end)"),
			closing_balance: knex.raw("SUBSTRING_INDEX(group_concat(case when MONTH(customer_transaction.updated_at) = " + month + " and YEAR(customer_transaction.updated_at) = " + year + " then closing_balance else 0 end ORDER BY customer_transaction.id DESC), ',', 1) "),
			total_points_earned: knex.raw("sum(case when customer_transaction.transaction_type = 'credit' then customer_transaction.points else 0 end)"),
			total_points_redeemed: knex.raw("sum(case when customer_transaction.transaction_type = 'debit' then customer_transaction.points else 0 end)"),
			total_points_expired: knex.raw("sum(case when is_used = 2 then wallet_ledger.points else 0 end)"),
			points_expiring_in_one_month: knex.raw("sum(case when month(wallet_ledger.end_date) = " + expiry_one_month + " and year(wallet_ledger.end_date) = " + year_param_1 + " then wallet_ledger.points ELSE 0 end)"),
			points_expiring_in_two_month: knex.raw("sum(case when month(wallet_ledger.end_date) = " + expiry_two_month + " and year(wallet_ledger.end_date) = " + year_param_2 + " then wallet_ledger.points ELSE 0 end)"),
			points_expiring_in_three_month: knex.raw("sum(case when month(wallet_ledger.end_date) = " + expiry_three_month + " and year(wallet_ledger.end_date) = " + year_param_3 + " then wallet_ledger.points ELSE 0 end)"),
			Statement_month_year: knex.raw("DATE_FORMAT(CURRENT_DATE(), '%m-%Y')"),
		}

		let obj = knex("customer_transaction")
			.select(columns)
			.innerJoin('customers', 'customers.id', '=', 'customer_transaction.customer_id')
			.innerJoin('master_activity', 'master_activity.id', '=', 'customer_transaction.activity_id')
			.innerJoin('point_ledger', 'point_ledger.transaction_id', '=', 'customer_transaction.transaction_id')
			.innerJoin('wallet_ledger', 'wallet_ledger.id', '=', 'point_ledger.wallet_ledger_id')
			.groupBy('customer_transaction.customer_id');
		return obj;
	}

	getCustomersReferralList(data) {
		let columns = {
			customer_id: knex.raw("CAST(AES_DECRYPT(customers.membership_no,'" + encription_key + "')AS CHAR(255))"),
			status: knex.raw("case when customer_referral.customer_id IS NULL then 'Pending' else 'Completed' end"),
			name: knex.raw("CONCAT(CAST(AES_DECRYPT(customers.first_name,'"+ encription_key +"') AS CHAR(255)),' ',CAST(AES_DECRYPT(customers.last_name,'"+ encription_key +"') AS CHAR(255)))"),
			referre_first_name: "customer_referral.first_name",
			referre_last_name: "customer_referral.last_name",
			referre_isd_code: "customers.isd",
			referre_mobile_number: "customer_referral.phone",
			referre_email_id: "customer_referral.email",
			referral_registered: knex.raw("case when customer_id is not null then 'Y' else 'N' end"),
			referral_registered_date: knex.raw("DATE_FORMAT(customer_referral.registered_date, '%d/%m/%Y %r')"),
			// referral_is_installed: knex.raw('?', null),
			// referral_is_installed_date: knex.raw('?', null)
		}
		let obj = knex("customer_referral")
			.select(columns)
			.leftJoin('customers', 'customers.id', '=', 'customer_referral.referrer_customer_id')
			// .leftJoin('customers as referral_customers', 'referral_customers.id', '=', 'customer_referral.customer_id')
			.where('customer_referral.status', 1)
		if (data['date'] == "") {
			obj.andWhere(knex.raw("DATE(DATE_ADD(customer_referral.created_at, INTERVAL 1 DAY))=CURRENT_DATE()"));
			obj.orWhere(knex.raw("DATE(DATE_ADD(customer_referral.updated_at, INTERVAL 1 DAY))=CURRENT_DATE()"));
		} else {
			obj.andWhere(knex.raw("DATE(DATE_ADD(customer_referral.created_at, INTERVAL 0 DAY))='" + data['date'] + "'"));
			obj.orWhere(knex.raw("DATE(DATE_ADD(customer_referral.updated_at, INTERVAL 0 DAY))='" + data['date'] + "'"));
		}
		return obj;
	}


	getProductReferralList(data) {
		return new Promise(async function (resolve, reject) {
			let updated_at;
			if (data['date'] == "") {
				updated_at = knex.raw("DATE(DATE_ADD(product_referral.updated_at, INTERVAL -1 DAY))");
			} else {
				updated_at = knex.raw("DATE(DATE_ADD(product_referral.updated_at, INTERVAL 0 DAY))");
			}


			let product_referral_columns = {
				customer_id: knex.raw("CAST(AES_DECRYPT(customers.membership_no,'" + encription_key + "')AS CHAR(255))"),
				updated_at: updated_at,
				status: knex.raw("product_referral.product_status"),
				name: knex.raw("CONCAT(CAST(AES_DECRYPT(customers.first_name,'"+ encription_key +"') AS CHAR(255)),' ',CAST(AES_DECRYPT(customers.last_name,'"+ encription_key +"') AS CHAR(255)))"),
				referee_first_name: "product_referral.first_name",
				referee_Last_name: "product_referral.last_name",
				referee_isd_code: "customers.isd",
				referee_mobile_number: "product_referral.phone",
				referee_email_id: "product_referral.email",
				product_type: "product_type_master.name",
				product_sub_type: "product_sub_type_master.name",
				organisation: "product_type_master.organization",
				lead_complete: knex.raw("case when lead_sales_transactions.lead_id is not null then 'Y' else 'N' end"),
				lead_complete_date: knex.raw("case when lead_sales_transactions.lead_id is not null then DATE_FORMAT(lead_sales_transactions.lead_generated_on, '%d/%m/%Y %r') else null end"),
				sales_complete: knex.raw("case when lead_sales_transactions.sales_id is not null then 'Y' else 'N' end"),
				sales_complete_date: knex.raw("case when lead_sales_transactions.sales_id is not null then DATE_FORMAT(lead_sales_transactions.sales_generated_on, '%d/%m/%Y %r') else null end")
			}
			let product_referral_obj = knex("product_referral")
				.select(product_referral_columns)
				.leftJoin("lead_sales_transactions", function () {
					this.on('lead_sales_transactions.email', '=', 'product_referral.email')
						.andOn('lead_sales_transactions.product_code', '=', 'product_referral.sub_product_id')
				})
				.join('customers', 'customers.id', '=', 'product_referral.referrer_id')
				.join('product_sub_type_master', 'product_sub_type_master.id', '=', 'product_referral.sub_product_id')
				.join('product_type_master', 'product_type_master.id', '=', 'product_sub_type_master.product_id')
				.where('product_referral.status', 1)
				.andWhere('product_referral.product_status', "!=", "Expired");

			if (data['date'] == "") {
				product_referral_obj.andWhere(knex.raw("DATE(DATE_ADD(product_referral.created_at, INTERVAL -1 DAY))=CURRENT_DATE()"));
				product_referral_obj.orWhere(knex.raw("DATE(DATE_ADD(product_referral.updated_at, INTERVAL -1 DAY))=CURRENT_DATE()"));
			} else {
				product_referral_obj.andWhere(knex.raw("DATE(DATE_ADD(product_referral.created_at, INTERVAL 0 DAY))='" + data['date'] + "'"));
				product_referral_obj.orWhere(knex.raw("DATE(DATE_ADD(product_referral.updated_at, INTERVAL 0 DAY))='" + data['date'] + "'"));
			}

			let self_purchase_columns = {
				customer_id: knex.raw("CAST(AES_DECRYPT(customers.membership_no,'" + encription_key + "')AS CHAR(255))"),
				status: knex.raw('?', "Self"),
				name: knex.raw("CONCAT(CAST(AES_DECRYPT(customers.first_name,'"+ encription_key +"') AS CHAR(255)),' ',CAST(AES_DECRYPT(customers.last_name,'"+ encription_key +"') AS CHAR(255)))"),
				referee_first_name: knex.raw("SUBSTRING_INDEX(SUBSTRING_INDEX(lead_sales_transactions.name, ' ', 1), ' ', -1)"),
				referee_Last_name: knex.raw("TRIM( SUBSTR(lead_sales_transactions.name, LOCATE(' ', lead_sales_transactions.name)) )"),
				referee_isd_code: "lead_sales_transactions.country_code",
				referee_mobile_number: "lead_sales_transactions.mobile",
				referee_email_id: "lead_sales_transactions.email",
				product_type: "product_type_master.name",
				product_sub_type: "product_sub_type_master.name",
				organisation: "product_type_master.organization",
				lead_complete: knex.raw("case when lead_sales_transactions.lead_id is not null then 'Y' else 'N' end"),
				lead_complete_date: knex.raw("case when lead_sales_transactions.lead_id is not null then DATE_FORMAT(lead_sales_transactions.lead_generated_on, '%d/%m/%Y %r') else null end"),
				sales_complete: knex.raw("case when lead_sales_transactions.sales_id is not null then 'Y' else 'N' end"),
				sales_complete_date: knex.raw("case when lead_sales_transactions.sales_id is not null then DATE_FORMAT(lead_sales_transactions.sales_generated_on, '%d/%m/%Y %r') else null end")
			}
			let self_purchase_obj = knex("lead_sales_transactions")
				.select(self_purchase_columns)
				.join('customers', knex.raw("CAST(AES_DECRYPT(customers.email,'"+ encription_key +"') AS CHAR(255))"), '=', 'lead_sales_transactions.email')
				.join('product_sub_type_master', 'product_sub_type_master.id', '=', 'lead_sales_transactions.product_code')
				.join('product_type_master', 'product_type_master.id', '=', 'product_sub_type_master.product_id')

			if (data['date'] == "") {
				self_purchase_obj.andWhere(knex.raw("DATE(DATE_ADD(lead_sales_transactions.created_at, INTERVAL -1 DAY))=CURRENT_DATE()"));
				self_purchase_obj.orWhere(knex.raw("DATE(DATE_ADD(lead_sales_transactions.updated_at, INTERVAL -1 DAY))=CURRENT_DATE()"));
			} else {
				self_purchase_obj.andWhere(knex.raw("DATE(DATE_ADD(lead_sales_transactions.created_at, INTERVAL 0 DAY))='" + data['date'] + "'"));
				self_purchase_obj.orWhere(knex.raw("DATE(DATE_ADD(lead_sales_transactions.updated_at, INTERVAL 0 DAY))='" + data['date'] + "'"));
			}

			let product_referral_result;
			await product_referral_obj.then(result => {
				product_referral_result = result;
			});

			let self_purchase_result;
			await self_purchase_obj.then(result => {
				self_purchase_result = result;
			})

			let result = [];
			if(product_referral_result.length > 0) {
				product_referral_result.map(res => {
					if(res.updated_at == data['date'] &&
						res.status != 'Expired') {
						delete res.updated_at;
						result.push(res)
					}
				})
			}

			if(self_purchase_result.length > 0) {
				self_purchase_result.map(res => {
					result.push(res)
				})
			}

			resolve(result);
		});
	}

	getBrandList(columns) {
        return knex('transaction_history')
            .select(columns)
    }
}
