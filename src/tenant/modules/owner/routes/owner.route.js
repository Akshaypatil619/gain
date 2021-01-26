'use strict';
let router = require('express').Router();
let owner_controller = new (require('../controllers/owner.controller'))();

router.post("/add_owner", owner_controller.add_owner);
router.put("/edit_owner", owner_controller.edit_owner);
router.get("/get_owner/:id", owner_controller.get_owner);
router.get("/list_owner", owner_controller.list_owner);
router.get("/get_owner_tenant", owner_controller.get_owner_tenant);

// router.get("/manual_settlement_list", )
router.post("/add_manual_settlement", owner_controller.add_manual_settlement);
router.get("/manual_settlement_list", owner_controller.manual_settlement_list);

router.get("/get_all_units", owner_controller.get_all_units);

module.exports = router;