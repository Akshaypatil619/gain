let knex = require("../../../../../config/knex");
const response = require('../response/family.response');
let config = require("../../../../../config/config");
let encription_key = config.encription_key;
const query = new (require('../queries/mysql/family'))();

module.exports = class FamilyModel {

    // add_familyMember(query_type,data) {
    //     console.log("QUERY",data)
    //     let columns=""
    //     switch(query_type){
    //         case "customer_type":
    //             columns = {
    //                 id: "customers.id",
    //                 type: "master_user_type.name"
    //             } 
    //             return knex("customers").select(columns)
    //                 .join('master_user_type','master_user_type.id','customers.user_type_id')
    //                 .where("customers.id","=",data['referrer_id'])
    //             break; 

    //         case "add_familyMember_exist":
    //             return knex("customers").select("customers.id")
    //                 .whereRaw("CAST(AES_DECRYPT(customers.phone,'" + encription_key + "') AS CHAR(255))='"+ data['phone']+"'")
    //                 .andWhereRaw("CAST(AES_DECRYPT(customers.email,'" + encription_key + "') AS CHAR(255))='"+ data['email']+"'")
    //        break; 
    //        case "add_familyMember":
    //         return knex("customers").insert(data);
    //        break;
    //        case "get_family_count":
    //         columns= {
    //             family_count: knex.raw("COUNT(customers.referrer_id)")
    //         } 
    //         return knex("customers").select(columns)
    //             .where("customers.referrer_id", data['referrer_id']).andWhere("customers.status",1);
    //         break; 
    //         case "get_owner_property_type":
    //             columns = {
    //                 id: "master_property_type.id",
    //                 proprty_type: "master_property_type.name"
    //             } 
    //             return knex("master_unit").select(columns)
    //                 .leftJoin('master_building','master_building.id','master_unit.building_id')
    //                 .leftJoin('master_property','master_property.id','master_building.property_id')
    //                 .leftJoin('master_property_type','master_property_type.id','master_property.property_type_id')
    //                 .where("master_unit.customer_id",data['referrer_id'])
    //                 .andWhere("master_unit.is_default",1);
    //             break;        
            
    //         case "get_tenant_property_type":
    //             columns = {
    //                 id: "master_property_type.id",
    //                 property_type: "master_property_type.name"
    //             } 
    //             return knex("master_unit").select(columns)
    //                 .leftJoin('master_building','master_building.id','master_unit.building_id')
    //                 .leftJoin('master_property','master_property.id','master_building.property_id')
    //                 .leftJoin('master_property_type','master_property_type.id','master_property.property_type_id')
    //                 .where("master_unit.tenant_customer_id",data['referrer_id']);
    //             break;

    //     }   
    // }


    // get_familyMember(query_type,data){
    //     switch(query_type){
    //         case "get_familyMember":
    //             let columns = {
    //                 id: "customers.id",
    //                 first_name: knex.raw("CAST(AES_DECRYPT(customers.first_name,'" + encription_key + "') AS CHAR(255))"),
    //                 last_name: knex.raw("CAST(AES_DECRYPT(customers.last_name,'" + encription_key + "') AS CHAR(255))"),
    //                 email: knex.raw("CAST(AES_DECRYPT(customers.email,'" + encription_key + "') AS CHAR(255))"),
    //                 referrer_id: 'customers.referrer_id',
    //                 gender: "customers.gender",
    //                 created_at: knex.raw("DATE_FORMAT(customers.created_at,'%b %d,%Y, %h:%i:%S %p')"),
    //                 phone: knex.raw("CAST(AES_DECRYPT(customers.phone,'" + encription_key + "') AS CHAR(255))"),
    //                 customer_unique_id: knex.raw("CAST(AES_DECRYPT(customers.customer_unique_id,'" + encription_key + "') AS CHAR(255))")
    //         };
    //         return knex("customers").select(columns).where("customers.customer_unique_id",data['customer_unique_id']);
    //        break; 
    //     }

    // }

    edit_familyMember(query_type,data) {
        switch(query_type){
            case "edit_familyMember_exist":
            return knex("customers").select("customers.id")
                    .whereRaw("CAST(AES_DECRYPT(customers.phone,'" + encription_key + "') AS CHAR(255))='"+ data['phone']+"'")
                    .andWhereRaw("CAST(AES_DECRYPT(customers.customer_unique_id,'" + encription_key + "') AS CHAR(255))='"+ data['customer_unique_id']+"'");
           break; 
           case "edit_familyMember":
            return knex("customers")
            .update(data)
            // .whereRaw("CAST(AES_DECRYPT(customers.customer_unique_id,'" + encription_key + "') AS CHAR(255))='"+ data['customer_unique_id']+"'")
            .where("customers.id",data['id']);
           break; 
        }
    }

    list_referral(data) {
        console.log("data")
        let columns = {
            id: "customers.id",
            customer_unique_id: knex.raw("CAST(AES_DECRYPT(customers.customer_unique_id,'" + encription_key + "')AS CHAR(255))"),
            first_name: knex.raw("CAST(AES_DECRYPT(customers.first_name,'" + encription_key + "')AS CHAR(255))"),
            last_name: knex.raw("CAST(AES_DECRYPT(customers.last_name,'" + encription_key + "')AS CHAR(255))"),
            email: knex.raw("CAST(AES_DECRYPT(customers.email,'" + encription_key + "')AS CHAR(255))"),
            phone: knex.raw("CAST(AES_DECRYPT(customers.phone,'" + encription_key + "')AS CHAR(50))"),
            status: "customers.status"
        };
        let obj = knex.select(columns)
            .from("customers")
            .where("customers.is_verified", 1)
            .whereBetween('user_type_id', [2, 3]);
            // is_verified = 1,user_type_id == 2 3 

        return obj
    }

    get_family_list(data) {
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
            customer_unique_id: knex.raw("CAST(AES_DECRYPT(family.customer_unique_id,'" + encription_key + "') AS CHAR(255))"),
           

        };
        let obj = knex.select(columns)
            .from("customers as family")
            .join('customers as referrer', 'family.referrer_id', 'referrer.id')
            .join('master_user_type', 'referrer.user_type_id', 'master_user_type.id')

            // .andWhere("customers.status",1);

        if (data.limit) {
            obj.limit(data['limit'])
        }
        if (data.offset != 0) {
            obj.offset(data['offset'])
        }

        return obj;
    }

    async updateCustomer(form_data) {

        let data = { status: form_data.status }
        
        let obj = knex("customers").update(data).where("customers.id", form_data['customer_id']);

        return obj
    }



    async addFamily(form_data){
    
        let allowed = 0;
        let allowedData;
        let familyCount;
        let email = await query.addFamily("add_family_email_exist",form_data);
        console.log("email",email)

        if(email.length>0){
            return response.failed("family_email_exist");
        }
        let phone = await query.addFamily("add_family_phone_exist",form_data);
        console.log("phone",phone)

        if(phone.length>0){
            return response.failed("family_phone_exist");
        }
        let customers = await query.addFamily("get_customer_id",form_data);
        console.log("customers",customers)

        if(customers.length>0){
            form_data['referrer_id'] = customers[0].id;
        }
        console.log("form",form_data)
        familyCount = await query.addFamily("get_family_count",form_data);
        if(customers[0].type=="Owner"){
            allowedData = await query.addFamily("get_owner_property_type",form_data);
            console.log("allowedData",allowedData)
            if(allowedData.length>0 && allowedData[0].property_type=="Commercial"){
                allowed=3;
            } else if(allowedData.length>0 && allowedData[0].property_type=="Residential"){
                allowed=10;
            }
        } else {
            allowedData = await query.addFamily("get_tenant_property_type",form_data);
            console.log("allowedData",allowedData)
            if(allowedData.length>0 && allowedData[0].property_type=="Commercial"){
                allowed=3;
            } else if(allowedData.length>0 && allowedData[0].property_type=="Residential"){
                allowed=10;
            }
        }
        let insert_family_data = await this.format_insert_family(form_data);
        console.log("GGGGGGGGGGGGGGGGGGGGGGGGGGGG : ",allowedData,allowed,familyCount)
        if((allowed-familyCount[0].family_count)>0){
            let family = await query.addFamily("add_family",insert_family_data);
            if(family.length>0){
                await knex("cc_account_summary").insert({customer_id: family[0]});
                return response.success("family_created", family); 
            } else {
                return response.failed("family_created_failed");
            }
        } else {
            return response.failed("family_threshold");
        }
    }

    async list_family(form_data){
        let families = await query.list_family("list_family",form_data);
        if(families.length>0){
            return response.success("family_found", families); 
        } else {
            return response.failed("family_not_found");
        }
    }

    async deleteFamily(form_data){
        let customerId = await query.deleteFamily("get_customer_id",form_data);
        if(customerId.length==0){
            return response.failed("referrer_does_not_exist");
        } else {
            form_data['referrer_id'] = customerId[0].id;
        }
        let familyId = await query.deleteFamily("family_exist",form_data);
        if(familyId.length==0){
            return response.failed("family_does_not_exist");
        } else {
            form_data['id'] = familyId[0].id;
        }
        let family = await query.deleteFamily("delete_family",form_data);
        return response.success("family_deleted");
    }


        
    async format_insert_family(record){
        let userTypeId = await knex('master_user_type').select('id').where('master_user_type.name',"Family");
        return {
            customer_unique_id: knex.raw("AES_ENCRYPT('" + (Math.floor(1000000000 + Math.random() * 9000000000)) + "', '" + encription_key + "')"),
            first_name: knex.raw("AES_ENCRYPT('" + record['first_name'] + "', '" + encription_key + "')"),
            last_name: knex.raw("AES_ENCRYPT('" + record['last_name'] + "', '" + encription_key + "')"),
            email: knex.raw("AES_ENCRYPT('" + record['email'] + "', '" + encription_key + "')"),
            phone: knex.raw("AES_ENCRYPT('" + record['phone'] + "', '" + encription_key + "')"),
            dob:record.dob,
            gender:record.gender,
            referrer_relation:record.referrer_relation,
            referrer_id:record.referrer_id,
            user_type_id: Number(userTypeId[0]['id']),
            status: 1
        }
    }

    async get_total_familyList_count(){

        return knex.select({total_record: knex.raw("COUNT(*)")})
        .from("customers as family")
        .join('customers as referrer', 'family.referrer_id', 'referrer.id')
        .join('master_user_type', 'referrer.user_type_id', 'master_user_type.id') 
        
        // knex('customers')
        //     .select( {total_record: knex.raw("COUNT(*)")})
        //     .leftJoin("master_user_type","master_user_type.id","=","customers.user_type_id")
            // .where("customers.id",data['referrer_id'])
        // return knex("master_property")
        // .select({ total_record: knex.raw("COUNT(*)") })
    }



}
