module.exports = class MasterFormatter {
    constructor() { }


    consume_promocode(req){
        return {
           promocode:req.query.promocode
        }
    }

    get_master_list(req) {
      

        return {
            oam_id: req.query.oam_id,
            customer_unique_id: req.query.customer_unique_id,
            property_code: req.query.property_code,
            property_type: req.query.property_type,
            limit: req.query.limit,
            offset: req.query.offset
        }
    }
    
    
    get_property_list(req) {
        return { 
            latitude: (req.query.latitude=="" || req.query.latitude==null || req.query.latitude==undefined) ? null : Number(req.query.latitude),
            longitude: (req.query.longitude=="" || req.query.longitude==null || req.query.longitude==undefined) ? null : Number(req.query.longitude),
            property_type_id: req.query.property_type_id,
            furnishing_id: req.query.furnishing_id,
            property_id: req.query.property_id,
            amenitiy_id: req.query.amenitiy_id,
            price_range: req.query.price_range,
            search: req.query.search,
            bedroom: req.query.bedroom,
            unit_type: req.query.unit_type,
            sort_price:req.query.sort_price,
            sort_alphabet:req.query.sort_alphabet,
            limit: req.query.limit,
            offset: req.query.offset
        }
    }

    get_property_suggession(req) {
        return { 
            search: req.query.search,
            unit_type: req.query.unit_type,
            latitude: (req.query.latitude=="" || req.query.latitude==null || req.query.latitude==undefined) ? null : Number(req.query.latitude),
            longitude: (req.query.longitude=="" || req.query.longitude==null || req.query.longitude==undefined) ? null : Number(req.query.longitude)
        }
    }

    get_property_type(req) {
        return {

        };
    }

    get_unit_list(req) {
        return {
            property_id: req.query.property_id,
            limit: req.query.limit,
            offset: req.query.offset
        }
    }

    unit_rent_list(req) {
        return {
            customer_unique_id: req.query.customer_unique_id,
            property_id: req.query.property_id,
            unit_type: req.query.unit_type
        }
    }

    updateUnitType(req) {
        if(req.body.unit_type=="rent" || req.body.unit_type=="sale"){
            if(req.body.unit_type=="rent"){
                return {
                    customer_unique_id: req.body.customer_unique_id,
                    unit_id: req.body.unit_id,
                    unit_type: req.body.unit_type,
                    rent_amount: req.body.amount,
                }
            } else {
                return {
                    customer_unique_id: req.body.customer_unique_id,
                    unit_id: req.body.unit_id,
                    unit_type: req.body.unit_type,
                    sale_amount: req.body.amount,
                }
            }
        } else {
            return {
                customer_unique_id: req.body.customer_unique_id,
                unit_id: req.body.unit_id,
                unit_type: req.body.unit_type,
            }
        }
        
    }
    
 

    addFamily(req) {
        return {
            customer_unique_id: req.body.customer_unique_id,
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            email: req.body.email,
            phone: req.body.phone,
            gender: req.body.gender,
            referrer_relation: req.body.referrer_relation,
            birthday: req.body.birthday,
            anniversary: req.body.anniversary,
            spouse_name: req.body.spouse_name,
            children: req.body.children
        }
    };
    familyList(req) {
        return {
            customer_unique_id: req.query.customer_unique_id
        }
    };

    deleteFamily(req) {
        return {
            customer_unique_id: req.body.customer_unique_id,
            family_unique_id: req.body.family_unique_id
        }
    };
    get_broker_list(req) {
        return {
            building_code: req.query.building_code,
            customer_unique_id: req.query.customer_unique_id,
            limit: req.query.limit,
            offset: req.query.offset           
        }
    }
}