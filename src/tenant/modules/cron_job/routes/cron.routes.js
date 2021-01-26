let express = require('express');
let router = express.Router();

let Cron_controller = require("../controllers/cron.controller");
let cron_controller = new Cron_controller();


/* Cron Routes Start */
router.get("/sync_property", cron_controller.syncProperty);
router.get("/sync_building", cron_controller.syncBuilding);
router.get("/sync_unit", cron_controller.syncUnit);
router.get("/sync_tenant", cron_controller.syncTenant);
router.get("/getBrandList", cron_controller.getBrandList);


module.exports = router;