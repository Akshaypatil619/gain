let knex = require("../../../../config/knex.js");
module.exports = class Point_type {
	add_point_type(query_type, data) {
		switch (query_type) {
			case "get_master_point_type":
				let productQuery = "(" + knex.raw("master_point_type.point_type_name='" + data['point_type_name']
					+ "' OR master_point_type.point_type_label='" + data['point_type_label'] + "'") + ")";
				return knex.select("id")
					.from("master_point_type")
					.where(knex.raw(productQuery))
			case "insert_master_point_type":
				return knex("master_point_type")
					.insert(data)
			case "insert_point_type_languages":
				return knex("master_point_type_languages")
					.insert(data)
		}
	}

	edit_point_type(query_type, data) {
		let point_type_id = data.id;
		let updateObject = Object.assign({}, data);
		delete updateObject.id;

		switch (query_type) {
			case "update":
				delete data.id;
				return knex("master_point_type")
					.where("id", point_type_id)
					.update(updateObject)

			case "check_exists":
				return knex("master_point_type")
					.where("point_type_name", data['point_type_name'])
					.whereNot("id", point_type_id);
			// .where("master_point_type.point_type_name", data['point_type_name'])
			// .whereNot("master_point_type.id", data['id'])

			case "update_point_type_languages":
				console.log("datadatadatadatadatadatadata : ", data);
				let id = data['id']
				delete data.id;
				delete data.point_type_id;
				return knex("master_point_type_languages")
					.where("id", id)
					.update(data)
		}
	}

	get_point_type_by_id(query_type, data) {
		switch (query_type) {
			case "get_master_point_type":
				return knex.select(data.columns)
					.where("id", data['id'])
					.from("master_point_type")
			case "get_master_point_type_languages":
				return knex.select(data.columns1)
					.from("master_point_type_languages")
					.innerJoin('master_languages', 'master_point_type_languages.language_code', '=', 'master_languages.language_code')
					.where("point_type_id", data['id'])
		}
	}

	get_point_type_list(query_type, data) {
		switch (query_type) {
			case "get_list":
				let columns = {
					point_type_name: "master_point_type.point_type_name",
					point_type_label: "master_point_type.point_type_label",
					point_expiry: "master_point_type.point_expiry",
					created_at: "master_point_type.created_at",
					applicable_points_percentage: "master_point_type.applicable_points_percentage",
					point_priority: "master_point_type.point_priority",
					id: "master_point_type.id",
					status: "master_point_type.status"
				};
				let obj = knex.select(columns)
					.from("master_point_type")
					// .where("master_point_type.is_transferable", 1)
					.where("master_point_type.status", 1);
				if (data['search']) {
					obj.where("master_point_type.point_type_name", "like", "%" + data['search'] + "%");
				}
				return obj;
		}
	}
}