let knex = require("../../../../config/knex.js");
module.exports = class product_type {
    add_product_type(query_type, data) {
        switch (query_type) {
            case "get_product_type":
            let productQuery = "(" + knex.raw("product_type_master.name='" + data['input'] 
                                       + "' OR product_type_master.code='" + data['code'] + "'")+")";
                return knex.select("id")
                    .from("product_type_master")
                    .where(knex.raw(productQuery))
                break;    
            case "insert_product_type":
                return knex("product_type_master")
                    .insert(data);
               break;
            case "insert_product_type_languages":
                return knex("product_type_languages")
                    .insert(data);
                break;            
        }
    }

    edit_product_type(query_type, data) {
        switch (query_type) {
            case "update":
                return knex("product_type_master")
                    .where("id", data['id'])
                    .update(data);
                break;    
            case "check_exists":
                return knex("product_type_master")
                    .where("name", data['name'])
                    .whereNot("id", data['id']);
                break;
            case "update_product_type_languages":
                return knex("product_type_languages")
                    .where("id", data['id'])
                    .update(data)
            break;            
        }
    }

    get_product_type_by_id(query_type, data) {
        switch (query_type) {
            case "get_product_type":
                return knex.select("*")
                    .where("id", data['id'])
                    .from("product_type_master");
                break;
            case "get_master_product_type_languages":
                  let coulmns ={id: "product_type_languages.id",
                                product_type_id: "product_type_languages.product_type_id",
                                product_type_name: "product_type_languages.product_type_name",
                                language_name: "product_type_languages.language_name",
                                language_code: "product_type_languages.language_code"
                            }
                return knex.select(coulmns)
                    .from("product_type_languages")
                    .innerJoin('product_type_master', 'product_type_master.id', 'product_type_languages.product_type_id')
                    .where("product_type_master.id", Number(data['id']));
                break;            
        }
    }

    get_product_type_list(query_type, data) {
        switch (query_type) {
            case "get_list":
                let columns = {
                    name: "product_type_master.name",
                    code: "product_type_master.code",
                    created_at: "product_type_master.created_at",
                    organization: "product_type_master.organization",
                    status: "product_type_master.status",
                    id: "product_type_master.id",
                };
                let obj = knex.select(columns)
                    .from("product_type_master")
                    .where("product_type_master.status", 1);
                if (data['search']) {
                    obj.where("product_type_master.name", "like", "%" + data['search'] + "%");
                }
                return obj;
        }
    }

}