let knex = require("../../../../config/knex.js");
module.exports = class Developer_panel {
    get_route_list(query_type, data) {
        let obj = "";
        let select = {};
        switch (query_type) {
            case "get_route_list":
                
                return knex("routes")
                    .select({
                        "id": "routes.id",
                        "route": "routes.route",
                        "api_permission_group_id": "routes.api_permission_group_id",
                        "status": "routes.status",
                        "enabled": "routes.enabled",
                        "group_name": "groups.name",
                        // "tenant_type_id": "routes.tenant_type_id",
                        "valid_permission_type": "routes.valid_permission_type",
                    })
                    .leftJoin("route_has_group_codes", function () {
                        this.on("routes.id", "=", "route_has_group_codes.route_id")
                            // .on("route_has_group_codes.tenant_type_id", "=", knex.raw("'" + data.tenant_type_id + "'"))
                            .on("route_has_group_codes.user_type", "=", knex.raw("'" + data.user_type + "'"))
                            .on("route_has_group_codes.status", "=", knex.raw("1"))
                    })
                    .leftJoin("groups_has_routes", function () {
                        this.on("groups_has_routes.route_id", "=", "routes.id")
                            .on("groups_has_routes.status", "=", knex.raw("?", 1))
                    })
                    .whereNull("groups_has_routes.id")
                    .where({
                        "routes.user_type": data.user_type,
                        // "routes.user_id": data.user_id,
                        // "routes.tenant_type_id": data.type_id,
                        "routes.status": 1,
                    })
                    .leftJoin("groups", "groups.id", "=", "routes.api_permission_group_id")
                    .groupBy("routes.id")
                break;
            case "get_group_master":
                select = {
                    id: 'groups.id',
                    name: 'groups.name',
                    user_type: 'groups.user_type',
                    group_code_id: 'groups.group_code_id',
                };
                console.log(data)
                switch (data.user_type) {
                    case 'tenant':
                        select.permission = knex.raw("IFNULL(tenant_type_has_group.status,'none')")
                        select.status = knex.raw("IFNULL(tenant_type_has_group.status,'0')");
                        break;
                    case 'merchant':
                        select.permission = knex.raw("IFNULL(merchant_type_has_group.status,'none')")
                        select.status = knex.raw("IFNULL(merchant_type_has_group.status,'0')");
                        break;
                    case 'admin':
                    default:
                        select.permission = knex.raw("IFNULL(tenant_type_has_group.status,'none')")
                        select.status = knex.raw("IFNULL(tenant_type_has_group.status,'0')");
                }
                obj = knex("groups")
                    .select(select)
                    .where({
                        "groups.user_type": data.user_type,
                    }).orderBy("groups.id");
                switch(data.user_type) {
                    case 'tenant':
                    obj.leftJoin("tenant_type_has_group", function(){
                        this.on("tenant_type_has_group.group_id", "=", "groups.id")
                        .on("tenant_type_has_group.tenant_type_id","=",knex.raw("?",data.tenant_type_id));
                    })
                    break;
                    case 'merchant':
                    obj.leftJoin("merchant_type_has_group", function(){
                        this.on("merchant_type_has_group.group_id", "=", "groups.id")
                        .on("merchant_type_has_group.merchant_type_id","=",knex.raw("?",data.type_id));
                    });
                    break;
                }
                return obj;
                break;
            case "get_master_group_code":
                return knex("master_group_code")
                    .select({
                        id: "master_group_code.id",
                        name: "master_group_code.name",
                        code: "master_group_code.code",
                    })
                    .where({
                        "master_group_code.status": 1,
                    })
        }
    }
    store_routes(query_type, data) {
        switch (query_type) {
            case "get_master_tenant_type":
                return knex("master_tenant_type")
                    .where({
                        id: data.type_id
                    })
                break;
            case "update_routes_status":
                return knex("routes")
                    .where({
                        user_type: data.user_type,
                        // user_id: data.user_id
                        // tenant_type_id: data.tenant_type_id,
                        user_type: data.user_type,
                    })
                    .update({
                        enabled: 0,
                        status: 0,
                    })
                break;
            case "get_routes":
                return knex("routes")
                    .where({
                        user_type: data.user_type,
                        // user_id: data.user_id
                        // tenant_type_id: data.tenant_type_id
                        user_type: data.user_type,
                    });
                break;
            case "batch_insert_routes":
                return knex.batchInsert("routes", data, 100);
                break;
            case "update_status_enable":
                return knex("routes")
                    .where({
                        user_type: data.user_type,
                        // user_id: data.user_id
                        // tenant_type_id: data.tenant_type_id,
                        user_type: data.user_type,
                    })
                    .whereIn("id", data.update_result)
                    .update({
                        enabled: 1,
                        status: 1
                    });
                break;
        }
    }
    enable_disable_route(query_type, data) {
        switch (query_type) {
            case "get_routes":
                return knex("routes")
                    .where({
                        id: data.route_id,
                        tenant_type_id: data.type_id,
                        user_type: data.user_type
                    })
                break;
            case "update_status":
                return knex("routes")
                    .where({
                        id: data.route_id,
                        tenant_type_id: data.type_id,
                        user_type: data.user_type
                    })
                    .update({
                        enabled: data.enabled
                    })
        }
    }
    update_valid_permission_type(query_type, data) {
        switch (query_type) {
            case "get_routes":
                return knex("routes")
                    .where({
                        user_type: data.user_type,
                        // user_id: data.user_id,
                        id: data.route_id,
                        // tenant_type_id: data.tenant_type_id
                    })
                break;
            case "update":
                return knex("routes")
                    .where({
                        user_type: data.user_type,
                        // user_id: data.user_id,
                        id: data.route_id,
                        // tenant_type_id: data.tenant_type_id
                    })
                    .update({
                        valid_permission_type: data.valid_permission_type
                    })
        }
    }
    update_route_group(query_type, data) {
        switch (query_type) {
            case "get_route_group":
                return knex("groups")
                    .where({
                        user_type: data.user_type,
                        id: data.api_permission_group_id
                    })
                break;
            case "get_routes":
                return knex("routes")
                    .where({
                        user_type: data.user_type,
                        // user_id: data.user_id,
                        id: data.route_id,
                        tenant_type_id: data.type_id
                    });
                break;
            case "update_route":
                return knex("routes")
                    .where({
                        user_type: data.user_type,
                        // user_id: data.user_id,
                        tenant_type_id: data.type_id,
                        id: data.route_id
                    })
                    .update({
                        api_permission_group_id: data.api_permission_group_id
                    });
                break;

        }
    }
    update_route_group_code(query_type, data) {
        switch (query_type) {
            case "get_routes":
                return knex("routes")
                    .where({
                        user_type: data.user_type,
                        // user_id: data.user_id,
                        id: data.route_id,
                        tenant_type_id: data.type_id
                    })
                break;
            case "get_routes_group_codes":
                return knex("route_has_group_codes")
                    .where({
                        user_type: data.user_type,
                        // user_id: data.user_id,
                        tenant_type_id: data.type_id,
                        route_id: data.route_id,
                        group_code_id: data.group_code_id
                    });
                break;
            case "update_group_codes":
                return knex("route_has_group_codes")
                    .where({
                        id: data.id
                    })
                    .update({
                        status: data.status
                    });
                break;
            case "insert_group_codes":
                return knex("route_has_group_codes")
                    .insert(data)
        }
    }
    getting_inner_api(query_type, data) {
        switch (query_type) {
            case "get_inner_api":
                return knex("inner_route_api")
                    .where({
                        user_type: data.user_type,
                        user_id: data.user_id,
                        route_id: data.route_id,
                    })
                break;
        }
    }
    add_inner_api(query_type, data) {
        switch (query_type) {
            case "get_inner_api":
                return knex("inner_route_api")
                    .where({
                        user_type: data.user_type,
                        user_id: data.user_id,
                        route_id: data.route_id,
                        inner_api_path: data.inner_api_path
                    })
                break;
            case "insert":
                return knex("inner_route_api")
                    .insert(data);
        }
    }
    remove_inner_api(query_type, data) {
        switch (query_type) {
            case "get_inner_api":
                return knex("inner_route_api")
                    .where({
                        user_type: data.user_type,
                        user_id: data.user_id,
                        id: data.inner_api_id
                    })
                break;
            case "update_inner_api":
                return knex("inner_route_api")
                    .where({
                        user_type: data.user_type,
                        user_id: data.user_id,
                        id: data.inner_api_id
                    })
                    .update({
                        deleted: 1
                    });
                break;
        }
    }
    get_tenant_types(query_type, data) {
        switch (query_type) {
            case "get_types":
                return knex("master_tenant_type")
                    .select({
                        id: "master_tenant_type.id",
                        name: "master_tenant_type.name"
                    })
                    .where({
                        status: 1
                    })
                break;
        }
    }
    get_merchant_types(query_type, data) {
        switch (query_type) {
            case "get_types":
                return knex("master_tenant_type")
                    .select({
                        id: "master_tenant_type.id",
                        name: "master_tenant_type.name"
                    })
                    .where({
                        status: 1
                    })
                break;
        }
    }
    get_routes(query_type, data) {
        switch (query_type) {
            case "get_tenant":
                return knex("tenants")
                    .select({
                        tenant_type_id: "tenants.tenant_type_id",
                        group_codes: knex.raw("GROUP_CONCAT(tenant_has_group_codes.group_code_id)"),
                    })
                    .leftJoin("tenant_has_group_codes", function () {
                        this.on("tenant_has_group_codes.tenant_id", "=", "tenants.id")
                            .on("tenant_has_group_codes.status", "=", knex.raw("'1'"))
                    })
                    .where({
                        tenant_id: data.user_id
                    })
                    .groupBy("tenants.id")
                break;
            case "get_routes":
             let obj = knex("routes")
                    .select({
                        id: "routes.id",
                        route: "routes.route",
                        api_permission_group: "groups.name",
                        stauts: "routes.status",
                        enabled: "routes.enabled",
                        valid_permission_type: "routes.valid_permission_type",
                    })
                    .join("groups_has_routes", function () {
                        this.on("groups_has_routes.route_id", "=", "routes.id")
                            .on("groups_has_routes.status", "=", knex.raw("?", 1))
                    })
                    .leftJoin("groups", "groups.id", "=", "groups_has_routes.group_id")
                    // .leftJoin("route_has_tenant_types", function () {
                    //     this.on("routes.id", "=", "route_has_tenant_types.route_id")
                    //         .on("route_has_tenant_types.status", "=", knex.raw("'1'"))
                    // })
                    .where({
                        "routes.status": "1",
                        "routes.enabled": "1",
                        "routes.user_type":data.user_type
                    })
                    switch(data.user_type){
                        case 'merchant':
                        break;
                        case 'tenant':
                        default:
                        obj.innerJoin("tenant_type_has_group", function () {
                            this.on("tenant_type_has_group.status", "=", knex.raw("?", 1))
                                .on("tenant_type_has_group.tenant_type_id", "=", knex.raw("?", data.type_id))
                                .on("tenant_type_has_group.group_id", "=", "groups.id")
                        }).leftJoin("route_has_group_codes", function () {
                            this.on("routes.id", "=", "route_has_group_codes.route_id")
                                .on("route_has_group_codes.status", "=", knex.raw("'1'"))
                        }).where(function () {
                            this.whereIn('route_has_group_codes.group_code_id', data.group_codes)
                                .orWhereNull("route_has_group_codes.group_code_id")
                        });
                    }
                console.log(obj.toString());
                return obj;
                break;
        }
    }
    check_table_exist() {
        knex.schema.hasTable('groups').then(function (exists) {
            if (!exists) {
                return knex.schema.createTable('groups', function (t) {
                    t.increments('id').primary();
                    t.string('name', 100);
                    t.string('user_type', 100);
                    t.integer('group_code_id');
                    t.boolean('status').defaultTo(1);
                    t.dateTime("created_at").notNullable().defaultTo(knex.raw("NOW()"));
                });
            }
        });
        knex.schema.hasTable('groups_has_routes').then(function (exists) {
            if (!exists) {
                return knex.schema.createTable("groups_has_routes", function (t) {
                    t.increments("id").primary();
                    t.integer("route_id");
                    t.integer("group_id");
                    t.string("user_type");
                    t.boolean("status").defaultTo(1);
                    t.dateTime("created_at").notNullable().defaultTo(knex.raw("NOW()"));
                })
            }
        })
        knex.schema.hasTable('groups_has_apis').then(function (exists) {
            if (!exists) {
                return knex.schema.createTable("groups_has_apis", function (t) {
                    t.increments("id").primary();
                    t.integer("api_id");
                    t.integer("group_id");
                    t.string("user_type");
                    t.boolean("status").defaultTo(1);
                    t.timestamps("created_at");
                })
            }
        });

        knex.schema.hasTable('merchant_type_has_group').then(function (exists) {
            if (!exists) {
                return knex.schema.createTable("merchant_type_has_group", function (t) {
                    t.increments("id").primary();
                    t.integer("merchant_type_id");
                    t.integer("group_id");
                    t.boolean("status").defaultTo(1);
                    t.dateTime("created_at").notNullable().defaultTo(knex.raw("NOW()"));
                })
            }
        })
    }
    add_group(query_type, data) {
        switch (query_type) {
            case "get_user_type":
                return knex("master_api_tokens")
                    .select({
                        user: "master_api_tokens.api_calling_for",
                        id: "master_api_tokens.id"
                    }).where({
                        "master_api_tokens.api_calling_for": data.user_type
                    })
                break;
            case "check_group":
                return knex("groups")
                    .where({
                        user_type: data.user_type,
                        name: data.name,
                    })
            case "insert_group":
                return knex("groups")
                    .insert(data, "id");
                break;
        }
    }
    modify_group(query_type, data) {
        switch (query_type) {
            case "get_user_type":
                return knex("master_api_tokens")
                    .select({
                        user: "master_api_tokens.api_calling_for",
                        id: "master_api_tokens.id"
                    }).where({
                        "master_api_tokens.api_calling_for": data.user_type
                    })
                break;
            case "check_group":
                return knex("groups")
                    .where({
                        user_type: data.user_type,
                        name: data.name,
                    })
                    .whereNot("id", data.id);
            case "update_group":
                return knex("groups")
                    .update(data.data)
                    .where("id", data.id);
                break;
        }
    }
    get_list(query_type, data) {
        switch (query_type) {
            case "get_user_type":
                return knex("master_api_tokens")
                    .select({
                        user: "master_api_tokens.api_calling_for",
                        id: "master_api_tokens.id"
                    }).where({
                        "master_api_tokens.api_calling_for": data.user_type
                    })
                break;
            case "get_api_groups":
                let obj = knex("groups")
                    .select("groups.name", "groups.id", "groups.status", "groups.user_type")
                    .select({
                        group_code_name: "master_group_code.name",
                        group_code_id: "master_group_code.id"
                    })
                    .leftJoin("master_group_code", "master_group_code.id", "=", "groups.group_code_id");
                (data.user_type != undefined) ? obj.where("groups.user_type", data.user_type) : "";
                data.name != undefined ? obj.where("groups.name", "like", "%" + data.name + "%") : "";
                data.status != undefined ? obj.where("groups.status", data.status) : "";
                return obj;
                break;
        }
    }
    set_status(query_type, data) {
        switch (query_type) {
            case "get_user_type":
                return knex("master_api_tokens")
                    .select({
                        user: "master_api_tokens.api_calling_for",
                        id: "master_api_tokens.id"
                    }).where({
                        "master_api_tokens.api_calling_for": data.user_type
                    })
                break;
            case "get_group":
                let obj = knex("groups")
                    .select("name", "id", "status")
                    .where("user_type", data.user_type)
                    .where("id", data.group_id);
                return obj;
                break;
            case "update_status":
                return knex("groups")
                    .update({
                        "status": data.status
                    })
                    .where("id", data.group_id);
                break;
        }
    }

    assign_routes(query_type, data) {
        switch (query_type) {
            case "delete_routes":
                return knex("groups_has_routes")
                    .update({
                        status: 0
                    })
                    .whereIn("route_id", data.routes)
                    .where("user_type", data.user_type)
                    .where("group_id", data.group_id);
            case "add_routes":
                return knex.batchInsert("groups_has_routes", data, 100);
                break;
        }
    }

    get_assigned_routes(query_type, data) {
        switch (query_type) {
            case "get_gorup_name":
                return knex("groups")
                    .where("id", data.group_id)
                break;
            case "get_list":
                return knex("groups_has_routes")
                    .select({
                        id: "groups_has_routes.id",
                        route: "routes.route",
                        route_id: "routes.id",
                        group: "groups.name",
                        valid_permission_type: "routes.valid_permission_type",
                    })
                    .leftJoin("groups", "groups.id", "=", "groups_has_routes.group_id")
                    .leftJoin("routes", "routes.id", "=", "groups_has_routes.route_id")
                    .where({
                        "groups_has_routes.group_id": data.group_id,
                        "groups_has_routes.user_type": data.user_type,
                        "groups_has_routes.status": 1
                    });
        }
    }
    remove_route(query_type, data) {
        switch (query_type) {
            case "remove":
                return knex("groups_has_routes")
                    .update({
                        status: 0
                    })
                    .where("id", data.assigned_id);
                break;
        }
    }

    update_permission_status(query_type, data) {
        switch (query_type) {
            case "check_is_exist":
                return knex(data.table)
                    .where({
                        group_id: data.group_id
                    }).where(data.where);
                break;
            case "insert_new":
                return knex(data.table)
                    .insert(data.insert_data);
            case "update_status":
                return knex(data.table)
                    .update({
                        status: data.status
                    })
                    .where({
                        group_id: data.group_id
                    }).where(data.where);
                break;
        }
    }

    assign_apis(query_type, data) {
        switch (query_type) {
            case "delete_apis":
                return knex("groups_has_apis")
                    .update({
                        status: 0
                    })
                    .whereIn("api_id", data.routes)
                    .where("group_id", data.group_id);
            case "add_api":
                return knex.batchInsert("groups_has_apis", data, 100);
                break;
        }
    }
    get_assigned_apis(query_type, data) {
        switch (query_type) {
            case "get_gorup_name":
                return knex("groups")
                    .where("id", data.group_id)
                break;
            case "get_list":
                return knex("groups_has_apis")
                    .select({
                        id: "groups_has_apis.id",
                        api: knex.raw("CONCAT(master_api_permission_modules.method,' - ',master_api_permission_modules.path)"),
                        group: "groups.name"
                    })
                    .leftJoin("groups", "groups.id", "=", "groups_has_apis.group_id")
                    .leftJoin("master_api_permission_modules", "master_api_permission_modules.id", "=", "groups_has_apis.api_id")
                    .where({
                        "groups_has_apis.group_id": data.group_id,
                        "groups_has_apis.user_type": data.user_type,
                        "groups_has_apis.status": 1
                    });
        }
    }
    remove_api(query_type, data) {
        switch (query_type) {
            case "remove":
                return knex("groups_has_apis")
                    .update({
                        status: 0
                    })
                    .where("id", data.assigned_id);
                break;
        }
    }
    get_api_list(query_type, data) {
        switch (query_type) {
            case "get_list":
                return knex("master_api_permission_modules")
                    .select({
                        id: "master_api_permission_modules.id",
                        api: knex.raw("CONCAT(master_api_permission_modules.method,' - ',master_api_permission_modules.path)")
                    })
                    .where({
                        "master_api_permission_modules.active": 1,
                        "master_api_permission_modules.api_user": data.user_type,
                        "master_api_permission_modules.disabled": 0
                    })
                break;
        }
    }
}