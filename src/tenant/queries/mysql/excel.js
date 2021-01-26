let knex = require("../../../../config/knex.js");
module.exports = class Excel {

    dynamicReportExport(query_type, data) {
        switch (query_type) {
            case "insert":
                return knex("cc_download")
                    .insert(data.cc_download, data.ruleFor_cc_download)
                break;
        }
    }
}
