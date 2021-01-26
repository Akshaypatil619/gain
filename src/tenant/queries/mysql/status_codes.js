let knex = require("../../../../config/knex.js");
module.exports = class Status_codes {
    get_customer_status_code_list(query_type, data) {
        switch (query_type) {
            case "get_list":
                return knex.select('*')
                    .from("l_status_code_master")
                break;
        }
    }
}