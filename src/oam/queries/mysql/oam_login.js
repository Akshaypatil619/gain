let knex = require("../../../../config/knex.js");
let config = require("../../../../config/config");
let encription_key = config.encription_key;
module.exports = class Oam_login {
    
    check_login(query_type, data) {
        switch (query_type) {
            case "check_login":
                let columns = {
                    oam_id: "customers.id",
                    is_verified: "customers.is_verified",
                    first_name: knex.raw("CAST(AES_DECRYPT(customers.first_name,'"+ encription_key +"') AS CHAR(255))"),
                    last_name: knex.raw("CAST(AES_DECRYPT(customers.last_name,'"+ encription_key +"') AS CHAR(255))"),
                    phone: knex.raw("CAST(AES_DECRYPT(customers.phone,'" + encription_key + "')AS CHAR(255))"),
					email: knex.raw("CAST(AES_DECRYPT(customers.email,'" + encription_key + "')AS CHAR(255))"),
                    address_line1: "customers.address_line1",
                    address_line2: "customers.address_line2",
                    country_code: "countries.country_code",
                    user_name: knex.raw("CONCAT(CAST(AES_DECRYPT(customers.first_name,'" + encription_key + "') AS CHAR(255)),' ',CAST(AES_DECRYPT(customers.last_name,'" + encription_key + "') AS CHAR(255)))"),
			        user_type: "master_user_type.name"
                };
                return knex("customers").select(columns)
                        .join("master_user_type", "master_user_type.id", "=", "customers.user_type_id")
                        .leftJoin("countries", "countries.id", "=", "customers.country_id")
                        .where("master_user_type.name","OAM")
               	        .andWhereRaw("CAST(AES_DECRYPT(customers.email,'" + encription_key + "') AS CHAR(255)) = '" + data['email'] + "'")
                        .andWhere("customers.status",1)
                        break;
            case "check_credentials":
                let credentialsColumns = {
                    id: "customers.id",
                    status: "customers.status",
                    first_name: knex.raw("CAST(AES_DECRYPT(customers.first_name,'"+ encription_key +"') AS CHAR(255))"),
                    last_name: knex.raw("CAST(AES_DECRYPT(customers.last_name,'"+ encription_key +"') AS CHAR(255))"),
                    email: knex.raw("CAST(AES_DECRYPT(customers.email,'"+ encription_key +"') AS CHAR(255))"),
                    phone: knex.raw("CAST(AES_DECRYPT(customers.phone,'"+ encription_key +"') AS CHAR(255))"),
                    user_name: knex.raw("CONCAT(CAST(AES_DECRYPT(customers.first_name,'" + encription_key + "') AS CHAR(255)),' ',CAST(AES_DECRYPT(customers.last_name,'" + encription_key + "') AS CHAR(255)))"),
			        user_type: "master_user_type.name"
                }
                return knex("customers").select(credentialsColumns)
                    .join("master_user_type", "master_user_type.id", "=", "customers.user_type_id")
                    .where("master_user_type.name","OAM")
                    .andWhereRaw(`CAST(AES_DECRYPT(customers.password, '${encription_key}') AS CHAR(255)) = '${data.password}'`)
                    .andWhereRaw(`CAST(AES_DECRYPT(customers.email, '${encription_key}') AS CHAR(255)) = '${data.email}'`)
                    .andWhere("customers.status",1)
                break;    
            }
    }
}