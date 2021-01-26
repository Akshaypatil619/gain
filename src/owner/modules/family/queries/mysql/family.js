let knex = require("../../../../../../config/knex.js");
let config = require("../../../../../../config/config");
let encription_key = config.encription_key;

module.exports = class Family {



    get_family_list(columns, data) {
        console.log("columns, data",columns,data)
        let query_obj = knex('master_property')
            .select(columns)
            .join('master_property_type', 'master_property_type.id', 'master_property.property_type_id')
            .join('master_property_elevation', 'master_property_elevation.id', 'master_property.property_elevation_id')
            .where('master_property.oam_id', 108)
            .orderBy('master_property.id', 'desc');

        if (data.property_code)
            query_obj.where('master_property.property_code', data.property_code);
        if (data.property_type)
            query_obj.where('master_property.property_type', data.property_type);
        if (data.limit)
            query_obj.limit(data.limit);
        if (data.offset)
            query_obj.offset(data.offset);

        return query_obj;
    }


    addFamily(query_type, data) {
        let columns="";
        switch(query_type){
            case "add_family_email_exist": 
                return knex("customers").select("customers.id")
                    .whereRaw("CAST(AES_DECRYPT(customers.email,'" + encription_key + "') AS CHAR(255))='"+ data['email']+"'")
                break; 

            case "add_family_phone_exist": 
                return knex("customers").select("customers.id")
                    .whereRaw("CAST(AES_DECRYPT(customers.phone,'" + encription_key + "') AS CHAR(255))='"+ data['phone']+"'")
                break;
                
            case "get_customer_id":
                columns = {
                    id: "customers.id",
                    type: "master_user_type.name"
                } 
                return knex("customers").select(columns)
                    .join('master_user_type','master_user_type.id','customers.user_type_id')
                    .where("customers.id", data['referrer_id'])
                    // .whereRaw("CAST(AES_DECRYPT(customers.customer_unique_id,'" + encription_key + "') AS CHAR(255))='"+ data['customer_unique_id']+"'")
                break;
            
                case "get_family_count":
                    columns = {
                        family_count: knex.raw("COUNT(customers.referrer_relation)")
                    } 
                    return knex("customers").select(columns)
                        .where("customers.referrer_id", data['referrer_id']).andWhere("customers.status",1);
                    break;  
                    
                case "get_owner_property_type":
                columns = {
                    id: "master_property_type.id",
                    proprty_type: "master_property_type.name"
                } 
                return knex("master_unit").select(columns)
                    .leftJoin('master_building','master_building.id','master_unit.building_id')
                    .leftJoin('master_property','master_property.id','master_building.property_id')
                    .leftJoin('master_property_type','master_property_type.id','master_property.property_type_id')
                    .where("master_unit.customer_id",data['referrer_id'])
                    .andWhere("master_unit.is_default",1);
                break;   
            
            // case "get_owner_property_type":
            //     columns = {
            //         id: "master_property_type.id",
            //         proprty_type: "master_property_type.name"
            //     } 
            //     return knex("master_unit").select(columns)
            //         .leftJoin('master_building','master_building.id','master_unit.building_id')
            //         .leftJoin('master_property','master_property.id','master_building.property_id')
            //         .leftJoin('master_property_type','master_property_type.id','master_property.property_type_id')
            //         .where("master_unit.customer_id",data['referrer_id'])
            //         .andWhere("master_unit.is_default",1);
            //     break;   

            case "get_tenant_property_type":
                columns = {
                    id: "master_property_type.id",
                    property_type: "master_property_type.name"
                } 
                return knex("master_unit").select(columns)
                    .leftJoin('master_building','master_building.id','master_unit.building_id')
                    .leftJoin('master_property','master_property.id','master_building.property_id')
                    .leftJoin('master_property_type','master_property_type.id','master_property.property_type_id')
                    .where("master_unit.tenant_customer_id",data['referrer_id']);
                break;         
                
            case "add_family": 
                return knex("customers").insert(data);
                break;    
        }
    }
    list_family(query_type, data) {
        switch(query_type){
            case "get_customer_id": 
                return knex("customers").select("customers.id")
                    .whereRaw("CAST(AES_DECRYPT(customers.customer_unique_id,'" + encription_key + "') AS CHAR(255))='"+ data['customer_unique_id']+"'")
                break;    

            case "list_family": 
            let columns = {
                id: "family.id",
                first_name: knex.raw("CAST(AES_DECRYPT(family.first_name,'" + encription_key + "')AS CHAR(255))"),
                last_name: knex.raw("CAST(AES_DECRYPT(family.last_name,'" + encription_key + "')AS CHAR(255))"),
                email: knex.raw("CAST(AES_DECRYPT(family.email,'" + encription_key + "')AS CHAR(255))"),
                phone: knex.raw("CAST(AES_DECRYPT(family.phone,'" + encription_key + "')AS CHAR(50))"),
                referral_phone: knex.raw("CAST(AES_DECRYPT(referrer.phone,'" + encription_key + "')AS CHAR(50))"),
                referral_email: knex.raw("CAST(AES_DECRYPT(referrer.email,'" + encription_key + "')AS CHAR(255))"),
                referral_type: "master_user_type.name",
                status: "family.status",
                family_unique_id: knex.raw("CAST(AES_DECRYPT(family.customer_unique_id,'" + encription_key + "') AS CHAR(255))"),
                referrer_relation :  "family.referrer_relation",
                dob: "family.dob",
                gender: "family.gender",
                created_at: "family.created_at",
                
        };
        let family_query = knex.select(columns)
            .from("customers as family")
            .join('customers as referrer', 'family.referrer_id', 'referrer.id')
            .join('master_user_type', 'referrer.user_type_id', 'master_user_type.id')
            .where("family.referrer_id",data['owner_id'])
            .andWhere("family.status",1);
            if (data['name']) {
                family_query.andWhereRaw("concat(CAST(AES_DECRYPT(family.first_name,'" + encription_key + "') AS CHAR(255)),'',CAST(AES_DECRYPT(family.last_name,'" + encription_key + "') AS CHAR(255))) like '%" + data['name'] + "%'")
            }
            if (data['email']) {
                family_query.andWhereRaw("CAST(AES_DECRYPT(family.email,'" + encription_key + "') AS CHAR(255)) like '%" + data['email'] + "%'")
            }
            if (data['phone']) {
                family_query.andWhereRaw("CAST(AES_DECRYPT(family.phone,'" + encription_key + "') AS CHAR(255)) like '%" + data['phone'] + "%'")
            }
            if (data['family_unique_id']) {
                family_query.andWhereRaw("CAST(AES_DECRYPT(family.customer_unique_id,'" + encription_key + "') AS CHAR(255)) like '%" + data['family_unique_id'] + "%'")
            }
            return family_query.orderBy("family.created_at")

        }
    }
    deleteFamily(query_type, data) {
        switch(query_type){
            case "get_customer_id": 
                return knex("customers").select("customers.id")
                    .whereRaw("CAST(AES_DECRYPT(customers.customer_unique_id,'" + encription_key + "') AS CHAR(255))='"+ data['customer_unique_id']+"'")
                    .andWhere("customers.status",1)
                    .andWhere("customers.is_logged_in",1);
                break;    

            case "family_exist": 
                return knex("customers").select("customers.id")
                    .whereRaw("CAST(AES_DECRYPT(customers.customer_unique_id,'" + encription_key + "') AS CHAR(255))='"+ data['family_unique_id']+"'")
                    .andWhere("customers.status",1)
                    .andWhere("customers.is_logged_in",0);
                break;        

            case "delete_family": 
                return knex("customers").update({status: 0}).where("customers.id", data['id']);
                break;    
        }
    }

    
}