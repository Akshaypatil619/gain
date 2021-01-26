const query = new (require('../queries/mysql/user.query'))();
const response = require('../response/user.response');
const knex = require('../../../config/knex');
let config = require("../../../config/config");
let encription_key = config.encription_key;

module.exports = class UserModel {

    constructor() {}

    get_property_list(formData) {
        
        const columns = {
            property_id: 'master_property.id',
            property_code: 'master_property.property_code',
            property_name: 'master_property.property_name',
            property_type: 'master_property_type.name',
            property_elevation: 'master_property_elevation.name',
            no_of_units: 'master_property.no_of_units',
            no_of_parking_spaces: 'master_property.no_of_parking_spaces',
            area: 'master_property.area',
            address: 'master_property.address_line_1',
            oam_code: knex.raw(`cast(aes_decrypt(customers.oam_code, '${encription_key}') as char(255))`),
            emirate: 'master_emirate.name',
            country_name: 'countries.name'
        };

        let propertyList = query.get_property_list(columns, formData)
        return propertyList.then(async properties => {
                let returnResult = {};
                if (properties.length > 0) {
                    returnResult['total_records'] = properties.length;
                    returnResult['property_list'] = await propertyList.limit(formData['limit']).offset(formData['offset']);
                } else {
                    returnResult['total_records'] = 0;
                    returnResult['property_list'] = []
                };
                return response.success('properties_found', returnResult);
            }).catch(err => response.catch_error(err));

    }

    get_building_list(formData) {
        
        const columns = {
            id: 'master_building.id',
            property_id: 'master_building.property_id',
            building_name: 'master_building.name',
            building_code: 'master_building.code',
            broker_name: knex.raw('group_concat(DISTINCT  mb.name)'),
        };

        let buildingRecords = query.get_building_list(columns, formData);
           return buildingRecords.then(async buildings => {
                let returnResult = {};
                if (buildings.length > 0) {
                    returnResult['total_records'] = buildings.length;
                    returnResult['building_list'] = await buildingRecords.limit(formData['limit']).offset(formData['offset']);
                } else {
                    returnResult['total_records'] = 0;
                    returnResult['building_list'] = []
                };
                return response.success('building_found', returnResult);
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
            id: 'transaction_history.id',
            brand_name: 'transaction_history.brand_name',
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
                } else {
                    returnResult['total_records'] = 0;
                    returnResult['property_type_list'] = []
                };
                return response.success('properties_found', returnResult);
            }).catch(err => response.catch_error(err));
    }

    
    get_unit_list(form_data) {
        
        const columns = {
            unit_id: 'master_unit.id',
            unit_no: 'master_unit.unit_no',
            property_id: 'master_property.id',
            property_code: 'master_property.property_code',
            unit_type: 'master_unit.unit_type',
            title: 'master_unit.title',
            description: 'master_unit.description',
            no_of_rooms: 'master_unit.no_of_rooms',
            rent_amount: 'master_unit.rent_amount',
            sale_amount: 'master_unit.sale_amount',
            owner_first_name: knex.raw("CAST(AES_DECRYPT(customers.first_name,'" + encription_key + "')AS CHAR(255))"),
            owner_last_name: knex.raw("CAST(AES_DECRYPT(customers.last_name,'" + encription_key + "')AS CHAR(255))"),
            owner_email_id: knex.raw("CAST(AES_DECRYPT(customers.email,'" + encription_key + "')AS CHAR(255))"),
            owner_mobile_number: knex.raw("CAST(AES_DECRYPT(customers.phone,'" + encription_key + "')AS CHAR(50))"),
        };
       
        let unitList = query.get_unit_list(columns, form_data)
            return unitList.then(async units => {
                let returnResult = {};
                if (units.length > 0) {
                    returnResult['total_records'] = units.length;
                    returnResult['unit_list'] = await unitList.limit(form_data['limit']).offset(form_data['offset']);
                } else {
                    returnResult['total_records'] = 0;
                    returnResult['unit_list'] = []
                };
                return response.success('units_found', returnResult);
            }).catch(err => response.catch_error(err));

    };
    async get_unitlist(form_data) {
        const columns = {
            unit_id: 'master_unit.id',
            unit_no: 'master_unit.unit_no',
            property_id: 'master_property.id',
            property_code: 'master_property.property_code',
            unit_type: 'master_unit.unit_type',
            title: 'master_unit.title',
            description: 'master_unit.description',
            no_of_rooms: 'master_unit.no_of_rooms',
            rent_amount: 'master_unit.rent_amount',
            sale_amount: 'master_unit.sale_amount',
            owner_first_name: knex.raw("CAST(AES_DECRYPT(customers.first_name,'" + encription_key + "')AS CHAR(255))"),
            owner_last_name: knex.raw("CAST(AES_DECRYPT(customers.last_name,'" + encription_key + "')AS CHAR(255))"),
            owner_email_id: knex.raw("CAST(AES_DECRYPT(customers.email,'" + encription_key + "')AS CHAR(255))"),
            owner_mobile_number: knex.raw("CAST(AES_DECRYPT(customers.phone,'" + encription_key + "')AS CHAR(50))"),
        };

        let unitList = query.get_unitlist(columns, form_data)
        return unitList.then(async units => {
            let returnResult = {};
            if (units.length > 0) {
                returnResult['total_records'] = units.length;
                returnResult['unit_list'] = await unitList.limit(form_data['limit']).offset(form_data['offset']);
            } else {
                returnResult['total_records'] = 0;
                returnResult['unit_list'] = []
            };
            return response.success('units_found', returnResult);
        }).catch(err => response.catch_error(err));



          
    }

    // get_transaction_unitlist

    

    async get_unitReportlist(form_data) {
        const columns = {
            unit_id: 'master_unit.id',
            unit_no: 'master_unit.unit_no',
            property_id: 'master_property.id',
            property_code: 'master_property.property_code',
            unit_type: 'master_unit.unit_type',
            title: 'master_unit.title',
            description: 'master_unit.description',
            no_of_rooms: 'master_unit.no_of_rooms',
            rent_amount: 'master_unit.rent_amount',
            sale_amount: 'master_unit.sale_amount',
            owner_first_name: knex.raw("CAST(AES_DECRYPT(customers.first_name,'" + encription_key + "')AS CHAR(255))"),
            owner_last_name: knex.raw("CAST(AES_DECRYPT(customers.last_name,'" + encription_key + "')AS CHAR(255))"),
            owner_email_id: knex.raw("CAST(AES_DECRYPT(customers.email,'" + encription_key + "')AS CHAR(255))"),
            owner_mobile_number: knex.raw("CAST(AES_DECRYPT(customers.phone,'" + encription_key + "')AS CHAR(50))"),
        };

        let unitList = query.get_unitReportlist(columns, form_data)
        return unitList.then(async units => {
            let returnResult = {};
            if (units.length > 0) {
                returnResult['total_records'] = units.length;
                returnResult['unit_list'] = await unitList.limit(form_data['limit']).offset(form_data['offset']);
            } else {
                returnResult['total_records'] = 0;
                returnResult['unit_list'] = []
            };
            return response.success('units_found', returnResult);
        }).catch(err => response.catch_error(err));



          
    }

    async get_transaction_unitlist(form_data) {
        const columns = {
            unit_id: 'master_unit.id',
            unit_no: 'master_unit.unit_no',
            property_id: 'master_property.id',
            property_code: 'master_property.property_code',
            unit_type: 'master_unit.unit_type',
            title: 'master_unit.title',
            description: 'master_unit.description',
            no_of_rooms: 'master_unit.no_of_rooms',
            rent_amount: 'master_unit.rent_amount',
            sale_amount: 'master_unit.sale_amount',
            owner_first_name: knex.raw("CAST(AES_DECRYPT(customers.first_name,'" + encription_key + "')AS CHAR(255))"),
            owner_last_name: knex.raw("CAST(AES_DECRYPT(customers.last_name,'" + encription_key + "')AS CHAR(255))"),
            owner_email_id: knex.raw("CAST(AES_DECRYPT(customers.email,'" + encription_key + "')AS CHAR(255))"),
            owner_mobile_number: knex.raw("CAST(AES_DECRYPT(customers.phone,'" + encription_key + "')AS CHAR(50))"),
        };

        let unitList = query.get_transaction_unitlist(columns, form_data)
        return unitList.then(async units => {
            let returnResult = {};
            if (units.length > 0) {
                returnResult['total_records'] = units.length;
                returnResult['unit_list'] = await unitList.limit(form_data['limit']).offset(form_data['offset']);
            } else {
                returnResult['total_records'] = 0;
                returnResult['unit_list'] = []
            };
            return response.success('units_found', returnResult);
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