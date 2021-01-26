'use strict';
let knex = require('../../../../../config/knex.js');
let configKey = require("../../../../../config/config");
let encription_key = configKey.encription_key;

module.exports = class ownerModel {
    constructor() { }

    add_owner(query_type, data) {
        switch (query_type) {
            case "add_owner_exist":
                return knex("customers").select("customers.id")
                    // .whereRaw("CAST(AES_DECRYPT(customers.phone,'" + encription_key + "') AS CHAR(255))='"+ data['phone']+"'")
                    .whereRaw("CAST(AES_DECRYPT(customers.email,'" + encription_key + "') AS CHAR(255))='" + data['email'] + "'")
                break;
            case "check_unit":
                return knex("master_unit").select("master_unit.id").where("master_unit.unit_type", "rent").andWhere("master_unit.id", data['unit_id']);
                break;
            case "add_owner":
                return knex("customers").insert(data);
                break;
        }
    }

    get_owner(query_type, data) {
        switch (query_type) {
            case "get_owner":
                let columns = {
                    id: "customers.id",
                    unit_id: "master_unit.id",
                    first_name: knex.raw("CAST(AES_DECRYPT(customers.first_name,'" + encription_key + "') AS CHAR(255))"),
                    last_name: knex.raw("CAST(AES_DECRYPT(customers.last_name,'" + encription_key + "') AS CHAR(255))"),
                    email: knex.raw("CAST(AES_DECRYPT(customers.email,'" + encription_key + "') AS CHAR(255))"),
                    phone: knex.raw("CAST(AES_DECRYPT(customers.phone,'" + encription_key + "') AS CHAR(255))"),
                    property_name: "master_property.property_name",
                    building_name: "master_building.name",
                    unit_name: knex.raw("CONCAT(master_property.property_name, ' - ',master_building.name, ' - ',master_unit.title)"),
                    birthday: "customers.birthday",
                    anniversary: "customers.anniversary",
                    spouse_name: "customers.spouse_name",
                    children: "customers.children",
                    unit_no: "master_unit.unit_no",
                    fav_cuisine: "customers.fav_cuisine",
                    fav_hotel: "customers.fav_hotel",
                    fav_travel_destination: "customers.fav_travel_destination",
                    annual_household_income: "customers.annual_household_income",
                    children_age: "customers.children_age",
                    oam_name: knex.raw("CONCAT(CAST(AES_DECRYPT(oam.first_name,'" + encription_key + "') AS CHAR(255)),' ',CAST(AES_DECRYPT(oam.last_name,'" + encription_key + "') AS CHAR(255)))"),
                    brand_suggestion: "customers.brand_suggestion",
                };
                return knex("customers").select(columns)
                    .leftJoin('master_unit', 'master_unit.customer_id', 'customers.id')
                    .join('master_building', 'master_building.id', 'master_unit.building_id')
                    .join('master_property', 'master_property.id', 'master_building.property_id')
                    .leftJoin("customers as oam", "oam.id", "=", "master_property.oam_id")
                    .where("customers.id", data['id']);
                break;
        }
    }
    edit_owner(query_type, data) {
        switch (query_type) {
            case "edit_owner_exist":
                return knex("customers").select("customers.id")
                    .whereRaw("CAST(AES_DECRYPT(customers.phone,'" + encription_key + "') AS CHAR(255))='" + data['phone'] + "'")
                    .andWhereRaw("customers.id !=" + data['id']);
                break;
            case "edit_owner":
                return knex("customers").update(data).where("customers.id", data['id']);
                break;
        }
    }
    list_owner(query_type, data) {
        switch (query_type) {
            case "list_owner":
                let columns = {
                    id: "customers.id",
                    first_name: knex.raw("CAST(AES_DECRYPT(customers.first_name,'" + encription_key + "') AS CHAR(255))"),
                    last_name: knex.raw("CAST(AES_DECRYPT(customers.last_name,'" + encription_key + "') AS CHAR(255))"),
                    email: knex.raw("CAST(AES_DECRYPT(customers.email,'" + encription_key + "') AS CHAR(255))"),
                    user_type_name: "master_user_type.name",
                    created_at: knex.raw("DATE_FORMAT(customers.created_at,'%Y-%c-%d, %h:%i:%S %p')"),
                    phone: knex.raw("CAST(AES_DECRYPT(customers.phone,'" + encription_key + "') AS CHAR(255))"),
                    customer_unique_id: knex.raw("CAST(AES_DECRYPT(customers.customer_unique_id,'" + encription_key + "') AS CHAR(255))"),
                    property_name: "master_property.property_name",
                    unit_no: "master_unit.unit_no",
                    building_name: "master_building.name",
                    fav_cuisine: "customers.fav_cuisine",
                    fav_hotel: "customers.fav_hotel",
                    fav_travel_destination: "customers.fav_travel_destination",
                    annual_household_income: "customers.annual_household_income",
                    children_age: "customers.children_age",
                    oam_name: knex.raw("CONCAT(CAST(AES_DECRYPT(oam.first_name,'" + encription_key + "') AS CHAR(255)),' ',CAST(AES_DECRYPT(oam.last_name,'" + encription_key + "') AS CHAR(255)))")
                };
                let query = knex('customers')
                    .select(columns)
                    .leftJoin("master_user_type", "master_user_type.id", "=", "customers.user_type_id")
                    .leftJoin('master_unit', `master_unit.customer_id`, `customers.id`)
                    .leftJoin('master_building', `master_building.id`, `master_unit.building_id`)
                    .leftJoin("countries", "countries.id", "=", "customers.country_id")
                    .join('master_property', 'master_property.id', 'master_building.property_id')
                    .leftJoin("customers as oam", "oam.id", "=", "master_property.oam_id")
                    .where("master_user_type.name", "Owner")
                if (data['name']) {
                    let oam=data['name'].replace(/\s/g,'');
                   
                    query.whereRaw("concat(CAST(AES_DECRYPT(customers.first_name,'" + encription_key + "') AS CHAR(255)),CAST(AES_DECRYPT(customers.last_name,'" + encription_key + "') AS CHAR(255))) like '%" +oam+ "%'")
                }
                if (data['oam_id']) {
                    query.where("master_property.oam_id", data['oam_id']);
                }
                if (data['email']) {
                
                    query.whereRaw("CAST(AES_DECRYPT(customers.email,'" + encription_key + "') AS CHAR(255)) like '%" + data['email'] + "%'")
                }
                if (data['property_id']) {
                    query.where("master_building.property_id", data['property_id'])
                }
                if (data['building_id']) {
                    query.where("master_unit.building_id", data['building_id'])
                }
                if (data['unit_no']) {
                    query.whereRaw("master_unit.unit_no like '%" + data['unit_no'] + "%'")
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
                return query.groupBy("master_unit.customer_id", "master_building.id").orderBy("customers.created_at", "desc")
                break;
        }
    }
    get_owner_tenant() {
        let colunms = {
            id: "customers.id",
            name: knex.raw("concat(CAST(AES_DECRYPT(customers.first_name,'" + encription_key + "') AS CHAR(255)),' ',CAST(AES_DECRYPT(customers.last_name,'" + encription_key + "') AS CHAR(255)),' - ',master_user_type.name)")
        }
        return knex("customers").select(colunms)
            .leftJoin("master_user_type", "master_user_type.id", "=", "customers.user_type_id")
            .whereIn("master_user_type.name", ["Owner", "Tenant"]);
    }

    async add_manual_settlement(formData) {
        const transDetails = await knex('reward_history').select('id', 'customer_id', 'reward',
            'unit_id', 'building_id', 'property_id')
            .where({ user_type: 'owner', status: 1, is_settled: 0, unit_id: formData.unit_id });

        if (!transDetails.length) return { status: false, message: 'no_transaction_to_settle' };

        let settlementObj = {};

        for (let data of transDetails) {
            await knex('user_rewards').update({ settled_rewards: knex.raw(`settled_rewards + ${data.reward}`) })
                .where('customer_id', data.customer_id);

            await knex('unit_owner_rewards').update({ settled_rewards: knex.raw(`settled_rewards + ${data.reward}`) })
                .where({ unit_id: data.unit_id, building_id: data.building_id, property_id: data.property_id, is_settled: 0, status: 1 });

            await knex('unit_owner_rewards').update({ is_settled: 1 }).where({
                unit_id: data.unit_id, building_id: data.building_id,
                property_id: data.property_id, is_settled: 0, status: 1, settled_rewards: knex.raw(`total_rewards`)
            });

            const oamCustDetails = await knex('master_property').select('customers.id as customer_id')
                .join('customers', 'customers.id', 'master_property.oam_id')
                .where('master_property.id', data.property_id);

            if (oamCustDetails.length)
                await knex('user_rewards').update({ owners_settled_rewards: knex.raw(`owners_settled_rewards + ${data.reward}`) })
                    .where({ customer_id: oamCustDetails[0].customer_id, user_type: 'oam', status: 1 });

            await knex('reward_history').update({ is_settled: 1 }).where('id', data.id);

            const settlementObjKey = `${data.customer_id}_${data.unit_id}_${data.building_id}_${data.property_id}`;
            if (settlementObj[settlementObjKey]) {
                let settled_rewards = settlementObj[settlementObjKey].settled_rewards;
                settlementObj[settlementObjKey].settled_rewards = settled_rewards + data.reward;
            } else settlementObj[settlementObjKey] = { settled_rewards: data.reward };

        }

        for (let data in settlementObj) {
            const keys = data.split('_');

            await knex('manual_unit_settlement').insert({
                customer_id: parseInt(keys[0]),
                unit_id: parseInt(keys[1]),
                building_id: parseInt(keys[2]),
                property_id: parseInt(keys[3]),
                settled_rewards: settlementObj[data].settled_rewards,
                settlement_reason: formData.settlement_reason
            });
        }

        return { status: true };

    }

    manual_settlement_list(formData) {
        const columns = {
            property_name: 'master_property.property_name',
            property_manager: knex.raw(`cast(aes_decrypt(oam.first_name,'${encription_key}') as char(255))`),
            unit_number: 'master_unit.unit_no',
            owner_name: knex.raw(`cast(aes_decrypt(owner.first_name,'${encription_key}') as char(255))`),
            settled_amount: 'manual_unit_settlement.settled_rewards'
        };

        let query = knex('manual_unit_settlement').select(columns)
            .join('master_unit', 'master_unit.id', 'manual_unit_settlement.unit_id')
            .join('master_property', 'master_property.id', 'manual_unit_settlement.property_id')
            .join('customers as oam', 'oam.id', 'master_property.oam_id')
            .join('customers as owner', 'owner.id', 'manual_unit_settlement.customer_id');

        if (formData.property_name)
            query.whereRaw("master_property.property_name like '%" + formData.property_name + "%'");
        if (formData.property_manager)
            query.whereRaw("CAST(AES_DECRYPT(oam.first_name,'" + encription_key + "') AS CHAR(255)) like '%" + formData.property_manager + "%'");
        if (formData.unit_number)
            query.where('master_unit.unit_no', formData.unit_number);
        if (formData.owner_name)
            query.whereRaw("CAST(AES_DECRYPT(owner.first_name,'" + encription_key + "') AS CHAR(255)) like '%" + formData.owner_name + "%'");

        return query;
    }

    get_all_units() {
        const columns = {
            id: 'master_unit.id',
            unit_no: 'unit_no',
            building_id: 'master_building.id',
            text: knex.raw("CONCAT(master_building.name, ' - ',master_unit.unit_no)"),
            // name: knex.raw("CONCAT(CAST(AES_DECRYPT(customers.first_name,'" + encription_key + "') AS CHAR(255)),' ',CAST(AES_DECRYPT(customers.last_name,'" + encription_key + "') AS CHAR(255)))"),
            building_name: 'master_building.name',
            property_name: 'master_property.property_name',
            area: "master_property.area",
            emirate: 'master_emirate.name',
            address_line_1: 'master_property.address_line_1',
            address_line_2: 'master_property.address_line_2'
        }

        return knex('master_unit').select(columns)
            // .leftJoin('customers', 'customers.id', 'master_unit.customer_id')
            .join('master_building', 'master_building.id', 'master_unit.building_id')
            .join('master_property', 'master_property.id', 'master_building.property_id')
            .leftJoin('master_emirate', 'master_emirate.id', 'master_property.emirate_id')
            .where('master_unit.status', 1);
            // .where('master_unit.customer_id', customer_id)
    }
}