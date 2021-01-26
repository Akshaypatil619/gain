let express = require('express');
let router = express.Router();
let expressValidator = require('express-validator');
router.use(expressValidator());

let master_controller = new (require("../controller/Master_controller"))();

router.get("/property_list", master_controller.get_property_list);
router.get("/property_suggession", master_controller.get_property_suggession);
router.get("/unit_list", master_controller.get_unit_list);
router.get("/unit_rent_list", master_controller.unit_rent_list);
router.get("/broker_list", master_controller.get_broker_list);

// router.get("/consume_promocode", master_controller.consume_promocode);



router.get("/master_list", master_controller.get_master_list);
// router.post("/update_unit_type", master_controller.updateUnitType);
router.post("/add_family", master_controller.addFamily);
router.get("/family_list", master_controller.familyList);
router.post("/delete_family", master_controller.deleteFamily);




module.exports = router;