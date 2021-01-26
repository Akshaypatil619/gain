let knex = require("../../../../../../config/knex.js");

module.exports = class Property {



    get_property_list(columns, data) {
        console.log("columns, data",columns,data)
        let query_obj = knex('master_property')
            .select(columns)
            .join('master_property_type', 'master_property_type.id', 'master_property.property_type_id')
            .join('master_property_elevation', 'master_property_elevation.id', 'master_property.property_elevation_id')
            .leftJoin('customers', 'customers.id', 'master_property.oam_id')
           

        if (data.oam_name)
			query.whereRaw("concat(CAST(AES_DECRYPT(customers.first_name,'" + encription_key + "') AS CHAR(255)),'',CAST(AES_DECRYPT(customers.last_name,'" + encription_key + "') AS CHAR(255))) like '%" + data['oam_name'] + "%'")    
        if (data.property_code)
            query_obj.where('master_property.property_code', data.property_code);
        if (data.property_type)
            query_obj.where('master_property.property_type', data.property_type);
        if (data.limit)
            query_obj.limit(data.limit);
        if (data.offset)
            query_obj.offset(data.offset);

        return query_obj.orderBy('master_property.id', 'desc');
    }

    getBuilding(columns, data) {
        let query_obj = knex('master_property')
            .select(columns)
            .join('master_property_type', 'master_property_type.id', 'master_property.property_type_id')
            .join('master_property_elevation', 'master_property_elevation.id', 'master_property.property_elevation_id')
            

        if (data.property_code)
            query_obj.where('master_property.property_code', data.property_code);
        if (data.property_type)
            query_obj.where('master_property.property_type', data.property_type);
        if (data.limit)
            query_obj.limit(data.limit);
        if (data.offset)
            query_obj.offset(data.offset);

        return query_obj.orderBy('master_property.id', 'desc');;
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

}