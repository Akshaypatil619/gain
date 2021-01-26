let express = require('express');
let router = express.Router();

let Coupon_Controller = require("../controllers/coupon.controller");
let coupon_Controller = new Coupon_Controller();

router.post("/add", coupon_Controller.addCoupon);
router.get("/list", coupon_Controller.listCoupon);
router.post("/edit", coupon_Controller.editCoupon);
router.get("/get_coupon", coupon_Controller.get_coupon);
router.get("/getUserTypeList", coupon_Controller.getUserTypeList);
router.get("/getMerchantCode", coupon_Controller.getMerchantCode);

router.post("/checkPrefix", coupon_Controller.checkPrefix);



module.exports = router;