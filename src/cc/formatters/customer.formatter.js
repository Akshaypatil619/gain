"use strict";

module.exports = class CityFormatter {

    consumeCoupon(req) {
        return {
            coupon_code: req.body.coupon_code,
            ty_transaction_id: req.body.ty_transaction_id,
            merchant_code: req.body.merchant_code,
            merchant_name: req.body.merchant_name,
            offer_title: req.body.offer_title,
            brand_name: req.body.brand_name,
            amount: req.body.amount,
            merchant_discount: req.body.merchant_discount
        }
    }

    getCouponCode(req) {
        return {
            customer_unique_id: req.body.customer_unique_id,
            merchant_code: req.body.merchant_code
        }
    }

    disputeTransaction(req) {
        return {
            transaction_id: req.body.transaction_id
        }
    }

    getCustomerTransactions(req) {
        return {
            customer_unique_id: req.query.customer_unique_id,
            limit: req.query.limit ? parseInt(req.query.limit) : 10,
            offset: req.query.offset ? parseInt(req.query.offset) : 0
        }
    }

    addTransaction(req) {
        return {
            customer_unique_id: req.body.customer_unique_id,
            ty_transaction_id: req.body.ty_transaction_id,
            coupon_code: req.body.coupon_code,
            merchant_code: req.body.merchant_code,
            merchant_name: req.body.merchant_name,
            offer_title: req.body.offer_title,
            brand_name: req.body.brand_name,
            amount: req.body.amount,
            merchant_discount: req.body.merchant_discount,

            offer_image: req.body.offer_image,
            outlet_code: req.body.outlet_code,
            brand_code: req.body.brand_code,
            offer_expiry: req.body.offer_expiry,
            category_name: req.body.category_name,
            bill_amount: req.body.bill_amount,
            save_amount: req.body.save_amount,
            offer_type: req.body.offer_type,
            offer_code: req.body.offer_code,
            enquiry_code: req.body.enquiry_code
        }
    }

    formatGetProfile(req) {
        return {
            customer_unique_id: req.query.customer_unique_id,
            language_code: req.query.language_code
        }
    }

    getUnitList(req) {
        return {
            customer_unique_id: req.query.customer_unique_id,
            language_code: 'EN'
        }
    }

    setDefaultUnit(req) {
        return {
            customer_unique_id: req.body.customer_unique_id,
            language_code: 'EN',
            unit_id: req.body.unit_id
        }
    }

    formatCustomerCredentials(req) {
        return {
            input: req.body.input,
            language_code: 'EN'
        }
    }
    formatCustomerSignupOTP(req) {
        return {
            tenant_id: req['tenant_id'],
            otp: req.body.otp,
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            email: req.body.email.trim().toLowerCase(),
            country_code: req.body.country_code,
            phone: req.body.phone,
            city: req.body.city,
            gender: req.body.gender,
            dob: req.body.dob.replace("Tháng", ""),
            nationality_id: req.body.nationality_id,
            fcm_token: req.body.fcm_token,
            device_id: req.body.device_id,
            os: req.body.os,
            language_code: req.query.language_code
        }
    }

    formatCustomerOTP(req) {
        return {
            input: req.body.input,
            fcm_token: req.body.fcm_token,
            device_id: req.body.device_id,
            otp: req.body.otp,
            os: req.body.os,
            language_code: req.query.language_code
        }
    }

    formatCustomerResendOTP(req) {
        return {
            input: req.body.input,
            language_code: req.query.language_code
        }
    }

    formatCustomerReferralList(req) {
        return {
            customer_id: req.query.customer_id,
            language_code: req.query.language_code
        }
    }

}
