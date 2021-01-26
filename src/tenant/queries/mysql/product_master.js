let knex = require("../../../../config/knex.js");
module.exports = class Product_Master {
	add_product(query_type, data) {
		switch (query_type) {
			case "get_master_product":
				// return knex.select(knex.raw("count(DISTINCT id) as count"))
				// 	.from("master_product")
				// break;

				// let subProductQuery = "(" + knex.raw("master_product.product_name='" + data['product_name'] + "'") + ")";
				// return knex.select("id")
				// 	.from("master_product")
				// 	.where(knex.raw(subProductQuery))
				// break;
				let productQuery = "(" + knex.raw("master_product.product_name='" + data['product_name']
					+ "' OR master_product.product_code='" + data['product_code'] + "'") + ")";
				return knex.select("id")
					.from("master_product")
					.where(knex.raw(productQuery))
				break;
			case "insert_master_product":
				return knex("master_product")
					.insert(data)
				break;
			case "insert_product_languages":
				return knex("product_languages")
					.insert(data)
				break;


		}
	}
	edit_product(query_type, data) {
		switch (query_type) {
			case "update":
				return knex("master_product")
					.where("id", data['id'])
					.update(data)
				break;
			case "check_exists":
				return knex("master_product")
					.where("product_name", data['product_name'])
					.whereNot("id", data['id']);
				break;
			case "update_product_languages":
				return knex("product_languages")
					.where("id", data['id'])
					.update(data)
				break;
		}
	}
	get_product_by_id(query_type, data) {
		switch (query_type) {
			case "get_master_product":
				return knex.select(data.columns)
					.where("id", data['id'])
					.from("master_product")
				break;
			case "get_master_product_languages":
				return knex.select(data.columns1)
					.from("product_languages")
					.innerJoin('master_languages', 'product_languages.language_code', 'master_languages.language_code')
					.where("product_id", data['id'])
				break;
		}
	}
	get_product_list(query_type, data) {
		switch (query_type) {
			case "get_list":
				let columns = {
					id: "master_product.id",
					product_name: "master_product.product_name",
					product_code: "master_product.product_code",
					created_at: "master_product.created_at",
					status: "master_product.status"
				};
				let obj = knex.select(columns)
					.from("master_product")
				//.where("master_product.status", 1);
				if (data['product_name']) {
					obj.where("master_product.product_name", "like", "%" + data['product_name'] + "%");
				}
				if (data['product_code']) {
					obj.where("master_product.product_code", "like", "%" + data['product_code'] + "%");
				}
				return obj;
				break;
		}
	}
}