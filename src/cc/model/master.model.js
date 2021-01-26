
const query = new (require('../queries/master.query'))();
const response = require('../response/master.response');
const knex = require('../../../config/knex');
let config = require("../../../config/config");
let encription_key = config.encription_key;


module.exports = class MasterModel {

    constructor() { }

    async get_master_list(formData) {

        let master_list = {}

        let returnResult = {};
        let listArray = [];
        let master_propertys = await query.get_master_property_type()

        let master_amenities = await query.get_master_amenities()

        let master_furnishing = await query.get_master_furnishing()

        let min_max_price = await query.get_min_max_price();

        let min_max_bedroom = await query.get_min_max_bedroom();

        listArray.push(
            {
                "type": "master_property_type",
                "title": "Property Type",
                "data": master_propertys
            },
            {
                "type": "min_max_price",
                "title": "Min Max Price",
                "data": min_max_price
            },
            {
                "type": "min_max_bedroom",
                "title": "Bedroom",
                "data": min_max_bedroom
            },
            {
                "type": "master_furnishing",
                "title": "Furnishing",
                "data": master_furnishing
            },
            {
                "type": "master_amenities",
                "title": "Amenities",
                "data": master_amenities.map(e => {
                    if (e.image_path)
                        e.image_path = `${config.url}${e.image_path}`;
                    return e;
                })
            }
           

        );
        returnResult['master_list'] = listArray;

        return response.success('Master_Property_List_found', returnResult);

    }


    get_property_list(formData) {


        const columns = {

            unit_id: 'master_unit.id',
            property_id: 'master_property.id',
            property_name: 'master_property.property_name',
            property_code: 'master_property.property_code',
            property_type: 'master_property_type.name',
            address_line_1: "master_property.address_line_1",
            address_line_2: "master_property.address_line_2",
            latitude: 'master_property.latitude',
            longitude: 'master_property.longitude',
            property_elevation: 'master_property_elevation.name',
            no_of_units: 'master_property.no_of_units',
            no_of_parking_spaces: 'master_property.no_of_parking_spaces',
            property_images: knex.raw('GROUP_CONCAT(DISTINCT property_has_images.path)'),
            // property_images: knex.raw("GROUP_CONCAT(property_has_images.name)"),
            building_code: 'master_unit.building_code',
            building_id: `master_unit.building_id`,
            unit_reference_number: `master_unit.reference_number`,
            rent_amount: 'unit_transactions.rent_amount',
            sale_amount: 'unit_transactions.sale_amount',
            unit_type: 'unit_transactions.unit_type',
            title: 'unit_transactions.title',
            detailed_title: 'unit_transactions.detailed_title',
            description: 'unit_transactions.description',
            detailed_description: 'unit_transactions.detailed_description',
            no_of_rooms: 'unit_transactions.no_of_rooms',
            no_of_bathrooms: 'unit_transactions.no_of_bathrooms',
            unit_amenities: knex.raw(" GROUP_CONCAT(DISTINCT CONCAT( master_amenities.name, ',', master_amenities.image_path ) SEPARATOR '|' ) "),
            unit_count: knex.raw("COUNT(master_unit.id)"),
            unit_no: 'master_unit.unit_no',
            unit_size: 'unit_transactions.unit_size',
            unit_images: knex.raw('GROUP_CONCAT(DISTINCT unit_has_images.path)'),  

        };

        if (formData['latitude'] != null && formData['longitude'] != null) {
            columns['distance'] = knex.raw("ROUND( 6371 * ACOS( COS( RADIANS(" + formData['latitude'] + ") ) * COS( RADIANS( master_property.latitude ) ) * COS( RADIANS( master_property.longitude ) - RADIANS(" + formData['longitude'] + ") ) + SIN( RADIANS(" + formData['latitude'] + ") ) * SIN(RADIANS(master_property.latitude)) ) , 3)")
        }


        return query.get_property_list(columns, formData)
            .then(async properties => {
                console.log("config.base__url=",config.url);
                for (const element of properties) {
                    if (!(element['property_images'] == undefined || element['property_images'] == null || element['property_images'] == "")) {
                        element['property_images'] = element['property_images'].split(",").map(e => `${config.url}${e}`);
                    }


                    if (!(element['unit_images'] == undefined || element['unit_images'] == null || element['unit_images'] == "")) {
                        element['unit_images'] = element['unit_images'].split(",").map(e => `${config.url}${e}`);
                    }


                    if (element.unit_amenities)
                        element.unit_amenities = element.unit_amenities.split('|').map(e => {
                            let details = e.split(',');
                            details[1] = config.url + details[1];
                            return details.join(',')
                        }).join('|');
                }
                let returnResult = {};
                if (properties.length > 0) {
                    delete formData.limit;
                    delete formData.offset;
                    let total_records = properties.length;
                    returnResult['total_records'] = total_records;
                    returnResult['property_list'] = properties;
                    return response.success('properties_found', returnResult);
                } else {
                    return response.failed('properties_not_found', returnResult);
                };

            }).catch(err => response.catch_error("DDDDDDDDDDDDDDDDDDDDDDDDDDDDD1234 : ", err));

    }

    get_property_suggession(formData) {


        const columns = {

            property_id: 'master_property.id',
            property_name: 'master_property.property_name',
            building_name: 'master_building.name',
            // unit_name: 'master_unit.title',
            // unit_type: 'master_unit.unit_type',
            address_line_1: "master_property.address_line_1",
            address_line_2: "master_property.address_line_2",
            unit_count: knex.raw("COUNT(master_unit.id)"),
        };

        if (formData['latitude'] != null && formData['longitude'] != null) {
            columns['distance'] = knex.raw("ROUND( 6371 * ACOS( COS( RADIANS(" + formData['latitude'] + ") ) * COS( RADIANS( master_property.latitude ) ) * COS( RADIANS( master_property.longitude ) - RADIANS(" + formData['longitude'] + ") ) + SIN( RADIANS(" + formData['latitude'] + ") ) * SIN(RADIANS(master_property.latitude)) ) , 3)")
        }
        return query.get_property_suggession(columns, formData)
            .then(async properties => {
                if (properties.length > 0) {
                    return response.success('properties_found', properties);
                } else {
                    return response.failed('properties_not_found');
                };
            }).catch(err => response.catch_error(err));
    }


    async get_broker_list(formData) {
        let return_result = {};
        if (formData['customer_unique_id'] == undefined || formData['customer_unique_id'] == null || formData['customer_unique_id'] == "") {
            return_result.total_records = (await query.get_broker_list("broker_list", formData)).length;
            if ((return_result.total_records > 0)) {
                let broker_list = await query.get_broker_list("broker_list", formData)
                    .limit(parseInt(formData['limit']))
                    .offset(parseInt(formData['offset']));
                return_result.broker_list = broker_list;
                return response.success('broker_found', return_result);
            } else {
                return response.failed('broker_not_found');
            };
        } else {
            let customers = await query.get_broker_list("customer_exist", formData);
            if (customers.length > 0) {
                formData['customer_id'] = customers[0].customer_id;
                if (Number(customers[0].user_type_id) == 2) {
                    return_result.total_records = (await query.get_broker_list("owner_broker_list", formData)).length;
                    if ((return_result.total_records > 0)) {
                        let broker_list = await query.get_broker_list("owner_broker_list", formData)
                            .limit(parseInt(formData['limit']))
                            .offset(parseInt(formData['offset']));
                        return_result.broker_list = broker_list;
                        return response.success('broker_found', return_result);
                    } else {
                        return response.failed('broker_not_found');
                    };
                } else if (Number(customers[0].user_type_id) == 3) {
                    return_result.total_records = (await query.get_broker_list("tenant_broker_list", formData)).length;
                    if ((return_result.total_records > 0)) {
                        let broker_list = await query.get_broker_list("tenant_broker_list", formData)
                            .limit(parseInt(formData['limit']))
                            .offset(parseInt(formData['offset']));
                        return_result.broker_list = broker_list;
                        return response.success('broker_found', return_result);
                    } else {
                        return response.failed('referrer_does_not_exist');
                    };
                } else if (Number(customers[0].user_type_id) == 4) {
                    let familyParent = await query.get_broker_list("family_parent", formData);
                    if (familyParent.length > 0) {
                        formData['customer_id'] = familyParent[0].customer_id;
                        if (Number(familyParent[0].user_type_id) == 2) {
                            return_result.total_records = (await query.get_broker_list("owner_broker_list", formData)).length;
                            if ((return_result.total_records > 0)) {
                                let broker_list = await query.get_broker_list("owner_broker_list", formData)
                                    .limit(parseInt(formData['limit']))
                                    .offset(parseInt(formData['offset']));
                                return_result.broker_list = broker_list;
                                return response.success('broker_found', return_result);
                            } else {
                                return response.failed('referrer_does_not_exist');
                            };
                        } else if (Number(familyParent[0].user_type_id) == 3) {
                            return_result.total_records = (await query.get_broker_list("tenant_broker_list", formData)).length;
                            if ((return_result.total_records > 0)) {
                                let broker_list = await query.get_broker_list("tenant_broker_list", formData)
                                    .limit(parseInt(formData['limit']))
                                    .offset(parseInt(formData['offset']));
                                return_result.broker_list = broker_list;
                                return response.success('broker_found', return_result);
                            } else {
                                return response.failed('referrer_does_not_exist');
                            };
                        }
                    } else {
                        return response.failed('family_parent_does_not_exist');
                    }
                }
            } else {
                return response.failed('customer_not_exists');
            }
        }
    }
    get_unit_list(form_data) {

        const columns = {
            unit_id: 'master_unit.id',
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
            owner_mobile_email: knex.raw("CAST(AES_DECRYPT(customers.email,'" + encription_key + "')AS CHAR(255))"),
            owner_mobile_number: knex.raw("CAST(AES_DECRYPT(customers.phone,'" + encription_key + "')AS CHAR(50))"),
        };

        return query.get_unit_list(columns, form_data)
            .then(async units => {
                let returnResult = {};
                if (units.length > 0) {
                    delete form_data.limit;
                    delete form_data.offset;
                    let total_records = await query.get_unit_list({
                        count: knex.raw('count(master_unit.id)')
                    }, form_data);
                    returnResult['total_records'] = total_records[0].count;
                    returnResult['unit_list'] = units;
                } else {
                    returnResult['total_records'] = 0;
                    returnResult['unit_list'] = []
                };
                return response.success('units_found', returnResult);
            }).catch(err => response.catch_error(err));
    }

    async unit_rent_list(data) {
        return query.get_customer_id(data.customer_unique_id).then(async custDetails => {

            if (!custDetails.length)
                return response.failed('customer_not_exists');
            custDetails = custDetails[0];

            if (custDetails.user_type == 'tenant')
                return response.failed('incorrect_user_type');

            let customer_id = custDetails.id;

            let family_customer_id = null;
            if (custDetails.user_type == 'family') {
                family_customer_id = customer_id;

                const referrerDetails = await knex('customers').select({
                    referrer_id: 'customers.referrer_id',
                    referrer_user_type: 'master_user_type.code'
                }).join('customers as rc', 'rc.id', 'customers.referrer_id')
                    .join('master_user_type', 'master_user_type.id', 'rc.user_type_id')
                    .where('customers.id', customer_id);

                if (!referrerDetails.length || !referrerDetails[0].referrer_id)
                    return response.failed('incorrect_user_type');

                customer_id = referrerDetails[0].referrer_id;
                let referrer_user_type = referrerDetails[0].referrer_user_type;

                if (referrer_user_type == 'tenant')
                    return response.failed('incorrect_user_type');
            }

            return query.get_rent_unit_list(customer_id).then(unitDetails => {
                if (!unitDetails.length) return response.failed('rent_unit_not_found');

                return response.success('rent_unit_found', unitDetails);
            })
        });
    }

    /* async unit_rent_list(form_data, type) {
            let columns = {
                customer_id: "customers.id"
            }
            let customers = await knex("customers").select(columns).whereRaw(`cast(aes_decrypt(customers.customer_unique_id, '${encription_key}') as char(255)) = '${form_data.customer_unique_id}'`)
            if(customers.length>0){
                form_data['owner_id'] = customers[0].customer_id;
                let unitColumns ={
                    id: "master_unit.id",
                    text: knex.raw("CONCAT(master_property.property_name, ' - ',master_building.name, ' - ',master_unit.title)"),
                    unit_type: "master_unit.unit_type",
                    tenant_joining_date: "customers.tenant_joining_date",
                    tenant_leaving_date: "customers.tenant_leaving_date"
                }
                let query = knex('master_unit')
                    .select(unitColumns)
                    .leftJoin('customers', 'customers.id', 'master_unit.tenant_customer_id')
                    .join('master_building', 'master_building.id', 'master_unit.building_id')
                    .join('master_property', 'master_property.id', 'master_building.property_id')
                    .where("master_unit.customer_id",form_data['owner_id']);
                    if (form_data.unit_type){
                        query.andWhere("master_unit.unit_type",form_data['unit_type'])
                    } else {
                        query.whereIn("master_unit.unit_type",["rent", "rent_occupied"])
                    }
                    let rentUnit = await query;
                    if(rentUnit.length>0){
                        return response.success("data_found", rentUnit);
                    } else {
                        return response.failed("data_not_found");
                    }
            } else {
                return response.failed("customer_not_exists");
            }
    } */

    async updateUnitType(data) {
        let owner = await query.updateUnitType("customer_exist", data);
        if (owner.length > 0) {
            data['customer_id'] = owner[0].id;
            let unit = await query.updateUnitType("unit_exist", data);
            if (unit.length > 0) {
                if (Number(unit[0].customer_id) == Number(data['customer_id'])) {
                    data['tenant_customer_id'] = null;
                    let updateUnit = await query.updateUnitType("update_unit", data);
                    if (updateUnit > 0) {
                        return response.success("unit_updated");
                    } else {
                        return response.failed("unit_not_updated");
                    }
                } else {
                    return response.failed("invalid_unit_combination");
                }
            } else {
                return response.failed("unit_not_exists");
            }
        } else {
            return response.failed("customer_not_exists");
        }
    }

    async addFamily(form_data) {
        let allowed = 0;
        let allowedData;
        let familyCount;
        let email = await query.addFamily("add_family_email_exist", form_data);
        if (email.length > 0) {
            return response.failed("family_email_exist");
        }
        let phone = await query.addFamily("add_family_phone_exist", form_data);
        if (phone.length > 0) {
            return response.failed("family_phone_exist");
        }
        let customers = await query.addFamily("get_customer_id", form_data);
        if (customers.length > 0) {
            form_data['referrer_id'] = customers[0].id;
        }
        familyCount = await query.addFamily("get_family_count", form_data);
        // if (customers[0].type == "Owner") {
        //     allowedData = await query.addFamily("get_owner_property_type", form_data);
        //     if (allowedData.length > 0 && allowedData[0].property_type == "Commercial") {
        //         allowed = 3;
        //     } else if (allowedData.length > 0 && allowedData[0].property_type == "Residential") {
        //         allowed = 10;
        //     }
        // } else {
        //     allowedData = await query.addFamily("get_tenant_property_type", form_data);
        //     if (allowedData.length > 0 && allowedData[0].property_type == "Commercial") {
        //         allowed = 3;
        //     } else if (allowedData.length > 0 && allowedData[0].property_type == "Residential") {
        //         allowed = 10;
        //     }
        // }
        let insert_family_data = await this.format_insert_family(form_data);
        // if ((allowed - familyCount[0].family_count) > 0) {
        if (familyCount[0].family_count < 3) {
            let family = await query.addFamily("add_family", insert_family_data);
            if (family.length > 0) {
                await knex("cc_account_summary").insert({ customer_id: family[0] });
                return response.success("family_created", family);
            } else {
                return response.failed("family_created_failed");
            }
        } else {
            return response.failed("family_threshold");
        }
    }

    async familyList(form_data) {
        let customerId = await query.familyList("get_customer_id", form_data);
        if (customerId.length > 0) {
            form_data['referrer_id'] = customerId[0].id;
        }
        let families = await query.familyList("list_family", form_data);
        if (families.length > 0) {
            return response.success("family_found", families);
        } else {
            return response.failed("family_not_found");
        }
    }

    async deleteFamily(form_data) {
        let customerId = await query.deleteFamily("get_customer_id", form_data);
        if (customerId.length == 0) {
            return response.failed("referrer_does_not_exist");
        } else {
            form_data['referrer_id'] = customerId[0].id;
        }
        let familyId = await query.deleteFamily("family_exist", form_data);
        if (familyId.length == 0) {
            return response.failed("family_does_not_exist");
        } else {
            form_data['id'] = familyId[0].id;
        }
        let family = await query.deleteFamily("delete_family", form_data);
        return response.success("family_deleted");
    }

    async format_insert_family(record) {
        let userTypeId = await knex('master_user_type').select('id').where('master_user_type.name', "Family");
        return {
            customer_unique_id: knex.raw("AES_ENCRYPT('" + (Math.floor(1000000000 + Math.random() * 9000000000)) + "', '" + encription_key + "')"),
            first_name: knex.raw("AES_ENCRYPT('" + record['first_name'] + "', '" + encription_key + "')"),
            last_name: knex.raw("AES_ENCRYPT('" + record['last_name'] + "', '" + encription_key + "')"),
            email: knex.raw("AES_ENCRYPT('" + record['email'] + "', '" + encription_key + "')"),
            phone: knex.raw("AES_ENCRYPT('" + record['phone'] + "', '" + encription_key + "')"),
            dob: record.dob,
            gender: record.gender,
            referrer_relation: record.referrer_relation,
            referrer_id: record.referrer_id,
            user_type_id: Number(userTypeId[0]['id']),
            status: 1,
            birthday: record.birthday,
            anniversary: record.anniversary,
            spouse_name: record.spouse_name,
            children: record.children,
        }
    }



    async consume_promocode(formData) {
        const columns = {
            id: 'id'
        }
        let data = await query.consume_promocode(columns, formData);


        return (JSON.parse(JSON.stringify(data)));
        // return (JSON.parse(JSON.stringify(data)));


    }



    async update_promocode(id) {
        const columns = {
            is_used: 1
        }
        let data = await query.update_promocode(columns, id);


        return (JSON.parse(JSON.stringify(data)));
        // return (JSON.parse(JSON.stringify(data)));


    }


}

