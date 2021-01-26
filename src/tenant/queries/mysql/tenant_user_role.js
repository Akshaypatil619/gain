let dateFormat = require('dateformat');
let knex = require("../../../../config/knex.js");
let now = new Date();
module.exports = class Tenant_user_role {
    add_tenant_user_role(query_type, data) {
        switch (query_type) {
            case "get_role_master":
                return knex("master_tenant_user_role")
                    .select("name")
                    .where("name", data.name)
                    .where("tenant_id", data.tenant_id)
                break;
            case "insert":
                return knex("master_tenant_user_role").insert(data, "id");
                break;
        }
    }
    edit_tenant_user_role(query_type, data) {
        switch (query_type) {
            case "update":
                return knex("master_tenant_user_role")
                    .where("id", data.role_id)
                    .update(data.data)

                break;
        }
    }
    get_tenant_user_roles_list(query_type, data) {
        switch (query_type) {
            case "get_list":
                let columns = {
                    role_id: "master_tenant_user_role.id",
                    name: "master_tenant_user_role.name",
                    description: "master_tenant_user_role.description",
                    is_admin: "master_tenant_user_role.is_admin",
                    status: knex.raw("if(master_tenant_user_role.status=1,'Active','Inactive')"),
                    created_by: "tenant_users.name",
                    created_time: "master_tenant_user_role.created_at"
                };
                let obj = knex("master_tenant_user_role")
                    .select(columns)
                    .leftJoin("tenant_users", "tenant_users.id", "master_tenant_user_role.created_by")
                    .where('master_tenant_user_role.tenant_id', '=', data['tenant_id']);
                if (data['search']) {
                    obj.where("master_tenant_user_role.name", "like", "%" + data['search'] + "%");
                    obj.orWhere("tenant_users.name", "like", "%" + data['search'] + "%");
                }
                if (data['from_date'] && data['to_date']) {
                    obj.whereBetween('master_tenant_user_role.created_at', [data['from_date'], data['to_data']]);
                } else if (data['from_date'] && !data['to_date']) {
                    obj.whereBetween('master_tenant_user_role.created_at', [data['from_date'], dateFormat(now, "yyyy-mm-dd 23:59:59")]);
                } else if (!data['from_date'] && data['to_date']) {
                    obj.whereBetween('master_tenant_user_role.created_at', ["1970-01-01", data['to_date'] + " 23:59:59"]);
				}
				obj.orderBy("master_tenant_user_role.created_at", "desc")
                return obj
                break;
        }
    }
    get_tenant_user_role_by_id(query_type, data) {
        switch (query_type) {
            case "get_user_role":
                let columns = {
                    role_id: "master_tenant_user_role.id",
                    name: "master_tenant_user_role.name",
                    description: "master_tenant_user_role.description",
                    status: "master_tenant_user_role.status",
                };
                let obj = knex("master_tenant_user_role")
                    .select(columns)
                    .where("id", data.role_id)
                return obj;
                break;

        }
    }
    update_status(query_type, data) {
        switch (query_type) {
            case "update_status":
                return knex("master_tenant_user_role")
                    .where("id", role_id)
                    .update(data)
                break;
        }
    }
}