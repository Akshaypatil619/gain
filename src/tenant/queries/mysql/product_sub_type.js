let knex = require("../../../../config/knex.js");
module.exports = class product_sub_type {
	add_product_sub_type(query_type, data) {
		switch (query_type) {
			case "get_product_sub_type":
				let subProductQuery = "(" + knex.raw("product_sub_type_master.name='" + data['input']
					+ "' OR product_sub_type_master.code='" + data['code'] + "'") + ")";
				return knex.select("name", "code")
					.from("product_sub_type_master")
					.where(knex.raw(subProductQuery))
				break;
			case "insert_product_sub_type":
				return knex("product_sub_type_master")
					.insert(data);
				break;
			case "insert_product_languages":
				return knex("sub_product_languages")
					.insert(data);
				break;
		}
	}

	edit_product_sub_type(query_type, data) {
		switch (query_type) {
			case "update":
				return knex("product_sub_type_master")
					.where("id", data['id'])
					.update(data);
				break;
			case "check_exists":
				return knex("product_sub_type_master")
					.where("name", data['name'])
					.whereNot("id", data['id']);
				break;
			case "update_product_languages":
				return knex("sub_product_languages")
					.where("id", data['id'])
					.update(data)
				break;
		}
	}

	get_product_sub_type_by_id(query_type, data) {
		switch (query_type) {
			case "get_product_sub_type":
				return knex.select("*")
					.where("id", data['id'])
					.from("product_sub_type_master");
				break;
			case "get_master_product_languages":
				let columns = {
					id: "sub_product_languages.id",
					sub_product_id: "sub_product_languages.sub_product_id",
					product_name: "sub_product_languages.product_name",
					link: "sub_product_languages.link",
					language_name: "sub_product_languages.language_name",
					language_code: "sub_product_languages.language_code"
				};
				return knex.select(columns)
					.from("sub_product_languages")
					.innerJoin('product_sub_type_master', 'product_sub_type_master.id', 'sub_product_languages.sub_product_id')
					.where("product_sub_type_master.id", Number(data['id']))
				break;
		}
	}

	get_product_sub_type_list(query_type, data) {
		switch (query_type) {
			case "get_list":
				let columns = {
					name: "product_sub_type_master.name",
					code: "product_sub_type_master.code",
					created_at: "product_sub_type_master.created_at",
					// link: "product_sub_type_master.link",
					status: "product_sub_type_master.status",
					product_type: "product_sub_type_master.product_type_id",
					id: "product_sub_type_master.id",
				};
				let obj = knex.select(columns)
					.from("product_sub_type_master")
					.where("product_sub_type_master.status", 1);
				if (data['search']) {
					obj.where("product_sub_type_master.name", "like", "%" + data['search'] + "%");
				}
				return obj;
		}
	}

	product_type_list(query_type, data) {
		switch (query_type) {
			case "get":
				let obj = knex.select(data.columns)
					.from("product_type_master")
					.where('status', 1);
				return obj;
		}
	}

}