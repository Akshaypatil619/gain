let root_folder = "../../../../../";
let express = require('express');
let router = express.Router();

let Tenant_user_role_controller = require("../controllers/user_role.controller");
let tenant_user_role_controller = new Tenant_user_role_controller();

/*************************** Role Routes Start ********************************************/
router.post("/addTenantUserRole", tenant_user_role_controller.addTenantUserRole);
router.put("/editTenantUserRole/:id", tenant_user_role_controller.editTenantUserRole);
router.get("/getTenantUserRolesList", tenant_user_role_controller.getTenantUserRolesList);
router.get("/getTenantUserRoleById/:id", tenant_user_role_controller.getTenantUserRoleById);
router.put("/updateStatus", tenant_user_role_controller.updateStatus);
/*************************** Role Routes End ********************************************/
module.exports = router;