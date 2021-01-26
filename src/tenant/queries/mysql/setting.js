let knex = require("../../../../config/knex.js");
module.exports = class Salutation {
    add_setting(query_type, data) {
        switch (query_type) {
            case "update_status":
                return knex("tenant_settings")
                    .update({ status: 0 })
                    .where("settings_name", data['settings_name'])
                    .where('tenant_id', data['tenant_id'])
                break;
            case "insert":
                return knex("tenant_settings").insert(data)
                break;
        }
    }
    get_setting(query_type, data) {
        console.log("query_type",query_type);
        switch (query_type) {
            case "get_setting":
                let columns = {
                    settings_name: "tenant_settings.settings_name",
                    data: "tenant_settings.data",
                    created_at: "tenant_settings.created_at",
                };
                return knex.select(columns)
                    .from("tenant_settings")
                    .where("tenant_settings.settings_name", data['settings_name'])
                    // .where("tenant_settings.tenant_id", data['tenant_id'])
                    .where("tenant_settings.status", 1)
                break;
        }
    }
    get_setting_list(query_type, data) {
        switch (query_type) {
            case "get_list":
                let columns = {
                    settings_name: "tenant_settings.settings_name",
                    data: "tenant_settings.data",
                    created_at: "tenant_settings.created_at",
                };
                return knex.select(columns)
                    .from("tenant_settings")
                    .where("tenant_settings.status", 1)
                    .where("tenant_settings.tenant_id", data['tenant_id'])

                break;
        }
    }
    get_dynamic_customer_data_by_id(query_type, data) {
        switch (query_type) {
            case "get_customer":
                return knex.select("*")
                    .from("customers")
                    .where("customers.tenant_id", data['tenant_id'])
                    .where("customers.id", data['customer_id'])

                break;
        }
    }
    add_tp_application(query_type, data) {
        switch (query_type) {
            case "get_third_party_application":
                return knex('third_party_applications').select('*')
                    .where("domain_name", data.domain_name)
                    .where("tp_application_key", data.tp_application_key)
                break;
            case "insert":
                return knex("third_party_applications")
                    .insert(data)
        }
    }
    edit_tp_application(query_type, data) {
        switch (query_type) {
            case "update":
                return knex("third_party_applications")
                    .where("id", data['tp_application_id'])
                    .update(data.data)
                break;
        }
    }
    get_tp_application_list(query_type, data) {
        switch (query_type) {
            case "get_list":
                let obj = knex.select('*')
                    .from("third_party_applications")
                    .where("third_party_applications.tenant_id", data['tenant_id']);
                if (data['search']) {
                    obj.where("third_party_applications.application_name", "like", "%" + data['search'] + "%");
                }
                return obj;
                break;
        }
    }
    get_tp_application_by_id(query_type, data) {
        switch (query_type) {
            case "get_tp_application":
                return knex.select("*")
                    .from("third_party_applications")
                    .where("third_party_applications.tenant_id", data['tenant_id'])
                    .where("third_party_applications.id", data['tp_application_id'])
                break;
        }
    }
    tp_application_status_change(query_type, data) {
        switch (query_type) {
            case "":
                return knex("third_party_applications")
                    .where("id", data['id'])
                    .update(data)
                break;
        }
    }
    get_lock_point_list(query_type, data) {
        switch (query_type) {
            case "get_lock_points":
                let columns = {
                    lock_point: "lock_point.lock_point",
                    lock_point_reason: "lock_point.lock_point_reason",
                    lock: "lock_point.lock",
                    unlock_reason: "lock_point.unlock_reason",
                    burn: "lock_point.burn",
                    first_name: "customers.first_name",
                }
                return knex.select(columns)
                    .from("lock_point")
                    .leftJoin("customers", "customers.id", "=", "lock_point.customer_id")
                    .where("lock_point.tenant_id", data['tenant_id'])
                break;
        }
    }
}