let express = require('express');
let router = express.Router();
let expressValidator = require('express-validator');
router.use(expressValidator());
let Tenant_user_controller = require("../controllers/Tenant_user_controller");

let Email_template_controller = require("../controllers/Email_template_controller");
let Sms_controller = require("../controllers/Sms_template_controller");
let Broker_controller = require("../controllers/Broker_controller");
// let Tenant_privileges_controller = require("../controllers/Tenant_privileges_controller");
let Tenant_user_role_controller = require("../controllers/Tenant_user_role_controller");
// let Tenant_program_controller = require("../controllers/Tenant_program_controller");
let Html_template_controller = require("../controllers/Html_template_controller");

// let Tags_controller = require("../controllers/Tags_controller");
let Report_controller = require("../controllers/Report_controller");
let Developer_panel_controller = require("../controllers/Developer_panel_controller");
let Push_notification_controller = require("../controllers/Push_notification_controller");
// let Brand_controller = require("../controllers/Brand_controller");
let Notification_controller = require("../controllers/Notification_controller");

let Cron_controller=require("../controllers/Cron_controller");
let cron_controller=new Cron_controller();

let tenant_user_controller = new Tenant_user_controller();
// let tenant_privileges_controller = new Tenant_privileges_controller();
let email_template_controller = new Email_template_controller();
let sms_controller = new Sms_controller();
let broker_controller = new Broker_controller();
let tenant_user_role_controller = new Tenant_user_role_controller();
// let tenant_program_controller = new Tenant_program_controller();
let html_template_controller = new Html_template_controller();

// let tags_controller = new Tags_controller();
let report_controller = new Report_controller();
let developer_panel_controller = new Developer_panel_controller();
let push_notification_controller = new Push_notification_controller();
let notification_controller = new Notification_controller();

// router.put("/tenants/edit_redemption_channel", tenant_user_controller.edit_redemption_channel);
// router.post("/tenants/add_tenant_program", tenant_program_controller.add_tenant_program);
// router.put("/tenants/edit_tenant_program", tenant_program_controller.edit_tenant_program);
// router.get("/tenants/get_tenant_program/", tenant_program_controller.get_tenant_program_by_id);
// router.get("/tenants/get_program_info_tree/", tenant_program_controller.get_program_info_tree);
// router.get("/tenants/get_tenant_branch_list", tenant_user_controller.get_tenant_branch_list);
// router.post("/unlock_assign_point", tenant_user_controller.unlock_assign_point);
// router.get("/tenants/get_languages_list/", tenant_program_controller.get_languages_list);


let cron_route=require("../../tenant/modules/cron_job/routes/cron.routes");

router.use('/cron/', cron_route);

router.post("/cron",cron_controller.add_cron);
router.put("/action",cron_controller.action);

router.put("/cron",cron_controller.modify_cron);
router.get("/cron/list",cron_controller.cron_list);


router.post("/email_template/add_email_template", email_template_controller.add_email_template);
router.put("/email_template/edit_email_template/:id", email_template_controller.edit_email_template);
router.get("/email_template/get_email_template_by_id/:id", email_template_controller.get_email_template_by_id);
router.get("/email_template/get_email_template_list", email_template_controller.get_email_template_list);
router.post("/email_template/get_tag_list", email_template_controller.get_tag_list);
// router.post("/email_template/sendEmail", email_template_controller.sendEmail);
router.get("/email_template/get_activity_email_logs", email_template_controller.get_activity_email_logs);
router.put("/email_template/change_email_template_status", email_template_controller.change_email_template_status);
router.get("/email_template/get_selected_activity_list/:id", email_template_controller.get_selected_activity_list);
router.get("/email_template/get_selected_email_languages/:id", email_template_controller.get_selected_email_languages);

router.post("/sms", sms_controller.add_sms_template);
router.put("/sms/edit_sms_template/:id", sms_controller.edit_sms_template);
router.get("/sms/get_sms_template_by_id/:id", sms_controller.get_sms_template_by_id);
router.get("/sms/get_sms_template_list", sms_controller.get_sms_template_list);
router.get("/sms/get_sms_activities_list", sms_controller.get_sms_activities_list);
router.get("/sms/get_selected_activity_list/:id", sms_controller.get_selected_activity_list);
router.get("/sms/get_selected_sms_languages/:id", sms_controller.get_selected_sms_languages);

router.post("/broker/add_broker", broker_controller.add_broker);
router.put("/broker/edit_broker", broker_controller.edit_broker);
router.get("/broker/get_broker_list", broker_controller.get_broker_list);
router.get("/broker/get_building_list", broker_controller.get_building_list);
router.get("/broker/get_broker/:id", broker_controller.get_broker);

router.post("/role/add_tenant_user_role", tenant_user_role_controller.add_tenant_user_role);
router.put("/role/edit_tenant_user_role/:id", tenant_user_role_controller.edit_tenant_user_role);
router.put("/role/update_status/", tenant_user_role_controller.update_status);
router.get("/role/get_tenant_user_role/:id", tenant_user_role_controller.get_tenant_user_role_by_id);
router.get("/role/get_tenant_user_roles_list", tenant_user_role_controller.get_tenant_user_roles_list);


router.post("/html_templates/", html_template_controller.upload_template);
router.get("/html_templates/", html_template_controller.get_templates);

