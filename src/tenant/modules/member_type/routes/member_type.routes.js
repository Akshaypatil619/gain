let express = require('express');
let router = express.Router();

let Member_Type_Controller = require("../controllers/member_type.controller");
let member_type_controller = new Member_Type_Controller();

router.post("/addMemberType", member_type_controller.add_member_type);
router.put("/editMemberType/:id",member_type_controller.edit_member_type);
router.get("/getMemberType", member_type_controller.get_member_type);
router.get("/getMemberTypeById/:id", member_type_controller.get_member_type_by_id);
router.put("/memberTypeStatus/:id", member_type_controller.member_type_status);


module.exports = router;