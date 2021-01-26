module.exports = class Property_Validators {
    
        /**
         * Prepare validation rules for property
         *
         * @param type
         */
        add_property(type) {
            // return variable
            let returnData = {};
            switch (type) {
                case "master_property":
                    returnData = {
                            name: "required",
                            status:"required",
                            prefix_id:"required"
                    };
                    break;
            }
            return returnData;
        }
    
    
        /**
         * Rules for get property list
         * @param type
         */
        get_property_list(type) {
            // return variable
            let returnData = {};
        
            switch (type) {
                case "master_property":
                    returnData = {
                        // tenant_id:"required",
                        // oam_id: 'required'
                    };
                    break;
            }
            return returnData;
        } 
        updateHotSelling(req) {
            return {
                id: "required",
                hot_selling: "required",
            }
        }



   
        updateUnitMaster(req) {
            return {
                unit_id: "required",
                unit_type: "required"
                // rent_amount:  "required",
				// sale_amount:  "required",
				// no_of_rooms:"required",
				// no_of_bathrooms:  "required",
				// title:"required",
				// detailed_title: "required",
				// description: "required",
				// detailed_description:"required", 
				// reference_number:"required", 
                // permit_number: "required",
                // broker_id:"required",
                // furnishing_id: "required",
          }
        }

        update_property_master(){

            return{

                id: "required",
            }
        }

        update_building(){

            return{

                id: "required",
            }
        }

        getBuilding() {
            return {};
        }
        total_building_list(){
            return {};
        }

        getUnit() {
            return {};
        }

        get_unit_transaction() {
            return {};
        }

        update_unit_transaction() {
            return {
                id: "required",
                unit_id: "required",
                unit_type: "required",
                furnishing_id: "required",
                amenity_id: "required",
                no_of_rooms: "required",
                no_of_bathrooms: "required"
            };
        }

        getUnitbyid(){
            return {
                id: "required"
            }
        }
        getBuildingbyid(){
            return {
                id: "required"
            }
        }

        viewImages(){
            return {
                id: "required"
            }
        }

        view_unit_images(){
            return {
                id: "required"
            }
        }

        delete_img_by_id(){
            return {
                id: "required"
            }
        }

        delete_property_img_by_id(){
            return {
                id: "required"
            }
        }

        delete_unit_img_by_id(){
            return {
                id: "required"
            }
        }

        updateUnitType() {
            return {
                id: "required",
                unit_type: "required",
            }
        }
        
        /**
         * Rules for get property list
         * @param type
         */
        get_master_property_type(type) {
            // return variable
            let returnData = {};
        
            switch (type) {
                case "master_property":
                    returnData = {
                        // tenant_id:"required",
                    };
                    break;
            }
            return returnData;
        } 
        /**
        * Prepare validation rules for edit property
        *
        * @param type
        */
       edit_property() {
    
        let returnData = {
            id: "required",
        };
        return returnData;
        }
    
        /**
         *    Prepare validation rules for get_property_by_id
         */
        get_property_by_id() {
            let returnData = {
                id: "required",
    
            };
            return returnData;
        }

        get_Building_by_id() {
            let returnData = {
                id: "required",
    
            };
            return returnData;
        }


        get_property_elevation(){
            return {}
        }

        getAmenityList(){
            return {};
        }
        delete_amenity_img_by_id(){
            return {
                id: "required"
            }
        }
        view_amenity_images(){
            return {
                id: "required"
            }
        }
        getBrokerList(){
            return {};
        }

    }
