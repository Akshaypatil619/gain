let knex = require("../../../../config/knex.js");
module.exports = class Activities {

    // get_all_partners(query_type, data) {
    //     let obj = {};
    //     switch (query_type) {
    //         case "fetch_all_partners":
    //             obj = knex("partner_master")
    //                 .select(data.columns)
    //                 .leftJoin('master_rule_activity', 'master_rule_activity.id', '=', 'partner_master.redemption_activity_id')
    //                 .where("partner_master.created_by", data['tenant_id'])
    //                 .groupBy("partner_master.id");

    //             if (data['search']) {
    //                 obj.where("partner_master.name", "like", "%" + data['search'] + "%");
    //             }

    //             return obj;

    //         case "get_total_partners_count":
    //             obj = knex("partner_master")
    //                 .select(knex.raw(' count( DISTINCT partner_master.id ) as count'))
    //                 .leftJoin('master_rule_activity', 'master_rule_activity.id', '=', 'partner_master.redemption_activity_id')
    //                 .where("partner_master.created_by", data['tenant_id']);

    //             if (data['search']) {
    //                 obj.where("partner_master.name", "like", "%" + data['search'] + "%");
    //             }

    //             return obj;
    //     }
    // }

    addPartner(queryType, data) {
        switch (queryType) {
            case "checkName": {
                let checkNameColumns = {
                    id: "merchants.id"
                }
                return knex("merchants")
                    .select(checkNameColumns)
                    .where("merchants.name", data['name'])
            }

            case "getMerchantType":
                return knex("master_tenant_type")
                    .select("master_tenant_type.id")
                    .where("name", data)

            case "addPartner":
                return knex("merchants")
                    .insert(data)

            case "addPartnerUser":
                return knex("merchant_users")
                    .insert(data)

            case "insertCountries":
                return knex("partner_has_countries")
                    .insert(data)

            case "insertCategories":
                return knex("partner_has_categories")
                    .insert(data)
        }
    }

    editPartner(queryType, data) {
        switch (queryType) {
            case "checkNameEdit": {
                let checkNameEditColumns = {
                    id: "merchants.id"
                }
                return knex("merchants")
                    .select(checkNameEditColumns)
                    .where("merchants.name", data['name'])
                    .where("merchant_id", "!=", data['id'])
            }

            case "editPartner":
                return knex("merchants")
                    .where("id", data['partner_id'])
                    .update(data['data'])

            case "editPartnerUser":
                return knex("merchant_users")
                    .where("merchant_id", data['partner_id'])
                    .update(data['data'])

            // countries
            case "removeCountries": {
                return knex("partner_has_countries")
                    .update({ "status": 0, "display_order": null })
                    .where("partner_id", data['partner_id'])
                    .whereNotIn("country_id", data['countries'])
                    .where("country_id", "!=", 0)
                    .where("status", 1)
            }
            case "setPreviousCountries": {
                return knex("partner_has_countries")
                    .update({ "status": 1 })
                    .where("partner_id", data['partner_id'])
                    .whereIn("country_id", data['countries'])
                    .where("status", 0)
            }
            case "fetchExistingCountries": {
                return knex("partner_has_countries")
                    .select("*")
                    .where("partner_id", data['partner_id'])
                    .where("status", 1)
            }
            case "insertCountries": {
                return knex("partner_has_countries")
                    .insert(data)
            }

            // categories
            case "removeCategories": {
                return knex("partner_has_categories")
                    .update({ "status": 0 })
                    .where("partner_id", data['partner_id'])
                    .whereNotIn("category_id", data['categories'])
                    .where("category_id", "!=", 0)
                    .where("status", 1)
            }
            case "setPreviousCategories": {
                return knex("partner_has_categories")
                    .update({ "status": 1 })
                    .where("partner_id", data['partner_id'])
                    .whereIn("category_id", data['categories'])
                    .where("status", 0)
            }
            case "fetchExistingCategories": {
                return knex("partner_has_categories")
                    .select("*")
                    .where("partner_id", data['partner_id'])
                    .where("status", 1)
            }
            case "insertCategories": {
                return knex("partner_has_categories")
                    .insert(data)
            }
        }
    }

    // return knex("partner_has_countries, partner_has_categories")
    //     .where("partner_has_countries.partner_id", data)
    //     .where("partner_has_categories.partner_id", data)
    //     .update("partner_has_countries.status", 0)
    //     .update("partner_has_categories.status", 0)
    // return knex.raw(`UPDATE partner_has_countries, partner_has_categories
    //     SET partner_has_countries.status = ?,
    //     partner_has_categories.status = ?
    //     WHERE partner_has_countries.partner_id = ?
    //     AND partner_has_categories.country_id != ?
    //     AND partner_has_categories.partner_id = ?`,
    //     [0, 0, data, 0, data])

    getPartnerById(queryType, data) {
        switch (queryType) {
            case "getPartnerById":
                return knex("merchants")
                    .select(data['columns'])
                    .leftJoin("partner_has_countries", function () {
                        this.on("partner_has_countries.partner_id", "=", "merchants.id")
                            .on("partner_has_countries.partner_id", "=", knex.raw("?", [data['id']]))
                            .on("partner_has_countries.status", "=", knex.raw("?", [1]))
                            .on("partner_has_countries.status", "!=", knex.raw("?", [0]))
                    })
                    .leftJoin("partner_has_categories", function () {
                        this.on("partner_has_categories.partner_id", "=", "merchants.id")
                            .on("partner_has_categories.partner_id", "=", knex.raw("?", [data['id']]))
                            .on("partner_has_categories.status", "=", knex.raw("?", [1]))
                    })
                    .where("merchants.id", data['id'])
        }
    }

    getPartnerList(queryType, data) {
        switch (queryType) {
            case "getPartnerList": {
                let obj = knex("merchants")
                    .select(data['columns'])
                    .innerJoin("master_tenant_type", function () {
                        this.on("master_tenant_type.id", "=", "merchants.merchant_type_id")
                            .on("master_tenant_type.name", "=", knex.raw("?", ["Partner"]))
                    })
                    .innerJoin("partner_has_countries", function () {
                        this.on("partner_has_countries.partner_id", "=", "merchants.id")
                            .on("partner_has_countries.status", knex.raw("?", [1]))
                    })

                if (data['name']) {
                    obj.where("merchants.name", "like", "%" + data['name'] + "%");
                }
                if (data['countries']) {
                    let countries = data['countries'].split(",");

                    obj.whereIn("partner_has_countries.country_id", countries)
                }
                if (data['categories']) {
                    let categories = data['categories'].split(",");

                    obj.innerJoin("partner_has_categories", function () {
                        this.on("partner_has_categories.partner_id", "=", "merchants.id")
                            .on("partner_has_categories.status", knex.raw("?", [1]))
                    })
                    obj.whereIn("partner_has_categories.category_id", categories)
                }
                obj.orderByRaw("partner_has_countries.display_order IS NULL, partner_has_countries.display_order");

                return obj;
            }
        }
    }

    getPartnerDropdownList(queryType, data) {
        switch (queryType) {
            case "getPartnerDropdownList": {
                let obj = knex("merchants")
                    .select(data['columns'])
                    .innerJoin("master_tenant_type", function () {
                        this.on("master_tenant_type.id", "=", "merchants.merchant_type_id")
                            .on("master_tenant_type.name", "=", knex.raw("?", ["Partner"]))
                    });

                data['name'] ? obj.where("merchants.name", "like", "%" + data['name'] + "%") : "";
                data['limit'] ? obj.limit(data['limit']) : "";
                data['offset'] ? obj.offset(data['offset']) : "";

                return obj;
            }
        }
    }

    getPartnerListByCountry(queryType, data) {
        switch (queryType) {
            case "getPartnerListByCountry": {
                let obj = knex("merchants")
                    .select(data['columns'])
                    .innerJoin("master_tenant_type", function () {
                        this.on("master_tenant_type.id", "=", "merchants.merchant_type_id")
                            .on("master_tenant_type.name", "=", knex.raw("?", ["Partner"]))
                    })
                    .innerJoin("partner_has_countries", function () {
                        this.on("partner_has_countries.partner_id", "=", "merchants.id")
                            .on("partner_has_countries.status", knex.raw("?", [1]))
                            .on("partner_has_countries.country_id", knex.raw("?", [data['countries']]))
                    })
                    .where("merchants.status", 1)
                    .orderByRaw("partner_has_countries.display_order IS NULL, partner_has_countries.display_order");

                return obj;
            }
        }
    }

    insertPartnerDisplayOrdersByCountry(queryType, data) {
        switch (queryType) {
            case "insertPartnerDisplayOrdersByCountry": {
                let obj = knex('partner_has_countries')
                    .insert(data)
                    .toQuery();

                obj += " ON DUPLICATE KEY UPDATE display_order = VALUES(display_order)";
                return knex.raw(obj);

            }
        }
    }

}