"use strict";

module.exports = class CouponFormatter {

    /**
    * Get Redemption Partner Point
    *
    * @param {*} req
    * @returns
    */

  


    formatCouponData(req) {
        let data = {
            merchant_code: req.body.merchant_code,
            coupon_name: req.body.coupon_name,
            campaign_id:req.body.campaign_id,
            prefix:req.body.prefix,
            postfix_length:req.body.postfix_length,
            user_type_id:req.body.user_type_id,
            description:req.body.description,
            prefix:req.body.prefix,
            postfix_length:req.body.postfix_length,
            quantity:req.body.quantity,
            discount:req.body.discount,
            cc_file: req.files ? req.files.cc_file : undefined,
            type:req.body.type,
            valid_till:req.body.valid_till 
        }
        return data;
    }


  

    list_coupon(req) {
        return {
           

            merchant_code: req.query.merchant_id,
            coupon_name:req.query.coupon_name ,
            campaign_id:req.query.campaign_id ,
            user_type_id:req.query.user_type_id ,
            limit: parseInt(req.query.limit),
			offset: parseInt(req.query.offset),
	
        };
    }


    getUserTypeList(req){
        return {};
    }

    get_coupon(req) {
    
        return {
            id: req.query.id,
            limit: parseInt(req.query.limit),
			offset: parseInt(req.query.offset)
         
        };
    }

    edit_coupon(req){
        return{
         id:req.body.id,
         prefix:req.body.prefix,
         postfix_length:req.body.postfix_length,
        coupon_name: req.body.coupon_name,
        description:req.body.description,
        quantity:req.body.quantity,
        extra_quantity:req.body.extra_quantity,
        type:req.body.type,
        cc_file: req.files ? req.files.cc_file : undefined,
        valid_till:req.body.valid_till 
        
        }
    }

    checkPrefix(req){
        return{
            prefix:req.body.prefix}
    }


}
