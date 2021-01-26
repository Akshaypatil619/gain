let knex = require("../../../../config/knex.js");
module.exports = class Sms_teplate {
	add_sms_template(query_type, data) {
		switch (query_type) {
			case "get_sms_template":
				return knex("sms_templates").select("id")
					.where("template_name", data.template_name)
					.andWhere("template_code", data.template_code)
					.where("tenant_id", data.tenant_id)
				break;
			case "insert":
				return knex("sms_templates").insert(data);
				break;
		}
	}
	edit_sms_template(query_type, data) {
		switch (query_type) {
			case "update":
				return knex("sms_templates")
					.where("id", data['sms_template_id'])
					.update(data.data)
				break;
		}
	}
	get_sms_template_by_id(query_type, data) {
		switch (query_type) {
			case "get_template":
				let columns = {
					id: "sms_templates.id",
					template_name: "sms_templates.template_name",
					template_code: "sms_templates.template_code",
					status: "sms_templates.status",
					body: "languages_for_sms_templates.body",
					language_code: "languages_for_sms_templates.language_code",
				}
				return knex("sms_templates").select(columns)
					.join("languages_for_sms_templates", "languages_for_sms_templates.sms_template_id", "=", "sms_templates.id")	
					.where('tenant_id', data['tenant_id'])
					.where("sms_templates.id", data['sms_template_id'])
				break;
		}
	}
	get_sms_template_list(query_type, data) {
		switch (query_type) {
			case "get_list":
				let columns = {
					id: "sms_templates.id",
					template_name: "sms_templates.template_name",
					template_code: "sms_templates.template_code",
					body: "sms_templates.body",
					status: "sms_templates.status",
					activity_id: "sms_templates.activity_id"
				};
				let obj = knex.select(columns)
					.from("sms_templates")
					.where("sms_templates.tenant_id", data['tenant_id'])
				if (data['search']) {
					obj.where("sms_templates.template_name", "like", "%" + data['search'] + "%");
				}
				return obj;
				break;

				case "get_sms_activity":
					let column = {
						tag_id: "sms_template_activities.sms_template_id",
						// activity_id: "tag_has_activities.activity_id",
						activity_name: "master_api_permission_modules.name"
					};
					let obj1 = knex.select(column)
						.from("sms_template_activities")
						.innerJoin("master_api_permission_modules", "master_api_permission_modules.id", "=", "sms_template_activities.activity_id")
						.where("sms_template_activities.status", 1)
					return obj1;
					break;
			}
		}
	
	get_sms_activities_list(query_type, data) {
		switch (query_type) {
			case "get_sms_activities":
				return knex("master_api_permission_modules")
					.select(['id', "name"])
					// .where("api_user", "cc")
					.where("is_sms_activity", 1)
					.where("active", 1)
					.where("disabled", 0)
		}
	}

	get_selected_activity_list(query_type, data) {
		switch (query_type) {
			case "get_selected_activity_list":
				let query = knex('sms_template_activities').select(data.columns)
					.where('sms_template_activities.sms_template_id', data["sms_template_id"])
					.where('sms_template_activities.status', 1);
				return query;
		}
	}

	get_selected_sms_languages(query_type, data) {
		switch (query_type) {
			case "get_selected_sms_languages":
				let query = knex('languages_for_sms_templates').select(data.columns)
					.leftJoin("master_languages", "languages_for_sms_templates.language_code", "=", "master_languages.language_code")
					.where('languages_for_sms_templates.sms_template_id', data["sms_template_id"])
					.where('languages_for_sms_templates.status', 1);
				return query;
		}
	}
}