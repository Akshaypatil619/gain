let knex = require("../../../../../config/knex");
let dateFormat = require('dateformat');
let config = require("../../../../../config/config");
let encription_key = config.encription_key;
module.exports = class CustomerModel {

    /**
     * Get customer info query
     *
     * @param data
     * @returns {*}
     */
	getCustomerInfo(data) {
		// fetch selected columns
		return knex("customers").select('*')
			.whereNot('id', data['customer_id'])
			.whereRaw("CAST(AES_DECRYPT(customers.phone,'" + encription_key + "') AS CHAR(255)) = '" + data['phone'] + "'")
			.orWhereRaw("CAST(AES_DECRYPT(customers.email,'" + encription_key + "') AS CHAR(255)) = '" + data['email'] + "'")
	}

	checkCustomerId(data) {
		// fetch selected columns
		return knex("customers")
			.select('*')
			.where('id', data['customer_id'])
	}

    /**
     * Insert customer data
     *
     * @param data
     * @returns {*}
     */
	insertCustomerInfo(data) {
		// return knex object for insert data into customers table
		return knex("customers").insert(data, "id");
	}

    /**
     * Insert customer social profile
     *
     * @param data
     * @returns {*}
     */
	insertCustomerSocialProfile(data) {
		// return knex object for insert data into customer's social profile table
		return knex("customer_social_profile").insert(data, "id");
	}

    /**
     * Update customer data
     *
     * @param data
     * @returns {*}
     */
	updateCustomer(data) {
		// return knex object for update customer records with where condition 
		return knex("customers").update(data.update).where(data.where);
	}

    /**
     * Get customer social profile - selected columns
     * @param data
     * @returns {*}
     */
	getCustomerSocialProfileInfo(data) {
		// get customer social profile 
		let queryObject = knex("customer_social_profile")
			.select(data.select);

		// where condition
		data.where ? queryObject.where(data.where) : "";
		data.whereNot ? queryObject.whereNot(data.whereNot) : "";

		// return knex query object
		return queryObject;
	}

    /**
     * Update customer social profile info
     * @param data
     * @returns {*}
     */
	updateCustomerSocialProfileInfo(data) {
		// return knex object for update customer records with where condition 
		return knex("customer_social_profile")
			.update(data.data)
			.where(data.where);
	}

    /**
     * Get customer profile and social profile data
     *
     * @param data
     * @returns {*}
     */
	getCustomerProfile(data) {
		let columns = {
			customer_id: "customers.id",
			first_name: knex.raw("CAST(AES_DECRYPT(customers.first_name,'" + encription_key + "') AS CHAR(255))"),
			phone: knex.raw("CAST(AES_DECRYPT(customers.phone,'" + encription_key + "') AS CHAR(255))"),
			last_name: knex.raw("CAST(AES_DECRYPT(customers.last_name,'" + encription_key + "') AS CHAR(255))"),
			email: knex.raw("CAST(AES_DECRYPT(customers.email,'" + encription_key + "') AS CHAR(255))"),
			contact: "customers.contact",
			country_code: "customers.country_code",
			designation: "customers.designation ",
			dob: "customers.dob",
			gender: "customers.gender",
			country: "customers.country_id",
			tier: "customers.tier_id",
			member_code: "customers.member_code",
			country_id: "countries.id",
			country_name: "countries.name",
			tier_name: "customer_tiers.name",
			tier_order: "customer_tiers.tier_order",
			tier_price: "customer_tiers.tier_price",
			time_period: "customer_tiers.time_period",
			tier_status: "customer_tiers.status",
			grace_period: "customer_tiers.grace_period",
			customerStatus: "customers.status",
			google_link: "customer_social_profile.google_link",
			twitter_link: "customer_social_profile.twitter_link",
			linked_in_link: "customer_social_profile.linked_in_link",
			facebook_link: "customer_social_profile.facebook_link",
			member_since: "customers.created_at",
			total_points: "cc_account_summary.point_balance",
		}
		// get selected columns from customer and customer social profile
		console.log("objobjobjobjobjobj.toString() : ", objobjobjobjobjobj.toString());
		let obj = knex("customers").select(columns)
			.leftJoin('customer_social_profile', 'customer_social_profile.customer_id', '=', 'customers.id') //left join with customer social profile for getting social information
			.leftJoin('countries', 'customers.country_id', '=', 'countries.id') //left join with  countries for getting assigned or selected country information
			.leftJoin('customer_tiers', 'customers.tier_id', '=', 'customer_tiers.id') //lef join customer_tiers for getting related tier
			.leftJoin("cc_account_summary", "cc_account_summary.customer_id", "=", "customers.id") //join for getting  master member type
			.where({ 'customers.id': data.where.id })

		// reutrn knex promise object
		return obj;
	}

	/** get locked points
     *  Author :
     * @param {*} query_data 
     * @param {*} callback 
     */

	async  get_locked_points(query_data) {
		let columns = {
			id: "lock_point.id",
			lock_point: knex.raw("IFNULL(sum(case when lock_point.burn = 0 then lock_point.lock_point end),0)"),
		}
		let setting_result = await knex("tenant_settings").select("*")
			.where("status", 1)
			.where("settings_name", 'lock_point_timeout_setting')
		let timeout = setting_result.length > 0 ? setting_result[0]['data'] : status_codes.lock_point_timeout_setting;

		let lock_points = await knex("lock_point").select(columns)
			.where("lock_point.lock", 1)
			.where("lock_point.burn", 0)
			.where("lock_point.customer_id", query_data.customer_id)
			.where(knex.raw("UNIX_TIMESTAMP(lock_point.created_at)+" + timeout), ">=", parseInt(new Date() / 1000));
		if (lock_points.length > 0) {
			query_data['total_points'] = parseInt(query_data['total_points']) - parseInt(lock_points[0]['lock_point']);
		}

		return query_data['total_points'];
	}




    /**
     * Get customer card info
     *
     * @param data
     * @returns {*}
     */
	// getCustomerCardInfo(data) {
	//     // return a knex promise object for getting customer card information of a customer
	//     return knex('customer_has_cards')
	//         .select(knex.raw('customer_has_cards.id as customer_card_id,customer_has_cards.*,bank_master.name as bank_name,card_network_master.name as card_network_name'))
	//         .leftJoin('bank_master', 'bank_master.id', '=', 'customer_has_cards.bank_id') //left join with bank_master for getting information of card's bank
	//         .leftJoin('card_network_master', 'card_network_master.id', '=', 'customer_has_cards.card_network_id') // left join with card_network_master for getting information for card's network
	//         .where('customer_has_cards.customer_id', data['customer_id'])
	//         .where('customer_has_cards.status', 1);
	// }

    /**
     * Get customer login token
     *
     * @param data
     * @returns {*}
     */
	getCustomerLoginToken(data) {
		// return  a knex promise object for getting customer's login token
		return knex('customer_login_tokens')
			.select(knex.raw('customer_login_tokens.created_at as lastLogin, customer_login_tokens.agent_type as agentType,customer_login_tokens.updated_at as updateAt '))
			.where("customer_login_tokens.customer_id", "=", data['customer_id'])
			.orderBy("customer_login_tokens.created_at", "desc")
			.limit(1)
	}

    /**
     * Get customer voucher codes
     *
     * @param data
     * @returns {*}
     */
	getCustomerVoucherCodes(data) {
		// getting voucher codes 
		return knex('voucher_codes')
			.select(knex.raw('count(voucher_codes.id) as wowchersRedeemed'))
			.where("voucher_codes.assined_tenant_id", "=", data['tenant_id'])
			.where("voucher_codes.purchased_customer_id", "=", data['customer_id'])
			.where("voucher_codes.used", "=", 1)
	}
	// ,
    /**
     * Get customers list
     *
     * @param data
     * @returns {*}
     */
	getCustomersList(data) {
		// Getting current date and time
		let now = new Date();

		let obj = knex
			.from("customers")
			// .leftJoin('master_product', 'master_product.id', '=', 'customers.product_id') // Left join master_product for getting product name
			// .leftJoin('countries', 'customers.country_id', '=', 'countries.id') //left join with  countries for getting assigned or selected country information
			// .leftJoin('master_city', 'customers.city', '=', 'master_city.id') //left join with  countries for getting assigned or selected country information
			.orderBy("customers.created_at", "desc")
		// .where('customers.status', 1)
		// search with first_name and last_name
		if (data['name']) {
			obj.whereRaw("concat(CAST(AES_DECRYPT(customers.first_name,'" + encription_key + "') AS CHAR(255)),' ',CAST(AES_DECRYPT(customers.last_name,'" + encription_key + "') AS CHAR(255))) like '%" + data['name'] + "%'")
		}
		if (data['email']) {
			obj.whereRaw("CAST(AES_DECRYPT(customers.email,'" + encription_key + "') AS CHAR(255)) like '%" + data['email'] + "%'")
		}
		if (data['phone']) {
			obj.whereRaw("CAST(AES_DECRYPT(customers.phone,'" + encription_key + "') AS CHAR(255)) like '%" + data['phone'] + "%'")
		}
		if (data['customer_unique_id']) {
			obj.whereRaw("CAST(AES_DECRYPT(customers.customer_unique_id,'" + encription_key + "') AS CHAR(255)) like '%" + data['customer_unique_id'] + "%'")
		}
		if (data['customer_id']) {
			obj.where("customers.id", data['customer_id'])
		}
		
		if (data['from_date'] && data['to_date']) {
			obj.whereBetween('customers.created_at', [dateFormat(data['from_date'], "yyyy-mm-dd 00:00:00"), dateFormat(data['to_date'], "yyyy-mm-dd 23:59:59")]);
		} else if (data['from_date'] && !data['to_date']) {
			obj.whereBetween('customers.created_at', [dateFormat(data['from_date'], "yyyy-mm-dd"), dateFormat(now, "yyyy-mm-dd 23:59:59")]);
		} else if (!data['from_date'] && data['to_date']) {
			obj.whereBetween('customers.created_at', ["1970-01-01", [dateFormat(data['to_date'], "yyyy-mm-dd 23:59:59")]]);
		}

		// check columns is not null
		if (data.columns) {

			// getting records from offset to limit with order by customers.id
			obj.select(data.columns)
				.limit(data['limit'])
				.offset(data['offset'])
				.orderBy("customers.id")
		} else {
			obj.select(knex.raw("COUNT(*) AS total_records"))
		}
			obj.orderBy("customers.id", "desc")
		return obj;
	}

    /**
     * Get tenant customers list
     *
     * @param data
     * @returns {*}
     */
	getTenantCustomersList(data) {
		// Getting current date and time
		let now = new Date();

		// Getting data from customers
		let obj = knex
			.from("customers")
			.leftJoin('customer_social_profile', 'customer_social_profile.customer_id', '=', 'customers.id') // join with customer_social_profile for getting social information
		// search with first_name
		if (data['search']) {
			obj.where("customers.first_name", "like", "%" + data['search'] + "%");
		}
		//check from_date and to_date is not null
		if (data['from_date'] && data['to_date']) {
			// getting records where created_at between from_date and to_date 
			obj.whereBetween('customers.created_at', [data['from_date'], data['to_data']]);
		}
		// else check if form_date is not null and to_date is null
		else if (data['from_date'] && !data['to_date']) {
			// getting records where created_at between from_date and now 
			obj.whereBetween('customers.created_at', [data['from_date'], dateFormat(now, "yyyy-mm-dd 23:59:59")]);
		}
		// lese check if from_date is null and to_date is not null
		else if (!data['from_date'] && data['to_date']) {
			// getting records where created_at between 1970-01-01 and to_date 
			obj.whereBetween('customers.created_at', ["1970-01-01", data['to_date'] + " 23:59:59"]);
		}
		// check columns is not null
		if (data.columns) {
			// getting records from offset to limit with order by customers.id
			obj.select(data.columns)
				.limit(data['limit'])
				.offset(data['offset'])
		} else {
			// getting count of total records
			obj.select(knex.raw("COUNT(*) AS totalRecords"))
		}

		// check customer_id is not null, if not null then add condition of customer_id 
		data.customer_id ? obj.whereNot("customers.id", "=", data.customer_id) : "";

		// getting only tenant_base customers 
		obj.where("customers.tenant_id", "=", data['tenant_id'])
		return obj;
	}

    /**
     * Batch insert customer cards
     *
     * @param data
     * @returns {*}
     */
	batchInsertCustomerCards(data) {
		// Batch insert customer_has_cards records
		return knex.batchInsert('customer_has_cards', data, 5000);
	}

    /**
     * @description
     * @author Brijehs Kumar Khatri
     * @param {*} data
     * @returns
     */
	removeCustomerCard(data) {
		// update customer_has_cards fields available in updateData with where condition
		return knex("customer_has_cards")
			.update(data.updateData)
			.where(data.where)
	}

    /**
     * @description
     * @author Brijehs Kumar Khatri
     * @param {*} data
     * @returns
     */
	getCustomerCard(data) {
		// getting custoemr_has_cards records where customer_id and id matched
		return knex("customer_has_cards")
			.where({
				"customer_id": data.customer_id,
				"id": data.customer_card_id
			})
	}

    /**
     * @description
     * @author Brijehs Kumar Khatri
     * @param {*} data
     * @returns
     */
	insertComment(data) {
		// insert customer_comment data
		return knex("customer_comment").insert(data, "id");
	}

    /**
     * @description
     * @author Brijehs Kumar Khatri
     * @param {*} data
     * @returns
     */
	batchInsertCommentTags(data) {
		// Batch insert comment_tags 
		return knex.batchInsert('comment_tags', data);
	}

    /**
     * @description
     * @author Brijehs Kumar Khatri
     * @param {*} data
     * @returns
     */
	updateCommentTag(data) {
		// update comment_tags with where condition
		return knex("comment_tags")
			.update(data.update)
			.where(data.where)
	}

    /**
     * @description
     * @author Brijehs Kumar Khatri
     * @param {*} data
     * @returns
     */
	getCommentById(data) {
		// Getting customer_comment records where comment id is matched
		return knex('customer_comment')
			.select(knex.raw("customer_comment.comment as commentName"))
			.where("customer_comment.id", "=", data.id)
	}

    /**
     * @description
     * @author Brijehs Kumar Khatri
     * @param {*} data
     * @returns
     */
	getComments(data) {
		// getting customer_comment records
		let obj = knex.select(data.columns)
			.from("customer_comment")
			.leftJoin('customers', 'customers.id', '=', 'customer_comment.customer_id') // join with customers for getting customer information
			.leftJoin('tenants', 'tenants.id', '=', 'customer_comment.tenant_id') // join with tenant for getting tenant information
			// .leftJoin('comment_tags', 'comment_tags.customer_comment_id', '=', 'customer_comment.id')
			.leftJoin(knex.raw('(SELECT customer_comment_id as customer_comment_id, note_tag_id as note_tag_id  from comment_tags where comment_tags.isDeleted = 0) AS comment_tags'),
				'customer_comment.id', '=', 'comment_tags.customer_comment_id')
			.leftJoin('master_tag', 'master_tag.id', '=', 'comment_tags.note_tag_id') // join with master_tag for getting tag informations
			.where("customer_comment.customer_id", data['customer_id'])

		// search with comment
		if (data['search']) {
			obj.where("customer_comment.comment", "like", "%" + data['search'] + "%");
		}
		// apply limit and offset
		obj.limit(data['limit'])
			.offset(data['offset']);
		return obj;
	}

    /**
     * @description
     * @author Brijehs Kumar Khatri
     * @param {*} data
     * @returns
     */
	insertCustomerAssignTags(data) {
		// Insert customer_assigned_source_tags  
		return knex("customer_assigned_source_tags")
			.insert(data);
	}

    /**
     * @description
     * @author Brijehs Kumar Khatri
     * @param {*} data
     * @returns
     */
	updateCustomerAssignTags(data) {
		// update customer_assigned_source_tags with where condition
		return knex("customer_assigned_source_tags")
			.update(data.update)
			.where(data.where);
	}

    /**
     * @description
     * @author Brijehs Kumar Khatri
     * @param {*} data
     * @returns
     */
	getCustomerAssignTags(data) {
		// getting customer_assigned_source_tags  records where customer_id matched
		return knex('customer_assigned_source_tags')
			.select(data.columns)
			.leftJoin('master_tag', function () {
				this.on("master_tag.id", "=", 'customer_assigned_source_tags.tag_id')
					.on('master_tag.status', 1)
			}) //join master_tag for getting tas informations
			.where('customer_assigned_source_tags.customer_id', data["customer_id"])
			.where('customer_assigned_source_tags.status', 1)
	}

    /**
     * @description
     * @author Brijehs Kumar Khatri
     * @param {*} data
     * @returns
     */
	commentListByTag(data) {
		// getting customer_comment records where customer_id matched
		let obj = knex.select(data.columns)
			.from("customer_comment")
			.leftJoin('customers', 'customers.id', '=', 'customer_comment.customer_id') // join with customers for getting customer information
			.leftJoin('tenants', 'tenants.id', '=', 'customer_comment.tenant_id') // join with tenants for getting tenant information
			.leftJoin('comment_tags', 'comment_tags.customer_comment_id', '=', 'customer_comment.id') //join with comment_tags for getting comment information
			.leftJoin('master_tag', 'master_tag.id', '=', 'comment_tags.note_tag_id') // join with master_tag for getting tag information
			.where("customer_comment.customer_id", data['customer_id'])
		// search with comment
		if (data['search']) {
			obj.where("customer_comment.comment", "like", "%" + data['search'] + "%");
		}
		// search with note_tag_id
		if (data['tags']) {
			obj.whereIn("comment_tags.note_tag_id", data['tags']);
		}
		// apply limit and offset
		obj.limit(data['limit'])
			.offset(data['offset'])
		return obj;
	}

    /**
     * @description
     * @author Brijehs Kumar Khatri
     * @param {*} data
     * @returns
     */
	updateComment(data) {
		// update customer_comment with where condition
		return knex("customer_comment")
			.update(data.update)
			.where(data.where)
	}

    /**
     * @description
     * @author Brijehs Kumar Khatri
     * @param {*} data
     * @returns
     */
	fetchBulkUploadFiles(data) {
		// Getting current date and time
		let now = new Date();
		// getting bulk_process_files records where tenant_id matched
		let obj = knex.select(data.columns)
			.from("bulk_process_files")
			.where("bulk_process_files.tenant_id", "=", data['tenant_id'])

		//search with file name
		if (data['search']) {
			obj.where("bulk_process_files.file_name", "like", "%" + data['search'] + "%");
		}

		// search with process_type
		if (data['process_type']) {
			obj.where("bulk_process_files.process_type", "=", data['process_type']);
		}
		//check from_date and to_date is not null
		if (data['from_date'] && data['to_date']) {
			// getting records where created_at between from_date and to_date 
			obj.whereBetween('bulk_process_files.created_at', [data['from_date'], data['to_data']]);
		}
		// else check if form_date is not null and to_date is null
		else if (data['from_date'] && !data['to_date']) {
			// getting records where created_at between from_date and now 
			obj.whereBetween('bulk_process_files.created_at', [data['from_date'], dateFormat(now, "yyyy-mm-dd 23:59:59")]);
		}
		// lese check if from_date is null and to_date is not null
		else if (!data['from_date'] && data['to_date']) {
			// getting records where created_at between 1970-01-01 and to_date 
			obj.whereBetween('bulk_process_files.created_at', ["1970-01-01", data['to_date'] + " 23:59:59"]);
		}

		// apply limit and offset
		obj.limit(data['limit'])
			.offset(data['offset']);
		return obj;
	}

    /**
     * @description
     * @author Brijehs Kumar Khatri
     * @param {*} data
     * @returns
     */
	fetchBulkUploadFileData(data) {
		// getting bulk_process_file_data with where condition
		return knex("bulk_process_file_data")
			.select(data.columns)
			.where(data.where)
	}

    /**
     * @description
     * @author Brijehs Kumar Khatri
     * @param {*} data
     * @returns
     */
	updateCustomerUpgrades(data) {
		// update customer_upgrades with where condition
		return knex("customer_upgrades")
			.update(data.update)
			.where(data.where)
	}

    /**
     * @description
     * @author Brijehs Kumar Khatri
     * @param {*} data
     * @returns
     */
	insertCustomerUpgrades(data) {
		// insert customer_upgrades data
		return knex("customer_upgrades")
			.insert(data, "id");
	}

    /**
     * @description
     * @author Brijehs Kumar Khatri
     * @param {*} data
     * @returns
     */
	insertCustomerTransaction(data) {
		//  insert customer_transaction data
		return knex("customer_transaction")
			.insert(data, "id");
	}

    /**
     * @description
     * @author Brijehs Kumar Khatri
     * @param {*} data
     * @returns
     */
	getCustomerActivities(data) {
		// get customer last 5 activities where customer_id matched
		return knex.select(data.columns)
			.from("customers")
			.rightJoin("customer_voucher_purchases", "customer_voucher_purchases.customer_id", "=", "customers.id") // join with customer_product_purchases for get product purchase data
			.rightJoin("customer_product_purchases", "customer_product_purchases.customer_id", "=", "customers.id") // join with customer_voucher_purchases for get voucher purchase data
			.orderBy("customer_voucher_purchases.created_at", 'desc')
			.orderBy("customer_product_purchases.created_at", 'desc')
			.where("customers.id", "=", data['customer_id'])
			.limit(5)
	}

    /**
     * @description
     * @author Brijehs Kumar Khatri
     * @param {*} data
     * @returns
     */
	getHistoryList(data) {
		// get customer history data where customer_id matched
		return knex.select(data.columns)
			.from("customers")
			.leftJoin("customer_product_purchases", "customer_product_purchases.customer_id", "=", "customers.id") // join with customer_product_purchases for get product purchase data
			.leftJoin("customer_voucher_purchases", "customer_voucher_purchases.customer_id", "=", "customers.id") // join with customer_voucher_purchases for get voucher purchase data
			.leftJoin("customer_login_tokens", "customer_login_tokens.customer_id", "=", "customers.id") // join with customer_login_tokens for get login data
			.where("customers.id", data['customer_id'])
			.orderBy("customer_voucher_purchases.created_at", "desc")
			.orderBy("customer_product_purchases.product_purchase_date", "desc")
			.orderBy("customer_login_tokens.created_at", "desc")
			.orderBy("customer_login_tokens.updated_at", "asc")
			.limit(1)
	}

    /**
     * @description
     * @author Brijehs Kumar Khatri
     * @param {*} data
     * @returns
     */
	getCustomerGraphValue(data) {
		// get customer graph values with offer_redemptions and wallet_ledger where customer id is matched 
		return knex.select(data.columns)
			.from("cc_account_summary")
			.leftJoin("customers", "customers.id", "=", "cc_account_summary.customer_id")
			.where("cc_account_summary.customer_id", data['customer_id'])

		// return knex.select(data.columns)
		// .from("customers")
		// .leftJoin("offer_redemptions", "offer_redemptions.customer_id", "=", "customers.id")
		// .leftJoin("wallet_ledger", function () {
		//     this.on("customers.tenant_id", "wallet_ledger.tenant_id")
		// })
		// .where("customers.id", data['customer_id'])
	}

	getTotalCustomerGraphValue(data) {
		return knex.select(data.column)
			.from("wallet_ledger")
			.leftJoin("point_ledger", "point_ledger.wallet_ledger_id", "=", "wallet_ledger.id")
	}
    /**
     * @description
     * @author Brijehs Kumar Khatri
     * @param {*} data
     * @returns
     */
	getCustomerTableColumns(data) {
		// get customers table columns
		return knex.select(knex.raw('DISTINCT COLUMN_NAME'))
			.from("INFORMATION_SCHEMA.COLUMNS")
			.where("TABLE_NAME", "customers")
			.whereRaw(" INFORMATION_SCHEMA.COLUMNS.COLUMN_NAME NOT LIKE 'column_%' ")
	}

    /**
     * @description
     * @author Brijehs Kumar Khatri
     * @param {*} data
     * @returns
     */
	getCustomerAssignConsent(data) {
		// get consent_master data 
		let obj = knex.select(data.columns)
			.from("consent_master")
			.joinRaw("LEFT JOIN customer_assigned_consent ON (customer_assigned_consent.consent_id = consent_master.id AND customer_assigned_consent.customer_id=" + data.customer_id + ")")
			.groupBy("consent_master.id");
		// search by name
		if (data['search']) {
			obj.where("consent_master.name", "like", "%" + data['search'] + "%");
		}
		// apply limit and offset
		obj.limit(data['limit'])
			.offset(data['offset']);
		return obj;
	}

    /**
     * @description
     * @author Brijehs Kumar Khatri
     * @param {*} data
     * @returns
     */
	createDynamicField(data) {
		// Creating a dynamic field in customers table after created_by
		return knex.schema.alterTable('customers', function (t) {
			// t.increments().primary(); // add
			// drops previous default value from column, change type to string and add not nullable constraint
			t.string(data.field_name, data.length).notNullable().after("created_by");
			// drops both not null contraint and the default value
			// t.integer('age').alter();
		});
	}

    /**
     * @description
     * @author Brijehs Kumar Khatri
     * @param {*} data
     * @returns
     */
	getSalesOfficeList(data) {
		// get sales office list where status is active
		let obj = knex.select(data.columns)
			.from("sales_offices")
			.where("sales_offices.status", 1)
		// apply limit and offset
		obj.limit(data['limit'])
			.offset(data['offset'])
		return obj;
	}

    /**
     * @description
     * @author Brijehs Kumar Khatri
     * @param {*} data
     * @returns
     */
	getCustomerPointTransferList(data) {
		// get customer's transfer points where transfer_from is matched
		return knex.select(data.columns)
			.from("customers_point_transfer")
			.leftJoin("master_point_type", "master_point_type.id", "=", "customers_point_transfer.point_type_id") // join with master_point_type for getting point master data
			.leftJoin("customers", "customers.id", "=", "customers_point_transfer.transfer_to") // join with customers for get customer data
			.where("customers_point_transfer.transfer_from ", data['transfer_from'])
	}

    /**
     * @description
     * @author Brijehs Kumar Khatri
     * @param {*} data
     * @returns
     */
	getCustomerPointReceivedList(data) {
		// get customer's received points where transfer_to is matched
		return knex.select(data.columns)
			.from("customers_point_transfer")
			.leftJoin("master_point_type", "master_point_type.id", "=", "customers_point_transfer.point_type_id") // join with master_point_type for getting point master data
			.leftJoin("customers", "customers.id", "=", "customers_point_transfer.transfer_from") // join with customers for get customer data
			.where("customers_point_transfer.transfer_to ", data['transfer_to'])
	}

    /**
     * @description
     * @author Brijehs Kumar Khatri
     * @param {*} data
     * @returns
     */
	insertTagMaster(data) {
		// insert master_tag data
		return knex("master_tag").insert(data);
	}

	get_points_locked(query_data) {
		let columns = {
			lock_point: knex.raw("IFNULL(sum(case when lock_point.burn = 0 then lock_point.lock_point end),0)"),
		}
		let setting_result = knex("tenant_settings").select("*")
			.where("status", 1)
			.where("settings_name", 'lock_point_timeout_setting')
		let timeout = setting_result.length > 0 ? setting_result[0]['data'] : status_codes.lock_point_timeout_setting;

		return knex("lock_point").select(columns)
			.where("lock_point.lock", 1)
			.where("lock_point.burn", 0)
			.where("lock_point.customer_id", query_data.customer_id)
			.where(knex.raw("UNIX_TIMESTAMP(lock_point.created_at)+" + timeout), ">=", parseInt(new Date() / 1000));
	}

	get_points_expired(query_data) {
		let columns = {
			expired_point: knex.raw("IFNULL(SUM(wallet_ledger.points),0)"),
		}
		return knex("wallet_ledger").select(columns)
			.where("wallet_ledger.customer_id", query_data.customer_id)
			.where(knex.raw("UNIX_TIMESTAMP(wallet_ledger.end_date)"), "<=", parseInt(new Date() / 1000));
		// .where(knex.raw("wallet_ledger.end_date", ">", knex.raw("?", dateFormat(now, "yyyy-mm-dd 23:59:59"))));
	}
}
