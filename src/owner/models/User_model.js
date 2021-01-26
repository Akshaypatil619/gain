const query = new (require('../queries/mysql/user.query'))();
const response = require('../response/user.response');
const knex = require('../../../config/knex');
let config = require("../../../config/config");
let encription_key = config.encription_key;

module.exports = class UserModel {

    constructor() {}

    get_property_list(formData) {
        
        const columns = {
            id: knex.raw('distinct master_unit.id'),
            property_id: 'master_property.id',
            property_code: 'master_property.property_code',
            property_name: 'master_property.property_name',
            property_type: 'master_property_type.name',
            property_elevation: 'master_property_elevation.name',
            no_of_units: 'master_property.no_of_units',
            no_of_parking_spaces: 'master_property.no_of_parking_spaces',
            area: 'master_property.area',
            address: 'master_property.address_line_1',
            emirate: 'master_emirate.name',
            country_name: 'countries.name',
            building_name: 'master_building.name',
            unit_no: 'master_unit.unit_no',
            oam_id: "customers.id",
            oam_name: knex.raw("CONCAT(CAST(AES_DECRYPT(oam.first_name,'" + encription_key + "') AS CHAR(255)),' ',CAST(AES_DECRYPT(oam.last_name,'" + encription_key + "') AS CHAR(255)))")
        };

        let propertyList = query.get_property_list(columns, formData);
            return propertyList.then(async properties => {
                let returnResult = {};
                if (properties.length > 0) {
                    returnResult['total_records'] = properties.length;
                    returnResult['property_list'] = await propertyList.limit(formData['limit']).offset(formData['offset']);
                    return response.success('properties_found', returnResult);
                } else {
                    return response.failed('properties_not_found');
                };
            }).catch(err => response.catch_error(err));

    }

    get_building_list(formData) {
        
        const columns = {
            id: knex.raw('distinct master_building.id'),
            property_id: 'master_building.property_id',
            building_name: 'master_building.name',
            building_code: 'master_building.code',
            broker_name: knex.raw('group_concat(mb.name)'),
        };

        let buildingRecords =  query.get_building_list(columns, formData);
            return buildingRecords.then(async buildings => {
                let returnResult = {};
                if (buildings.length > 0) {
                    returnResult['total_records'] = buildings.length;
                    returnResult['building_list'] = await buildingRecords.limit(formData['limit']).offset(formData['offset']);
                    return response.success('building_found', returnResult);
                } else {
                    return response.failed('building_not_found');
                };
                
            }).catch(err => response.catch_error(err));

    }

    get_all_building_list(formData) {
        const columns = {
            id: 'master_building.id',
            building_name: 'master_building.name',
        };

        let buildingRecords =  query.get_all_building_list(columns, formData);
            return buildingRecords.then(async buildings => {
                if (buildings.length > 0) {
                    return response.success('building_found', buildings);
                } else {
                    return response.failed('building_not_found');
                };
                
            }).catch(err => response.catch_error(err));
    }



    getBrandList(formData) {
        const columns = {
            id: 'user_transaction_history.id',
            brand_name: 'user_transaction_history.brand_name',
        };

        let brandRecords =  query.getBrandList(columns, formData);
            return brandRecords.then(async buildings => {
                if (buildings.length > 0) {
                    return response.success('building_found', buildings);
                } else {
                    return response.failed('building_not_found');
                };
                
            }).catch(err => response.catch_error(err));
    }

    get_all_oam_list(formData) {
        const columns = {
            id: 'oam.id',
            oam_name: knex.raw("CONCAT(CAST(AES_DECRYPT(oam.first_name,'" + encription_key + "') AS CHAR(255)),' ',CAST(AES_DECRYPT(oam.last_name,'" + encription_key + "') AS CHAR(255)))")
        };
        let buildingRecords =  query.get_all_oam_list(columns, formData);
            return buildingRecords.then(async buildings => {
                if (buildings.length > 0) {
                    return response.success('property_manager_found', buildings);
                } else {
                    return response.failed('property_manager_not_found');
                };
                
            }).catch(err => response.catch_error(err));

    }


    get_property_type(form_data) {
        const columns = {
            id: 'id',
            name: 'name',
            code: 'code'
        };

        let propertTypList = query.get_property_type(columns, form_data)
            return propertTypList.then(async property_type => {
                let returnResult = {};
                if (property_type.length > 0) {
                    returnResult['total_records'] = property_type.length;
                    returnResult['property_type_list'] = await propertTypList.limit(form_data['limit']).offset(form_data['offset']);
                    return response.success('properties_found', returnResult);
                } else {
                    return response.failed('property_type_not_found');
                };
                
            }).catch(err => response.catch_error(err));
    }

    
    get_unit_list(form_data) {
        
        const columns = {
            unit_id: 'master_unit.id',
            unit_no: 'master_unit.unit_no',
            property_id: 'master_property.id',
            property_code: 'master_property.property_code',
            building_name: 'master_building.name',
            unit_type: 'master_unit.unit_type',
            title: 'master_unit.title',
            description: 'master_unit.description',
            no_of_rooms: 'master_unit.no_of_rooms',
            rent_amount: 'master_unit.rent_amount',
            sale_amount: 'master_unit.sale_amount',
            unit_code: 'master_unit.unit_code',
            owner_first_name: knex.raw("CAST(AES_DECRYPT(customers.first_name,'" + encription_key + "')AS CHAR(255))"),
            owner_last_name: knex.raw("CAST(AES_DECRYPT(customers.last_name,'" + encription_key + "')AS CHAR(255))"),
            owner_mobile_email: knex.raw("CAST(AES_DECRYPT(customers.email,'" + encription_key + "')AS CHAR(255))"),
            owner_mobile_number: knex.raw("CAST(AES_DECRYPT(customers.phone,'" + encription_key + "')AS CHAR(50))"),
        };

        let unitList = query.get_unit_list(columns, form_data);
            return unitList.then(async units => {
                let returnResult = {};
                if (units.length > 0) {
                    returnResult['total_records'] = units.length;
                    returnResult['unit_list'] = await unitList.limit(form_data['limit']).offset(form_data['offset']);
                    return response.success('units_found', returnResult);
                } else {
                    return response.failed('units_not_found');
                };
            }).catch(err => response.catch_error(err));

    }

    get_unit_total_list(form_data) {
        
        const columns = {
            unit_id: 'master_unit.id',
            unit_no: 'master_unit.unit_no',
            unit_type: 'master_unit.unit_type',
            title: 'master_unit.title',
            description: 'master_unit.description',
            no_of_rooms: 'master_unit.no_of_rooms',
            rent_amount: 'master_unit.rent_amount',
            sale_amount: 'master_unit.sale_amount',
            unit_code: 'master_unit.unit_code',
            owner_first_name: knex.raw("CAST(AES_DECRYPT(customers.first_name,'" + encription_key + "')AS CHAR(255))"),
            owner_last_name: knex.raw("CAST(AES_DECRYPT(customers.last_name,'" + encription_key + "')AS CHAR(255))"),
            owner_mobile_email: knex.raw("CAST(AES_DECRYPT(customers.email,'" + encription_key + "')AS CHAR(255))"),
            owner_mobile_number: knex.raw("CAST(AES_DECRYPT(customers.phone,'" + encription_key + "')AS CHAR(50))"),
        };

        let unitList = query.get_unit_total_list(columns, form_data);
            return unitList.then(async units => {
                let returnResult = {};
                if (units.length > 0) {
                    returnResult['total_records'] = units.length;
                    returnResult['unit_list'] = await unitList.limit(form_data['limit']).offset(form_data['offset']);
                    return response.success('units_found', returnResult);
                } else {
                    return response.failed('units_not_found');
                };
            }).catch(err => response.catch_error(err));

    }

    unit_rent_list(data) {
        
        return query.get_rent_unit_list(data)
            .then(async units => {
                return response.success('units_found', units);
            }).catch(err => response.catch_error(err));
    }
    async updateHotSelling(data){
        await knex("master_property").update({hot_selling: data.hot_selling}).where("master_property.id",data['id']);
        return response.success('property_hot_selling_updated');
    }
    async updateUnitType(data){
        let id = data['id'];
        delete data['id'];
        data['tenant_customer_id'] = null;
        await knex("master_unit").update(data).where("master_unit.id",id);
        return response.success('unit_type_updated');
    }
}