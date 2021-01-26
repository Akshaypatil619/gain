let Validator = require('validatorjs');

module.exports = class CustomerValidator {

    consumeCoupon() {
        return {
            coupon_code: 'required',
            ty_transaction_id: 'required'
        }
    }

    getCouponCode() {
        return {
            customer_unique_id: 'required',
            merchant_code: 'required'
        }
    }

    disputeTransaction() {
        return {
            transaction_id: 'required'
        }
    }

    getCustomerTransactions() {
        return {
            customer_unique_id: 'required'
        }
    }

    addTransaction() {
        return {
            customer_unique_id: "required",
            ty_transaction_id: "required",
            amount: "required|numeric|min:1",
            merchant_discount: "required|numeric|min:1|max:100"
        }
    }

    validateGetProfile() {
        return {
            customer_unique_id: "required",
        };
    }

    getUnitList() {
        return {
            customer_unique_id: 'required'
        }
    }

    setDefaultUnit() {
        return {
            customer_unique_id: 'required',
            unit_id: 'required'
        }
    }

    validateCustomerCredentials() {
        return {
            input: "required|max:70",
        };
    }

    validateCustomerSignupOTP() {
        return  {
            otp: "required",
            first_name: "required|max:50|min:2",
			last_name: "required|max:50|min:2",
			email: "required|email|max:50",
			country_code: "required|alpha_num|max:6|min:2",
			phone: "required|numeric",
			city: "required|numeric",
			gender: "required",
			dob: "required|date",
			nationality_id: "numeric"
        };
    }

    validateCustomerOTP() {
        return  {
            input: "required",
            otp: "required"
        };
    }

    validateCustomerResendOTP() {
        return  {
            input: "required",
        };
    }
    validateCustomerReferralList() {
        return  {
            customer_id: "required",
        };
    }
}
