let express = require('express');
let router = express.Router();
let expressValidator = require('express-validator');
router.use(expressValidator());

// load all controllers
let Oam_login_controller = require("../controllers/Oam_login_controller");
let Oam_profile_controller = require("../controllers/Oam_profile_controller");
let Oam_dashboard_controller = require("../controllers/Oam_dashboard_controller");


// create controller variables
let oam_login_controller = new Oam_login_controller();
let oam_profile_controller = new Oam_profile_controller();
let oam_dashboard_controller = new Oam_dashboard_controller();
const User_controller = require("../controllers/User_controller");

// create controller variables
const user_controller = new User_controller();


/* **************************  login routes start *************************** */
router.post("/login", oam_login_controller.check_login);
// router.post("/oam_login",oam_login_controller.oam_login);
router.post("/verify_otp", oam_login_controller.verifyOAMOTP);
router.post("/resend_otp", oam_login_controller.resendOtp);
router.post("/save_password", oam_login_controller.savePassword);
router.post("/generate_otp_forgot_password", oam_login_controller.generateOTPForgotPassword);
router.post("/reset_password", oam_login_controller.resetPassword);
/* **************************  login routes end ***************************** */


/* **************************  profile routes start *************************** */
router.post("/get_user_details", oam_profile_controller.get_user_details);
router.post("/get_password", oam_profile_controller.get_password);
router.post("/update_data", oam_profile_controller.update_data);
router.post("/addMyMedia", oam_profile_controller.addMyMedia);
router.get("/all_building_list", user_controller.get_all_building_list);
router.get("/getBrandList", user_controller.getBrandList);
router.get("/property_list", user_controller.get_property_list);
router.get("/building_list", user_controller.get_building_list);
router.get("/property_type", user_controller.get_property_type);
router.get("/unit_list", user_controller.get_unit_list);
router.get("/unitlist", user_controller.get_unitlist);

router.get("/get_unitReportlist", user_controller.get_unitReportlist);
router.get("/get_transaction_unitlist", user_controller.get_transaction_unitlist);


router.put("/update_unit_type", user_controller.updateUnitType);
router.put("/update_hot_selling", user_controller.updateHotSelling);
//srouter.get("/list_tenant", user_controller.list_tenant);
let report_route = require("../modules/report/routes/report.route.js");
router.use("/report/", report_route);

let tenant_route = require("../modules/tenant/routes/tenant.route.js");
router.use("/tenant/", tenant_route);

/* **************************  profile routes end ***************************** */

/* **************************  dashboard routes start *************************** */
router.get("/dashboard",oam_dashboard_controller.dashboard);

/* **************************  dashboard  routes end ***************************** */

router.get('/verify_token', function (req, res) { res.json({ status: true, message: 'Token verified' }).sendStatus(200) })
module.exports = router;
