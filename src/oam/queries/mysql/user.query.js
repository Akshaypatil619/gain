const knex = require('../../../../config/knex');
let config = require("../../../../config/config");
let encription_key = config.encription_key;

module.exports = class UserQuery {

    constructor() { }

    get_property_list(columns, data) {
        let query_obj = knex('master_property')
            .select(columns)
            .leftJoin('master_property_type', 'master_property_type.id', 'master_property.property_type_id')
            .leftJoin('master_property_elevation', 'master_property_elevation.id', 'master_property.property_elevation_id')
            .leftJoin('customers', 'customers.id', 'master_property.oam_id')
            .leftJoin('master_emirate', 'master_emirate.id', 'master_property.emirate_id')
            .leftJoin('countries', 'countries.id', 'master_property.country_id')
            .where('master_property.oam_id', data.oam_id)
      

        if(data['property_name']){
            query_obj.where("master_property.property_name", "like", "%" + data['property_name'] + "%");
        } 
        if (data['property_type_id']){
            query_obj.where('master_property.property_type_id', data['property_type_id']);
        }
        if (data['emirate_id']){
            query_obj.where('master_property.emirate_id', data['emirate_id']);
        }
        if(data['address']){
            query_obj.where("master_property.address_line_1", "like", "%" + data['address'] + "%");
        } 
        if(data['area']){
            query_obj.where("master_property.area", "like", "%" + data['area'] + "%");
        } 
        return query_obj.orderBy('master_property.id', 'desc');
    }

    get_building_list(columns, data) {
        let query_obj = knex('master_building')
            .select(columns)
            // .leftJoin('master_building', 'master_building.id', 'master_unit.building_id')
            .leftJoin('building_has_brokers as bhb', 'bhb.building_id', 'master_building.id')
            .leftJoin('master_broker as mb', 'mb.id', 'bhb.broker_id')
            .leftJoin('master_property', 'master_property.id', 'master_building.property_id')
            // .leftJoin('master_broker', 'master_broker.id', 'master_unit.broker_id')
            .where('master_property.oam_id', data.oam_id)
            .groupBy('master_building.id')
            if(data['building_id']){
                query_obj.where("master_building.id",data['building_id']);
            }
            if (data['property_id']){
                query_obj.where('master_property.id', data['property_id']);
            }
            if(data['broker_name']){
                query_obj.where("mb.name", "like", "%" + data['broker_name'] + "%");
            }
        return query_obj.groupBy("master_building.id").orderBy('master_building.id', 'DESC');
    }

    get_all_building_list(columns, data) {
        return knex('master_unit')
            .select(columns)
            .leftJoin('master_building', 'master_building.id', 'master_unit.building_id')
            .where('master_unit.customer_id', data.oam_id).groupBy("master_building.id");
    }

    getBrandList(columns, data) {
        return knex('transaction_history')
            .select(columns)
            // .whereRaw('user_transaction_history.id IN (' + data.trans_id + ')')
            .groupBy("transaction_history.brand_name");
    }

    get_property_type(columns, data) {
        return knex('master_property_type')
            .select(columns)
            .orderBy('master_property_type.id', 'desc');
    }

    get_unit_list(columns, data) {
        let query_obj = knex('master_unit')
            .select(columns)
            .join('master_building', 'master_building.id', 'master_unit.building_id')
            .join('master_property', 'master_property.id', 'master_building.property_id')
            .leftJoin('customers', 'customers.id', 'master_unit.customer_id')
            .where('master_unit.building_id', Number(data.building_id))
            
        
        if (data.title)
            query_obj.where('title', data.title);
        if (data.type)
            query_obj.where('unit_type', data.type);
        if (data.unit_no)
            query_obj.where('unit_no', data.unit_no);
        if (data.owner_email_id)
            query_obj.whereRaw(`cast( aes_decrypt(customers.email, '${encription_key}') as char(255) ) like '%${data.owner_email_id}%'`);

        return query_obj.groupBy('master_unit.id').orderBy('master_unit.id', 'desc');
    }

    get_unitlist(columns, data) {
        let query_obj = knex('master_unit')
            .select(columns)
            .join('master_building', 'master_building.id', 'master_unit.building_id')
            .join('master_property', 'master_property.id', 'master_building.property_id')
            .leftJoin('customers', 'customers.id', 'master_unit.customer_id')
            .whereRaw('master_unit.building_id IN (' + data.building_id + ')');

   
        if (data.title)
            query_obj.where('title', data.title);
        if (data.type)
            query_obj.where('unit_type', data.type);
        if (data.unit_no)
            query_obj.where('unit_no', data.unit_no);
        if (data.owner_email_id)
            query_obj.whereRaw(`cast( aes_decrypt(customers.email, '${encription_key}') as char(255) ) like '%${data.owner_email_id}%'`);

        return query_obj.groupBy('master_unit.id').orderBy('master_unit.id', 'desc');
    }

    get_unitReportlist(columns, data) {
        let query_obj = knex('master_unit')
            .select(columns)
            .leftJoin('customers', 'customers.id', 'master_unit.customer_id')
            .join('unit_owner_rewards', 'unit_owner_rewards.unit_id', 'master_unit.id')
            .join('master_building', 'master_building.id', 'unit_owner_rewards.building_id')
            .join('master_property', 'master_property.id', 'unit_owner_rewards.property_id')
            .whereRaw('master_unit.building_id IN (' + data.building_id + ')');

   
        if (data.title)
            query_obj.where('title', data.title);
        if (data.type)
            query_obj.where('unit_type', data.type);
        if (data.unit_no)
            query_obj.where('unit_no', data.unit_no);
        if (data.owner_email_id)
            query_obj.whereRaw(`cast( aes_decrypt(customers.email, '${encription_key}') as char(255) ) like '%${data.owner_email_id}%'`);

        return query_obj.groupBy('master_unit.id').orderBy('master_unit.id', 'desc');
    }


    get_transaction_unitlist(columns, data) {
        let query_obj = knex('master_unit')
            .select(columns)
            .join('master_building', 'master_building.id', 'master_unit.building_id')
            .join('master_property', 'master_property.id', 'master_building.property_id')
            .leftJoin('customers', 'customers.id', 'master_unit.customer_id')
            .join('transaction_history', 'transaction_history.unit_id', 'master_unit.id')
            .whereRaw('master_unit.building_id IN (' + data.building_id + ')');

   
        if (data.title)
            query_obj.where('title', data.title);
        if (data.type)
            query_obj.where('unit_type', data.type);
        if (data.unit_no)
            query_obj.where('unit_no', data.unit_no);
        if (data.owner_email_id)
            query_obj.whereRaw(`cast( aes_decrypt(customers.email, '${encription_key}') as char(255) ) like '%${data.owner_email_id}%'`);

        return query_obj.groupBy('master_unit.id').orderBy('master_unit.id', 'desc');
    }

}