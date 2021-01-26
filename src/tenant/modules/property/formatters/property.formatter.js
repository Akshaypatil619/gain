module.exports = class PropertyFormatter {
    /**
     * category list formatter
     *
     * @param {*} req
     * @returns
     */
    // get_property(req) {
    //     let data = {
    //         // tenant_id: req['tenant_id'],
    //         property_code: req.query.property_code,
    //         oam_id:req.query.oam_id,
    //         property_type_id:req.query.property_type_id,
    //         // from_date: req.query.from_date,
    //         // to_date: req.query.to_date,
    //         //name: req.query.name,
    //     };
    //     return data;
    // }



    get_property_list(req) {
        return {
            oam_id: req.query.oam_id,
            property_code: req.query.property_code,
            property_name: req.query.property_name,
            oam_id: req.query.oam_id,
            building_id: req.query.building_id,
            company_name: req.query.company_name,
            property_type: req.query.type,
           unit_no: req.query.unit_no,
           building_id:req.query.building_id,
            limit: req.query.limit ? parseInt(req.query.limit) : null,
            offset: req.query.offset ? parseInt(req.query.offset) : null
        }
    }

        get_unit_transaction(req) {
            return {
                unit_no: req.query.unit_no,
                property_name: req.query.property_name,
                building_name: req.query.building_name,
                owner_name: req.query.owner_name,
                limit: req.query.limit ? parseInt(req.query.limit) : null,
                offset: req.query.offset ? parseInt(req.query.offset) : null
            }
        }

        update_unit_transaction(req) {
            return {
                id: req.query.id,
                unit_id: req.query.unit_id
            }
        }

        updateHotSelling(req) {
            return {
                id: req.body.id,
                hot_selling: req.body.hot_selling,
            }
        }
    


    updateUnitMaster(req) {
        return {
            unit_id: Number(req.body.id),
            no_of_rooms: Number(req.body.no_of_rooms),
            no_of_bathrooms: Number(req.body.no_of_bathrooms),
            title: req.body.title,
            detailed_title: req.body.detailed_title,
            description: req.body.description,
            detailed_description: req.body.detailed_description,
            furnishing_id: Number(req.body.furnishing_id),
            amenity_id: (req.body.amenity_id != null && req.body.amenity_id != undefined && req.body.amenity_id != "") ? req.body.amenity_id.split(",") : null,
            unit_type: req.body.unit_type,
            rent_amount: req.body.unit_type == 'rent' ? req.body.amount : null,
            sale_amount: req.body.unit_type == 'sale' ? req.body.amount : null,
            unit_size: req.body.unit_size,
            reference_number: req.body.reference_number,
            images: (req.files == null || req.files == undefined || req.files == [] || req.files == "") ? null : req.files.images
        }
    }


    update_property_master(req) {

        return {

            id: req.body.id,
            property_code: req.body.property_code,
            property_name: req.body.property_name,
            property_type_id: req.body.property_type_id,
            property_elevation_id: req.body.property_elevation_id,
            no_of_units: req.body.no_of_units,
            no_of_parking_spaces: req.body.no_of_parking_spaces,
            latitude: req.body.latitude,
            longitude: req.body.longitude,
            // hot_selling: req.body.hot_selling,
            address_line_1: req.body.address_line_1,
            address_line_2: req.body.address_line_2,
            area: req.body.area,
            country_id: req.body.country_id,
            emirate_id: req.body.emirate_id,
            amenity_id: req.body.amenity_id,
            images: (req.files == null || req.files == undefined || req.files == [] || req.files == "") ? null : req.files.images


        }

    }

    update_building(req) {
        return {
            id: req.body.id,
            name: req.body.name,
            code: req.body.code,
            building_broker: req.body.building_broker
        }
    }
    total_building_list(req) {
        return {
            name: req.query.name,
            code: req.query.code,
            limit: req.query.limit ? parseInt(req.query.limit) : null,
            offset: req.query.offset ? parseInt(req.query.offset) : null
        }
    }
      getBuilding(req) {
        return {
            property_id: req.params.property_id,
            name: req.query.name,
            broker_name: req.query.broker_name,
            code: req.query.code,
            limit: req.query.limit ? parseInt(req.query.limit) : null,
            offset: req.query.offset ? parseInt(req.query.offset) : null
        }
    }

    getUnit(req) {
        return {
            building_id: req.params.building_id,
            customer_name: req.query.customer_name,
            building_name: req.query.building_name,
            building_code: req.query.building_code,
            broker_name: req.query.broker_name,
            reference_number:req.query.reference_number,
            limit: req.query.limit ? parseInt(req.query.limit) : null,
            offset: req.query.offset ? parseInt(req.query.offset) : null
        }
    }


    getUnitbyid(req) {
        return {
            id: req.params.id
        }
    }

    viewImages(req) {
        return {
            id: req.params.id
        }
    }   
    view_unit_images(req){
        return {
            id: req.params.id
        }
    }

    delete_img_by_id(req) {
        return {
            id: req.body.delete_id,
            unit_id: req.body.unit_id
        }
    }
    delete_property_img_by_id(req) {
        return {
            id: req.body.delete_id,
            property_id: req.body.property_id
        }
    }

        delete_unit_img_by_id(req){
            return {
                id: req.body.delete_id,
                unit_id:req.body.unit_id
            }
        }

        



    updateUnitType(req) {
        return {
            id: req.body.id,
            unit_type: req.body.unit_type,
        }
    }



    // get_property(req) {
    //     console.log("RRR",req.query)
    //     let data = {
    //         tenant_id: req['tenant_id'],
    //         property_code: req.query.property_code,
    //         oam_id:req.query.oam_id,
    //         property_type_id:req.query.property_type_id,
    //     };
    //     return data;
    // }


    /**
  * get property by id Formatter
  *
  * @param req
  * @return data
  */
    get_property_by_id(req) {



        return { id: req.params.id };
    }


    get_Building_by_id(req) {



        return { id: req.params.id };
    }



    /**
* get property by id Formatter
*
* @param req
* @return data
*/
    get_master_property_type_List(req) {
        let data = [];
        data['master_property_type'] = {};
        try {
            data['master_property_type']['id'] = req.params.id;
        } catch (e) {
            console.log(e);
        }
        return data;
    }

        get_property_elevation(){
            return {};
        }
        getAmenityList(){
            return {};
        }

        view_amenity_images(req){
            return {
                id: req.params.id
            }
        }
        delete_amenity_img_by_id(req){
            return {
                id: req.body.delete_id,
                amenity_id:req.body.amenity_id
            }
        }
    
   
    getBrokerList() {
        return {};
    }
}
