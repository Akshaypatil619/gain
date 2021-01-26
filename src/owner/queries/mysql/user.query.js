const knex = require('../../../../config/knex');
let configKey = require("../../../../config/config");
let encription_key = configKey.encription_key;

module.exports = class UserQuery {

    constructor() { }

    get_property_list(columns, data) {
        let query_obj = knex('master_unit')
            .select(columns)
            .join('master_building', 'master_building.id', 'master_unit.building_id')
            .join('master_property', 'master_property.id', 'master_building.property_id')
            .leftJoin('master_property_type', 'master_property_type.id', 'master_property.property_type_id')
            .leftJoin('master_property_elevation', 'master_property_elevation.id', 'master_property.property_elevation_id')
            .leftJoin('master_emirate', 'master_emirate.id', 'master_property.emirate_id')
            .leftJoin('customers', 'customers.id', 'master_unit.customer_id')
            .leftJoin('countries', 'countries.id', 'master_property.country_id')
            .join('customers as oam', 'oam.id', 'master_property.oam_id')
            .where('master_unit.customer_id', data.owner_id)
            .groupBy('master_property.id')
            .orderBy('master_property.id', 'desc');

        if (data['property_name']) {
            query_obj.where("master_property.property_name", "like", "%" + data['property_name'] + "%");
        }
        if (data['oam_id']) {
            query_obj.where("master_property.oam_id", data['oam_id']);
        }
        if (data['property_type_id']) {
            query_obj.where('master_property.property_type_id', data['property_type_id']);
        }
        if (data['emirate_id']) {
            query_obj.where('master_property.emirate_id', data['emirate_id']);
        }
        if (data['address']) {
            query_obj.where("master_property.address_line_1", "like", "%" + data['address'] + "%");
        }
        if (data['area']) {
            query_obj.where("master_property.area", "like", "%" + data['area'] + "%");
        }
        if (data['building_name']) {
            query_obj.where("master_building.name", "like", "%" + data['building_name'] + "%");
        }
        if (data['building_id']) {
            query_obj.where("master_unit.building_id", data['building_id']);
        }
        // if(data['unit_no']){
        // query_obj.where('unit_no', data.unit_no);
        // }
        if (data['unit_no']) {
            query_obj.where('master_unit.unit_no', "like", "%" + data['unit_no'] + "%");
        }
        return query_obj.orderBy('master_property.id', 'desc');
    }

    get_building_list(columns, data) {
        let query_obj = knex('master_unit')
            .select(columns)
            .leftJoin('master_building', 'master_building.id', 'master_unit.building_id')
            .leftJoin('master_property', 'master_property.id', 'master_building.property_id')
            .leftJoin('building_has_brokers as bhb', 'bhb.building_id', 'master_building.id')
            .leftJoin('master_broker as mb', 'mb.id', 'bhb.broker_id')
            .where('master_unit.customer_id', data.owner_id)
            .groupBy('master_building.id')
        if (data['building_id']) {
            query_obj.where("master_unit.building_id",data['building_id']);
        }
        if (data['broker_name']) {
            query_obj.where("mb.name", "like", "%" + data['broker_name'] + "%");
        }
        return query_obj.groupBy("master_building.id").orderBy('master_building.id', 'desc');
    }

    get_all_building_list(columns, data) {
        return knex('master_unit')
            .select(columns)
            .leftJoin('master_building', 'master_building.id', 'master_unit.building_id')
            .where('master_unit.customer_id', data.owner_id).groupBy("master_building.id");
    }


    getBrandList(columns, data) {
        return knex('user_transaction_history')
            .select(columns)
            .whereRaw('user_transaction_history.id IN (' + data.trans_id + ')')
            .groupBy("user_transaction_history.id");
    }

    get_all_oam_list(columns, data) {
        return knex('master_unit')
            .select(columns)
            .leftJoin('master_building', 'master_building.id', 'master_unit.building_id')
            .leftJoin('master_property', 'master_property.id', 'master_building.property_id')
            .join('customers as oam', 'oam.id', 'master_property.oam_id')
            .where('master_unit.customer_id', data.owner_id).groupBy("master_building.id");
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
            .where('master_building.property_id', Number(data.property_id))
            .andWhere("master_unit.customer_id", Number(data.owner_id))
            .orderBy('master_unit.id', 'desc');
        if (data.title)
            query_obj.where('title', data.title);
        if (data.type)
            query_obj.where('unit_type', data.type);
        if (data.unit_no)
            query_obj.where('unit_no', data.unit_no);
        if (data['building_name']) {
            query_obj.where("master_building.name", "like", "%" + data['building_name'] + "%");
        }

        return query_obj.groupBy('master_unit.id').orderBy('master_unit.id', 'desc');
    }
    get_unit_total_list(columns, data) {
        let query_obj = knex('master_unit')
            .select(columns)
            // .join('master_building', 'master_building.id', 'master_unit.building_id')
            .leftJoin('customers', 'customers.id', 'master_unit.customer_id')
            .andWhere("master_unit.customer_id", Number(data.owner_id))
            .orderBy('master_unit.id', 'desc');
        if (data.title)
            query_obj.where('title', data.title);
        if (data.type)
            query_obj.where('unit_type', data.type);
        if (data.unit_no)
            query_obj.where('unit_no', data.unit_no);

        return query_obj.groupBy('master_unit.id').orderBy('master_unit.id', 'desc');
    }

    unit_rent_list(data) {
        let unitColumns = {
            id: "master_unit.id",
            building_id: "master_unit.building_id",
            text: knex.raw("CONCAT(master_building.name, ' - ',master_unit.unit_no)"),
            tenant_leaving_date: "customers.tenant_leaving_date",
            name: knex.raw("CONCAT(CAST(AES_DECRYPT(customers.first_name,'" + encription_key + "') AS CHAR(255)),'',CAST(AES_DECRYPT(customers.last_name,'" + encription_key + "') AS CHAR(255)))"),
            address: "master_property.address_line_1",
            area: "master_property.area",
            emirate: 'master_emirate.name',
            address_line_1: 'master_property.address_line_1',
            address_line_2: 'master_property.address_line_2'
        }
        return knex('master_unit')
            .select(unitColumns)
            .leftJoin('customers', 'customers.id', 'master_unit.customer_id')
            .join('master_building', 'master_building.id', 'master_unit.building_id')
            .join('master_property', 'master_property.id', 'master_building.property_id')
            .whereIn("master_unit.unit_type", ["rent", "rent_occupied"])
            .andWhere("master_unit.customer_id", data['owner_id']);
    }
    async get_rent_unit_list(data) {
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
            .where('master_unit.customer_id', data['owner_id'])
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


}