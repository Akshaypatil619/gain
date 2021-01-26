let knex = require("../../../../config/knex.js");
module.exports = class Language {

	get_language_list(query_type, columns) {
		switch (query_type) {
			case "get_language_list":
				return knex.select("master_languages.*")
					.from("master_languages")
					.where('master_languages.status', 1)
					// .where('master_languages.is_deleted', '!=', 1);
		}
	}
	add_language(query_type, data) {
		switch (query_type) {
			case "add_language":
				return knex('master_languages').insert(data)
		}
	}
	get_language_master_list(query_type, data) {
		switch (query_type) {
			case "get_language_master":
				let obj = knex.select(data.column)
					.from('master_languages')
					.limit(data['limit'])
					.offset(data['offset'])

				if (data['language_name']) {
					obj.where("master_languages.language_name", "like", "%" + data['language_name'] + "%")
				}
				if (data['language_code']) {
					obj.where("master_languages.language_code", "like", "%" + data['language_code'] + "%")
				}
				if (data['language_name'] && data['language_code']) {
					obj.where(function () {
						this.where("master_languages.language_name", "=", data['language_name'])
							.andWhere("master_languages.language_code", "=", data['language_code'])
					});
				}
				if (data['is_default']) {
					 obj.where("master_languages.is_default", 1)
				}
				return obj;
				break;
			case "get_language_master_count":
				return knex("master_languages").select({
					total_record: knex.raw('COUNT(*) ')
				})
		}
	}
	edit_language(query_type, data) {
		switch (query_type) {
			case "update":
				return knex("master_languages")
					.update(data)
					.where("id", data['id'])
		}
	}
	update_is_default(query_type, id) {
		switch (query_type) {
			case "update_is_default":
				return knex('master_languages')
					.update({ is_default: 0 })
					.whereNot("id", id)
		}
	}

	get_language_master_by_id(query_type, data) {
		switch (query_type) {
			case "get_language":
				return knex.select("*")
					.where("id", data['id'])
					.from("master_languages")
		}
	}

	getLanguageInfo(query_type, data) {
		switch (query_type) {
			case "get_language_name":
				return knex.select("*")
					.where("language_name", data)
					.from("master_languages")
				break;
			case "get_language_code":
				return knex.select("*")
					.where("language_code", data)
					.from("master_languages")
				break;
		}
	}
}