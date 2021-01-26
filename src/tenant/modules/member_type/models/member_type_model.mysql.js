let knex = require("../../../../../config/knex");
let dateFormat = require('dateformat');
let now = new Date();
module.exports = class MemberTypeModel {

    /**
     * @description
     * @author siddheshwar kadam
     * @param {*} data
     * @returns
     */
    getMemberType(data) {
        return knex("master_member_type")
            .select('*')
            .where(data.where)
    }

    /**
    * @description
    * @author siddheshwar
    * @param {*} data
    * @returns
    */
    get_member_type(data) {
        console.log(data)
        let obj = knex.select("*")
            .from("master_member_type")
        if (data['name']) {
            obj.where("master_member_type.name", "like", "%" + data['name'] + "%");
        }
        if (data['from_date'] && data['to_date']) {
            obj.whereBetween('master_member_type.created_at', [data['from_date'], data['to_data']]);
        } else if (data['from_date'] && !data['to_date']) {
            obj.whereBetween('master_member_type.created_at', [data['from_date'], dateFormat(now, "yyyymmdd 23:59:59")]);
        } else if (!data['from_date'] && data['to_date']) {
            obj.whereBetween('master_member_type.created_at', ["19700101", data['to_date'] + " 23:59:59"]);
        }
        return obj;
    }

    /**
     * Insert Member Type
     *
     * @param data
     * @returns {*}
     */
    insertMemberType(data) {
        return knex("master_member_type").insert(data, "id");
    }

    /**
   * Update Member Type
   *
   * @param data
   * @returns {*}
   */
  updateMemberType(data) {
    return knex("master_member_type").update(data.data).where(data.where);
}


    /**
     * 
     * Get Member Type by id
     */
    get_member_type_by_id(data) {
        return knex("master_member_type")
            .select('*')
            .where(data.where)

    }
    
    updateMemberTypeStatus(data){
        return knex('master_member_type')
    .update(data.data).where(data.where);
    }

    get_total_member_count(){
        return knex("master_member_type")
        .select({ total_record: knex.raw("COUNT(*)") })
    }
    
}
