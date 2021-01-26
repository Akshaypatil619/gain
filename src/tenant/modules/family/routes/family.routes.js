let express = require('express');
let router = express.Router();

let Family_Controller = require("../controllers/family.controller");
let family_controller = new Family_Controller();

router.get("/getFamily", family_controller.get_family);
router.put('/familyStatusChange', family_controller.familyStatusChange);
router.post("/addFamilyMember", family_controller.addFamily);
router.get("/getReferralList/", family_controller.list_referral);
router.put("/editFamilyMember/",family_controller.edit_familyMember);
router.get("/getFamilyMemberById/:customer_unique_id", family_controller.familyList);

module.exports = router;