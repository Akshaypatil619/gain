let knex = require("../../../../../config/knex");
module.exports = class CityModel {


    async addCoupon(data) {
        let columns = {
            merchant_code: data.merchant_code,
            coupon_name: data.coupon_name,
            campaign_id: data.campaign_id,
            prefix: data.prefix,
            postfix_length: data.postfix_length,
            user_type_id: data.user_type_id,
            description: data.description,
            discount: data.discount,
            quantity: data.quantity,
            type:data.type
        }

        let couponId = await knex('merchant_coupons').insert(columns).returning('id');

        return couponId;
    }

    async checkCampaignId(data) {
        let columns = {
            id: "merchant_coupons.id",
        }
        let couponId = await knex('merchant_coupons').select(columns).where("merchant_coupons.campaign_id", data.campaign_id);

        return couponId;
    }


    async isMerchantExist(data) {
        let columns = {
            id: "merchant_coupons.id",
        }
        // merchant_code, user_type_id
        let couponId = await knex('merchant_coupons').select(columns)
        .where("merchant_coupons.merchant_code", data.merchant_code)
        .andWhere("merchant_coupons.user_type_id",data.user_type_id);

        return couponId;
    }



  
   async addCouponCode(data) {
            return new Promise(async(resolve, reject) => {
                let chunkSize = 100;
                for (let i = 0; i <= data.length; i = (i + chunkSize)) {
                    await knex.batchInsert('coupon_codes',
                        data.slice(i, i + chunkSize), chunkSize);
                }
                resolve();
            });
        }
    


  async getUserTypeList(){
       let coloums={
           id:"id",
           name:"name",
           code:"code"
       }
    let userTypeList = await knex('master_user_type').select(coloums).whereIn('id', [2, 3, 4]);
    return  userTypeList;
   }

   async getCouponCodes(){
    let codes = await knex('coupon_codes').select({code:"code"}).where('status',1);
    return  JSON.parse(JSON.stringify(codes));
   }



async checkPrefix(formData){
  
    let coloums={
        id:"id",
      
    }
 let data = await knex('merchant_coupons').select(coloums).where('prefix',formData.prefix);
 return  (JSON.parse(JSON.stringify(data)));
}


    list_coupon(query_type, data) {

        switch (query_type) {
            case "list_coupon":
                let columns = {
                    id: "merchant_coupons.id",
                    merchant_name: "merchant_coupons.merchant_code",
                    user_type: "master_user_type.name ",
                    coupon_name: "merchant_coupons.coupon_name",
                    campaign_id: "merchant_coupons.campaign_id",
                    discount: "merchant_coupons.discount",
                    quantity: "merchant_coupons.quantity",
                    prefix: "merchant_coupons.prefix",
                    postfix_length: "merchant_coupons.postfix_length",


                };


                let query = knex('merchant_coupons')
                    .select(columns)
                     .leftJoin("master_user_type", "master_user_type.id", "=", "merchant_coupons.user_type_id")
                    // .leftJoin("master_merchant", "master_merchant.id", "=", "merchant_coupons.merchant_code")
                // .where("master_user_type.name","Owner");
                if (data['merchant_code']) {
                    query.whereRaw("merchant_coupons.merchant_code like '%"+ data['merchant_code']+"%'");
                }

                if (data['user_type_id']) {
                    query.where("master_user_type.id", data['user_type_id']);
                }

                if (data['campaign_id']) {
                    query.where("merchant_coupons.campaign_id", data['campaign_id']);
                }
                if (data['coupon_name']) {
                    query.whereRaw("merchant_coupons.coupon_name like '%"+ data['coupon_name']+"%'");
                }





                //	query.orderBy("customers.created_at", "desc")
                return query;
                break;
        }

    }




    get_coupon(query_type, data) {
        switch (query_type) {
            case "get_coupon":
                let columns = {
                    merchant_code: "merchant_coupons.merchant_code",
                    coupon_name: "merchant_coupons.coupon_name",
                    campaign_id: "merchant_coupons.campaign_id",
                    user_type_id: "merchant_coupons.user_type_id",
                    description: "merchant_coupons.description",
                    discount: " merchant_coupons.discount",
                    quantity: "merchant_coupons.quantity",
                    prefix: "merchant_coupons.prefix",
                    postfix_length: "merchant_coupons.postfix_length",
                    type:"merchant_coupons.type",
                    valid_till:"coupon_codes.valid_till"
                };
                return knex("merchant_coupons").select(columns)
                .join("coupon_codes", "coupon_codes.coupon_id", "=", "merchant_coupons.id")
                .where("merchant_coupons.id", data['id'])
                .limit(1);
                break;

          case "get_coupon_codes":
                let column = {
                    code:"coupon_codes.code",
                    customer_id:"coupon_codes.customer_id",
                    is_used:"coupon_codes.is_used",
                    valid_till:"coupon_codes.valid_till"
                };
                return knex("merchant_coupons").select(column)
                .join("coupon_codes", "coupon_codes.coupon_id", "=", "merchant_coupons.id")
                .where("merchant_coupons.id", data['id']);
              
                break; 

        }


    }


   
    async updateMerchantCoupon(data) {
   
        let columns = {
            coupon_name: data.coupon_name,
            description: data.description,
            quantity: data.quantity,

        }

        try {
            await knex("merchant_coupons").update(columns).where("id", data['id']);
            return true;

        } catch (err) {

            return false;
        }

    }





}
