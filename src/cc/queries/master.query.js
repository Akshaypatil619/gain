const knex = require('../../../config/knex');
let config = require("../../../config/config");
let encription_key = config.encription_key;
let geo_radius = config.geo_radius;
module.exports = class MasterQuery {


    constructor() { }

    get_master_property_type() {

        const columns = {

            id: 'master_property_type.id',
            code: 'master_property_type.code',
            name: 'master_property_type.name'
        }

        let query_obj = knex('master_property_type')
            .select(columns)
            .from('master_property_type')
        return query_obj;
    }

    get_master_furnishing() {

        const columns = {

            id: 'master_furnishing.id',
            code: 'master_furnishing.code',
            name: 'master_furnishing.name'
        }

        let query_obj = knex('master_furnishing')
            .select(columns)
            .from('master_furnishing')
        return query_obj;
    }

    get_master_amenities() {
        const columns = {

            id: 'master_amenities.id',
            code: 'master_amenities.code',
            name: 'master_amenities.name',
            image_path: 'master_amenities.image_path'
        }
        let query_obj = knex('master_amenities')
            .select(columns)
            .from('master_amenities')

        return query_obj;
    }


    get_min_max_price() {
        return knex("unit_transactions").select(knex.raw("MIN(LEAST(rent_amount, sale_amount)) AS min ,MAX(GREATEST(rent_amount, sale_amount)) AS max")).where("unit_transactions.status",1);
    }

    get_min_max_bedroom(){
        return knex("unit_transactions").select(knex.raw("MIN(no_of_rooms) AS min ,MAX(no_of_rooms) AS max")).where("unit_transactions.status",1);
    }

    get_property_list(columns, data) {

        let query_obj = knex('master_property')
            .select(columns)
            .leftJoin('master_property_type', 'master_property_type.id', 'master_property.property_type_id')
            .leftJoin('master_property_elevation', 'master_property_elevation.id', 'master_property.property_elevation_id')
            .leftJoin('property_has_images', function () {
                this.on('property_has_images.property_id', 'master_property.id')
                    .on('property_has_images.status', 1);
            })
            .join('master_building', 'master_building.property_id', 'master_property.id')
            .join('master_unit', 'master_unit.building_id', 'master_building.id')
            .join('unit_transactions', 'unit_transactions.unit_id', 'master_unit.id')
            // .leftJoin('unit_has_images', 'unit_has_images.unit_id', 'unit_transactions.id')

            .leftJoin('unit_has_images', function () {
                this.on('unit_has_images.unit_id', 'unit_transactions.id')
                    .on('unit_has_images.status', 1);
            })

            .leftJoin('unit_has_amenities', 'unit_has_amenities.unit_id', 'unit_transactions.id')
            .leftJoin('master_amenities', 'master_amenities.id', 'unit_has_amenities.amenity_id')
            .where('unit_transactions.status', 1);
        // .join('master_broker','master_broker.id','master_building.broker_id')
        // .whereIn("master_unit.unit_type",["rent","sale"]);
        if (data.search)
            query_obj.whereRaw('(master_property.property_name like "%' + data.search + '%" OR master_property.address_line_1 like "%' + data.search + '%" OR master_property.area like "%' + data.search + '%")');
        if (data.property_type_id)
            query_obj.whereRaw('master_property.property_type_id IN (' + data.property_type_id + ')');
        if (data.furnishing_id)
            query_obj.whereRaw('unit_transactions.furnishing_id IN (' + data.furnishing_id + ')');
        if (data.amenitiy_id)
            query_obj.whereRaw('unit_has_amenities.amenity_id IN (' + data.amenitiy_id + ')');
        if (data.bedroom)
            query_obj.whereRaw('unit_transactions.no_of_rooms IN (' + data.bedroom + ')');
        if (data.unit_type) {
            query_obj.where('unit_transactions.unit_type', data['unit_type']);
        }
        if (data.property_id) {
            query_obj.where('master_property.id', data['property_id']);
        } else {
            query_obj.whereIn('unit_transactions.unit_type', ["sale", "rent"]);
        }
        if (data.price_range)
            query_obj.whereRaw("CASE WHEN unit_transactions.unit_type='rent' THEN unit_transactions.rent_amount between " + data.price_range.split(',')[0] + " AND " + data.price_range.split(',')[1] + " WHEN unit_transactions.unit_type='sale' THEN unit_transactions.sale_amount between " + data.price_range.split(',')[0] + " AND " + data.price_range.split(',')[1] + " END ");
        

        if (data['latitude'] != null && data['longitude'] != null) {
            query_obj.having('distance', '<=', geo_radius).orderBy("distance", "ASC");
        }
        // sort_price: asc
        // sort_alphabet: desc
        if (data['sort_price'] && data['sort_alphabet']) {
           query_obj.orderBy(knex.raw(`case when unit_transactions.unit_type = 'rent' then unit_transactions.rent_amount
           else unit_transactions.sale_amount end`), data['sort_price']).catch((err) => { console.log("GGGGGGGGGGGGGGGGGGGGGGGG : ", err) });
        } else if (data['sort_alphabet']) {
           query_obj.orderBy("master_property.property_name", data['sort_alphabet']).catch((err) => { console.log("GGGGGGGGGGGGGGGGGGGGGGGG : ", err) });
        } else if (data['sort_price']) {
           query_obj.orderBy(knex.raw(`case when unit_transactions.unit_type = 'rent' then unit_transactions.rent_amount
             else unit_transactions.sale_amount end`), data['sort_price']).catch((err) => { console.log("GGGGGGGGGGGGGGGGGGGGGGGG : ", err) });

        } else {
            query_obj.orderBy('master_property.property_name').catch((err) => { console.log("GGGGGGGGGGGGGGGGGGGGGGGG : ", err) });

        }
        if (data.limit)
            query_obj.limit(data.limit);
        if (data.offset) {
            query_obj.offset(data.offset);
        }
        // query_obj.groupBy('master_property.id')
        query_obj.groupBy('master_unit.id')
        return query_obj;
    }

    get_property_suggession(columns, data) {

        let query_obj = knex('master_property')
            .select(columns)
            .join('master_building', 'master_building.property_id', 'master_property.id')
            .join('master_unit', 'master_unit.building_id', 'master_building.id')
            .join('unit_transactions', 'unit_transactions.unit_id', 'master_unit.id')
            .where('unit_transactions.status', 1)
            .groupBy('master_property.id')
        if (data.search)
            query_obj.whereRaw('(master_property.property_name like "%' + data.search + '%" OR master_property.area like "%' + data.search + '%" OR master_property.address_line_1 like "%' + data.search + '%")');

        if (data.unit_type) {
            query_obj.where('unit_transactions.unit_type', data['unit_type']);
        } else {
            query_obj.whereIn('unit_transactions.unit_type', ["sale", "rent"]);
        }
        if (data['latitude'] != null && data['longitude'] != null) {
            query_obj.groupBy('master_property.id').having('distance', '<=', geo_radius).orderBy(['distance', 'master_property.property_name']);
        } else {
            query_obj.groupBy('master_property.id').orderBy('master_property.property_name', "ASC");
        }
        return query_obj;
        // .groupBy('master_property.id').having('distance', '<=', geo_radius)
        //     .orderBy(['distance', 'master_property.property_name']);  

    }

    get_property_type(columns, data) {
        let query_obj = knex('master_property_type')
            .select(columns)
            .orderBy('master_property_type.id', 'desc');

        if (data.limit)
            query_obj.limit(data.limit);
        if (data.offset)
            query_obj.offset(data.offset);

        return query_obj;
    }

    get_unit_list(columns, data) {
        let query_obj = knex('master_unit')
            .select(columns)
            .leftJoin('master_building', 'master_building.id', 'master_unit.building_id')
            .leftJoin('master_property', 'master_property.id', 'master_building.property_id')
            .leftJoin('customers', 'customers.id', 'master_unit.customer_id')
            .where('master_property.id', data.property_id)
            .orderBy('master_unit.id', 'desc');

        if (data.limit)
            query_obj.limit(data.limit);
        if (data.offset)
            query_obj.offset(data.offset);

        return query_obj;
    }

    get_customer_id(customer_unique_id) {
        return knex('customers').select('customers.id as id', 'master_user_type.code as user_type')
            .join('master_user_type', 'master_user_type.id', 'customers.user_type_id')
            .whereRaw(`CAST(AES_DECRYPT(customers.customer_unique_id, '${encription_key}') AS CHAR(255)) = '${customer_unique_id}'`);
    }

    async get_rent_unit_list(customer_id) {
        const columns = {
            id: 'master_unit.id',
            unit_no: 'unit_no',
            building_name: 'master_building.name',
            property_name: 'master_property.property_name',
            emirate: 'master_emirate.name',
            address_line_1: 'address_line_1',
            address_line_2: 'address_line_2'
        }

        let unitDetails = await knex('master_unit').select(columns)
            .join('master_building', 'master_building.id', 'master_unit.building_id')
            .join('master_property', 'master_property.id', 'master_building.property_id')
            .leftJoin('master_emirate', 'master_emirate.id', 'master_property.emirate_id')
            .where('master_unit.customer_id', customer_id)
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
    }

    unit_rent_list(data) {
        let unitColumns = {
            id: "master_unit.id",
            text: knex.raw("CONCAT(master_property.property_name, ' - ',master_building.name, ' - ',master_unit.title)"),
            unit_type: "master_unit.unit_type",
            tenant_joining_date: "customers.tenant_joining_date",
            tenant_leaving_date: "customers.tenant_leaving_date"
        }
        return knex('master_unit')
            .select(unitColumns)
            .leftJoin('customers', 'customers.id', 'master_unit.tenant_customer_id')
            .join('master_building', 'master_building.id', 'master_unit.building_id')
            .join('master_property', 'master_property.id', 'master_building.property_id')
            .whereIn("master_unit.unit_type", ["rent", "rent_occupied"])
            .andWhere("master_unit.customer_id", data['owner_id']);
    }
    get_broker_list(type, data) {
        switch (type) {
            case "broker_list":
                const brokerColumns = {
                    building_code: 'master_building.code',
                    broker_name: 'master_broker.name',
                    broker_email: 'master_broker.email',
                    broker_phone: 'master_broker.phone',
                    broker_role_id: 'master_broker.role_id',
                    broker_orn_number: 'master_broker.orn_number',
                    broker_address: 'master_broker.address',
                    broker_experience: 'master_broker.experience',
                    broker_image_path: 'master_broker.image_path',
                    reference_number: 'master_broker.reference_number',
                    permit_number: 'master_broker.permit_number',
                    languages_known: 'master_broker.languages'
                };
                let brokerColumnsObj = knex('master_building')
                    .select(brokerColumns)
                    .leftJoin('building_has_brokers', function () {
                        this.on('building_has_brokers.building_id', 'master_building.id')
                            .on('building_has_brokers.status', 1)
                    }).leftJoin('master_broker', 'master_broker.id', 'building_has_brokers.broker_id')
                if (data['building_code']) {
                    brokerColumnsObj.where('master_building.code', data.building_code)
                }
                return brokerColumnsObj.orderBy('master_building.id', 'ASC');
                break;

            case "customer_exist":

                let customerColumns = {
                    customer_id: "customers.id",
                    user_type_id: "customers.user_type_id"
                }
                return knex("customers").select(customerColumns)
                    .whereRaw("CAST(AES_DECRYPT(customers.customer_unique_id,'" + encription_key + "') AS CHAR(255))='" + data['customer_unique_id'] + "'");
                break;

            case "owner_broker_list":
                const ownerBrokerColumns = {
                    customer_id: "master_unit.customer_id",
                    building_code: 'master_building.code',
                    broker_name: 'master_broker.name',
                    broker_email: 'master_broker.email',
                    broker_phone: 'master_broker.phone',
                    broker_role_id: 'master_broker.role_id',
                    broker_orn_number: 'master_broker.orn_number',
                    broker_address: 'master_broker.address',
                    broker_experience: 'master_broker.experience',
                    broker_image_path: 'master_broker.image_path',
                    reference_number: 'master_broker.reference_number',
                    permit_number: 'master_broker.permit_number',
                    languages_known: 'master_broker.languages'
                };
                let ownerBrokerColumnsObj = knex('master_unit')
                    .select(ownerBrokerColumns)
                    .join('master_building', 'master_building.id', 'master_unit.building_id')
                    .leftJoin('building_has_brokers', 'building_has_brokers.building_id', 'master_building.id')
                    .leftJoin('master_broker', 'master_broker.id', 'building_has_brokers.broker_id')
                    .where('master_unit.customer_id', data.customer_id);
                if (data['building_code']) {
                    ownerBrokerColumnsObj.where('master_building.code', data.building_code)
                }
                return ownerBrokerColumnsObj.groupBy(["master_broker.name", "master_building.code"]).orderBy('master_building.id', 'ASC');
                break;

                return knex("customers").select(customerColumns)
                    .whereRaw("CAST(AES_DECRYPT(customers.customer_unique_id,'" + encription_key + "') AS CHAR(255))='" + data['customer_unique_id'] + "'");
                break;


            case "family_parent":
                let familyColumns = {
                    customer_id: "owner.id",
                    user_type_id: "owner.user_type_id"
                }
                return knex("customers as owner").select(familyColumns)
                    .join('customers as family', 'family.referrer_id', 'owner.id')
                    .where("family.id", data['customer_id']);
                break;

            case "tenant_broker_list":
                const tenantBrokerColumns = {
                    customer_id: "master_unit.customer_id",
                    building_code: 'master_building.code',
                    broker_name: 'master_broker.name',
                    broker_email: 'master_broker.email',
                    broker_phone: 'master_broker.phone',
                    broker_role_id: 'master_broker.role_id',
                    broker_orn_number: 'master_broker.orn_number',
                    broker_address: 'master_broker.address',
                    broker_experience: 'master_broker.experience',
                    broker_image_path: 'master_broker.image_path',
                    reference_number: 'master_broker.reference_number',
                    permit_number: 'master_broker.permit_number',
                    languages_known: 'master_broker.languages'
                };
                let tenantBrokerColumnsObj = knex('master_unit')
                    .select(tenantBrokerColumns)
                    .join('master_building', 'master_building.id', 'master_unit.building_id')
                    .leftJoin('building_has_brokers', 'building_has_brokers.building_id', 'master_building.id')
                    .leftJoin('master_broker', 'master_broker.id', 'building_has_brokers.broker_id')
                    .where('master_unit.tenant_customer_id', data.customer_id);
                if (data['building_code']) {
                    tenantBrokerColumnsObj.where('master_building.code', data.building_code)
                }
                return tenantBrokerColumnsObj.groupBy(["master_broker.name", "master_building.code"]).orderBy('master_building.id', 'ASC');
                break;
        }


        // if (data.limit)
        //     query_obj.limit(data.limit);
        // if (data.offset)
        //     query_obj.offset(data.offset);

        // return query_obj;
    }
    addFamily(query_type, data) {
        let columns = "";
        switch (query_type) {
            case "add_family_email_exist":
                return knex("customers").select("customers.id")
                    .whereRaw("CAST(AES_DECRYPT(customers.email,'" + encription_key + "') AS CHAR(255))='" + data['email'] + "'")
                break;

            case "add_family_phone_exist":
                return knex("customers").select("customers.id")
                    .whereRaw("CAST(AES_DECRYPT(customers.phone,'" + encription_key + "') AS CHAR(255))='" + data['phone'] + "'")
                break;

            case "get_customer_id":
                columns = {
                    id: "customers.id",
                    type: "master_user_type.name"
                }
                return knex("customers").select(columns)
                    .join('master_user_type', 'master_user_type.id', 'customers.user_type_id')
                    .whereRaw("CAST(AES_DECRYPT(customers.customer_unique_id,'" + encription_key + "') AS CHAR(255))='" + data['customer_unique_id'] + "'")
                break;

            case "get_family_count":
                columns = {
                    family_count: knex.raw("COUNT(customers.referrer_relation)")
                }
                return knex("customers").select(columns)
                    .where("customers.referrer_id", data['referrer_id']).andWhere("customers.status", 1);
                break;

            case "get_owner_property_type":
                columns = {
                    id: "master_property_type.id",
                    property_type: "master_property_type.name"
                }
                return knex("master_unit").select(columns)
                    .leftJoin('master_building', 'master_building.id', 'master_unit.building_id')
                    .leftJoin('master_property', 'master_property.id', 'master_building.property_id')
                    .leftJoin('master_property_type', 'master_property_type.id', 'master_property.property_type_id')
                    .where("master_unit.customer_id", data['referrer_id'])
                    .andWhere("master_unit.is_default", 1);
                break;

            case "get_tenant_property_type":
                columns = {
                    id: "master_property_type.id",
                    property_type: "master_property_type.name"
                }
                return knex("master_unit").select(columns)
                    .leftJoin('master_building', 'master_building.id', 'master_unit.building_id')
                    .leftJoin('master_property', 'master_property.id', 'master_building.property_id')
                    .leftJoin('master_property_type', 'master_property_type.id', 'master_property.property_type_id')
                    .where("master_unit.tenant_customer_id", data['referrer_id']);
                break;

            case "add_family":
                return knex("customers").insert(data);
                break;
        }
    }
    familyList(query_type, data) {
        switch (query_type) {
            case "get_customer_id":
                return knex("customers").select("customers.id")
                    .whereRaw("CAST(AES_DECRYPT(customers.customer_unique_id,'" + encription_key + "') AS CHAR(255))='" + data['customer_unique_id'] + "'")
                break;

            case "list_family":
                let columns = {
                    // id: "family.id",
                    first_name: knex.raw("CAST(AES_DECRYPT(family.first_name,'" + encription_key + "')AS CHAR(255))"),
                    last_name: knex.raw("CAST(AES_DECRYPT(family.last_name,'" + encription_key + "')AS CHAR(255))"),
                    email: knex.raw("CAST(AES_DECRYPT(family.email,'" + encription_key + "')AS CHAR(255))"),
                    phone: knex.raw("CAST(AES_DECRYPT(family.phone,'" + encription_key + "')AS CHAR(50))"),
                    // referral_phone: knex.raw("CAST(AES_DECRYPT(referrer.phone,'" + encription_key + "')AS CHAR(50))"),
                    // referral_email: knex.raw("CAST(AES_DECRYPT(referrer.email,'" + encription_key + "')AS CHAR(255))"),
                    // referral_type: "master_user_type.name",
                    user_type: "master_user_type.code",
                    // status: "family.status",
                    family_unique_id: knex.raw("CAST(AES_DECRYPT(family.customer_unique_id,'" + encription_key + "') AS CHAR(255))"),
                    // customer_unique_id: knex.raw("CAST(AES_DECRYPT(referrer.customer_unique_id,'" + encription_key + "') AS CHAR(255))"),
                    // referrer_relation :  "family.referrer_relation",
                    dob: "family.dob",
                    gender: "family.gender",
                    is_logged_in: "family.is_logged_in",
                    created_at: "family.created_at",
                    birthday: "family.birthday",
                    anniversary: "family.anniversary",
                    spouse_name: "family.spouse_name",
                    children: "family.children"

                };
                return knex.select(columns)
                    .from("customers as family")
                    .join('customers as referrer', 'family.referrer_id', 'referrer.id')
                    .join('master_user_type', 'family.user_type_id', 'master_user_type.id')
                    .where("family.referrer_id", data['referrer_id'])
                    .andWhere("family.status", 1);
        }
    }
    deleteFamily(query_type, data) {
        switch (query_type) {
            case "get_customer_id":
                return knex("customers").select("customers.id")
                    .whereRaw("CAST(AES_DECRYPT(customers.customer_unique_id,'" + encription_key + "') AS CHAR(255))='" + data['customer_unique_id'] + "'")
                    .andWhere("customers.status", 1)
                    .andWhere("customers.is_logged_in", 1);
                break;

            case "family_exist":
                return knex("customers").select("customers.id")
                    .whereRaw("CAST(AES_DECRYPT(customers.customer_unique_id,'" + encription_key + "') AS CHAR(255))='" + data['family_unique_id'] + "'")
                    .andWhere("customers.status", 1)
                    .andWhere("customers.is_logged_in", 0);
                break;

            case "delete_family":
                return knex("customers").update({ status: 0 }).where("customers.id", data['id']);
                break;
        }
    }

    updateUnitType(query_type, data) {
        switch (query_type) {
            case "customer_exist":
                return knex("customers").select("customers.id")
                    .whereRaw("CAST(AES_DECRYPT(customers.customer_unique_id,'" + encription_key + "') AS CHAR(255))='" + data['customer_unique_id'] + "'")
                    .andWhere("customers.status", 1);
                break;

            case "unit_exist":
                return knex("master_unit").select("master_unit.customer_id")
                    .andWhere("master_unit.id", data['unit_id'])
                break;

            case "update_unit":
                delete data['customer_id'];
                delete data['customer_unique_id'];
                let unit_id = data['unit_id'];
                delete data['unit_id'];
                return knex("master_unit").update(data).where("master_unit.id", unit_id);
                break;
        }
    }



    async consume_promocode(columns, data) {

        let query_obj = await knex('coupon_codes')
            .select(columns)
            .where("coupon_codes.code", data['promocode'])
            .andWhere("coupon_codes.is_used", 0);

        return query_obj;
    }


    async update_promocode(columns, id) {

        let query_obj = await knex('coupon_codes')
            .update(columns)
            .where("coupon_codes.id", id)


        return query_obj;
    }




}