'use strict';
let knex = require('../../../../../config/knex.js');
let configKey = require("../../../../../config/config");
let dateFormat = require('dateformat');

module.exports = class OrganizationModel {
    constructor() { }

    add_organization(query_type,data) {
        switch(query_type){
            case "add_organization_exist":
                return knex("master_organization").select("master_organization.id")
                .where("master_organization.name", data['name'])
                .orWhere("master_organization.code", data['code'])
                break; 
           
           case "add_organization":
            return knex("master_organization").insert(data);
                break; 
        }
    }
    get_organization(query_type,data) {
        switch(query_type){
            case "get_organization":
                let columns = {
                    id: "master_organization.id",
                    name: "master_organization.name",
                    code: "master_organization.code",
                    email: "master_organization.email",
                    mobile: "master_organization.mobile",
                    address: "master_organization.address",
                    area: "master_organization.area",
                    emirate_id: "master_organization.emirate_id",
                    country_id: "master_organization.country_id",
                    emirate_name: "master_emirate.name",
                    country_name: "countries.name",
                };
            return knex("master_organization").select(columns)
                    .leftJoin("master_emirate","master_emirate.id","=","master_organization.emirate_id")
                    .leftJoin("countries","countries.id","=","master_organization.country_id")
                    .where("master_organization.id",data['id']);
           break; 
        }
    }
    // edit_organization(query_type,data) {
    //     console.log("8888888",data)
    //     switch(query_type){
    //         case "edit_organization_exist":
    //         return knex("master_organization").select("master_organization.id")
    //                             .where("master_organization.name", data['name'])
    //                             .orWhere("master_organization.code", data['code'])
    //                                     .andWhereRaw("master_organization.id !="+data['id']);
    //        break; 
    //        case "edit_organization":
    //         return knex("master_organization").update(data).where("master_organization.id",data['id']);
    //        break; 
    //     }
    // }
    edit_organization(query_type,data) {
        switch(query_type){
            case "edit_organization_exist":
             return knex("master_organization").select("master_organization.id")
                    .whereRaw("(master_organization.name='"+ data['name']+"' AND master_organization.code='"+ data['code']+"')")
                    .andWhereRaw("master_organization.id !="+data['id']);
            break; 
           case "edit_organization":
            return knex("master_organization").update(data).where("master_organization.id",data['id']);
           break; 
        }
    }
    list_organization(query_type,data) {
        console.log("$$$$$$$$$$$$$$$$$$$$$",data);
        switch(query_type){
            case "list_organization":
                let columns = {
                    id: "master_organization.id",
                    name: "master_organization.name",
                    code: "master_organization.code",
                    email: "master_organization.email",
                    mobile: "master_organization.mobile",
                    address: "master_organization.address",
                    area: "master_organization.area",
                    emirate_id: "master_organization.emirate_id",
                    country_id: "master_organization.country_id",
                    emirate_name: "master_emirate.name",
                    country_name: "countries.name",
                };
            let query= knex("master_organization").select(columns)
                    .leftJoin("master_emirate","master_emirate.id","=","master_organization.emirate_id")
                    .leftJoin("countries","countries.id","=","master_organization.country_id")
                if (data['name']) {
					query.whereRaw("master_organization.name like '%" + data['name'] + "%'")
                }
                if (data['code']) {
					query.whereRaw("master_organization.code like '%" + data['code'] + "%'")
                }
                if (data['email']) {
					query.whereRaw("master_organization.email like '%" + data['email'] + "%'")
                }
                if (data['mobile']) {
					query.whereRaw("master_organization.mobile like '%" + data['mobile'] + "%'")
				}
				if (data['from_date'] && data['to_date']) {
					query.whereBetween('master_organization.created_at', [dateFormat(data['from_date'], "yyyy-mm-dd 00:00:00"), dateFormat(data['to_date'], "yyyy-mm-dd 23:59:59")]);
				} else if (data['from_date'] && !data['to_date']) {
					query.whereBetween('master_organization.created_at', [dateFormat(data['from_date'], "yyyy-mm-dd"), dateFormat(now, "yyyy-mm-dd 23:59:59")]);
				} else if (!data['from_date'] && data['to_date']) {
					query.whereBetween('master_organization.created_at', ["1970-01-01", [dateFormat(data['to_date'], "yyyy-mm-dd 23:59:59")]]);
				}
				query.orderBy("master_organization.created_at", "desc")
				return query;
            break;
        }
    }
}