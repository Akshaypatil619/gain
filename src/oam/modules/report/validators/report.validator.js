'use strict';
module.exports = class reportValidator {
    constructor() { }

    get_commission_list_data() {
        return {
            oam_id: 'required'
        };
    }
    get_customer_transaction_list(){
        return {
            oam_id: 'required'
        }
    };
    unit_report(){
        return {
            oam_id: 'required'
        }
    };
}