let knex = require("../../../../../config/knex");
let config = require("../../../../../config/config");
let encription_key = config.encription_key;
module.exports = class PropertyModel {

    /**
     * @description
     * @author 
     * @param {*} data
     * @returns
     */
    getProperty(data) {
        return knex("master_property")
            .select('*')
            .where(data.where)
    }




    /**
    * @description
    * @author
    * @param {*} data
    * @returns
    */
    get_property_list(data) {

        let columns = {
            oam_id: "customers.id",
            first_name: knex.raw("CAST(AES_DECRYPT(customers.first_name,'" + encription_key + "')AS CHAR(255))"),
            last_name: knex.raw("CAST(AES_DECRYPT(customers.last_name,'" + encription_key + "')AS CHAR(255))"),
            email: knex.raw("CAST(AES_DECRYPT(customers.email,'" + encription_key + "')AS CHAR(255))"),
            phone: knex.raw("CAST(AES_DECRYPT(customers.phone,'" + encription_key + "')AS CHAR(50))"),
            property_type_id: "master_property_type.id",
            property_type_name: "master_property_type.name",
            property_type_code: "master_property_type.code",
            property_code: "master_property.property_code",
            property_name: 'master_property.property_name',
            unit_no: 'master_unit.unit_no',
            property_id: "master_property.id",
            hot_selling: "master_property.hot_selling",
            sale_amount: "unit_transactions.sale_amount",
            property_elevation_id: "master_property.property_elevation_id",
            no_of_units: "master_property.property_elevation_id",
            no_of_parking_spaces: "master_property.no_of_parking_spaces",
            latitude: "master_property.latitude",
            longitude: "master_property.longitude",
            property_elevation_id: "master_property_elevation.id",
            property_elevation_name: "master_property_elevation.name",
            property_elevation_code: "master_property_elevation.code",
            building_name:"master_building.name",
            imgPath: knex.raw("GROUP_CONCAT(property_has_images.path)"),  
            
        };
        let obj = knex.select(columns)
            .from("master_property")
            .join('customers', 'customers.id', 'master_property.oam_id')
            .leftJoin('master_unit', 'master_unit.id', '=','master_property.id')
            .leftJoin('unit_transactions', 'unit_transactions.unit_id', '=','master_unit.id')
            .leftJoin('master_building', 'master_building.id', '=','master_unit.building_id')
            .leftJoin('property_has_images', 'property_has_images.property_id', 'master_property.id')
            .leftJoin('master_property_type', 'master_property.property_type_id', '=', 'master_property_type.id')
            .leftJoin('master_property_elevation', 'master_property.property_elevation_id', '=', 'master_property_elevation.id')
          


        if (data['oam_name'])
            obj.whereRaw("concat(CAST(AES_DECRYPT(customers.first_name,'" + encription_key + "') AS CHAR(255)),'',CAST(AES_DECRYPT(customers.last_name,'" + encription_key + "') AS CHAR(255))) like '%" + data['oam_name'] + "%'")    
        if (data['property_code']) {
            obj.where("master_property.property_code", "like", "%" + data['property_code'] + "%")
            // .leftJoin('master_property_type', 'master_property.property_type_id', '=', 'master_property_type.id') ;
        }
        if(data['property_name']){
            obj.where("master_property.property_name", "like", "%" + data['property_name'] + "%");
        } 
        if (data['oam_id']) {
            obj.where('master_property.oam_id', data['oam_id'])
        }
        if (data['building_id']) {
            obj.where('master_building.id', data['building_id'])
        }
        if (data['property_type']) {
            obj.where('master_property.property_type_id', data['property_type'])
        }
        if (data['unit_no']) {
            obj.where("master_unit.unit_no", data['unit_no'])
        }

        // if (data.limit) {
        //     obj.limit(data['limit'])
        // }
        // if (data.offset != 0) {
        //     obj.offset(data['offset'])
        // }
        return obj.groupBy('master_building.id','master_unit.id').orderBy("master_property.id", 'desc');;
    }

    get_unit_transaction(data) {
        let columns = {
            id: "unit_transactions.id",
            unit_id: "master_unit.id",
            owner_name: knex.raw("CONCAT(CAST(AES_DECRYPT(owner.first_name,'" + encription_key + "') AS CHAR(255)),' ',CAST(AES_DECRYPT(owner.last_name,'" + encription_key + "') AS CHAR(255)))"),
            tenant_name: knex.raw("CONCAT(CAST(AES_DECRYPT(tenant.first_name,'" + encription_key + "')AS CHAR(255)),' ',CAST(AES_DECRYPT(tenant.last_name,'" + encription_key + "')AS CHAR(255)))"),
            building_name: "master_building.name",
            property_name: "master_property.property_name",
            unit_no: "master_unit.unit_no",
            unit_code: "master_unit.unit_code",
            unit_type: "unit_transactions.unit_type",
            sale_amount: "unit_transactions.sale_amount",
            rent_amount: "unit_transactions.rent_amount",
            no_of_rooms: "unit_transactions.no_of_rooms",
            no_of_bathrooms: "unit_transactions.no_of_bathrooms",
            furnishing_name: "master_furnishing.name",
            title: "unit_transactions.title",
            detailed_title: "unit_transactions.detailed_title",
            description: "unit_transactions.description",
            detailed_description: "unit_transactions.detailed_description",
            status: "unit_transactions.status"
            // imgPath: knex.raw("CONCAT(unit_has_images.path)") 
        };
        let obj = knex("master_unit").select(columns)
            .leftJoin('customers', 'customers.id', 'master_unit.customer_id')
            .leftJoin('customers as owner', 'owner.id', 'master_unit.customer_id')
            .leftJoin('customers as tenant', 'tenant.id', 'master_unit.tenant_customer_id')
            .join('unit_transactions', 'unit_transactions.unit_id', 'master_unit.id')
            .leftJoin('master_building', 'master_building.id', 'master_unit.building_id')
            .leftJoin('master_property', 'master_property.id', 'master_building.property_id')
            .leftJoin('master_furnishing', 'master_furnishing.id', 'unit_transactions.furnishing_id')
        // .leftJoin('unit_has_images','unit_has_images.unit_id','unit_transactions.id')
        obj.where("unit_transactions.status", 1);
        if (data['unit_no']) {
            obj.where("master_unit.unit_no", data['unit_no'])
        }
        if (data['property_name']) {
            obj.where("master_property.property_name", "like", "%" + data['property_name'] + "%")
        }
        if (data['building_name']) {
            obj.where("master_building.name", "like", "%" + data['building_name'] + "%")
        }
        if (data['owner_name']) {
            obj.whereRaw("concat(CAST(AES_DECRYPT(owner.first_name,'" + encription_key + "') AS CHAR(255)),' ',CAST(AES_DECRYPT(owner.last_name,'" + encription_key + "') AS CHAR(255))) like '%" + data['owner_name'] + "%'")
        }
        return obj.groupBy("master_building.id","master_unit.id","master_property.id").orderBy("unit_transactions.id", 'DESC');
    }

    update_unit_transaction(type, data) {
        switch (type) {
            case "transaction":
                return knex("unit_transactions").update({ status: 0 }).where("unit_transactions.id", data['id']);
                break;
            case "unit":
                return knex("master_unit").update({ unit_type: "none" }).where("master_unit.id", data['unit_id']);
                break;
        }
    }

    updateHotSelling(data) {
        return knex("master_property").update({ hot_selling: data.hot_selling }).where("master_property.id", data['id']);
    }



    updateHotSelling(data) {
        return knex("master_property").update({ hot_selling: data.hot_selling }).where("master_property.id", data['id']);
    }


    updateUnitMaster(type, data) {
        switch (type) {
            case "update_unit_status":
                return knex("unit_transactions").update({ status: 0 }).where("unit_transactions.unit_id", data['unit_id']);
                break;
            case "create_transaction":
                return knex("unit_transactions").insert(data);
                break;
            case "master_unit":
                return knex("master_unit").update(data).where("master_unit.id", data['id']);
                break;
            case "create_amenity":
                return knex("unit_has_amenities").insert(data);
                break;
        }

    }



    update_property_master(data) {
        return knex("master_property").update(data).where("master_property.id", data['id']);
    }

    InsertUnitImage(data) {

        return knex.batchInsert("unit_has_images", data, 500);
    }

    InsertPropertyImage(data) {

        return knex.batchInsert("property_has_images", data, 500);
    }

    async InsertPropertyAmenities(data, id) {

        await knex("property_has_amenities").update({ status: 0 }).where("property_has_amenities.property_id", id);
        return await knex.batchInsert("property_has_amenities", data, 500);
    }

    get_update_unit_data(query_type) {
        let columns = {}
        switch (query_type) {
            case "get_furnishing_list":
                columns = {
                    id: "master_furnishing.id",
                    name: "master_furnishing.name",
                    code: "master_furnishing.code"
                }
                let query = knex('master_furnishing')
                    .select(columns)
                return query;
                break;
            case "get_amenity_list":
                columns = {
                    id: "master_amenities.id",
                    name: "master_amenities.name",
                    code: "master_amenities.code"
                }
                return knex('master_amenities')
                    .select(columns)
                break;
            case "get_broker_list":
                columns = {
                    id: "master_broker.id",
                    name: "master_broker.name",
                    // code:"master_broker.code"
                }
                let query1 = knex('master_broker')
                    .select(columns)
                return query1;
                break;
        }
    }


    updateUnitType(data) {
        return knex("master_unit").update({ unit_type: data.unit_type }).where("master_unit.id", data['id']);
    }
    getBuilding(data) {
        let columns = {
            id: "master_building.id",
            name: "master_building.name",
            code: "master_building.code",
            broker_name: "master_broker.name"


        };
        let obj = knex.select(columns)
            .from("master_building")
            .leftJoin('master_broker', 'master_broker.id', 'master_building.broker_id')
            .where("master_building.property_id", data['property_id'])
            .andWhere('master_building.status', 1)
            .groupBy("master_building.code");

        if (data['name']) {
            obj.where("master_building.name", "like", "%" + data['name'] + "%")
        }
        if (data['code']) {
            obj.where("master_building.code", "like", "%" + data['code'] + "%")
        }
        if (data['broker_name']) {
            obj.where("master_broker.name", "like", "%" + data['broker_name'] + "%")
        }

        return obj.groupBy("master_building.property_id");
    }

    get_Building_by_id(data) {
        let columns = {
            id: "master_building.id",
            name: "master_building.name",
            code: "master_building.code",
            // broker_name: "master_building.na"
        };
        return knex("master_building")
            .select(columns)
            .groupBy('master_building.id')
            .where('master_building.id', data);
    }

    getUnitbyid(data) {
        let columns = {
            id: knex.raw("distinct master_unit.id"),
            unit_no: "master_unit.unit_no",
            reference_number: "master_unit.reference_number",
            owner_name: knex.raw("CONCAT(CAST(AES_DECRYPT(customers.first_name,'" + encription_key + "') AS CHAR(255)),' ',CAST(AES_DECRYPT(customers.last_name,'" + encription_key + "') AS CHAR(255)))"),
            detailed_description: 'ut.detailed_description',
            unit_type: 'ut.unit_type',
            amount: knex.raw(`case when ut.unit_type = 'rent' then ut.rent_amount else ut.sale_amount end`),
            no_of_rooms: 'ut.no_of_rooms',
            no_of_bathrooms: 'ut.no_of_bathrooms',
            detailed_title: 'ut.detailed_title',
            description: 'ut.description',
            title: 'ut.title',
            furnishing_id: 'ut.furnishing_id',
            amenity_id: knex.raw('group_concat(ua.amenity_id)'),
            unit_size: 'ut.unit_size'
        };
        let obj = knex.select(columns)
            .from("master_unit")
            .join('customers', 'customers.id', 'master_unit.customer_id')
            .leftJoin('unit_transactions as ut', function () {
                this.on('ut.unit_id', 'master_unit.id')
                    .on('ut.status', 1)
            }).leftJoin('unit_has_amenities as ua', 'ua.unit_id', 'ut.id')
            .groupBy('master_unit.id')
            .where("master_unit.id", data['id']);
        return obj;
    }

    // getUnitMasterImages(data) {
    //     // return obj;
    //    return obj.groupBy("master_building.property_id");
    // }
    total_building_list(data) {
        let columns = {
            id: "master_building.id",
            name: "master_building.name",
            code: "master_building.code"


        };
        let key = "";
        let value = "";
        if (data['property_id'] == 'undefined' || data['property_id'] == "" || data['property_id'] == undefined) {
            key = 1;
            value = 1;

        } else {
            key = "master_building.property_id";
            value = data['property_id'];

        }
        let obj = knex.select(columns)
            .from("master_building")
            .where(key, value)
            .andWhere('master_building.status', 1)
            .groupBy("master_building.code");

        if (data['name']) {
            obj.where("master_building.name", "like", "%" + data['name'] + "%")
        }
        if (data['code']) {
            obj.where("master_building.code", "like", "%" + data['code'] + "%")
        }
        return obj.groupBy("master_building.property_id");
    }

    async  getUnitMasterImages(data) {

        let trns_id = await knex('unit_transactions').select({ id: "id" })
            .where("unit_transactions.unit_id", data['id'])
            .andWhere('unit_transactions.status', 1);

        let unit_ids = data['id'];
        let transaction_id = JSON.parse(JSON.stringify(trns_id));
        if (transaction_id.length > 0) {
            if (transaction_id[0].id != undefined && transaction_id[0].id != 'undefined' && transaction_id[0].id != '') {
                unit_ids = transaction_id[0].id;
            }
        }
        console.log("trns_id*=", trns_id);
        return await knex('unit_has_images').select("*")
            .where("unit_has_images.unit_id", unit_ids)
            .andWhere('unit_has_images.status', 1)


    }


    view_property_images(data) {
        return knex('property_has_images').select("*")
            .where("property_has_images.property_id", data['id'])
            .andWhere('property_has_images.status', 1)


    }

   async view_unit_images(data) {



        let trns_id = await knex('unit_transactions').select({ id: "id" })
            .where("unit_transactions.unit_id", data['id'])
            .andWhere('unit_transactions.status', 1);

        let unit_ids = data['id'];
        let transaction_id = JSON.parse(JSON.stringify(trns_id));
        if (transaction_id.length > 0) {
            if (transaction_id[0].id != undefined && transaction_id[0].id != 'undefined' && transaction_id[0].id != '') {
                unit_ids = transaction_id[0].id;
            }
        }
        console.log("trns_id*=", trns_id);
        return await knex('unit_has_images').select("*")
            .where("unit_has_images.unit_id", unit_ids)
            .andWhere('unit_has_images.status', 1)


        // return knex('unit_has_images').select("*")
        // .where("unit_has_images.unit_id", data['id'])
        // .andWhere('unit_has_images.status', 1)
    }


    getUnit(data) {
   
        let columns = {
            id: "master_unit.id",
            customer_name: knex.raw("CONCAT(CAST(AES_DECRYPT(customers.first_name,'" + encription_key + "') AS CHAR(255)),' ',CAST(AES_DECRYPT(customers.last_name,'" + encription_key + "') AS CHAR(255)))"),
            building_name: "master_building.name",
            building_code: "master_building.code",
            // sale_amount: "master_unit.sale_amount",
            // rent_amount: "master_unit.rent_amount",
            unit_type: "master_unit.unit_type",
            unit_no: "master_unit.unit_no",
            reference_number:"master_unit.reference_number",
            // title: "master_unit.title",
            // detailed_title: "master_unit.detailed_title",
            // description: "master_unit.description",
            // detailed_description: "master_unit.detailed_description",
            // no_of_rooms: "master_unit.no_of_rooms",
            // no_of_bathrooms: "master_unit.no_of_bathrooms",
            broker_name: "master_broker.name",
        };
        let obj = knex.select(columns)
            .from("master_unit")
            .join('customers', 'customers.id', 'master_unit.customer_id')
            .join('master_building', 'master_building.id', 'master_unit.building_id')
            .leftJoin('master_broker', 'master_broker.id', 'master_building.broker_id')
            .where("master_unit.building_id", data['building_id'])
            .andWhere('master_unit.status', 1)

        if (data['customer_name']) {
            obj.whereRaw("concat(CAST(AES_DECRYPT(customers.first_name,'" + encription_key + "') AS CHAR(255)),'',CAST(AES_DECRYPT(customers.last_name,'" + encription_key + "') AS CHAR(255))) like '%" + data['customer_name'] + "%'")
        }
        if (data['building_name']) {
            obj.where("master_building.name", "like", "%" + data['building_name'] + "%")
        }
        if (data['building_code']) {
            obj.where("master_building.code", "like", "%" + data['building_code'] + "%")
        }
        if (data['broker_name']) {
            obj.where("master_broker.name", "like", "%" + data['broker_name'] + "%")
        }

        if (data['reference_number']) {

            obj.where("master_unit.reference_number", "like", "%" + data['reference_number'] + "%")
        }
        
        return obj;
    }


    get_master_property_type_List() {
        let obj = knex.select("*")
            .from("master_property_type")

        return obj
    }


    getAmenityList() {
        let obj = knex.select("*")
            .from("master_amenities")

        return obj
    }

    getBrokerList() {
        let obj = knex.select("*")
            .from("master_broker")

        return obj
    }


    get_property_elevation() {
        let obj = knex.select("*")
            .from("master_property_elevation")

        return obj
    }

    get_total_master_property_type_count() {
        return knex("master_property_type")
            .select({ total_record: knex.raw("COUNT(*)") })

    }





    /**
     * 
     * Get property by idlet customerModel = new (require("../models/customers_model." + config.db_driver))();

     */
    get_property_by_id(data) {


        //"messageIds": knex.raw("GROUP_CONCAT(messageId)"),

        let columns = {
            id: 'master_property.id',
            property_code: 'master_property.property_code',
            property_name: 'master_property.property_name',
            oam_id: 'master_property.oam_id',
            property_type_id: 'master_property.property_type_id',
            property_elevation_id: 'master_property.property_elevation_id',
            no_of_units: 'master_property.no_of_units',
            no_of_parking_spaces: 'master_property.no_of_parking_spaces',
            latitude: 'master_property.latitude',
            longitude: 'master_property.longitude',
            hot_selling: 'master_property.hot_selling',
            address_line_1: 'master_property.address_line_1',
            address_line_2: 'master_property.address_line_2',
            area: 'master_property.area',
            country_id: 'master_property.country_id',
            emirate_id: 'master_property.emirate_id',
            // amenity_id: knex.raw("GROUP_CONCAT(DISTINCT property_has_amenities.amenity_id)"),
            // amentiy_status: knex.raw("GROUP_CONCAT(DISTINCT property_has_amenities.status)"),
            // img_path:knex.raw("GROUP_CONCAT(DISTINCT property_has_images.path)"),
            // image_status:knex.raw("GROUP_CONCAT( DISTINCT property_has_images.status)")
        };
        return knex("master_property")
            .select(columns)
            // .leftJoin('property_has_amenities', 'property_has_amenities.property_id', '=', 'master_property.id')
            // .leftJoin('property_has_images', 'property_has_images.property_id', '=', 'master_property.id')
            .groupBy('master_property.id')
            .where('master_property.id', data);


    }

    update_building(type, data) {
        switch (type) {
            case "building":
                return knex("master_building").update(data).where("master_building.id", data['id']);
                break;
            case "broker":
                return knex("building_has_brokers").insert(data);
                break;
        }
    }


    async get_amenitydata(data) {

        let columns = {
            "id": "id",
            "property_id": "property_id",
            "amenity_id": "amenity_id"
        }
        return knex("property_has_amenities")
            .select(columns)
            .where('status', 1)
            .andWhere('property_id', data);
    }

    async get_amenitydata(data) {

        let columns = {
            "id": "id",
            "property_id": "property_id",
            "amenity_id": "amenity_id"
        }
        return knex("property_has_amenities")
            .select(columns)
            .where('status', 1)
            .andWhere('property_id', data);
    }


    delete_img_by_id(data) {
        return knex("unit_has_images").update({ status: 0 }).where("id", data['id']);
    }

    delete_property_img_by_id(data) {
        return knex("property_has_images").update({ status: 0 }).where("id", data['id']);
    }

    delete_unit_img_by_id(data) {
        return knex("unit_has_images").update({ status: 0 }).where("id", data['id']);
    }

    // get_total_property_count() {
    //     return knex("master_property")
    //         .select({ total_record: knex.raw("COUNT(*)") })
    // }
    view_amenity_images(data) {
        let columns = {
            id: "master_amenities.id",
            name: "master_amenities.name",
            path: "master_amenities.image_path"
        }
        return knex('unit_transactions').select(columns)
            .leftJoin('master_unit', 'master_unit.id', '=', 'unit_transactions.unit_id')
            .leftJoin('unit_has_amenities', 'unit_has_amenities.unit_id', '=', 'master_unit.id')
            .leftJoin('master_amenities', 'master_amenities.id', '=', 'unit_has_amenities.amenity_id')
            .where("unit_transactions.id", data['id']).andWhere("master_amenities.status", 1);
    }
    delete_amenity_img_by_id(data) {
        return;
        // return knex("unit_has_images").update({status:0}).where("id",data['id']);        
    }


}
