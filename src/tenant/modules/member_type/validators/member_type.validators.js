module.exports = class Member_Type_Validators {
    
        /**
         * Prepare validation rules for Member Type
         *
         * @param type
         */
        add_member_type(type) {
            // return variable
            let returnData = {};
            switch (type) {
                case "member_type":
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
         * Rules for get member_type list
         * @param type
         */
        get_member_type(type) {
            // return variable
            let returnData = {};
        
            switch (type) {
                case "member_type":
                    returnData = {
                        tenant_id:"required",
                    };
                    break;
            }
            return returnData;
        } 
    
        /**
        * Prepare validation rules for edit member type
        *
        * @param type
        */
       edit_member_type() {
    
        let returnData = {
            id: "required",
        };
        return returnData;
        }
    
        /**
         *    Prepare validation rules for get_member_type_by_id
         */
        get_member_type_by_id() {
            let returnData = {
                id: "required",
    
            };
            return returnData;
        }
          /**
        * Prepare validation rules for member type status
        *
        * @param type
        */
       member_type_status() {
    
        let returnData = {
            id: "required",
        };
        return returnData;
        }
    }
