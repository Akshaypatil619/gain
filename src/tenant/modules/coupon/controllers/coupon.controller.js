"use strict";
let Validator = require('validatorjs');
let CouponService = require("../services/coupon.services");
let CouponFormatter = new (require('../formatters/coupon.formatter'))();
let CouponValidator = new (require("../validators/coupon.validators"));
let responseMessages = require("../response/coupon.response");
let config = require('../../../../../config/config');
let couponModel = new (require("../models/coupon." + config.db_driver))();
var { nanoid } = require("nanoid");

const moment = require('moment');
var xlsx = require("xlsx");
let couponService = new CouponService();

module.exports = class CouponController {

    constructor() { }

    async addCoupon(req, res) {

        let returnResponse = {}
        let form_data = CouponFormatter.formatCouponData(req);


        let rules = CouponValidator.validateCoupon(req);
        let validation = new Validator(form_data, rules);
        if (validation.passes() && !validation.fails()) {
             let result = await couponService.addCoupon(form_data);
            console.log("form_data==",form_data);
            returnResponse = result;
        } else {


            returnResponse = validation.errors.errors;
        }
        return res.json(returnResponse);
    }



    async editCoupon(req, res) {
        let coupon_codes = [];

        let returnResponse = {}
        let form_data = CouponFormatter.edit_coupon(req);
  
        let rules = CouponValidator.edit_coupon();
        let validation = new Validator(form_data, rules);
        if (validation.passes() && !validation.fails()) {
            let extra_quantity = parseInt(form_data.extra_quantity);
            form_data.quantity = extra_quantity + parseInt(form_data.quantity);

            let status = await couponModel.updateMerchantCoupon(form_data);


            if (status) {
                if (form_data.type == 'system') {

                    for (let i = 0; i < extra_quantity; i++) {
                        const newId = nanoid(form_data.postfix_length);

                        coupon_codes.push({
                            coupon_id: form_data.id,
                            code: form_data.prefix + newId,
                            valid_till: form_data.valid_till

                        })

                    }
                } else {

                    var workbook = xlsx.read(form_data.cc_file.data);
                    var sheet_name_list = workbook.SheetNames;
                    // var upload_data = xlsx.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);

                    var upload_data = xlsx.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]], {
                        raw: false,
                        defval: null, dateNF: 'yyyy-mm-dd'
                    });
                    if (upload_data != undefined) {


                        for (let i = 0; i < upload_data.length; i++) {
                           let validDate=moment(upload_data[i]["Valid Till"]).format();
                        

                            coupon_codes.push({
                                coupon_id: form_data.id,
                                code: upload_data[i]["Coupon Code"],
                                valid_till:validDate

                            })

                        }

                    }



                }



                let isDuplicate = await couponService.checkDuplicateCoupon(coupon_codes);

                if (isDuplicate) {
                    returnResponse = responseMessages.failed("duplicate_code", "");

                } else {
                    await couponModel.addCouponCode(coupon_codes);
                    returnResponse = responseMessages.success("update_coupon_success", "");
                }

            } else {
                returnResponse = responseMessages.failed("failed_update_coupon", "");
            }

        } else {


            returnResponse = validation.errors.errors;
        }

        return res.json(returnResponse);
    }



    async listCoupon(req, res) {
        let return_result = {};
        let form_data = CouponFormatter.list_coupon(req);
     
        let rules = CouponValidator.list_coupon();
        let validation = new Validator(form_data, rules);
        if (validation.passes() && !validation.fails()) {
            return_result.total_records = (await couponModel.list_coupon("list_coupon", form_data)).length;
             
            if ((return_result.total_records > 0) && Number(form_data.limit) > 0) {

                return_result.coupon_list = await couponModel.list_coupon("list_coupon", form_data)
                    .limit(parseInt(form_data['limit']))
                    .offset(parseInt(form_data['offset']));
                
                return res.json(responseMessages.success("coupon_found", return_result));
            } else {
                return res.json(responseMessages.failed("coupon_not_found", return_result));
            }
        } else {
            return res.json(responseMessages.failed('form_fields_required', validation.errors.errors));
        }
    }



    async getUserTypeList(req, res) {

        let return_result = {};
        let form_data = CouponFormatter.getUserTypeList(req);
        let rules = CouponValidator.getUserTypeList();
        let validation = new Validator(form_data, rules);
        if (validation.passes() && !validation.fails()) {
            return_result = (await couponModel.getUserTypeList());
            return res.json(responseMessages.success("user_found", return_result));

        } else {
            return res.json(responseMessages.failed('form_fields_required', validation.errors.errors));
        }
    }




    async checkPrefix(req, res) {

        let return_result = {};
        let form_data = CouponFormatter.checkPrefix(req);
        let rules = CouponValidator.checkPrefix();
        let validation = new Validator(form_data, rules);
        if (validation.passes() && !validation.fails()) {
            let data = (await couponModel.checkPrefix(form_data));

            if (data.length > 0) {
                return res.json(responseMessages.failed("prefix_found", return_result));
            } else {
                return res.json(responseMessages.success("prefix_not_found", return_result));
            }

        } else {
            return res.json(responseMessages.failed('form_fields_required', validation.errors.errors));
        }
    }




    async getMerchantCode(req, res) {


        let result = await couponService.getMerchantCode();

        return res.json(responseMessages.success("merchant_found", result));


    }


    async get_coupon(req, res) {
        let form_data = CouponFormatter.get_coupon(req);
     

        let rules = CouponValidator.get_coupon();
        let validation = new Validator(form_data, rules);
        let resultArray=[];
        if (validation.passes() && !validation.fails()) {
            let coupon = JSON.parse(JSON.stringify(await couponModel.get_coupon("get_coupon", form_data)));
          
            if (coupon.length > 0) {
             let totalRecord = JSON.parse(JSON.stringify(await couponModel.get_coupon("get_coupon_codes", form_data))).length;
          
             if(totalRecord>0){
     
                let codes = JSON.parse(JSON.stringify(await couponModel.get_coupon("get_coupon_codes", form_data)
                .limit(parseInt(form_data['limit']))
                .offset(parseInt(form_data['offset']))));


                resultArray.push({coupon:coupon,codes:codes,total_record:totalRecord})

           
   
                 return res.json(responseMessages.success("coupon_found", resultArray));

             }
          
             
          
            } else {
                return res.json(responseMessages.failed("coupon_not_found"));
            }
        } else {
            return res.json(responseMessages.failed('form_fields_required', validation.errors.errors));
        }
    };

}
