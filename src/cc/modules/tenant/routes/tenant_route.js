'use strict';
let router = require('express').Router();
let tenant_controller = new (require('../controllers/tenant.controller'))();

router.post("/add_tenant", tenant_controller.add_tenant);
router.post("/edit_tenant", tenant_controller.edit_tenant);
// router.get("/get_tenant", tenant_controller.get_tenant);
router.get("/list_tenant", tenant_controller.list_tenant);
router.post("/delete_tenant", tenant_controller.delete_tenant);
module.exports = router;