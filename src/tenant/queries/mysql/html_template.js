let knex = require("../../../../config/knex.js");
module.exports = class Html_template {
    upload_template(query_type, data) {
        switch (query_type) {
            case "insert_html_template":
            return knex("html_templates")
            .insert(data, "id")
                break;
        }
    }

    get_templates(query_type, data) {
        switch (query_type) {
            case "get_html_template":
            return knex("html_templates")
            .select("*")
            .where("tenant_id", data.tenant_id)
                break;
        }
    }
}
