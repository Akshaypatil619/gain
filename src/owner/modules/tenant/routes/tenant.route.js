'use strict';
let router = require('express').Router();
let tenant_controller = new (require('../controllers/tenant.controller'))();

router.post("/add_tenant", tenant_controller.add_tenant);
router.put("/edit_tenant", tenant_controller.edit_tenant);
router.get("/get_tenant/:id", tenant_controller.get_tenant);
router.get("/list_tenant", tenant_controller.list_tenant);
router.get("/list_countries", tenant_controller.list_countries);
router.get("/list_emirate", tenant_controller.list_emirate);
router.get("/list_building_code", tenant_controller.list_building_code);

module.exports = router;