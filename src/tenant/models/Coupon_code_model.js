let Validator = require('validatorjs');

/************** Load Files****************/
let messages = require("../../../config/messages.js");
let status_codes = require("../../../config/response_status_codes.js");
let knex = require("../../../config/knex");
Response_adapter = require("../../core/response_adapter");
Upload_files = require("../../core/upload_files");
let Queries = require("../queries/mysql/coupon_code");

/************** Generate Objects ****************/
let upload_files = new Upload_files();
let response = new Response_adapter();
let queries = new Queries();

module.exports = class coupon_code_model {
    // constructor() {}
    /*------------------------------------------------------------------------------------------------------------------------------*/
    /************************************
     Coupon_code Operation Start
     ************************************/

    /* Add Coupon_code */
    async  add_coupon_code(form_data, callback) {
        let data = {};
        Object.assign(data, form_data);
        let couponCodeId = '';

        let rules = {
            coupon_name: "required",
            start_date: "required",
            end_date: "required",
            //coupon_image: "required",
            merchant_id: "required"
        };
        //Check Validation
        let validation = new Validator(data, rules);
        if (validation.passes() && !validation.fails()) {
            delete data.coupon_image;
            try {
                let couponCodeId = await knex("coupon_code").insert(data)
                if (form_data['coupon_image']) {
                    let image_file = [{
                        path: "./uploads/images/coupon_code/" + couponCodeId,
                        file_name: couponCodeId + ".jpg",
                        file: form_data['coupon_image'],
                        return_file_name: 'coupon_image'
                    }];
                    upload_files.upload_Multiple_Files(image_file, function (err, files) {
                        let return_result;
                        let update_result = {};
                        let deactivate = false
                        if (err) {
                            return_result = response.response_error(false, status_codes.coupon_code_create_failed, messages.coupon_code_create_failed);
                            return return_result;
                        } else {
                            return_result = response.response_success(true, status_codes.coupon_code_create_success, messages.coupon_code_create_success);
                            update_result = {
                                coupon_image: files['coupon_image'],
                            };
                        }

                        queries.add_coupon_code("update", {
                            couponCodeId: couponCodeId,
                            update_result: update_result,
                        })
                            .then(function (res) {
                                return callback(return_result);
                            }).catch(function (err) {
                                return callback(response.response_error(true, status_codes.coupon_code_create_failed, messages.coupon_code_create_failed));
                            });
                    });
                }
                else
                    return callback(response.response_success(true, status_codes.coupon_code_create_success, messages.coupon_code_create_success));

            } catch (error) {
                return callback(response.response_error(false, status_codes.coupon_code_create_failed, messages.coupon_code_create_failed, error.message));
            }

        } else {
            let errors = validation.errors.errors;
            return callback(response.response_error(false, status_codes.form_field_reqired, messages.form_field_reqired, errors));
        }
    }

    /* Modify Customer */
    edit_coupon_code(form_data, callback) {
        let data = {};
        Object.assign(data, form_data);
        delete data.image;
        delete data.coupon_code_id;
        queries.edit_coupon_code("update", {
            coupon_code_id: form_data['coupon_code_id'],
            data: data
        })
            .then((result) => {
                let return_result = response.response_success(true, status_codes.coupon_code_update_success, messages.coupon_code_update_success);

                if (typeof form_data['image'] != 'undefined') {
                    let image_file = [{
                        path: "./uploads/images/coupon_code/" + form_data['coupon_code_id'],
                        file_name: form_data['coupon_code_id'] + ".jpg",
                        file: form_data['image'],
                        return_file_name: "image"
                    }];

                    upload_files.upload_Multiple_Files(image_file, function (err, files) {
                        let update_result = {};
                        if (err) {
                            return_result = response.response_error(false, status_codes.coupon_code_id_update_failed, messages.coupon_code_id_update_failed);
                            return return_result;
                        } else {
                            update_result = {
                                coupon_image: files['image'],
                            };
                        }
                        queries.edit_coupon_code("update_coupon_code", {
                            coupon_code_id: form_data['coupon_code_id'],
                            update_result: update_result
                        })
                            .then(function (res) {
                                return callback(return_result);
                            }).catch(function (err) {
                                return callback(response.response_error(false, status_codes.coupon_code_id_update_failed, messages.coupon_code_id_update_failed));
                            });
                    });
                } else {
                    return callback(return_result);
                }
            }).catch((err) => {
                return callback(response.response_error(false, status_codes.coupon_code_id_create_failed, messages.coupon_code_id_create_failed, err.message));
            });
    }

    //Get Customer By ID
    get_coupon_code_by_id(query_data, callback) {
        let data = {
            coupon_code_id: query_data['coupon_code_id']
        };
        let columns = {
            id: "coupon_code.id",
            coupon_name: "coupon_code.coupon_name",
            start_date: "coupon_code.start_date",
            end_date: "coupon_code.end_date",
            merchant_id: "coupon_code.merchant_id",
            coupon_description: "coupon_code.coupon_description",
            coupon_image: "coupon_code.coupon_image",
            status: "coupon_code.status"
        };
        let rules = {
            coupon_code_id: "required"
        };
        //Check Validation
        let validation = new Validator(data, rules);
        if (validation.passes() && !validation.fails()) {
            queries.get_coupon_code_by_id("get_coupon_code", {
                columns: columns,
                coupon_code_id: coupon_code_id
            })
                .then((result) => {
                    if (result.length > 0) {
                        return callback(response.response_success(true, status_codes.coupon_code_found, messages.coupon_code_found, (result)));
                    } else {
                        return callback(response.response_error(false, status_codes.coupon_code_not_found, messages.coupon_code_not_found));
                    }
                }).catch(function (err) {
                    let result = status_codes.check_error_code("DATABASE", err.errno);
                    return callback(Object.assign({ "status": false }, result));
                });
        } else {
            let errors = validation.errors.errors;
            return callback(response.response_error(false, status_codes.form_field_reqired, messages.form_field_reqired, errors));
        }
    }

    //Get Customer List With Filter
    get_coupon_code_list(query_data, callback) {
        let now = new Date();
        let return_result = {}
        query_data.columns = {
            coupon_code_id: "coupon_code.id",
            coupon_name: "coupon_code.coupon_name",
            coupon_description: "coupon_code.coupon_description",
            coupon_image: "coupon_code.coupon_image",
            start_date: "coupon_code.start_date",
            end_date: "coupon_code.end_date",
            merchant_name: "merchants.name"
        };
        let obj = queries.get_coupon_code_list("get_coupon_code_list", query_data)
        obj.then((t_result) => {
            return_result.couponcodes_total_record = Object.keys(t_result).length;
            if (t_result.length > 0) {
                obj.limit(query_data['limit'])
                    .offset(query_data['offset'])
                    .then((result) => {
                        return_result.couponcodes_list = result;
                        if (result.length > 0)
                            return callback(response.response_success(true, status_codes.coupon_code_found, messages.coupon_code_found, (return_result)));
                        return callback(response.response_error(false, status_codes.coupon_code_not_found, messages.coupon_code_not_found));
                    })
            } else {
                return callback(response.response_error(false, status_codes.coupon_code_not_found, messages.coupon_code_not_found));
            }

        }).catch(function (err) {
            let result = status_codes.check_error_code("DATABASE", err.errno);
            console.log(err);
            return callback(Object.assign({ "status": false }, result));
        });
    };

    get_merchant_list(query_data, callback) {
        
        let merchant_id = query_data['merchant_id'];
        queries.get_merchant_list("get_merchant_list", {
            merchant_id:merchant_id,
            tenant_id: query_data.tenant_id
        })
            .then(function (result) {
                if (result.length > 0) {
                    return callback(response.response_success(true, status_codes.merchant_list, messages.merchants, (result)));
                } else {
                    return callback(response.response_error(false, status_codes.merchant_list_found, messages.merchant_found));
                }
            }).catch(function (err) {
                console.log(err);
                let result = status_codes.check_error_code("DATABASE", err.errno);
                return callback(Object.assign({ "status": false }, result));
            });
    }
    /************************************
     coupon_code. Operation End
     ************************************/
};