let knex = require("../../../../../config/knex");
let config = require("../../../../../config/config");
let encription_key = config.encription_key;
let dateFormat = require('dateformat');
const { Console } = require('console');
let now = new Date();
module.exports = class OamCustomerModel {

    /**
     * @description
     * @author abhishek ghosh
     * @param {*} data
     * @returns
     */
    getOamCustomer(data) {
        console.log(data);
        return knex("customers")
            .select('*')
            .where('first_name', data.first_name);
    }

    /**
    * @description
    * @author abhishek ghosh
    * @param {*} data
    * @returns
    */
    get_oam_customer_list(columns) {
        let obj = knex.select(columns)
            .from("customers")
            obj.where("customers.user_type_id", 1);
        return obj;
    }

    /**
     * Insert Oam Customer
     *
     * @param data
     * @returns {*}
     */
    add_oam(query_type,data) {
        console.log("mail checking");
        switch(query_type){
            case "add_oam_exist":
                return knex("customers").select("customers.id")
                    // .whereRaw("CAST(AES_DECRYPT(customers.phone,'" + encription_key + "') AS CHAR(255))='"+ data['phone']+"'")
                    .whereRaw("CAST(AES_DECRYPT(customers.email,'" + encription_key + "') AS CHAR(255))='"+ data['email']+"'")
           break; 
           case "add_oam":
            return knex("customers").insert(data);
           break;

        }   
    }

    /**
   * Update Oam Customer
   *
   * @param data
   * @returns {*}
   */
  updateOamCustomer(data) {
    return knex("customers").update(data.data).where(data.where);
}


    /**
     * 
     * Get Oam Customer by id
     */
    get_oam(query_type,data) {
        switch(query_type){
            case "get_oam":
                let columns = {
                    id: "customers.id",
                    company_name: knex.raw("CAST(AES_DECRYPT(customers.company_name,'" + encription_key + "') AS CHAR(255))"),
                 //   last_name: knex.raw("CAST(AES_DECRYPT(customers.last_name,'" + encription_key + "') AS CHAR(255))"),
                    email: knex.raw("CAST(AES_DECRYPT(customers.email,'" + encription_key + "') AS CHAR(255))"),
                    oam_commission: "customers.oam_commission",
                    owner_commission: "customers.owner_commission",
                    gain_commission: "customers.gain_commission",
                    manager: "customers.manager",
                    country_id: "customers.country_id",
                   // dob: "customers.dob",
                   // gender: "customers.gender",
                    created_at: knex.raw("DATE_FORMAT(customers.created_at,'%b %d,%Y, %h:%i:%S %p')"),
                    phone: knex.raw("CAST(AES_DECRYPT(customers.phone,'" + encription_key + "') AS CHAR(255))"),
                    customer_unique_id: knex.raw("CAST(AES_DECRYPT(customers.customer_unique_id,'" + encription_key + "') AS CHAR(255))")
            };
            return knex("customers").select(columns)
                    .leftJoin("countries","countries.id","=","customers.country_id")
                    .where("customers.id",data['id']);
           break; 
        }
    }
    

    list_oam(query_type,data) {
        switch(query_type){
            case "list_oam":
                let columns = {
                    id: "customers.id",
                    company_name: knex.raw("CAST(AES_DECRYPT(customers.company_name,'" + encription_key + "') AS CHAR(255))"),
                    oam_name: knex.raw("CONCAT(CAST(AES_DECRYPT(customers.first_name,'" + encription_key + "') AS CHAR(255)),' ',CAST(AES_DECRYPT(customers.last_name,'" + encription_key + "') AS CHAR(255)))"),
                    email: knex.raw("CAST(AES_DECRYPT(customers.email,'" + encription_key + "') AS CHAR(255))"),
                    oam_commission: "customers.oam_commission",
                    owner_commission: "customers.owner_commission",
                    gain_commission: "customers.gain_commission",
                    tenant_commission: "customers.tenant_discount",
                    manager: "customers.manager",
                    user_type_name: "master_user_type.name",
                    //dob: "customers.dob",
                    //gender: "customers.gender",
                    created_at: knex.raw("DATE_FORMAT(customers.created_at,'%b %d,%Y, %h:%i:%S %p')"),
                    phone: knex.raw("CAST(AES_DECRYPT(customers.phone,'" + encription_key + "') AS CHAR(255))"),
                    customer_unique_id: knex.raw("CAST(AES_DECRYPT(customers.customer_unique_id,'" + encription_key + "') AS CHAR(255))"),
                    country_name: "countries.name"
            };
            let query = knex('customers')
                .select(columns)
                .leftJoin("master_user_type","master_user_type.id","=","customers.user_type_id")
                .leftJoin("countries","countries.id","=","customers.country_id")
                .where("master_user_type.name","OAM");
                if (data['company_name']) {
					query.whereRaw("(CAST(AES_DECRYPT(customers.company_name,'" + encription_key + "') AS CHAR(255))) like '%" + data['company_name'] + "%'")
				}
				if (data['email']) {
					query.whereRaw("CAST(AES_DECRYPT(customers.email,'" + encription_key + "') AS CHAR(255)) like '%" + data['email'] + "%'")
				}
                if (data['phone']) {
					query.whereRaw("CAST(AES_DECRYPT(customers.phone,'" + encription_key + "') AS CHAR(255)) like '%" + data['phone'] + "%'")
                }
                if (data['customer_unique_id']) {
					query.whereRaw("CAST(AES_DECRYPT(customers.customer_unique_id,'" + encription_key + "') AS CHAR(255)) like '%" + data['customer_unique_id'] + "%'")
				}
				if (data['from_date'] && data['to_date']) {
					query.whereBetween('customers.created_at', [dateFormat(data['from_date'], "yyyy-mm-dd 00:00:00"), dateFormat(data['to_date'], "yyyy-mm-dd 23:59:59")]);
				} else if (data['from_date'] && !data['to_date']) {
					query.whereBetween('customers.created_at', [dateFormat(data['from_date'], "yyyy-mm-dd"), dateFormat(now, "yyyy-mm-dd 23:59:59")]);
				} else if (!data['from_date'] && data['to_date']) {
					query.whereBetween('customers.created_at', ["1970-01-01", [dateFormat(data['to_date'], "yyyy-mm-dd 23:59:59")]]);
				}
				query.orderBy("customers.created_at", "desc")
				return query;
            break;
        }
    }

    edit_oam(query_type,data) {
        switch(query_type){
            case "edit_oam_exist":
            return knex("customers").select("customers.id")
                    .whereRaw("CAST(AES_DECRYPT(customers.phone,'" + encription_key + "') AS CHAR(255))='"+ data['phone']+"'")
                    .andWhereRaw("customers.id !="+data['id']);
           break; 
           case "edit_oam":
            return knex("customers").update(data).where("customers.id",data['id']);
           break; 
        }
    }

    get_all_countries(data) {
        return knex("countries")
            .select('*')
            .where("countries.status",1);
    }

    getOamCustomerData(data) {
        return knex("customers")
            .select('*')
            .where(data.where)
    }

    updateOamCustomerStatus(data){
        return knex('customers').update(data.update).where(data.where);
    }

    get_total_oam_customer_count(){
        return knex("customers")
        .select({ total_record: knex.raw("COUNT(*)") })
    }
    
}
