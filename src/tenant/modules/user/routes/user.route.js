var express = require("express");
var router = express.Router();

var UserController = require("../controllers/user.controller");
var userController = new UserController();

router.post("/login", userController.checkLogin);
// router.get("/get_module_permissions", userController.get_module_permissions);
// router.post("/add_new_admin", userController.get_module_permissions);
router.get("/getProfile", userController.getProfile); // /tenants/get_tenants
router.put("/editProfile", userController.editProfile); // /tenants/edit_tenant/
router.get("/getGroupCodes", userController.getGroupCodes); // /tenants/get_group_codes/
router.post("/addRedemptionChannel", userController.addRedemptionChannel); // tenants/add_redemption_channel
router.put("/editRedemptionChannel", userController.editRedemptionChannel); // /tenants/edit_redemption_channel
router.get("/getRedemptionChannel", userController.getRedemptionChannel); // /tenants/get_redemption_channel
router.get("/getRuleTypes", userController.getRuleTypes); // /tenants/get_rule_types
router.get("/getTenantBranchList", userController.getTenantBranchList); // /tenants/get_tenant_branch_list
// router.get("/tenants/test", userController.test);
router.post("/unlockAssignPoint", userController.unlockAssignPoint); // /unlock_assign_point
// /*************************** User Routes Start ********************************************/
router.post("/addTenantUser", userController.addTenantUser); // /tenant_user/add_tenant_user
router.put("/editTenantUser/:id", userController.editTenantUser); // /tenant_user/edit_tenant_user/:id
router.get("/getTenantUser/:id", userController.getTenantUserById); // /tenant_user/get_tenant_user/:id
router.post("/getTenantUserByEmail", userController.getTenantUserByEmail); // /tenant_user/get_tenant_user_by_id_email
router.get("/getTenantUsersList", userController.getTenantUsersList); // /tenant_user/get_tenant_users_list
router.post("/updateTenantUserDetails", userController.updateTenantUserDetails); // /tenant_user/update_tenant_userDetails
router.post("/changePassword", userController.changePassword); // /tenant_user/change_password
// router.post("/tenant_user/point_redeem_tenant", userController.point_redeem_tenant);
// /*************************** User Routes End ********************************************/
// /*****************************DashBoard Services ************************************************ */
router.get("/getDashboardCount", userController.getDashboardCount); // /get_dashboard_count
router.get("/getDashboardGraph", userController.getDashboardGraph); // /get_dashboard_graph
router.get("/overallPoints", userController.overallPoints); // /get_dashboard_graph
// /*****************************DashBoard Services ************************************************* */
router.get("/getEmailTrackDetails", userController.getEmailTrackDetails);
module.exports = router;