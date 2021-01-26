'use strict';
let knex = require('../../../../../config/knex.js');
let configKey = require("../../../../../config/config");
let encription_key = configKey.encription_key;

module.exports = class TenantModel {
    constructor() { }

    get_customer_id(customer_unique_id) {
        return knex('customers').select('customers.id as id', 'master_user_type.code as user_type')
            .join('master_user_type', 'master_user_type.id', 'customers.user_type_id')
            .whereRaw(`CAST(AES_DECRYPT(customers.customer_unique_id, '${encription_key}') AS CHAR(255)) = '${customer_unique_id}'`);
    }

    async get_rent_unit_list(customer_id, unit_id, tenant_id) {
        const columns = {
            id: 'master_unit.id',
            unit_no: 'unit_no',
            building_name: 'master_building.name',
            property_name: 'master_property.property_name',
            emirate: 'master_emirate.name',
            address_line_1: 'address_line_1',
            address_line_2: 'address_line_2',
            tenant_customer_id: 'master_unit.tenant_customer_id'
        }

        let unitDetails = await knex('master_unit').select(columns)
            .join('master_building', 'master_building.id', 'master_unit.building_id')
            .join('master_property', 'master_property.id', 'master_building.property_id')
            .leftJoin('master_emirate', 'master_emirate.id', 'master_property.emirate_id')
            .where('master_unit.customer_id', customer_id)
            .where('master_unit.id', unit_id)
            .whereRaw("master_unit.unit_type = 'rent'");
            
        if (!unitDetails.length) return [];

        const unitAvalibilityColumns = {
            id: 'master_unit.id',
            tenant_joining_date: 'customers.tenant_joining_date',
            tenant_leaving_date: 'customers.tenant_leaving_date'
        }

        let unitAvalibility = knex('master_unit').select(unitAvalibilityColumns)
            .join('customers', function () {
                this.on('customers.unit_id', 'master_unit.id')
                    .on('customers.status', 1)
            }).orderBy('customers.tenant_joining_date', 'asc')
            .whereIn('master_unit.id', unitDetails.map(e => e.id));
        
        if (tenant_id) unitAvalibility.whereNot('customers.id', tenant_id);

        unitAvalibility = await unitAvalibility;

        return unitDetails.map(e => {
            let a = unitAvalibility.filter(a => a.id == e.id);

            e.tenant_staying_dates = [];
            if (a.length > 0)
                a.forEach(d => e.tenant_staying_dates.push({
                    tenant_joining_date: d.tenant_joining_date,
                    tenant_leaving_date: d.tenant_leaving_date
                }));

            return e;
        });
    }

    /* update_unit(data, unit_id) {
        return knex('master_unit').update(data).where('id', unit_id);
    } */

    add_tenant(query_type, data) {
        switch (query_type) {
            case "customer_exist":
                return knex("customers").select("customers.id as id")
                    .join('master_user_type', 'master_user_type.id', 'customers.user_type_id')
                    .where('master_user_type.code', 'owner')
                    .whereRaw("CAST(AES_DECRYPT(customers.customer_unique_id,'" + encription_key + "') AS CHAR(255))='" + data['customer_unique_id'] + "'")
                break;
            case "unit_belongs":
                return knex("master_unit").select("master_unit.id")
                    .where("master_unit.id", data['unit_id'])
                    .where("master_unit.customer_id", data.customer_id);
                break;
            case "add_tenant_exist":
                return knex("customers").select("customers.id")
                    // .whereRaw("CAST(AES_DECRYPT(customers.phone,'" + encription_key + "') AS CHAR(255))='"+ data['phone']+"'")
                    .whereRaw("CAST(AES_DECRYPT(customers.email,'" + encription_key + "') AS CHAR(255))='" + data['email'] + "'")
                    .where('status', 1)
                break;
            case "check_unit":
                return knex("master_unit").select("master_unit.id").whereIn("master_unit.unit_type", ["rent", "rent_occupied"]).andWhere("master_unit.id", data['unit_id']);
                break;
            case "add_tenant":
                return knex("customers").insert(data);
                break;
        }
    }
    get_tenant(query_type, data) {
        switch (query_type) {
            case "get_tenant":
                let columns = {
                    id: "customers.id",
                    unit_id: "master_unit.id",
                    first_name: knex.raw("CAST(AES_DECRYPT(customers.first_name,'" + encription_key + "') AS CHAR(255))"),
                    last_name: knex.raw("CAST(AES_DECRYPT(customers.last_name,'" + encription_key + "') AS CHAR(255))"),
                    email: knex.raw("CAST(AES_DECRYPT(customers.email,'" + encription_key + "') AS CHAR(255))"),
                    tenant_remark: "customers.tenant_remark",
                    country_id: "customers.country_id",
                    dob: "customers.dob",
                    tenant_joining_date: "customers.tenant_joining_date",
                    tenant_leaving_date: "customers.tenant_leaving_date",
                    gender: "customers.gender",
                    created_at: knex.raw("DATE_FORMAT(customers.created_at,'%b %d,%Y, %h:%i:%S %p')"),
                    phone: knex.raw("CAST(AES_DECRYPT(customers.phone,'" + encription_key + "') AS CHAR(255))"),
                    customer_unique_id: knex.raw("CAST(AES_DECRYPT(customers.customer_unique_id,'" + encription_key + "') AS CHAR(255))"),
                    birthday: "customers.birthday",
                    anniversary: "customers.anniversary",
                    spouse_name: "customers.spouse_name",
                    children: "customers.children"
                };
                return knex("customers").select(columns)
                    .leftJoin('master_unit', 'master_unit.tenant_customer_id', 'customers.id')
                    .leftJoin("countries", "countries.id", "=", "customers.country_id")
                    .where("customers.id", data['id']);
                break;
        }
    }
    edit_tenant(query_type, data) {
        switch (query_type) {
            case "edit_tenant_exist":
                return knex("customers").select("id", "is_logged_in")
                    .whereRaw("CAST(AES_DECRYPT(customers.customer_unique_id,'" + encription_key + "') AS CHAR(255))='" + data['tenant_unique_id'] + "'")
                    .andWhere("customers.status", 1);
                break;
            case "edit_tenant":
                return knex("customers").update(data).where("customers.id", data['id']);
                break;
        }
    }

    delete_tenant(query_type, data) {
        switch (query_type) {
            case "customer_exist":
                return knex("customers").select("customers.id")
                    .whereRaw("CAST(AES_DECRYPT(customers.customer_unique_id,'" + encription_key + "') AS CHAR(255))='" + data['customer_unique_id'] + "'")
                    .andWhere("customers.status", 1);
                break;
            case "get_tenant":
                return knex("customers").select("customers.id")
                    .whereRaw("CAST(AES_DECRYPT(customers.customer_unique_id,'" + encription_key + "') AS CHAR(255))='" + data['tenant_unique_id'] + "'")
                    .andWhere("customers.status", 1);
                break;
            case "delete_tenant":
                return knex("customers").update({ status: 0 }).where("customers.id", data['tenant_id']);
                break;

            case "update_unit":
                return knex("master_unit").update({ unit_type: 'rent' }).where("master_unit.tenant_customer_id", data['tenant_id']);
                break;
        }
    }

    async get_tenant_list(data) {
        console.log("in list");
        const unitDetails = await knex('master_unit').select('id').where('customer_id', data.customer_id);

        const columns = {
            tenant_unique_id: knex.raw("CAST(AES_DECRYPT(customers.customer_unique_id,'" + encription_key + "') AS CHAR(255))"),
            unit_no: "master_unit.unit_no",
            unit_id: "master_unit.id",
            first_name: knex.raw("CAST(AES_DECRYPT(customers.first_name,'" + encription_key + "') AS CHAR(255))"),
            last_name: knex.raw("CAST(AES_DECRYPT(customers.last_name,'" + encription_key + "') AS CHAR(255))"),
            email: knex.raw("CAST(AES_DECRYPT(customers.email,'" + encription_key + "') AS CHAR(255))"),
            tenant_remark: "customers.tenant_remark",
            dob: "customers.dob",
            tenant_joining_date: "customers.tenant_joining_date",
            tenant_leaving_date: "customers.tenant_leaving_date",
            gender: "customers.gender",
            phone: knex.raw("CAST(AES_DECRYPT(customers.phone,'" + encription_key + "') AS CHAR(255))"),
            country_name: "countries.name",
            unit_name: "master_unit.title",
            building_name: "master_building.name",
            property_name: "master_property.property_name",
            birthday: "customers.birthday",
            anniversary: "customers.anniversary",
            spouse_name: "customers.spouse_name",
            children: "customers.children",
            created_at: "customers.created_at",
            is_logged_in: "customers.is_logged_in"
        };

        let query = knex('customers').select(columns)
            .join('master_unit', 'master_unit.id', 'customers.unit_id')
            .join('master_building', 'master_building.id', 'master_unit.building_id')
            .join('master_property', 'master_property.id', 'master_building.property_id')
            .leftJoin('master_user_type', 'master_user_type.id', 'customers.user_type_id')
            .leftJoin('countries', 'countries.id', 'customers.country_id')

            .whereRaw(`master_user_type.code = 'tenant'`)
            .where('customers.status', 1)
            .whereIn('master_unit.id', unitDetails.map(e => e.id))
            .orderBy('customers.created_at', 'desc');

        if (data['name'])
            query.whereRaw("concat(CAST(AES_DECRYPT(customers.first_name,'" + encription_key + "') AS CHAR(255)),'',CAST(AES_DECRYPT(customers.last_name,'" + encription_key + "') AS CHAR(255))) like '%" + data['name'] + "%'")
        if (data['email'])
            query.whereRaw("CAST(AES_DECRYPT(customers.email,'" + encription_key + "') AS CHAR(255)) like '%" + data['email'] + "%'")
        if (data['phone'])
            query.whereRaw("CAST(AES_DECRYPT(customers.phone,'" + encription_key + "') AS CHAR(255)) like '%" + data['phone'] + "%'")
        /* if (data['from_date'] && data['to_date'])
            query.whereBetween('customers.created_at', [dateFormat(data['from_date'], "yyyy-mm-dd 00:00:00"), dateFormat(data['to_date'], "yyyy-mm-dd 23:59:59")]);
        else if (data['from_date'] && !data['to_date'])
            query.whereBetween('customers.created_at', [dateFormat(data['from_date'], "yyyy-mm-dd"), dateFormat(now, "yyyy-mm-dd 23:59:59")]);
        else if (!data['from_date'] && data['to_date'])
            query.whereBetween('customers.created_at', ["1970-01-01", [dateFormat(data['to_date'], "yyyy-mm-dd 23:59:59")]]);
        } */
        return query;
    }

}