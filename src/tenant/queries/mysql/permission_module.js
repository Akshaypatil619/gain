let knex = require("../../../../config/knex.js");
module.exports = class permission_module {

	add_permission_module(query_type, data) {
		switch (query_type) {
			case "add_module":
				return knex("master_api_permission_modules")
					.insert(data)
				break;
			case "checkExist":
				return knex.select("id")
				.where("master_api_permission_modules.name", data['name'])
				.from("master_api_permission_modules")
				break;
		}
	}

	permission_module_list(query_type, data) {
		switch (query_type) {
			case "get_list":
				let columns = {
					id: "master_api_permission_modules.id",
					name: "master_api_permission_modules.name",
					path: "master_api_permission_modules.path",
					method: "master_api_permission_modules.method",
					is_email_activity: "master_api_permission_modules.is_email_activity",
					is_sms_activity: "master_api_permission_modules.is_sms_activity",
					is_push_activity: "master_api_permission_modules.is_push_activity",
					is_notification_activity: "master_api_permission_modules.is_notification_activity"
				};
				let obj = knex.select(columns)
					.from("master_api_permission_modules")
				// .where('master_api_permission_modules.status', 1)
				if (data['search']) {
					obj.where("master_api_permission_modules.name", "like", "%" + data['search'] + "%");
				}
				if (data['is_email_activity']) {
					obj.where("master_api_permission_modules.is_email_activity", "like", "%" + data['is_email_activity'] + "%");
				}
				if (data['is_sms_activity']) {
					obj.where("master_api_permission_modules.is_sms_activity", "like", "%" + data['is_sms_activity'] + "%");
				}
				if (data['is_push_activity']) {
					obj.where("master_api_permission_modules.is_push_activity", "like", "%" + data['is_push_activity'] + "%");
				}
				if (data['is_notification_activity']) {
					obj.where("master_api_permission_modules.is_notification_activity", "like", "%" + data['is_notification_activity'] + "%");
				}
				return obj;
				break;
		}
	}

	get_permission_module_byId(query_type, data) {
		switch (query_type) {
			case "get_permission_module":
				let columns = {
					name: "master_api_permission_modules.name",
					path: "master_api_permission_modules.path",
					method: "master_api_permission_modules.method",
					api_user: "master_api_permission_modules.api_user",
					is_email_activity: "master_api_permission_modules.is_email_activity",
					is_sms_activity: "master_api_permission_modules.is_sms_activity",
					is_push_activity: "master_api_permission_modules.is_push_activity",
					is_notification_activity: "master_api_permission_modules.is_notification_activity",
					is_inapp_notification_activity: "master_api_permission_modules.is_inapp_notification_activity",
					status: "master_api_permission_modules.status",
					active: "master_api_permission_modules.active",
					disabled: "master_api_permission_modules.disabled"
				};
				return knex.select(columns)
					.where("master_api_permission_modules.id", data['id'])
					.from("master_api_permission_modules")
				break;
		}
	}

	edit_permission_module(query_type, data) {
		switch (query_type) {
			case "update_permission_module":
				return knex("master_api_permission_modules")
					.where("id", data['id'])
					.update(data['obj'])
				break;
		}
	}

	change_activity_status(query_type, data) {
		switch (query_type) {
			case "update_permission_module_activity":
				return knex("master_api_permission_modules")
					.where("id", data['id'])
					.update(data['obj'])
				break;
		}
	}

}