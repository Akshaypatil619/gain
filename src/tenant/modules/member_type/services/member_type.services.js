let config = require('../../../../../config/config');
/************** Generate Objects ****************/
let responseMessages = require("../response/member_type.response");
let memberTypeModel = new (require("../models/member_type_model." + config.db_driver))();

module.exports = class MemberTypeService {
    /**
     * Add Member Type
     *
     * @param _data
     * @returns {*}
     * Author sidddheshwar kadam
     */
    async add_member_type(_data) {
        // prepare variables
        let data = {};
        let memberTypeData = _data.member_type;
        Object.assign(data, memberTypeData);
        delete data.tenant_id;
        return memberTypeModel.getMemberType({
            where:
            {
                name: memberTypeData['name'],
                prefix_id: memberTypeData['prefix_id'],
            }
        })
            .then((memberTypeDataObj) => {
                if (memberTypeDataObj.length > 0) {
                    throw new Error("member_type_already_exist")
                } else {
                    return memberTypeModel.insertMemberType(data);
                }
            })
            .then(async (id) => {
                if (id) {
                    return responseMessages.success("member_type_created_successfully");
                }
                else {
                    throw new Error("member_type_created_fail");
                }
            })
            .catch(function (err) {
                // return failed response to controller
                let error = (typeof err.errors != 'undefined') ? err.errors : err.message;
                return responseMessages.failed(responseMessages.hasOwnProperty(err.message) ? err.message : "rule_activity_created_fail", error)
            });
    }

    /**
     * Get member type with filter
     * 
     * @param {*} data 
     */
    async get_member_type(form_data) {
        // return variable
        let return_result = {};
        // get member type list
        console.log(form_data);
        return memberTypeModel.get_member_type(form_data)
            .then(async (result) => {
                if (result.length > 0) {
                    return_result.member_type_list = result;
                    // return result;
                    return memberTypeModel.get_total_member_count(form_data)
                        .then(async (countData) => {
                            console.log(countData[0]);
                            return_result.total_Records = countData[0].total_record;
                            console.log(return_result);
                            return responseMessages.success("member_type_found", return_result);
                        })

                } else {
                    throw new Error("member_type_not_found");
                }
            })
            .catch(function (err) {
                let error = (typeof err.errors != 'undefined') ? err.errors : err.message;
                return responseMessages.failed(responseMessages.hasOwnProperty(err.message) ? err.message : "member_type_update_fail", error)
            });
    }


    /**
    *  Edit Member Type
    *
    * @param _data
    * @returns {*}
    */
    edit_member_type(form_data) {
        // prepare variables

            let data = {};
            let memberTypeData = form_data.member_type;
            return memberTypeModel.getMemberType({
                select: { id: 'master_member_type.id' },
                where: { id: memberTypeData['id'] }
            })
            // .then((result) => {
            //     if (result.length > 0) {
            //         return memberTypeModel.getMemberType({
            //             select: { id: 'master_member_type.id' },
            //             where: { name: data.name },
            //             whereNot: { id: memberTypeData['id'] }
            //         })
            //     } else {
            //         throw new Error("member_type_not_found")
            //     }
            // })
            // member already exists
            .then((member_type_result) => {
                if (member_type_result.length > 0) {
                    console.log(form_data)
                    return memberTypeModel.updateMemberType({
                        data: form_data.member_type,
                        where: { id: memberTypeData['id'] }
                    });
                } else {
                    throw new Error("member_type_already_exist");
 
                }
            })
            .then(async (member_type_id) => {
                return responseMessages.success("member_type_updated_successfully");

            })
            .catch(function (err) {
                let error = (typeof err.errors != 'undefined') ? err.errors : err.message;
                return responseMessages.failed(responseMessages.hasOwnProperty(err.message) ? err.message : "member_type_update_fail", error)
            });
    }

    //Get Member Type By ID
    get_member_type_by_id(form_data) {
        let data = {};
        let memberTypeData = form_data.member_type.id;

        Object.assign(data, memberTypeData);

        return memberTypeModel.get_member_type_by_id({
            where: { id: form_data['member_type']['id'] }
        })
            .then((member_type_result) => {
                if (member_type_result.length >= 1) {
                    return responseMessages.success("member_type_found", member_type_result);

                } else {
                    throw new Error("member_type_not_found")
                }
            })
            .catch(function (err) {
                // return failed response to controller
                let error = (typeof err.errors != 'undefined') ? err.errors : err.message;
                return responseMessages.failed(responseMessages.hasOwnProperty(err.message) ? err.message : "member_type_fetch_error", error)
            });

    }


    /**
     *  Member Type Status
     *
     * @param _data
     * @returns {*}
     */
    member_type_status(form_data) {

        // prepare variables

        let data = {};
        let memberTypeData = form_data.member_type;
        Object.assign(data, memberTypeData);
        return memberTypeModel.getMemberType({
            select: { id: 'master_member_type.id' },
            where: { id: memberTypeData['id'] }
        })

            // member already exists
            .then((member_type_result) => {
                if (member_type_result.length > 0) {
                    return memberTypeModel.updateMemberTypeStatus({
                        data: data,
                        where: { id: memberTypeData['id'] }
                    });
                }
            })
            .then(async (member_type_id) => {
                return responseMessages.success("member_type_status_updated_successfully");

            })
            .catch(function (err) {
                let error = (typeof err.errors != 'undefined') ? err.errors : err.message;
                return responseMessages.failed(responseMessages.hasOwnProperty(err.message) ? err.message : "member_type_status_update_fail", error)
            });
    }
};
