let express = require('express');
let router = express.Router();

let Customer_controller = require("../controllers/customers.controller");
let customer_controller = new Customer_controller();

// let Status_codes_controller = require("../controllers/Status_codes_controller");
// let status_codes_controller = new Status_codes_controller();

/* Customer Routes Start */

router.get("/getCustomersList", customer_controller.getCustomersList);
router.get("/getCustomer/:customer_id", customer_controller.getCustomerProfile);
router.post("/addCustomer", customer_controller.addCustomer);
router.put("/editCustomer", customer_controller.updateCustomer);
router.post("/updateCustomerStatus", customer_controller.updateCustomerStatus);
router.put("/processCustomerCards/", customer_controller.processCustomerCards);
router.put("/removeCustomerCard", customer_controller.removeCustomerCard);
router.post("/comment", customer_controller.comment);
router.get("/commentList", customer_controller.commentList);
router.post("/addTagInComment", customer_controller.addTagInComment);
router.post("/addTagInSource", customer_controller.addTagInSource);
router.get("/getCustomerAssignTags", customer_controller.getCustomerAssignTags);
router.put("/removeCustomerSource", customer_controller.removeCustomerSource);
router.put("/removeTagFromComment", customer_controller.removeTagFromComment);
router.get("/commentListByTag/:customer_id/:tags", customer_controller.commentListByTag);
router.get("/commentListByTag/:customer_id", customer_controller.commentListByTag);
router.get("/updateCommentStarred", customer_controller.updateCommentStarred);
router.post("/checkUserValidation", customer_controller.checkUserValidation);
router.post('/customerBulkUpload', customer_controller.customer_bulk_upload);
router.get('/fetchBulkUploadFiles', customer_controller.fetchBulkUploadFiles);
router.get('/fetchBulkUploadFileData', customer_controller.fetchBulkUploadFileData)
router.put('/customerProfileStatusChange', customer_controller.customerProfileStatusChange)
router.post('/import_customers_cards', customer_controller.import_customers_cards);
router.get('/getCustomerTableColumns', customer_controller.getCustomerTableColumns);
router.post('/customerTierUpgrade', customer_controller.customerTierUpgrade);
router.get('/getCustomerActivity', customer_controller.getCustomerActivity);
router.get('/getHistoryList', customer_controller.getHistoryList);
router.get('/getCustomerGraphValue', customer_controller.getCustomerGraphValue);
router.get('/getCustomerCardType', customer_controller.getCustomerCardType);
router.get('/getCustomerAssignConsent', customer_controller.getCustomerAssignConsent);
router.put('/customerDowngradeTier', customer_controller.customerDowngradeTier);
router.post('/createDynamicField', customer_controller.createDynamicField);
router.get('/get_customer_primary_data', customer_controller.get_customer_primary_data);
// router.post("/email/send_test_mail", customer_controller.send_test_mail);
router.get("/getCustomerPointTransferList", customer_controller.getCustomerPointTransferList);
router.get("/getTenantCustomersList", customer_controller.getTenantCustomersList);

router.get("/getSalesOfficeList", customer_controller.getSalesOfficeList);
// router.get('/fetch_customer_upload_subscription', customer_controller.fetch_bulk_upload_subscription_files);
// router.post("/upload_subscription", customer_controller.upload_customer_subscription_plan);

// router.get('/get_customer_status_code_list',status_codes_controller.get_customer_status_code_list);

/* Customer Routes End */
module.exports = router;