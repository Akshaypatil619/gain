let express = require('express');
let router = express.Router();

let Oam_Customer_Controller = require("../controllers/oam_customer.controller");
let oam_customer_controller = new Oam_Customer_Controller();

router.post("/addOamCustomer/", oam_customer_controller.add_oam);
router.get("/getOamCustomer/", oam_customer_controller.list_oam);
router.put("/editOamCustomer/",oam_customer_controller.edit_oam);
router.get("/getOamCustomerById/:id", oam_customer_controller.get_oam);
router.get("/get_all_countries", oam_customer_controller.get_all_countries);

module.exports = router;