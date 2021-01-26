module.exports = class CityValidator {

    /**
     *  Prepare validation rules for Get Redemption Partner Point
     * @param type
     */
    validateCoupon(req) {

        let data = {

            merchant_code: "required",
            coupon_name: "required",
            campaign_id: "required",
            description: "required",
            user_type_id: "required|numeric",
            type: "required",
            quantity: "required|numeric",
            discount: "required|numeric",
            valid_till:"required"

        };

        if (req.body.type == "system") {
            data["prefix"] = "required";
            data["postfix_length"] = "required|numeric";
        }
        return data;
    }

    list_coupon() {
        return {};
    }
    getUserTypeList(){
        return {};
    }

    get_coupon() {
        let data = { id: "required" }
        return data;
    }

    edit_coupon() {
        return {
            id: "required",
            coupon_name: "required",
            description: "required",
            quantity: "required",
            extra_quantity: "required",
            prefix: "required",
            postfix_length: "required",
            valid_till:"required"
        }
    }

    checkPrefix(){
        return {};
    }
}
