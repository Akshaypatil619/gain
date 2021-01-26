let knex = require("../../../../config/knex.js");
module.exports = class Tenant_privileges {
    get_tenant_user_privileges(query_type, data) {
        switch (query_type) {
            case "get_tenant":
                return knex("tenant_users")
                    .select("*")
                    .where("id", data.tenant_user_id)
                break;
            case "get_privileges":
                return knex("tenant_user_privileges")
                    .select("*")
                    .where("status", true)
                    .where("tenant_user_id", data.tenant_user_id)
                break;
            case "get_role_privileges":
                return knex("tenant_role_privileges")
                    .select("module_id")
                    .where("role_id", data.role)
                    .where("status", 1)
                    .where("permitted", 1);
                break;
            case "get_api_module":
                return knex("master_api_permission_modules")
                    .select("master_api_permission_modules.*")
                    .where("disabled", 0)
                    .where("api_user", "tenant")
                    .whereNot("name", null)
                    .whereIn("id", data)
                    .orderBy("id");

        }
    }
    update_tenant_user_privileges(query_type, data) {
        switch (query_type) {
            case "udpate":
                return knex("tenant_user_privileges").where("tenant_user_id", data.tenant_user_id)
                    .whereIn("module_id", data.setStatusFalse)
                    .update("status", 0)
                break;
            case "batch_insert":
                return knex.batchInsert("tenant_user_privileges", data.privileges, 5000)
                break;
        }
    }
    get_tenant_role_privileges(query_type, data) {
        switch (query_type) {
            case "get_role_master":
                return knex("master_tenant_user_role")
                    .where("id", data.role_id)
                break;
            case "get_role_privileges":
                return knex("tenant_role_privileges")
                    .select("*")
                    .where("status", true)
                    .where("role_id", data.role_id)
                break;
            case "get_api_module":
                return knex("master_api_permission_modules")
                    .select("*")
                    .where("api_user", "tenant")
                    .where("disabled", 0)
                    .whereNot("name", null)
                    .orderBy("id");
                break;
        }
    }
    update_tenant_role_privileges(query_type, data) {
        switch (query_type) {
            case "get_role_master":
                return knex("master_tenant_user_role")
                    .where('id', data.role_id)
                break;
            case "update":
                return knex("tenant_role_privileges").where("role_id", data.role_id)
                    .whereIn("module_id", data.setStatusFalse)
                    .update("status", 0)
                break;
            case "batch_insert":
                return knex.batchInsert("tenant_role_privileges", data.privileges, 5000)
                break;
        }
    }
}
