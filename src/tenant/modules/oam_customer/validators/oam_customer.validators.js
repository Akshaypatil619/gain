module.exports = class Oam_Customer_Validators {
    
    constructor() { }

    add_oam() {
        return {
            company_name: "required",
            email: "required",
            phone: "required"
        };
    }
    edit_oam() {
        return {
            id: "required",
            company_name: "required",
            phone: "required"
        };
    }
    get_oam() {
        return {
            id: "required",
        };
    }
    list_oam() {
        return {};
    }

    get_all_countries() {
        return {};
    }
}
