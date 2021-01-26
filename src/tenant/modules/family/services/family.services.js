let responseMessages = require("../response/family.response");
let family_model = new (require("../models/family_model.mysql"))();

module.exports = class FamilyService {

    /**
     * Get  family with filter
     * 
     * @param {*} data 
     */
    async get_family_list(form_data) {
        let return_result = {};
        let family = family_model.get_family_list(form_data)
            return family.then(async (result) => {
                if (result.length > 0) {
                    return_result.total_Records = result.length;
                    return family_model.get_family_list(form_data)
                        .limit(form_data.limit).offset(form_data.offset)
                        .then(async (res) => {
                            return_result.family_list = res;
                            return responseMessages.success("family_found", return_result);
                        })

                } else {
                    throw new Error("family_not_found");
                }
            })
            .catch(function (err) {
                let error = (typeof err.errors != 'undefined') ? err.errors : err.message;
                return responseMessages.failed(responseMessages.hasOwnProperty(err.message) ? err.message : "family_update_fail", error)
            });
    }


    familyStatusChange(query_data) {
        // update customer status where customer_id matched
        return family_model.updateCustomer(query_data)
            .then((result) => {
                if (result) {
                    // return result with customer status update
                    return responseMessages.success("customer_status_updated", result);
                } else {
                    // throw error customer status updated failed
                    throw new Error("customer_status_updated_failed")
                }
            })
            .catch(function (err) {
                // return error
                let error = (typeof err.errors != 'undefined') ? err.errors : err.message;
                return responseMessages.failed(responseMessages.hasOwnProperty(err.message) ? err.message : "customer_status_updated_failed", error)
            });
    }

};
