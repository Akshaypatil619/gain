'use strict';
let router = require('express').Router();
let tenant_controller = new (require('../controllers/tenant.controller'))();

router.get("/list_tenant", tenant_controller.list_tenant);

module.exports = router;