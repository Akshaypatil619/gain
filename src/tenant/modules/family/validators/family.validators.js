module.exports = class Family_Validators {

    get_family_list(type) {
        return {};
    }

    // add_familyMember() {
    //     return {
    //         first_name: "required",
    //         email: "required",
    //         phone: "required"
    //     };
    // }
    edit_familyMember() {
        return {
            customer_unique_id: "required",
            first_name: "required",
            phone: "required"
        };
    }
    // get_familyMember() {
    //     return {
    //         customer_unique_id: "required",
    //     };
    // }


    list_referral() {
        return {}
    }

    familyStatusChange(type) {
        return {
            customer_id: "required",
            status: "required"
        };

    }

    addFamily() {
        return {
            first_name: 'required',
            last_name: 'required',
            email: 'required',
            phone: 'required'
        }
    };

    familyList() {
        return {
            customer_unique_id: 'required'
        }
    };

    deleteFamily(){
        return {
            customer_unique_id: 'required',
            family_unique_id: 'required'
        }
    }


}
