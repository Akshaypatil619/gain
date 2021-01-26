let express = require('express');
let router = express.Router();

let Property_Controller = require("../controllers/property.controller");
let property_controller = new Property_Controller();

router.get("/getProperty", property_controller.get_property);
router.put("/update_hot_selling", property_controller.updateHotSelling);
router.get("/getPropertyType", property_controller.get_master_property_type_List);
router.get("/get_property_elevation", property_controller.get_property_elevation);
router.get("/getAmenityList", property_controller.getAmenityList);
router.get("/getupdateunitdata", property_controller.get_update_unit_data);


router.get("/getPropertyById/:id", property_controller.get_property_by_id);
router.get("/getBuilding/:property_id", property_controller.getBuilding);
router.get("/total_building_list", property_controller.total_building_list);

router.get("/getUnit/:building_id", property_controller.getUnit);
router.put("/update_unit_type", property_controller.updateUnitType);
router.get("/getUnitbyid/:id", property_controller.getUnitbyid);
router.get("/getBuildingbyid/:id", property_controller.get_Building_by_id);
router.post("/delete_img_by_id", property_controller.delete_img_by_id);

router.post("/delete_property_img_by_id", property_controller.delete_property_img_by_id);

router.get("/viewImages/:id", property_controller.viewImages);

router.get("/view_unit_images/:id", property_controller.view_unit_images);
router.post("/delete_unit_img_by_id", property_controller.delete_unit_img_by_id);

router.get("/view_amenity_images/:id", property_controller.view_amenity_images);
router.post("/delete_amenity_img_by_id", property_controller.delete_amenity_img_by_id);


router.get("/view_property_images/:id", property_controller.view_property_images);


router.put("/update_unit_master", property_controller.updateUnitMaster);

router.put("/update_property_master", property_controller.update_property_master);
router.put("/update_building", property_controller.update_building);
router.get("/getBrokerlist", property_controller.getBrokerList);


router.get("/get_unit_transaction", property_controller.get_unit_transaction);
router.get("/update_unit_transaction", property_controller.update_unit_transaction);


module.exports = router;