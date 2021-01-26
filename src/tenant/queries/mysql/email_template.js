
let knex = require("../../../../config/knex.js");
module.exports = class Email_template {

	add_email_template(query_type, data) {
		switch (query_type) {
			case "insert_":
				return knex("email_templates")
					.insert(data)
		}
	}
	edit_email_template(query_type, data) {
		switch (query_type) {
			case "update_":
				return knex("email_templates")
					.where("id", data['email_template_id'])
					.update(data.data)
		}
	}
	get_email_template_by_id(query_type, data) {
		switch (query_type) {
			case "get_email_template":
				let obj = knex.select(data.columns)
					.from("email_templates")
					.where("email_templates.id", data['email_id'])
					.leftJoin('tag_has_activities', 'tag_has_activities.id', '=', 'email_templates.activity_id')
					.leftJoin('master_tag', 'master_tag.id', '=', 'tag_has_activities.tag_id')
					.leftJoin('master_api_permission_modules', 'master_api_permission_modules.id', '=', 'tag_has_activities.activity_id')
				return obj;
		}
	}
	get_email_template_list(query_type, data) {
		switch (query_type) {
			case "get_list":
				let obj = knex.select(data.columns)
					.from("email_templates")
					.where("email_templates.tenant_id", data['tenant_id'])
				if (data['search']) {
					obj.where("email_templates.template_name", "like", "%" + data['search'] + "%");
				}
				return obj;
			case "get_email_activity_list":
				let column = {
					email_template_id: "email_template_activities.email_template_id",
					activity_name: "master_api_permission_modules.name",
				}
				return knex('email_template_activities').select(column)
					.innerJoin('master_api_permission_modules', 'master_api_permission_modules.id', '=', 'email_template_activities.activity_id')
					.where('email_template_activities.status', 1);
		}
	}

	get_tag_list(query_type, data) {
		switch (query_type) {
			case "get_tag_list":
				let query = knex('tag_has_activities').select(data.columns)
					.distinct('master_tag.tag_name')
					.innerJoin('master_tag', 'master_tag.id', '=', 'tag_has_activities.tag_id')
					.whereIn('tag_has_activities.activity_id', data);
				return query;
		}
	}

	sendEmail(query_type, data) {
		switch (query_type) {
			case "":
				break;
		}
	}
	convertHtmlToJade(query_type, data) {
		switch (query_type) {
			case "":
				break;
		}
	}
	get_activity_email_logs(query_type, data) {
		switch (query_type) {
			case "get_cron_data":
				return knex("email_sms_cron_data")
					// .where("tenant_id",query_data.tenant_id)
					.leftJoin("master_api_permission_modules", "master_api_permission_modules.id", "=", "email_sms_cron_data.activity_id")
				break;
		}
	}

	get_selected_activity_list(query_type, data) {
		switch (query_type) {
			case "get_selected_activity_list":
				let query = knex('email_template_activities').select(data.columns)
					.where('email_template_activities.email_template_id', data["email_template_id"])
					.where('email_template_activities.status', 1);
				return query;
		}
	}

	get_selected_email_languages(query_type, data) {
		switch (query_type) {
			case "get_selected_email_languages":
				let query = knex('languages_for_email_templates').select(data.columns)
					.leftJoin("master_languages", "languages_for_email_templates.language_code", "=", "master_languages.language_code")
					.where('languages_for_email_templates.email_template_id', data["email_template_id"])
					.where('languages_for_email_templates.status', 1);
				return query;
		}
	}
}