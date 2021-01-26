'use strict';
let knex = require('../../../../../config/knex.js');
let configKey = require("../../../../../config/config");
let encription_key = configKey.encription_key;

module.exports = class TenantModel {
    constructor() { }

    get_customer_id(customer_id) {
        return knex('customers').select('customers.id as id', 'master_user_type.code as user_type')
            .join('master_user_type', 'master_user_type.id', 'customers.user_type_id')
            .where("customers.id",customer_id);
            // .whereRaw(`CAST(AES_DECRYPT(customers.customer_unique_id, '${encription_key}') AS CHAR(255)) = '${customer_unique_id}'`);
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
    add_tenant(query_type,data) {
        
        switch(query_type){
            case "add_tenant_exist":
                return knex("customers").select("customers.id")
                    // .whereRaw("CAST(AES_DECRYPT(customers.phone,'" + encription_key + "') AS CHAR(255))='"+ data['phone']+"'")
                    .whereRaw("CAST(AES_DECRYPT(customers.email,'" + encription_key + "') AS CHAR(255))='"+ data['email']+"'")
                break; 
           case "check_unit":
            return knex("master_unit").select("master_unit.id").whereIn("master_unit.unit_type",["rent","rent_occupied"]).andWhere("master_unit.id", data['unit_id']);
                break; 
           case "add_tenant":
            return knex("customers").insert(data);
                break; 
        }
    }
    get_tenant(query_type,data) {
        switch(query_type){
            case "get_tenant":
                let columns = {
                    id: "tenant.id",
                    unit_id: "master_unit.id",
                    first_name: knex.raw("CAST(AES_DECRYPT(tenant.first_name,'" + encription_key + "') AS CHAR(255))"),
                    last_name: knex.raw("CAST(AES_DECRYPT(tenant.last_name,'" + encription_key + "') AS CHAR(255))"),
                    email: knex.raw("CAST(AES_DECRYPT(tenant.email,'" + encription_key + "') AS CHAR(255))"),
                    phone: knex.raw("CAST(AES_DECRYPT(tenant.phone,'" + encription_key + "') AS CHAR(255))"),
                    tenant_remark: "tenant.tenant_remark",
                    // dob: "tenant.dob",
                    country_id: "tenant.country_id",
                    tenant_joining_date: "tenant.tenant_joining_date",
                    tenant_leaving_date: "tenant.tenant_leaving_date",
                    // gender: "tenant.gender",
                    created_at: knex.raw("DATE_FORMAT(tenant.created_at,'%b %d,%Y, %h:%i:%S %p')"),
                    phone: knex.raw("CAST(AES_DECRYPT(tenant.phone,'" + encription_key + "') AS CHAR(255))"),
                    customer_unique_id: knex.raw("CAST(AES_DECRYPT(tenant.customer_unique_id,'" + encription_key + "') AS CHAR(255))"),
                    building_code: "master_building.name",
                    unit_name: knex.raw("CONCAT(master_property.property_name, ' - ',master_building.name, ' - ',master_unit.title)"),
                    name: knex.raw("CONCAT(CAST(AES_DECRYPT(owner.first_name,'" + encription_key + "') AS CHAR(255)),' ',CAST(AES_DECRYPT(owner.last_name,'" + encription_key + "') AS CHAR(255)))"),
                    address_line_1: "master_property.address_line_1",
                    area: "master_property.area",
                    unit_no:"master_unit.unit_no",
                    birthday: "tenant.birthday",
                    anniversary: "tenant.anniversary",
                    spouse_name: "tenant.spouse_name",
                    children: "tenant.children",
                    // is_logged_in:"tenant.is_logged_in"
            };
            return knex("customers as tenant").select(columns)
                    .leftJoin("countries","countries.id","=","tenant.country_id")
                    .leftJoin('master_unit', 'master_unit.id', 'tenant.unit_id')
                    .leftJoin("customers as owner","owner.id","=","master_unit.customer_id")
                    .join('master_building', 'master_building.id', 'master_unit.building_id')
                    .join('master_property', 'master_property.id', 'master_building.property_id')
                    .where("tenant.id",data['id'])
                    .andWhere("tenant.is_logged_in", 0);
                break; 
        }
    }
    edit_tenant(query_type,data) {
        switch(query_type){
            case "edit_tenant_exist":
                return knex("customers").select("customers.id as id")
                    .where("customers.id", data['id'])
                    .andWhere("customers.status", 1);
            break;
           break; 
           case "edit_tenant":
            return knex("customers").update(data).where("customers.id",data['id']);
           break; 
        }
    }
    // list_tenant(query_type,data) {
    //     switch(query_type){
    //         case "list_tenant":
    //             let columns = {
    //                 id: "customers.id",
    //                 first_name: knex.raw("CAST(AES_DECRYPT(customers.first_name,'" + encription_key + "') AS CHAR(255))"),
    //                 last_name: knex.raw("CAST(AES_DECRYPT(customers.last_name,'" + encription_key + "') AS CHAR(255))"),
    //                 email: knex.raw("CAST(AES_DECRYPT(customers.email,'" + encription_key + "') AS CHAR(255))"),
    //                 user_type_name: "master_user_type.name",
    //                 tenant_remark: "customers.tenant_remark",
    //                 // dob: "customers.dob",
    //                 tenant_joining_date: "customers.tenant_joining_date",
    //                 tenant_leaving_date: "customers.tenant_leaving_date",
    //                 // gender: "customers.gender",
    //                 created_at: knex.raw("DATE_FORMAT(customers.created_at,'%Y-%c-%d  %h:%i:%S %p')"),
    //                 phone: knex.raw("CAST(AES_DECRYPT(customers.phone,'" + encription_key + "') AS CHAR(255))"),
    //                 customer_unique_id: knex.raw("CAST(AES_DECRYPT(customers.customer_unique_id,'" + encription_key + "') AS CHAR(255))"),
    //                 country_name: "countries.name",
    //                 unit_number:"master_unit.unit_no",
    //               //  building_name: knex.raw("CAST(AES_DECRYPT(master_building.name,'" + encription_key + "') AS CHAR(255))"),
    //                 building_name: 'master_building.name',
    //         };
    //         let query = knex('customers')
    //             .select(columns)
    //             .leftJoin("master_user_type","master_user_type.id","=","customers.user_type_id")
    //             .leftJoin("countries","countries.id","=","customers.country_id")
    //             .leftJoin("master_unit","master_unit.id","=","customers.unit_id")
    //             .leftJoin('master_building', 'master_building.id', 'master_unit.building_id')
    //             .where("master_user_type.name","Tenant")
    //             // .andWhere("master_unit.customer_id",data['owner_id']);
    //             if (data['name']) {
	// 				query.whereRaw("concat(CAST(AES_DECRYPT(customers.first_name,'" + encription_key + "') AS CHAR(255)),'',CAST(AES_DECRYPT(customers.last_name,'" + encription_key + "') AS CHAR(255))) like '%" + data['name'] + "%'")
	// 			}
	// 			if (data['email']) {
	// 				query.whereRaw("CAST(AES_DECRYPT(customers.email,'" + encription_key + "') AS CHAR(255)) like '%" + data['email'] + "%'")
    //             }
    //             if(data['building_id']){
    //                 query.where("master_unit.building_id", data['building_id']);
    //             }
    //             // if(data['building_name']){
    //             //     query.whereRaw("CAST(AES_DECRYPT(master_building.name,'" + encription_key + "') AS CHAR(255)) like '%" + data['building_name'] + "%'")
    //             // }
    //             if (data['phone']) {
	// 				query.whereRaw("CAST(AES_DECRYPT(customers.phone,'" + encription_key + "') AS CHAR(255)) like '%" + data['phone'] + "%'")
    //             }
    //             if (data['customer_unique_id']) {
	// 				query.whereRaw("CAST(AES_DECRYPT(customers.customer_unique_id,'" + encription_key + "') AS CHAR(255)) like '%" + data['customer_unique_id'] + "%'")
	// 			}
	// 			if (data['from_date'] && data['to_date']) {
	// 				query.whereBetween('customers.created_at', [dateFormat(data['from_date'], "yyyy-mm-dd 00:00:00"), dateFormat(data['to_date'], "yyyy-mm-dd 23:59:59")]);
	// 			} else if (data['from_date'] && !data['to_date']) {
	// 				query.whereBetween('customers.created_at', [dateFormat(data['from_date'], "yyyy-mm-dd"), dateFormat(now, "yyyy-mm-dd 23:59:59")]);
	// 			} else if (!data['from_date'] && data['to_date']) {
	// 				query.whereBetween('customers.created_at', ["1970-01-01", [dateFormat(data['to_date'], "yyyy-mm-dd 23:59:59")]]);
	// 			}
    //             query.orderBy("customers.created_at", "desc");
    //     		return query;
    //         break;
    //     }
    // }

    async get_tenant_list_count(data) {
        const unitDetails = await knex('master_unit').select('id').where('customer_id', data.customer_id);

        const columns = {
            id: "customers.id",
            tenant_unique_id: knex.raw("CAST(AES_DECRYPT(customers.customer_unique_id,'" + encription_key + "') AS CHAR(255))"),
            unit_no: "master_unit.unit_no",
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
            unit_no: "master_unit.unit_no",
            building_name: "master_building.name",
            property_name: "master_property.property_name",
            birthday: "customers.birthday",
            anniversary: "customers.anniversary",
            spouse_name: "customers.spouse_name",
            children: "customers.children",
            created_at: "customers.created_at",
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
        if (data.oam_id)
            query.where('customers.id', data.oam_id);
        if (data.building_id)
            query.where('master_unit.building_id', data.building_id);
        if (data.unit_no)
            query.where('master_unit.unit_no', data.unit_no);
            /* if (data['from_date'] && data['to_date'])
            query.whereBetween('customers.created_at', [dateFormat(data['from_date'], "yyyy-mm-dd 00:00:00"), dateFormat(data['to_date'], "yyyy-mm-dd 23:59:59")]);
        else if (data['from_date'] && !data['to_date'])
            query.whereBetween('customers.created_at', [dateFormat(data['from_date'], "yyyy-mm-dd"), dateFormat(now, "yyyy-mm-dd 23:59:59")]);
        else if (!data['from_date'] && data['to_date'])
            query.whereBetween('customers.created_at', ["1970-01-01", [dateFormat(data['to_date'], "yyyy-mm-dd 23:59:59")]]);
        } */
        return query;
    }

    async get_tenant_list_data(data) {
        const unitDetails = await knex('master_unit').select('id').where('customer_id', data.customer_id);

        const columns = {
            id: "customers.id",
            tenant_unique_id: knex.raw("CAST(AES_DECRYPT(customers.customer_unique_id,'" + encription_key + "') AS CHAR(255))"),
            unit_no: "master_unit.unit_no",
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
            unit_no: "master_unit.unit_no",
            building_name: "master_building.name",
            property_name: "master_property.property_name",
            birthday: "customers.birthday",
            anniversary: "customers.anniversary",
            spouse_name: "customers.spouse_name",
            children: "customers.children",
            created_at: "customers.created_at",
            is_logged_in:"customers.is_logged_in",
            oam_name: knex.raw("CONCAT(CAST(AES_DECRYPT(oam.first_name,'" + encription_key + "') AS CHAR(255)),' ',CAST(AES_DECRYPT(oam.last_name,'" + encription_key + "') AS CHAR(255)))")
        };

        let query = knex('customers').select(columns)
            .join('master_unit', 'master_unit.id', 'customers.unit_id')
            .join('master_building', 'master_building.id', 'master_unit.building_id')
            .join('master_property', 'master_property.id', 'master_building.property_id')
            .leftJoin('master_user_type', 'master_user_type.id', 'customers.user_type_id')
            .leftJoin('countries', 'countries.id', 'customers.country_id')
            .join('customers as oam', 'oam.id', 'master_property.oam_id')
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
        if (data.oam_id)
            query.where('customers.id', data.oam_id);
        if (data.building_id)
            query.where('master_unit.building_id', data.building_id);
        if (data.unit_no)
            query.where('master_unit.unit_no', data.unit_no);
            /* if (data['from_date'] && data['to_date'])
            query.whereBetween('customers.created_at', [dateFormat(data['from_date'], "yyyy-mm-dd 00:00:00"), dateFormat(data['to_date'], "yyyy-mm-dd 23:59:59")]);
        else if (data['from_date'] && !data['to_date'])
            query.whereBetween('customers.created_at', [dateFormat(data['from_date'], "yyyy-mm-dd"), dateFormat(now, "yyyy-mm-dd 23:59:59")]);
        else if (!data['from_date'] && data['to_date'])
            query.whereBetween('customers.created_at', ["1970-01-01", [dateFormat(data['to_date'], "yyyy-mm-dd 23:59:59")]]);
        } */
        return query.offset(data['offset']).limit(data['limit']);
    }

    list_countries(){
        let columns = {
            id: "countries.id",
            name: "countries.name",
            code: "countries.code",
        };
        return knex('countries').select(columns).where("countries.status",1);       
    }

    list_emirate(){
        let columns = {
            id: "master_emirate.id",
            name: "master_emirate.name",
            code: "master_emirate.code",
        };
        return knex('master_emirate').select(columns);       
    }

    list_building_code(data){
        let columns = {
            id: "master_building.id",
            name: "master_building.name",
            code: "master_building.code",
        };
        return knex('master_unit')
        .select(columns)
        .join('master_building', 'master_building.id', 'master_unit.building_id')
        .join('master_property', 'master_property.id', 'master_building.property_id')
        .where("master_unit.customer_id",data['owner_id'])    
        .groupBy("master_building.id")   
    }
}