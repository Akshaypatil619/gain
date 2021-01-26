'use strict';
let knex = require('../../../../../config/knex.js');
let configKey = require("../../../../../config/config");
let encription_key = configKey.encription_key;

module.exports = class reportModel {
    constructor() { }

    get_commission_list(data) {
        const columns = {
            property_name: 'mp.property_name',
            building_name: 'mb.name',
            unit_number: 'mu.unit_no',
            owner_email: knex.raw(`cast(aes_decrypt(owner.email, '${encription_key}') as char(255))`),
            commission_amount: knex.raw(`sum(rh.reward)`),
            month_year: knex.raw(`concat(monthname(rh.created_at), '-', year(rh.created_at))`)
        }

        let query = knex('reward_history as rh').select(columns)
            .join('transaction_history as th', 'th.id', 'rh.transaction_history_id')
            .join('master_building as mb', 'mb.id', 'rh.building_id')
            .join('master_property as mp', 'mp.id', 'rh.property_id')
            .join('master_unit as mu', 'mu.id', 'rh.unit_id')
            .join('customers as owner', 'owner.id', 'mu.customer_id')
            .where({ 'rh.user_type': 'oam', 'rh.customer_id': data.oam_id, 'rh.status': 1 })
            .groupByRaw('year(rh.created_at) , month(rh.created_at) , mu.id , owner.id');

        if (data.property_name)
            query.whereRaw(`mp.property_name like '%${data.property_name}%'`)
        if (data.building_name)
            query.whereRaw(`mb.name like '%${data.building_name}%'`)
        if (data.unit_number)
            query.whereRaw(`mu.unit_no = '${data.unit_number}'`)
        if (data.owner_email)
            query.whereRaw(`cast(aes_decrypt(owner.email, '${encription_key}') AS CHAR(255)) like '%${data.owner_email}%'`)
            
        if (data.start_date){
                let dateArray=data.start_date.split("-");
                let year=dateArray[0];
                let month=dateArray[1];
                query.whereRaw(" YEAR(rh.created_at) ="+year+" AND MONTH(rh.created_at) = "+month+"")
            }   
                
            
        console.log(query.toString())
            
        return query;
    }

    get_commission_list_data(query_type,data) {
        switch(query_type){
            case "list":
                let columns = {
                    id: knex.raw("distinct user_commission_history.id"),
                    owner_name: knex.raw("CONCAT(CAST(AES_DECRYPT(cust.first_name,'" + encription_key + "') AS CHAR(255)),' ',CAST(AES_DECRYPT(cust.last_name,'" + encription_key + "') AS CHAR(255)))"),
                    tenant_name: knex.raw("CONCAT(CAST(AES_DECRYPT(tenant.first_name,'" + encription_key + "') AS CHAR(255)),' ',CAST(AES_DECRYPT(tenant.last_name,'" + encription_key + "') AS CHAR(255)))"),
                    // cc_transaction_id: "user_commission_history.cc_transaction_id",
                    ty_transaction_id: "user_commission_history.ty_transaction_id",
                    transaction_type: "user_commission_history.transaction_type",
                    commission_value: "user_commission_history.commission_value",
                    merchant_code: "user_transaction_history.merchant_code",
                    merchant_name: "user_transaction_history.merchant_name",
                    offer_title: "user_transaction_history.offer_title",
                    brand_name: "user_transaction_history.brand_name",
                };
            let query = knex('user_commission_history')
                .select(columns)
                .leftJoin("customers as cust","cust.id","=","user_commission_history.customer_id")
                .leftJoin("master_unit","master_unit.customer_id","=","cust.id")
                .leftJoin("customers as tenant","tenant.id","=","master_unit.tenant_customer_id")
                // .leftJoin("user_commission_history","user_commission_history.customer_id","=","cust.id")
                .leftJoin("user_transaction_history","user_transaction_history.customer_id","=","cust.id")
                .where("user_commission_history.status",1);
                if (data['name']) {
					query.whereRaw("concat(CAST(AES_DECRYPT(cust.first_name,'" + encription_key + "') AS CHAR(255)),'',CAST(AES_DECRYPT(cust.last_name,'" + encription_key + "') AS CHAR(255))) like '%" + data['name'] + "%'")
				}
				if (data['merchant_code']) {
					query.whereRaw("CAST(AES_DECRYPT(user_transaction_history.merchant_code,'" + encription_key + "') AS CHAR(255)) like '%" + data['merchant_code'] + "%'")
                }
                if (data['merchant_name']) {
					query.whereRaw("CAST(AES_DECRYPT(user_transaction_history.merchant_name,'" + encription_key + "') AS CHAR(255)) like '%" + data['merchant_name'] + "%'")
                }
                if (data['customer_unique_id']) {
					query.whereRaw("CAST(AES_DECRYPT(customers.customer_unique_id,'" + encription_key + "') AS CHAR(255)) like '%" + data['customer_unique_id'] + "%'")
                }
                if (data['transaction_id']) {
                    query.whereRaw("CAST(AES_DECRYPT(user_commission_history.ty_transaction_id,'" + encription_key + "') AS CHAR(255)) like '%" + data['transaction_id'] + "%'")
				}
				if (data['from_date'] && data['to_date']) {
					query.whereBetween('user_commission_history.created_at', [dateFormat(data['from_date'], "yyyy-mm-dd 00:00:00"), dateFormat(data['to_date'], "yyyy-mm-dd 23:59:59")]);
				} else if (data['from_date'] && !data['to_date']) {
					query.whereBetween('user_commission_history.created_at', [dateFormat(data['from_date'], "yyyy-mm-dd"), dateFormat(now, "yyyy-mm-dd 23:59:59")]);
				} else if (!data['from_date'] && data['to_date']) {
					query.whereBetween('user_commission_history.created_at', ["1970-01-01", [dateFormat(data['to_date'], "yyyy-mm-dd 23:59:59")]]);
				}
				return query.orderBy("user_commission_history.created_at", "desc")
               
            break;
        }
    }

    get_customer_transaction_list(data) {
		const columns = {
			id:'transaction_history.id',
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
			// .leftJoin('customers as oam', 'oam.id', 'transaction_history.oam_id')
			.leftJoin('customers as referrer', 'referrer.id', 'transaction_history.referrer_id')
            .join('master_unit', 'master_unit.id', 'transaction_history.unit_id')
			.join('master_building', 'master_building.id', 'transaction_history.building_id')
			.leftJoin('reward_history as rh', 'rh.transaction_history_id', 'transaction_history.id')
			.whereRaw(`(case when transaction_history.user_type = 'family' then rh.customer_id = transaction_history.referrer_id
                else rh.customer_id = transaction_history.customer_id END)`)
            .andWhere("transaction_history.oam_id",data["oam_id"])    
		// if (data.building_id){
		// 	query.where("master_unit.building_id",data["building_id"])
        // }
        
        if (data.building_id){
            console.log("data.building_id**=",data.building_id);
            // query.whereIn("master_unit.building_id",[data["building_id"]])
            query.whereRaw('master_unit.building_id IN (' + data.building_id + ')');
        }
		if (data.user_id){
            // query.whereIn("customers.user_type_id",[data["user_id"]])
            query.whereRaw('customers.user_type_id IN (' + data.user_id + ')');
		}
        if (data.unit_id){
            // query.where("master_unit.unit_no",data["unit_no"])
            query.whereRaw('master_unit.id IN (' + data.unit_id + ')');
		}
         if (data.brand_name){
            
             let brand_string="";
             let nameArray=data.brand_name.split(",");
             for(let i=0;i<nameArray.length;i++){
                brand_string= brand_string+"'"+nameArray[i]+"',";
             }
             let brands=brand_string.slice(0,brand_string.length-1);
            

		 query.whereRaw("transaction_history.brand_name in("+brands+")")
         }
         
         if (data.trans_id){
            // query.whereRaw("transaction_history.brand_name like '%"+data["brand_name"]+"%'")
            query.whereRaw('transaction_history.id IN (' + data.trans_id + ')');
            }
        return query.orderBy("transaction_history.created_at","DESC");
    }
    
    unit_report(data) {
      
		const columns = {
			id:'unit_owner_rewards.id',
            property_name: 'master_property.property_name',
            building_name: 'master_building.name',
			unit_no: 'master_unit.unit_no',
            total_commission: 'unit_owner_rewards.total_rewards',
            settled_commission: 'unit_owner_rewards.settled_rewards',
            is_total_settled: 'unit_owner_rewards.is_settled'
          	}

        let query = knex('unit_owner_rewards').select(columns)
            .join('master_property', 'master_property.id', 'unit_owner_rewards.property_id')
			.join('master_building', 'master_building.id', 'unit_owner_rewards.building_id')
            .join('master_unit', 'master_unit.id', 'unit_owner_rewards.unit_id')
            .where("master_property.oam_id",data["oam_id"]);
                
        if (data.property_id){
            query.where("unit_owner_rewards.property_id",data["property_id"])
        }
        if (data.building_id){
            console.log("data.building_id=",data.building_id)
            //query.where("unit_owner_rewards.building_id",data["building_id"])
            query.whereRaw('unit_owner_rewards.building_id IN (' + data.building_id + ')');
        }
        if (data.unit_id){
			query.where("unit_owner_rewards.unit_id",data["unit_id"])
		}
		return query.orderBy("unit_owner_rewards.created_at","DESC");
	}
}