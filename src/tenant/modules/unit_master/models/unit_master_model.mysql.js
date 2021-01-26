'use strict';
let knex = require('../../../../../config/knex.js');
let configKey = require("../../../../../config/config");
let encription_key = configKey.encription_key;

module.exports = class unitMasterModel {
    constructor() { }

    get_all_unit_master(query_type,data) {
        switch(query_type){
            case "get_unit_master":
                let unitColumns ={
                    id: "master_unit.id",
                    customer_name: knex.raw("CONCAT(CAST(AES_DECRYPT(cust1.first_name,'" + encription_key + "') AS CHAR(255)),' ',CAST(AES_DECRYPT(cust1.last_name,'" + encription_key + "') AS CHAR(255)))"),
                    tenant_name: knex.raw("CONCAT(CAST(AES_DECRYPT(cust2.first_name,'" + encription_key + "') AS CHAR(255)),' ',CAST(AES_DECRYPT(cust2.last_name,'" + encription_key + "') AS CHAR(255)))"),
                    property_name: "master_property_type.name",
                    property_code: "master_property.property_code",
                    rent_amount: "master_unit.rent_amount",
                    sale_amount: "master_unit.sale_amount",
                    unit_type: "master_unit.unit_type",
                    title: "master_unit.title",
                    detailed_title: "master_unit.detailed_title",
                    description: "master_unit.description",
                    detailed_description: "master_unit.detailed_description",
                    no_of_rooms: "master_unit.no_of_rooms",
                    no_of_bathrooms: "master_unit.no_of_bathrooms",
                    reference_number: "master_broker.reference_number",
                    permit_number: "master_broker.permit_number",
                    broker_name: "master_broker.name",
                    unit_no:"master_unit.unit_no",
                    owner_first_name:knex.raw("CAST(AES_DECRYPT(cust1.first_name,'cc_gain') AS CHAR(255))"),
                    owner_last_name:knex.raw("CAST(AES_DECRYPT(cust1.last_name,'cc_gain') AS CHAR(255))"),
                    owner_email_id:knex.raw("CAST(AES_DECRYPT(cust1.email,'cc_gain') AS CHAR(255))"),
                    owner_mobile_number:knex.raw("CAST(AES_DECRYPT(cust1.phone,'cc_gain') AS CHAR(255))"),

                    status: "master_unit.status",
                }
            let query = knex('master_unit')
                .select(unitColumns)
                .leftJoin("customers as cust1","cust1.id","=","master_unit.customer_id")
                .leftJoin("customers as cust2","cust2.id","=","master_unit.tenant_customer_id")
                .join('master_building', 'master_building.id', 'master_unit.building_id')
                .join('master_property', 'master_property.id', 'master_building.property_id')
                .leftJoin("master_property_type","master_property_type.id","=","master_property.property_type_id")
                .leftJoin("master_broker","master_broker.id","=","master_building.broker_id");
                if (data['name']) {
                    query.whereRaw("concat(CAST(AES_DECRYPT(cust1.first_name,'" + encription_key + "') AS CHAR(255)),'',CAST(AES_DECRYPT(cust1.last_name,'" + encription_key + "') AS CHAR(255))) like '%" + data['name'] + "%'")
                    query.orWhereRaw("concat(CAST(AES_DECRYPT(cust2.first_name,'" + encription_key + "') AS CHAR(255)),'',CAST(AES_DECRYPT(cust2.last_name,'" + encription_key + "') AS CHAR(255))) like '%" + data['name'] + "%'")
				}
                if (data['customer_unique_id']) {
					query.whereRaw("CAST(AES_DECRYPT(cust1.customer_unique_id,'" + encription_key + "') AS CHAR(255)) like '%" + data['customer_unique_id'] + "%'")
                }
                
                if (data['unit_no']) {
					query.whereRaw("master_unit.unit_no like '%" + data['unit_no'] + "%'")
                }

                if (data['owner_email_id']) {
					query.whereRaw("CAST(AES_DECRYPT(cust1.email,'" + encription_key + "') AS CHAR(255)) like '%" + data['owner_email_id'] + "%'")
                }

				if (data['from_date'] && data['to_date']) {
					query.whereBetween('customers.created_at', [dateFormat(data['from_date'], "yyyy-mm-dd 00:00:00"), dateFormat(data['to_date'], "yyyy-mm-dd 23:59:59")]);
				} else if (data['from_date'] && !data['to_date']) {
					query.whereBetween('customers.created_at', [dateFormat(data['from_date'], "yyyy-mm-dd"), dateFormat(now, "yyyy-mm-dd 23:59:59")]);
				} else if (!data['from_date'] && data['to_date']) {
					query.whereBetween('customers.created_at', ["1970-01-01", [dateFormat(data['to_date'], "yyyy-mm-dd 23:59:59")]]);
                }
                return query;
            break;
            case "get_unit_master_has_images":
                return knex('unit_has_images').select("*").where("unit_has_images.unit_id", data['id']);
            break; 
            case "get_unit_master_has_amenities":
                return knex('unit_has_amenities').select("*").where("unit_has_amenities.unit_id", data['id']);
            break;            
        }
    }

    async get_rent_unit_list(query_type) {
        switch(query_type){
            case "get_rent_unit_list":
                const columns = {
                    id: 'master_unit.id',
                    unit_no: 'unit_no',
                    building_id: 'master_building.id',
                    text: knex.raw("CONCAT(master_building.name, ' - ',master_unit.unit_no)"),
                    name: knex.raw("CONCAT(CAST(AES_DECRYPT(customers.first_name,'" + encription_key + "') AS CHAR(255)),' ',CAST(AES_DECRYPT(customers.last_name,'" + encription_key + "') AS CHAR(255)))"),
                    building_name: 'master_building.name',
                    property_name: 'master_property.property_name',
                    area: "master_property.area",
                    emirate: 'master_emirate.name',
                    address_line_1: 'master_property.address_line_1',
                    address_line_2: 'master_property.address_line_2'
                }
        
                let unitDetails = await knex('master_unit').select(columns)
                    .leftJoin('customers', 'customers.id', 'master_unit.customer_id')
                    .join('master_building', 'master_building.id', 'master_unit.building_id')
                    .join('master_property', 'master_property.id', 'master_building.property_id')
                    .leftJoin('master_emirate', 'master_emirate.id', 'master_property.emirate_id')
                    // .where('master_unit.customer_id', customer_id)
                    .whereRaw("master_unit.unit_type = 'rent'");
        
                if (!unitDetails.length) return [];
        
                const unitAvalibilityColumns = {
                    id: 'master_unit.id',
                    tenant_joining_date: 'customers.tenant_joining_date',
                    tenant_leaving_date: 'customers.tenant_leaving_date'
                }
        
                let unitAvalibility = await knex('master_unit').select(unitAvalibilityColumns)
                    .join('customers', function () {
                        this.on('customers.unit_id', 'master_unit.id')
                            .on('customers.status', 1)
                    }).orderBy('customers.tenant_joining_date', 'asc')
                    .whereIn('master_unit.id', unitDetails.map(e => e.id));
        
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
                break;


            case "get_owner_unit_list":
                let unitColumns1 ={
                    id: "master_unit.id",
                    text: knex.raw("CONCAT(master_property.property_name, ' - ',master_building.name, ' - ',master_unit.title,' - ',master_unit.unit_no)"),
                    unit_type: "master_unit.unit_type",
                    tenant_joining_date: "customers.tenant_joining_date",
                    tenant_leaving_date: "customers.tenant_leaving_date"
                }
            return knex('master_unit')
                .select(unitColumns1)
                .join('customers', 'customers.id', 'master_unit.customer_id')
                .join('master_building', 'master_building.id', 'master_unit.building_id')
                .join('master_property', 'master_property.id', 'master_building.property_id');
                // .whereIn("master_unit.unit_type",["rent", "rent_occupied"]);
                break;  
            }
    }
}