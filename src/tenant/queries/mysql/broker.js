let dateFormat = require('dateformat');
let knex = require("../../../../config/knex.js");
let now = new Date();
module.exports = class broker {
	add_broker(query_type, data) {
		switch (query_type) {
			case "get_broker":
				return knex("master_broker").select("id")
                    .where("email", data.email)
                    .where("phone", data.phone) 
				break;
			case "insert":
				return knex("master_broker").insert(data);
				break;
		}
    }
    

	edit_broker(query_type, data) {
		switch (query_type) {
			case "update":
				return knex("master_broker")
					.where("id", data['id'])
					.update(data.data)
				break;
		}
	}
	
	get_broker(query_type, data) {
		let columns = {
			id: "master_broker.id",
			name: "master_broker.name",
			email: "master_broker.email",
			phone: "master_broker.phone",
			role_id: "master_broker.role_id",
			orn_number: "master_broker.orn_number",
			reference_number: "master_broker.reference_number",
			permit_number: "master_broker.permit_number",
			address: "master_broker.address",
			experience: "master_broker.experience",
			image_path: "master_broker.image_path",
			languages: "master_broker.languages",
			organization_id: "master_broker.organization_id",
			status: "master_broker.status",
			building_id: knex.raw("GROUP_CONCAT(distinct building_has_brokers.building_id)"),
			country_id: "master_broker.country_id"
		}
		switch (query_type) {
			case "get_template":
				return knex("master_broker").select(columns)
					.leftJoin('building_has_brokers', 'building_has_brokers.broker_id', '=', 'master_broker.id')
					.where("master_broker.id", data['id']).andWhere("building_has_brokers.status", 1);
				break;
		}
	}
	get_broker_list(query_type, data) {
		switch (query_type) {
			case "get_list":
				let columns = {
					id: "master_broker.id",
					name: "master_broker.name",
					email: "master_broker.email",
					phone: "master_broker.phone",
					orn_number: "master_broker.orn_number",
					permit_number: "master_broker.permit_number",
					reference_number: "master_broker.reference_number",
					role_id: "master_broker.role_id",
					experience: "master_broker.experience",
					languages: "master_broker.languages",
					address: "master_broker.address",
					status: "master_broker.status",
					// building_name: "master_building.name",
					organization_name: "master_organization.name",
					country_name: "countries.name",
				}
				let obj = knex.select(columns)
					.from("master_broker")
					// .leftJoin('master_building', 'master_building.id', '=', 'master_broker.building_id')
					.leftJoin('master_organization', 'master_organization.id', '=', 'master_broker.organization_id')
					.leftJoin('countries', 'countries.id', '=', 'master_broker.country_id')
				if (data['name']) {
					obj.whereRaw("master_broker.name like '%" + data['name'] + "%'")
				}
				if (data['email']) {
					obj.whereRaw("master_broker.email like '%" + data['email'] + "%'")
				}
				if (data['phone']) {
					obj.whereRaw("master_broker.phone like '%" + data['phone'] + "%'")
				}
				if (data['from_date'] && data['to_date']) {
					obj.whereBetween('master_broker.created_at', [dateFormat(data['from_date'], "yyyy-mm-dd 00:00:00"), dateFormat(data['to_date'], "yyyy-mm-dd 23:59:59")]);
				} else if (data['from_date'] && !data['to_date']) {
					obj.whereBetween('master_broker.created_at', [dateFormat(data['from_date'], "yyyy-mm-dd"), dateFormat(now, "yyyy-mm-dd 23:59:59")]);
				} else if (!data['from_date'] && data['to_date']) {
					obj.whereBetween('master_broker.created_at', ["1970-01-01", [dateFormat(data['to_date'], "yyyy-mm-dd 23:59:59")]]);
				}
				return obj.orderBy("master_broker.id","DESC");
				break;
			}
	}

	get_building_list() {
		return knex("master_building").select("master_building.*");
			
	}
	
	
}