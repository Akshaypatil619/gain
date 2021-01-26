'use strict';
let knex = require('../../../../../config/knex.js');
let configKey = require("../../../../../config/config");
let encription_key = configKey.encription_key;

module.exports = class TenantModel {
    constructor() { }


    list_tenant(query_type,columns,data) {
        switch (query_type) {
            case "list_tenant":

                let query = knex('customers')
                    .select(columns)
                    .leftJoin("master_user_type", "master_user_type.id", "=", "customers.user_type_id")
                    .leftJoin("countries", "countries.id", "=", "customers.country_id")
                    .leftJoin("master_unit", "master_unit.id", "=", "customers.unit_id")
                    .leftJoin('master_building', 'master_building.id', 'master_unit.building_id')
                    .leftJoin('master_property', 'master_property.id', 'master_building.property_id')
                    .where("master_user_type.name", "Tenant")
                    .andWhere("master_property.oam_id", data['oam_id'])
                    .andWhere("customers.status", 1);
                if (data['name']) {
                    query.whereRaw("concat(CAST(AES_DECRYPT(customers.first_name,'" + encription_key + "') AS CHAR(255)),' ',CAST(AES_DECRYPT(customers.last_name,'" + encription_key + "') AS CHAR(255))) like '%" + data['name'] + "%'")
                }
                if (data['email']) {
                    query.whereRaw("CAST(AES_DECRYPT(customers.email,'" + encription_key + "') AS CHAR(255)) like '%" + data['email'] + "%'")
                }
                if (data['building_id']) {
                    query.where("master_unit.building_id", data['building_id']);
                }
                if (data['building_name']) {
                    query.whereRaw("CAST(AES_DECRYPT(master_building.name,'" + encription_key + "') AS CHAR(255)) like '%" + data['building_name'] + "%'")
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
                return query.orderBy("customers.created_at", "desc");
                break;
        }
    }

}