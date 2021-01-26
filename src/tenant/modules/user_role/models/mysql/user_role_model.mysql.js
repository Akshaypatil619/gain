let knex = require("../../../../../../config/knex.js");
let dateFormat = require('dateformat');
module.exports = class UserRoleModel {
    getRoleMaster(data) {
        console.log(data);
        return knex("master_tenant_user_role")
            .select("name")
            .where("name", data.name)
            .where("tenant_id", data.tenant_id)
    }

    addTenantUserRole(data) {
        return knex("master_tenant_user_role").insert(data, "id");
    }

    updateTenantUserRole(data) {
        return knex("master_tenant_user_role")
            .where("id", data.role_id)
            .update(data.data)
    }

    getTenantUserRolesList(data) {
        let now = new Date();
        let obj = knex("master_tenant_user_role")
            .select(data.columns)
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
        return obj
    }

    getTenantUserRoleById(data) {
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
    }

    updateRoleStatus(data) {
        return knex("master_tenant_user_role")
            .where("id", data.role_id)
            .update(data.data)
    }
}