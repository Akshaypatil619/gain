let express = require('express');
let router = express.Router();

let Customer_Controller = require("../controller/customer.controller");
let customer_Controller = new Customer_Controller();

router.post("/customer_login", customer_Controller.customerLogin);
router.get("/get_profile", customer_Controller.getProfile);

router.post("/verify_otp", customer_Controller.verifyOTP);
router.post("/resend_otp", customer_Controller.resendOtp);
router.post('/logout', customer_Controller.delete_fcm_token);

router.post("/set_default_unit", customer_Controller.setDefaultUnit);
router.get("/get_unit_list", customer_Controller.getUnitList);

router.post("/add_transaction", customer_Controller.addTransaction);
router.get("/get_transactions", customer_Controller.getTransactions);
router.post("/dispute_transaction", customer_Controller.disputeTransaction);

router.post("/get_coupon_code", customer_Controller.getCouponCode);
router.post("/consume_coupon", customer_Controller.consumeCoupon);
router.post("/process_transaction", customer_Controller.processTransaction);

router.get("/get_customer_transactions", customer_Controller.getCustomerTransactions);

module.exports = router;