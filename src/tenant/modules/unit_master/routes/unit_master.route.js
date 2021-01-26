'use strict';
let router = require('express').Router();
let unit_master_controller = new (require('../controllers/unit_master.controller'))();

router.get("/get_all_unit_master_list", unit_master_controller.get_all_unit_master);
router.get("/get_rent_unit_list", unit_master_controller.get_rent_unit_list);
router.get("/get_owner_unit_list", unit_master_controller.get_owner_unit_list);


module.exports = router;