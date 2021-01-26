'use strict';
let router = require('express').Router();
let report_controller = new (require('../controllers/report.controller'))();

router.get("/get_commission_list_data", report_controller.get_commission_list_data);
router.get("/get_customer_transaction_list", report_controller.get_customer_transaction_list);
router.get("/unit_report", report_controller.unit_report);



module.exports = router;
