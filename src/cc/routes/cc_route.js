let express = require('express');
let router = express.Router();
let expressValidator = require('express-validator');
router.use(expressValidator());
let User_controller = require("../controller/User_controller");
let user_controller = new User_controller();
let customerRoute = require("./customer.routes");
let masterRoutes= require('./master_route');
let tenantRoutes= require('../modules/tenant/routes/tenant_route');

router.use("/customer/", customerRoute);
router.use('/master/', masterRoutes);
router.use('/tenant/', tenantRoutes);

router.get("/user/getCCToken", user_controller.getCCToken);

router.post("/notification/get_notification_list", user_controller.get_notification_list);

router.get("/get_hot_selling_properties", user_controller.get_hot_selling_properties);



module.exports = router;
