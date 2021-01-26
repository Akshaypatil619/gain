let knex = require("../../../../config/knex.js");
let config = require("../../../../config/config");
let encription_key = config.encription_key;
module.exports = class Report {
	

	get_commission_list(data) {
		const columns = {
            property_name: 'mp.property_name',
            building_name: 'mb.name',
			unit_number: 'mu.unit_no',
			brand_name: 'th.brand_name',
			oam_email: knex.raw(`cast(aes_decrypt(oam.email, '${encription_key}') as char(255))`),
            commission_amount: knex.raw(`sum(rh.reward)`),
            month_year: knex.raw(`concat(monthname(rh.created_at), '-', year(rh.created_at))`)
        }

        let query = knex('reward_history as rh').select(columns)
            .join('transaction_history as th', 'th.id', 'rh.transaction_history_id')
            .join('master_building as mb', 'mb.id', 'rh.building_id')
            .join('master_property as mp', 'mp.id', 'rh.property_id')
            .join('master_unit as mu', 'mu.id', 'rh.unit_id')
			.join('customers as oam', 'oam.id', 'th.oam_id')
            .where({ 'rh.user_type': 'gain', 'rh.status': 1 })
            .groupByRaw('year(rh.created_at) , month(rh.created_at) , mu.id , oam.id');

        if (data.oam_name)
			query.whereRaw("concat(CAST(AES_DECRYPT(oam.first_name,'" + encription_key + "') AS CHAR(255)),'',CAST(AES_DECRYPT(oam.last_name,'" + encription_key + "') AS CHAR(255))) like '%" + data['oam_name'] + "%'")
        if (data.building_name)
			query.whereRaw(`mb.name like '%${data.building_name}%'`)
		if (data.brand_name)
			query.whereRaw(`th.brand_name like '%${data.brand_name}%'`)	
		if (data.oam_id)
			query.where('mp.oam_id',data.oam_id)
		if(data.brand_id)
			query.whereRaw('th.brand_name IN (' + data.brand_id + ')');		
        if (data.unit_no)
            query.whereRaw(`mu.unit_no = '${data.unit_no}'`)
        if (data.oam_email)
			query.whereRaw(`cast(aes_decrypt(oam.email, '${encription_key}') AS CHAR(255)) like '%${data.oam_email}%'`)
        return query;
	}





	get_customer_transaction_list(data) {
		const columns = {
			id:'transaction_history.id',
			oam_name:knex.raw("CONCAT(CAST(AES_DECRYPT(oam.first_name,'" + encription_key + "') AS CHAR(255)),' ',CAST(AES_DECRYPT(oam.last_name,'" + encription_key + "') AS CHAR(255)))"),
			building_name: 'master_building.name',
			unit_no: 'master_unit.unit_no',
			user_type:'transaction_history.user_type',
			customer_name:knex.raw("CONCAT(CAST(AES_DECRYPT(customers.first_name,'" + encription_key + "') AS CHAR(255)),' ',CAST(AES_DECRYPT(customers.last_name,'" + encription_key + "') AS CHAR(255)))"),
			referrer_type: 'transaction_history.referrer_type',
			referrer_name:knex.raw("CONCAT(CAST(AES_DECRYPT(referrer.first_name,'" + encription_key + "') AS CHAR(255)),' ',CAST(AES_DECRYPT(referrer.last_name,'" + encription_key + "') AS CHAR(255)))"),
			brand_name:'transaction_history.brand_name',
			transaction_id:'transaction_history.ty_transaction_id',
			transaction_amount:'transaction_history.amount',
			amount_earned:knex.raw(`case when transaction_history.user_type = 'owner' or (transaction_history.user_type = 'family' 
				AND transaction_history.referrer_type = 'owner') then rh.reward else "NA" end`),
			amount_saved:knex.raw(`case when transaction_history.user_type = 'tenant' or (transaction_history.user_type = 'family' 
				AND transaction_history.referrer_type = 'tenant') then rh.reward else "NA" end`)
		}

        let query = knex('transaction_history').select(columns)
            .join('customers', 'customers.id', 'transaction_history.customer_id')
			.leftJoin('customers as oam', 'oam.id', 'transaction_history.oam_id')
			.leftJoin('customers as referrer', 'referrer.id', 'transaction_history.referrer_id')
            .join('master_unit', 'master_unit.id', 'transaction_history.unit_id')
			.join('master_building', 'master_building.id', 'transaction_history.building_id')
			.leftJoin('reward_history as rh', 'rh.transaction_history_id', 'transaction_history.id')
			.whereRaw(`(case when transaction_history.user_type = 'family' then rh.customer_id = transaction_history.referrer_id
				else rh.customer_id = transaction_history.customer_id END)`)
		if (data.oam_id){
			query.where("transaction_history.oam_id",data["oam_id"])
		}	
		if (data.building_id){
			query.where("master_unit.building_id",data["building_id"])
		}
		if ((data.user_id) && (Number(data.user_id !=100))){
			query.where("customers.user_type_id",data["user_id"])
		}
        if (data.unit_no){
			query.where("master_unit.unit_no",data["unit_no"])
		}
         if (data.brand_name){
		 query.whereRaw("transaction_history.brand_name like '%"+data["brand_name"]+"%'")
		 }
        return query.orderBy("transaction_history.created_at","DESC");
	}


	/* get_login_report_list(query_type, data) {
		switch (query_type) {
			case "get_login_report_list":

				let columns = {
					customer_id: "login_count.id",
					users: knex.raw("CAST(AES_DECRYPT(login_count.users,'rainbowfinance') AS CHAR(255))"),
					email: knex.raw("CAST(AES_DECRYPT(login_count.email,'rainbowfinance') AS CHAR(255))"),
					os: "login_count.os",
					date: "login_count.date",
					phone: knex.raw("CAST(AES_DECRYPT(login_count.phone,'rainbowfinance') AS CHAR(255))"),
				}

				let obj = knex.select(columns)
					.from("login_count")

				if (data['os']) {
					obj.where("login_count.os", "like", "%" + data['os'] + "%");
				}
				if (data['users']) {
					obj.whereRaw("CAST(AES_DECRYPT(login_count.users,'" + encription_key + "') AS CHAR(255)) like '%" + data['users'] + "%'")
				}
				if (data['email']) {
					obj.whereRaw("CAST(AES_DECRYPT(login_count.email,'" + encription_key + "') AS CHAR(255)) like '%" + data['email'] + "%'");
				}
				if (data['from_date'] && data['to_date']) {
					obj.whereBetween('login_count.date', [dateFormat(data['from_date'], "yyyy-mm-dd 00:00:00"), dateFormat(data['to_date'], "yyyy-mm-dd 23:59:59")]);
				}
				else if (data['from_date'] && !data['to_date']) {
					obj.whereBetween('login_count.date', [dateFormat(data['from_date'], "yyyy-mm-dd"), dateFormat(now, "yyyy-mm-dd 23:59:59")]);
				}
				else if (!data['from_date'] && data['to_date']) {
					obj.whereBetween('login_count.date', ["1970-01-01", [dateFormat(data['to_date'], "yyyy-mm-dd 23:59:59")]]);
				}

				return obj;
		}
	}

	get_email_logs_list(query_type, data) {
		switch (query_type) {
			case "get_email_logs_list":

				let columns = {
					id: "email_logs.id",
					email_from: "email_logs.from_email",
					email_to: "email_logs.to_email",
					subject: "email_logs.subject",
					email_status: "email_logs.email_status",
					created_at: "email_logs.created_at",
				}
				let obj = knex
					.select(columns)
					.from("email_logs");
				if (data['from_date'] && data['to_date']) {
					obj.whereBetween('email_logs.created_at', [dateFormat(data['from_date'], "yyyy-mm-dd 00:00:00"), dateFormat(data['to_date'], "yyyy-mm-dd 23:59:59")]);
				} else if (data['from_date'] && !data['to_date']) {
					obj.whereBetween('email_logs.created_at', [dateFormat(data['from_date'], "yyyy-mm-dd"), dateFormat(now, "yyyy-mm-dd 23:59:59")]);
				} else if (!data['from_date'] && data['to_date']) {
					obj.whereBetween('email_logs.created_at', ["1970-01-01", [dateFormat(data['to_date'], "yyyy-mm-dd 23:59:59")]]);
				}
				return obj;
		}
	}

	get_sms_logs_list(query_type, data) {
		switch (query_type) {
			case "get_sms_logs_list":

				let columns = {
					id: "sms_logs.id",
					sms_from: "sms_logs.sms_from",
					sms_to: "sms_logs.sms_to",
					sms_body: "sms_logs.body",
					sms_status: "sms_logs.sms_status",
					created_at: "sms_logs.created_at",
				}
				let obj = knex
					.select(columns)
					.from("sms_logs");
				if (data['from_date'] && data['to_date']) {
					obj.whereBetween('sms_logs.created_at', [dateFormat(data['from_date'], "yyyy-mm-dd 00:00:00"), dateFormat(data['to_date'], "yyyy-mm-dd 23:59:59")]);
				} else if (data['from_date'] && !data['to_date']) {
					obj.whereBetween('sms_logs.created_at', [dateFormat(data['from_date'], "yyyy-mm-dd"), dateFormat(now, "yyyy-mm-dd 23:59:59")]);
				} else if (!data['from_date'] && data['to_date']) {
					obj.whereBetween('sms_logs.created_at', ["1970-01-01", [dateFormat(data['to_date'], "yyyy-mm-dd 23:59:59")]]);
				}
				return obj;
		}
	} */
}

