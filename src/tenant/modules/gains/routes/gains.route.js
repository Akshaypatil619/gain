'use strict';
let router = require('express').Router();
let gainsController = new (require('../controllers/gains.controller'))();

// router.get("/sync_customers", gainsController.syncCustomers);
router.get("/sync_oam", gainsController.syncOAM);
router.get("/sync_property", gainsController.syncProperty);
router.get("/sync_building", gainsController.syncBuilding);
router.get("/sync_unit", gainsController.syncUnit);
router.get("/sync_broker", gainsController.syncBroker);
router.get("/sync_tenant", gainsController.syncTenant);
// router.get("/pending_customers", gainsController.getPendingCustomers);
// router.post("/update_process_status", gainsController.updateProcessStatus);
// router.get("/migrate_customers", gainsController.migrateCustomers);
// router.get("/process_points", gainsController.processPoints);

// router.get("/customerReports", gainsController.customerReports);
// router.get("/fnfReports", gainsController.fnfReports);
// router.get("/loginReports", gainsController.loginReports);

// router.get("/customerDump", gainsController.customerDump);

module.exports = router;