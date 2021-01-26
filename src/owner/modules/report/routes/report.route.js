'use strict';
let router = require('express').Router();
let report_controller = new (require('../controllers/report.controller'))();

router.get("/get_commission_list_data", report_controller.get_commission_list_data);

module.exports = router;