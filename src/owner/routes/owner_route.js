let express = require('express');
let router = express.Router();
let expressValidator = require('express-validator');
router.use(expressValidator());

// load all controllers
let Owner_login_controller = require("../controllers/Owner_login_controller");
let User_controller = require("../controllers/User_controller");
let Owner_profile_controller = require("../controllers/Owner_profile_controller");
let Owner_dashboard_controller = require("../controllers/Owner_dashboard_controller");

// create controller variables
let owner_login_controller = new Owner_login_controller();
let user_controller = new User_controller();
let owner_profile_controller = new Owner_profile_controller();
let owner_dashboard_controller = new Owner_dashboard_controller();

/* **************************  login routes start *************************** */
router.post("/login", owner_login_controller.check_login);
// router.post("/oam_login",owner_login_controller.oam_login);
router.post("/verify_otp", owner_login_controller.verifyOwnerOTP);
router.post("/resend_otp", owner_login_controller.resendOtp);
router.post("/save_password", owner_login_controller.savePassword);
router.post("/generate_otp_forgot_password", owner_login_controller.generateOTPForgotPassword);
router.post("/reset_password", owner_login_controller.resetPassword);

/* **************************  login routes end ***************************** */

router.get("/property_list", user_controller.get_property_list);
router.get("/property_type", user_controller.get_property_type);
router.get("/building_list", user_controller.get_building_list);
router.get("/all_building_list", user_controller.get_all_building_list);
router.get("/getBrandList", user_controller.getBrandList);
router.put("/update_unit_type", user_controller.updateUnitType);
router.put("/update_hot_selling", user_controller.updateHotSelling);
router.get("/unit_list", user_controller.get_unit_list);
router.get("/unit_total_list", user_controller.get_unit_total_list);
router.get("/all_oam_list", user_controller.get_all_oam_list);

router.get("/unit_rent_list", user_controller.unit_rent_list);


router.post("/get_user_details", owner_profile_controller.get_user_details);
router.post("/get_password", owner_profile_controller.get_password);
router.post("/update_data", owner_profile_controller.update_data);
router.post("/details", owner_profile_controller.get_user_details);
router.post("/addMyMedia", owner_profile_controller.addMyMedia);

router.get('/verify_token', function (req, res) { res.json({ status: true, message: 'Token verified' }).sendStatus(200) })

let tenant_route = require("../modules/tenant/routes/tenant.route.js");
router.use("/tenant/", tenant_route);

let family_route = require("../modules/family/routes/family.routes.js");
router.use("/family/", family_route);

router.get('/dashboard',owner_dashboard_controller.dashboard);

let report_route = require("../modules/report/routes/report.route.js");
router.use("/report/", report_route);

module.exports = router;