router.get("/reports/commission", report_controller.get_commission_report_list);
router.get("/reports/get_customer_transaction_list", report_controller.get_customer_transaction_list);

router.get("/notification/get_push_notification_provider_masters", push_notification_controller.get_push_notification_provider_master_list);
router.post("/notification/add_push_notification_provider", push_notification_controller.add_push_notification_provider);
router.post("/notification/send_push_notification_global", push_notification_controller.send_push_notification_global);
router.post("/notification/send_push_notification", push_notification_controller.send_push_notification);
router.get("/notification/get_notification_template", push_notification_controller.get_notification_template);
router.post("/notification/add_notification_template", push_notification_controller.add_notification_template);
router.put("/notification/add_notification_template", push_notification_controller.add_notification_template);
router.get("/notification_template/get_activity_notification_logs", push_notification_controller.get_activity_notification_logs);
router.put("/notification_template/change_push_template_status", push_notification_controller.change_push_template_status);
router.get("/notification_template/get_notification_configuration", push_notification_controller.get_notification_configuration);
router.post("/notification_template/add_update_notification_config", push_notification_controller.add_update_notification_config);
router.get("/notification_template/get_selected_activity_list/:id", push_notification_controller.get_selected_activity_list);
router.get("/notification_template/get_selected_notification_languages/:id", push_notification_controller.get_selected_notification_languages);

router.get('/developer_panel/routes', developer_panel_controller.get_route_list);
router.post('/developer_panel/routes', developer_panel_controller.store_routes);
router.put('/developer_panel/routes/update_api_permission_group', developer_panel_controller.update_route_group);
router.put('/developer_panel/routes/update_group_codes', developer_panel_controller.update_route_group_code);
router.get('/developer_panel/tenant_types', developer_panel_controller.get_tenant_types);
router.put('/developer_panel/routes/update_route_valid_permission', developer_panel_controller.update_valid_permission_type);
router.put('/developer_panel/routes/enable_route', developer_panel_controller.enable_disable_route);
router.get('/routes/', developer_panel_controller.get_routes);
router.post("/developer_panel/status", developer_panel_controller.update_permission_status);
router.post("/developer_panel/api_group", developer_panel_controller.add_group);
router.put("/developer_panel/api_group", developer_panel_controller.modify_group);
router.get("/developer_panel/api_group/list", developer_panel_controller.get_list);
router.put("/developer_panel/api_group/status", developer_panel_controller.set_status);
router.get("/developer_panel/assign_api_group/get_users", developer_panel_controller.get_users);
router.get("/developer_panel/assign_api_group/get_group_list", developer_panel_controller.get_group_list);
router.post("/developer_panel/api_groups/assign_routes", developer_panel_controller.assign_routes);
router.get("/developer_panel/api_groups/assign_routes/list", developer_panel_controller.get_assigned_routes);
router.put("/developer_panel/api_groups/assign_routes/remove", developer_panel_controller.remove_route);
router.post("/developer_panel/api_groups/assign_apis", developer_panel_controller.assign_apis);
router.get("/developer_panel/api_groups/assign_apis/list", developer_panel_controller.get_assigned_apis);
router.put("/developer_panel/api_groups/assign_apis/remove", developer_panel_controller.remove_api);
router.get("/developer_panel/api/list", developer_panel_controller.get_api_list);

let customerRoutes = require("../modules/customers/routes/customers.routes");
router.use("/customers/", customerRoutes);

let user = require("../modules/user/routes/user.route");
router.use('/user/', user);

let memberType = require("../modules/member_type/routes/member_type.routes.js");
router.use("/member_type/", memberType);

let property = require("../modules/property/routes/property.routes.js");
router.use("/property/", property);

let family = require("../modules/family/routes/family.routes");
router.use("/family/", family);

let unit_master_route = require("../modules/unit_master/routes/unit_master.route.js");
router.use("/unit_master/", unit_master_route);

let owner_route = require("../modules/owner/routes/owner.route.js");
router.use("/owner/", owner_route);

let cron_job = require("../modules/cron_job/routes/cron.routes");
router.use("/cron_job/", cron_job);

let tenant_route = require("../modules/tenant/routes/tenant.route.js");
router.use("/tenant/", tenant_route);

let organization_route = require("../modules/organization/routes/organization.route.js");
router.use("/organization/", organization_route);

let common_route = require("../modules/common/routes/common.route.js");
router.use("/common/", common_route);

let gains_route = require("../modules/gains/routes/gains.route.js");
router.use("/gains/", gains_route);

let oam_customer_route = require("../modules/oam_customer/routes/oam_customer.routes.js");
router.use("/oam_customer/", oam_customer_route);

router.get("/inapp_notification/get_notification_template", notification_controller.get_notification_template);
router.post("/inapp_notification/add_notification_template", notification_controller.add_notification_template);
router.put("/inapp_notification/add_notification_template", notification_controller.add_notification_template);
router.get("/inapp_notification/get_selected_activity_list/:id", notification_controller.get_selected_activity_list);
router.get("/inapp_notification/get_selected_notification_languages/:id", notification_controller.get_selected_notification_languages);
router.put("/inapp_notification/change_push_template_status", notification_controller.change_push_template_status);

let couponRoute = require("../modules/coupon/routes/coupon.routes");
router.use("/coupon/", couponRoute);

module.exports = router; 
