let dateFormat = require('dateformat');
let knex = require("../../../../config/knex.js");
let now = new Date();
module.exports = class Point_defination {
    add_point_definition(query_type, data) {
        switch (query_type) {
            case "add_defination":
                return knex("master_point_definition")
                    .insert(data,"id")
                break;
        }
    }
    edit_point_definition(query_type, data) {
        switch (query_type) {
            case "updaet_defination":
                return knex("master_point_definition")
                    .where("id", data['point_definition_id'])
                    .update(data.data)
                break;
        }
    }
    get_point_definition_by_id(query_type, data) {
        switch (query_type) {
            case "get_point_defination":
                return knex.select("*")
                    .where("id", data['point_definition_id'])
                    .where("tenant_id", data['tenant_id'])
                    .from("master_point_definition")
                break;
        }
    }
    get_point_definition_list(query_type, data) {
        switch (query_type) {
            case "get_defination_list":
                let columns = {
                    id: "master_point_definition.id",
                    name: "master_point_definition.name",
                    no_of_rule: knex.raw(" COUNT(earning_point_rules.id) ")
                };

                let obj = knex.select(columns)
                    .from("master_point_definition")
                    .leftJoin('earning_point_rules', function () {
                        this.on("earning_point_rules.point_definition_id", "=", 'master_point_definition.id')
                            .on('earning_point_rules.status', 1)
                    })
                    .where("master_point_definition.tenant_id", "=", data['tenant_id'])
                    .where("master_point_definition.status", "=", 1)
                    .groupBy('master_point_definition.id');

                if (data['search']) {
                    obj.where("master_point_definition.name", "like", "%" + data['search'] + "%");
                }
                if (data['from_date'] && data['to_date']) {
                    obj.whereBetween('master_point_definition.created_at', [data['start_date'], data['end_date']]);
                } else if (data['start_date'] && !data['end_date']) {
                    obj.whereBetween('master_point_definition.created_at', [data['start_date'], dateFormat(now, "yyyy-mm-dd 23:59:59")]);
                } else if (!data['start_date'] && data['end_date']) {
                    obj.whereBetween('master_point_definition.created_at', ["1970-01-01", data['to_date'] + " 23:59:59"]);
                }
                return obj;
                break;
        }
    }
    get_accrual_point_definition_list(query_type, data) {
        switch (query_type) {
            case "get_accrual_list":
                let columns = {
                    id: "master_point_definition.id",
                    name: "master_point_definition.name",
                    no_of_rule: knex.raw(" COUNT(airline_accrual_point_rules.id) ")
                };

                let obj = knex.select(columns)
                    .from("master_point_definition")
                    .leftJoin('airline_accrual_point_rules', function () {
                        this.on("airline_accrual_point_rules.point_definition_id", "=", 'master_point_definition.id')
                            .on('airline_accrual_point_rules.status', 1)
                    })
                    .where("master_point_definition.tenant_id", "=", data['tenant_id'])
                    .where("master_point_definition.status", "=", 1)
                    .groupBy('master_point_definition.id');

                if (data['search']) {
                    obj.where("master_point_definition.name", "like", "%" + data['search'] + "%");
                }
                if (data['from_date'] && data['to_date']) {
                    obj.whereBetween('master_point_definition.created_at', [data['start_date'], data['end_date']]);
                } else if (data['start_date'] && !data['end_date']) {
                    obj.whereBetween('master_point_definition.created_at', [data['start_date'], dateFormat(now, "yyyy-mm-dd 23:59:59")]);
                } else if (!data['start_date'] && data['end_date']) {
                    obj.whereBetween('master_point_definition.created_at', ["1970-01-01", data['to_date'] + " 23:59:59"]);
                }
                return obj;
                break;
        }
    }
    get_redemption_point_definition_list(query_type, data) {
        switch (query_type) {
            case "get_redeem_list":
                let columns = {
                    id: "master_point_definition.id",
                    name: "master_point_definition.name",
                    no_of_rule: knex.raw(" COUNT(airline_redemption_point_rules.id) ")
                };

                let obj = knex.select(columns)
                    .from("master_point_definition")
                    .leftJoin('airline_redemption_point_rules', function () {
                        this.on("airline_redemption_point_rules.point_definition_id", "=", 'master_point_definition.id')
                            .on('airline_redemption_point_rules.status', 1)
                    })
                    .where("master_point_definition.tenant_id", "=", data['tenant_id'])
                    .where("master_point_definition.status", "=", 1)
                    .groupBy('master_point_definition.id');

                if (data['search']) {
                    obj.where("master_point_definition.name", "like", "%" + data['search'] + "%");
                }
                if (data['from_date'] && data['to_date']) {
                    obj.whereBetween('master_point_definition.created_at', [data['start_date'], data['end_date']]);
                } else if (data['start_date'] && !data['end_date']) {
                    obj.whereBetween('master_point_definition.created_at', [data['start_date'], dateFormat(now, "yyyy-mm-dd 23:59:59")]);
                } else if (!data['start_date'] && data['end_date']) {
                    obj.whereBetween('master_point_definition.created_at', ["1970-01-01", data['to_date'] + " 23:59:59"]);
                }
                return obj;
                break;
        }
    }
}
