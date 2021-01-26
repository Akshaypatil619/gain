'use strict';
let router = require('express').Router();
let organization_controller = new (require('../controllers/organization.controller'))();

router.post("/add_organization", organization_controller.add_organization);
router.put("/edit_organization", organization_controller.edit_organization);
router.get("/get_organization/:id", organization_controller.get_organization);
router.get("/list_organization", organization_controller.list_organization);

module.exports = router;