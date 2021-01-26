
let knex = require("../../../../config/knex.js");
module.exports = class Email_providers {
    add_email_providers(query_type, data) {
        switch (query_type) {
            case "get_email_provider":
                return knex("email_provider_master")
                    .where("providers_name", data['providers_name'])
                break;
            case "insert":
                return knex("email_providers").insert(data)
                break;
        }
    }
    edit_email_provider(query_type, data) {
        switch (query_type) {
            case "get_email_provider_master":
                return knex("email_provider_master")
                    .where("providers_name", data['providers_name'])
                break;
            case "get_email_provider":
                return knex("email_providers")
                    .where({
                        "id": data.email_provider_id,
                        "email_providers.user_id": data.tenant_id,
                        "email_providers.user_type": "tenant",
                    });
                break;
            case "update_old_data":
                return knex("updated_email_providers")
                    .insert(data);
                break;
            case "update":
                return knex("email_providers")
                    .where({
                        "id": data.email_provider_id,
                        "email_providers.user_id": data.tenant_id,
                        "email_providers.user_type": "tenant",
                    })
                    .update(data.email_data);
        }
    }
    get_email_providers_list(query_type, data) {
        switch (query_type) {
            case "get_list":
                return knex("email_providers").select(data.columns)
                    .where({
                        'email_providers.status': 1,
                        "email_providers.user_id": data.tenant_id,
                        "email_providers.user_type": "tenant",
                    })
                    .leftJoin("email_provider_master", "email_provider_master.id", "=", "email_providers.email_provider_master_id")
                    .groupBy('email_providers.id')
                break;
        }
    }
    get_email_provider(query_type, data) {
        switch (query_type) {
            case "get_email_provider":
                return knex("email_providers").select(data.columns)
                    .where({
                        'email_providers.status': 1,
                        "email_providers.user_type": "tenant",
                        "email_providers.user_id": data.tenant_id
                    })
                    .leftJoin("email_provider_master", "email_provider_master.id", "=", "email_providers.email_provider_master_id")
                    .where('email_providers.id', '=', data['email_provider_id'])
                    .groupBy('email_providers.id')
                break;
        }
    }
    update_status(query_type, data) {
        switch (query_type) {
            case "get_email_provider":
                return knex("email_providers")
                    .where({
                        id: data.email_provider_id,
                        user_type: "tenant",
                        user_id: data.tenant_id,
                    })
                break;
            case "update_status":
                return knex("email_providers")
                    .update({ status: data.status })
                    .where({ id: data.email_provider_id });
                break;
        }
    }
    set_default_provider(query_type, data) {
        switch (query_type) {
            case "get_email_provider":
                return knex("email_providers")
                    .where({
                        user_id: data.tenant_id,
                        id: data.email_provider_id,
                        user_type: "tenant"
                    })
                break;
            case "set_default_null":
                return knex("email_providers")
                    .update({
                        is_set_default: 0
                    }).where({
                        user_id: data.tenant_id,
                        user_type: "tenant"
                    })
                break;
            case "set_default":
                return knex("email_providers")
                    .update({
                        is_set_default: 1

                    }).where({
                        user_id: data.tenant_id,
                        id: data.email_provider_id,
                        user_type: "tenant"
                    })
                break;
        }
    }
    set_validation(query_type, data) {
        switch (query_type) {
            case "get_email_provider_master":
                return knex("email_provider_master")
                    .where("providers_name", data.providers_name)
                break;
        }
    }
}