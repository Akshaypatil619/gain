let messages = require("./messages.js");
let status_codes = {
	 "broker_template_created": 21022,
	 "broker_template_exist" : 21024,
	 "broker_template_created_failed": 21023,
	 "broker_template_found":21025,
	 "broker_template_not_found":21026,
	 "broker_template_update_success":21027,
	 "broker_template_update_failed":21028,
	 "broker_activity_found":21029,
	 "broker_activity_not_found":21030,


	"inavalid_credentials": 21100,
	"inavalid_user": 21101,
	"user_verified": 21112, 
	"user_not_verified": 21111, 
	"base_configuration_save_success": 21001,
	"base_configuration_save_failed": 21002,
	"base_setting_found": 21003,
	"base_setting_not_found": 21004,

	"setting_not_found": 21005,
	"setting_found": 21006,


	"data_found": 99887,
	"data_not_found": 99888,
	"data_update_success": 99889,
	"data_update_failed": 99890,
	"data_insert_failed": 99891,

	"group_codes_found": 23,
	"group_codes_not_found": 24,

	//Api Auth Error
	"api_auth": 1,
	"api_invalid": 2,
	"api_invalid_token": 3,
	"user_invalid_token": 4,
	"invalid_tenant_token": 5,
	"session_timeout": 6,

	//Login Module Related Messages
	"login_field_required": 101,
	"login_failed": 102,
	"login_success": 103,
	"email_not_verified": 104,
	"deactivated_admin": 105,
	"password_dose_not_match": 106,

	//Registration Module Related Messages
	"registration_field_required": 201,
	"registration_failed": 202,
	"registration_success": 203,
	"exist_field": 204,

	//Database Errors
	"database_table_not_exist": 301,
	"database_table_column_not_exist": 302,
	"database_column_ambiguous": 303,
	"database_query_parse_error": 304,
	"database_query_column_count_error": 305,
	"database_value_exist": 306,

	//Get Admin Module Permissions
	"module_permission_failed": 401,
	"module_permission_success": 402,

	"admin_deactivated_failed": 501,
	"admin_deactivated_success": 502,
	"admin_already_deactivated": 503,

	"admin_activated_failed": 504,
	"admin_activated_success": 505,
	"admin_already_activated": 506,

	"form_field_reqired": 601,
	"status_update_success": 590,
	"status_update_failed": 591,


	"channel_code_not_found": 592,
	"channel_code_found": 592,
	"channel_code_update_failed": 593,
	"channel_code_update_success": 594,
	"channel_code_create_failed": 595,
	"channel_code_create_success": 596,
	"channel_code_already_exist": 597,


	//Merchants
	//signup codes
	"email_already_exist": 602,
	"phone_already_exist": 603,
	//other codes
	"added_success": 604,
	"get_merchant_failed": 605,
	"get_merchant_success": 606,
	"branch_added_failed": 607,
	"branch_added_success": 608,
	"branch_update_success": 622,
	"merchant_activities_not_found": 609,
	"merchant_activities_found": 610,
	"merchant_branch_not_found": 611,
	"merchant_branch_found": 612,
	"sub_merchant_modified_failed": 613,
	"sub_merchant_modified_success": 614,
	"merchant_update_failed": 615,
	"merchant_update_success": 616,
	"sub_merchant_info_founded": 617,
	"sub_merchant_does_not_exists": 618,

	"bank_details_already_exist": 615,
	"bank_detail_added_failed": 616,
	"bank_detail_added_successfully": 617,
	"bank_details_found_failed": 618,
	"bank_details_found_success": 619,
	"bank_details_update_failde": 620,
	"bank_details_update_success": 621,

	"merchant_mid_tid_found": 622,
	"merchant_mid_tid_not_found": 623,
	"get_merchant_offer_success": 624,
	"get_merchant_offer_failed": 625,

	"tier_create_success": 701,
	"no_tier_found": 702,
	"tier_get_success": 703,
	"tier_update_success": 704,
	"update_customer_downgrade_tier": 706,
	"update_customer_downgrade_tier_faild": 708,

	//Store Branches
	"store_address_already_exist": 801,
	"lat_lng_already_exist": 802,

	//category create
	"category_create_failed": 901,
	"category_create_success": 902,
	"not_category_found": 903,
	"category_found": 904,
	"category_already_exist": 905,
	"category_not_found": 904,
	"category_update_failed": 906,
	"category_update_success": 907,
	"category_already_modified": 908,

	"sub_category_found": 914,
	"sub_category_not_found": 909,
	"sub_category_already_exist": 910,
	"sub_category_already_modified": 911,
	"sub_category_update_failed": 912,
	"sub_category_update_success": 913,
	"sub_category_create_success": 915,
	"sub_category_create_failed": 916,

	"channel_not_found": 1001,
	"channel_found": 1002,

	"get_form_init_data_failed": 1100,
	"get_form_init_data_success": 1101,

	//country
	"country_added_failed": 1200,
	"country_added_success": 1201,
	"get_countries_failed": 1202,
	"get_countries_success": 1203,
	"country_data_empty": 1204,
	"country_file_upload_failed": 1404,
	"get_emirate_success": 1210,
	"country_data_empty": 1211,


	// vouchers
	"voucher_create_failed": 1301,
	"voucher_create_success": 1302,
	"no_voucher_found": 1303,
	"voucher_get_success": 1304,
	"voucher_modified_failed": 1305,
	"voucher_modified_success": 1306,
	"voucher_remove_failed": 1307,
	"voucher_remove_success": 1308,
	"voucher_not_found": 1309,
	"voucher_already_removed": 1310,
	"get_vouchers_failed": 1311,
	"get_vouchers_success": 1312,
	"voucher_assigned_failed": 1313,
	"voucher_assigned_success": 1314,
	"voucher_quantity_is_low": 1315,
	"voucher_types_not_found": 1316,
	"voucher_types_founded": 1317,


	"voucher_redeem_success": 1318,
	"voucher_redeem_failed": 1319,
	"voucher_already_redeemed": 1320,
	"voucher_expired": 1321,
	"invalid_merchant": 1322,

	"voucher_already_added_in_favourite_list": 1323,
	"voucher_added_in_favourite_list": 1324,
	"voucher_not_found_in_favourite_list": 1325,
	"voucher_remove_from_favourite_list": 1326,
	"differant_voucher_redeem_branch": 1327,
	"voucher_modified_failed_plz_active_sub_category": 1328,
	"voucher_modified_failed_plz_active_category": 1329,

	// Deal Vouchers
	"deal_voucher_create_failed": 1401,
	"deal_voucher_create_success": 1402,
	"no_deal_voucher_found": 1403,
	"deal_voucher_modified_failed": 1405,
	"deal_voucher_modified_success": 1406,
	"deal_voucher_remove_failed": 1407,
	"deal_voucher_remove_success": 1408,
	"deal_voucher_not_found": 1409,
	"deal_voucher_already_removed": 1410,
	"get_deal_vouchers_failed": 1411,
	"get_deal_vouchers_success": 1412,
	"deal_voucher_types_not_found": 1416,
	"deal_voucher_types_found": 1417,

	"deal_voucher_redeem_success": 1418,
	"deal_voucher_redeem_failed": 1419,
	"deal_voucher_already_redeemed": 1420,
	"deal_voucher_expired": 1421,

	"deal_voucher_already_added_in_favourite_list": 1423,
	"deal_voucher_added_in_favourite_list": 1424,
	"deal_voucher_not_found_in_favourite_list": 1425,
	"deal_voucher_remove_from_favourite_list": 1426,
	"different_deal_voucher_redeem_branch": 1427,
	"deal_voucher_assigned_successfully": 1431,
	"deal_voucher_assignment_failed": 1432,
	"deal_voucher_purchase_success": 1433,
	"deal_voucher_purchase_failed": 1434,

	//Offer codes
	"offer_create_failed": 1001,
	"offer_create_success": 1002,
	"offer_found": 1004,
	"offer_not_found": 1003,
	"offer_update_failed": 1005,
	"offer_update_success": 1006,
	"offer_detele_failed": 1010,
	"offer_delete_success": 1011,
	"offer_redeem_success": 1012,
	"offer_redeem_failed": 1013,
	// Tenants codes
	"tenants_create_failed": 2001,
	"tenants_create_success": 2002,
	"tenants_found": 2004,
	"tenants_not_found": 2003,
	"tenants_update_failed": 2005,
	"tenants_update_success": 2006,
	"tenants_detele_failed": 2010,
	"tenants_delete_success": 2011,
	// "tenants_create_success": 2012,
	"tenants_invalid_edit_token": 2013,
	"tenants_merchant_assigned_failed": 2014,
	"tenants_merchant_assigned_success": 2015,
	"tenants_merchant_already_assigned": 2016,
	"tenant_merchant_request_placed": 2017,
	"tenant_merchant_request_place_failed": 2018,
	"tenant_merchant_request_already_placed": 2019,

	"tenants_merchant_deleted_success": 2020,
	"tenants_merchant_already_deleted": 2021,
	"tenant_merchant_delete_request_placed": 2022,
	"tenant_merchant_delete_request_place_failed": 2023,
	"tenant_merchant_delete_request_already_placed": 2024,

	"tenants_bank_info_update_failed": 2025,
	"tenants_bank_info_update_success": 2026,
	"tenants_group_code_info_get_success": 2027,
	"tenants_bank_info_found": 2028,
	"tenants_bank_info_not_found": 2029,

	"merchant_type_create_success": 2101,
	"merchant_type_update_success": 2102,
	"merchant_type_list_get_success": 2103,
	"merchant_type_status_update_success": 2104,
	"merchant_type_get_success": 2105,
	"merchant_type_details_not_found": 2106,


	/***********************************************************************************/
	/********************* tenant Dashboard Status codes **********************************/
	/***********************************************************************************/

	"deactive_tenant": 4000,
	"deactive_merchant": 4001,


	/***********************************************************************************/
	/********************* client Status codes *******************************/
	/***********************************************************************************/

	"client_join_success": 5000,
	"client_already_registered": 5001,
	"client_login_failed": 5002,
	"client_login_success": 5003,

	/***********************************************************************************/
	/********************* tenant Dashboard Status codes *******************************/
	/***********************************************************************************/

	"merchant_join_success": 6000,
	"merchant_already_registered": 6001,
	"merchant_login_failed": 6002,
	"merchant_login_success": 6003,

	"tenants_assigned_merchant_status_not_changed": 6100,
	"tenants_assigned_merchant_status_changed": 6101,
	"tenants_already_exits": 6102,

	//Product codes
	"product_create_failed": 1401,
	"product_create_success": 1402,
	"product_found": 1404,
	"product_not_found": 1403,
	"product_update_failed": 1405,
	"product_update_success": 1406,
	"product_detele_failed": 1410,
	"product_delete_success": 1411,
	"product_already_exist": 1412,
	"product_tenant_assigned_success": 1511,
	"product_tenant_assigned_failed": 1512,
	'product_modify_relationship_success': 1530,
	'product_modify_relationship_failed': 1531,
	'product_already_assigned_to_tenant': 1532,

	//Product Types
	"product_type_create_failed": 1513,
	"product_type_create_success": 1514,
	"product_type_found": 1515,
	"product_type_not_found": 1516,
	"product_type_update_failed": 1517,
	"product_type_update_success": 1518,
	"product_type_already_exist": 1519,

	"product_redeem_success": 1520,
	"product_referral_found": 152001,
	"product_referral_not_found": 15200,
	"product_redeem_failed": 1521,
	"product_already_redeemed": 1522,
	"product_expired": 1523,

	"product_already_added_in_favourite_list": 1524,
	"product_added_in_favourite_list": 1525,
	"product_not_found_in_favourite_list": 1526,
	"product_remove_from_favourite_list": 1527,

	"app_referral_found": 152002,
	"app_referral_not_found": 15203,

	//Offer Types
	"offer_type_create_failed": 1520,
	"offer_type_create_success": 1521,
	"offer_type_found": 1522,
	"offer_type_not_found": 1523,
	"offer_type_update_failed": 1524,
	"offer_type_update_success": 1525,
	"offer_type_already_exist": 15126,

	"offer_already_added_in_favourite_list": 15130,
	"offer_added_in_favourite_list": 15131,
	"offer_not_found_in_favourite_list": 15132,
	"offer_remove_from_favourite_list": 15133,


	// User Role Management
	"user_role_added_failed": 16001,
	"user_role_added_success": 16002,
	"user_role_update_failed": 16001,
	"user_role_update_success": 16002,
	"user_role_exist": 16003,
	"user_role_not_found": 16004,
	"user_role_list_fetched_failed": 16005,
	"user_role_list_fetched_success": 16006,
	"user_role_status_update_failed": 16007,
	"user_role_status_update_success": 16008,
	tenant_user_role_exist: 16009,

	// Admin user messages
	"admin_user_create_failed": 17001,
	"admin_user_create_success": 17002,
	"admin_user_details_updated_failed": 17003,
	"admin_user_details_updated_success": 17004,
	"admin_user_does_not_exist": 17005,
	"user_list_fetched_failed": 17006,
	"user_list_fetched_success": 17007,
	"admin_user_found": 17008,
	"inactive_admin_user": 17009,

	// Tenant user messages
	"tenant_user_create_failed": 18001,
	"tenant_user_create_success": 18002,
	"tenant_user_details_updated_failed": 18003,
	"tenant_user_details_updated_success": 18004,
	"tenant_user_does_not_exist": 18005,
	"tenant_user_list_fetched_failed": 18006,
	"tenant_user_list_fetched_success": 18007,
	"tenant_user_found": 18008,
	"inactive_tenant_user": 18009,
	"tenant_user_role_added_success": 18010,
	"tenant_user_role_update_success": 18011,

	//Earning Point Rules
	"earning_point_rule_create_failed": 1713,
	"earning_point_rule_create_success": 1714,
	"earning_point_rule_found": 1715,
	"earning_point_rule_not_found": 1716,
	"earning_point_rule_update_failed": 1717,
	"earning_point_rule_update_success": 1718,
	"earning_point_rule_already_exist": 1719,
	"stack_rule_points_added": 1720,
	"stack_rule_points_added_failed": 1721,

	//Tenant Banner
	"tenant_banner_update_failed": 1812,
	"tenant_banner_create_failed": 1813,
	"tenant_banner_create_success": 1814,
	"tenant_banner_found": 1815,
	"tenant_banner_not_found": 1816,
	"tenant_banner_update_success": 1818,
	"tenant_banner_already_exist": 1819,

	//Tenant Tax
	"tenant_tax_update_failed": 1912,
	"tenant_tax_create_failed": 1913,
	"tenant_tax_create_success": 1914,
	"tenant_tax_found": 1915,
	"tenant_tax_not_found": 1916,
	"tenant_tax_update_success": 1917,
	"tenant_tax_already_exist": 1918,
	"comment_create_success": 1919,


	//Tenant Redemption Channel    "comment_create_success": ,

	"tenant_redemption_channel_update_failed": 20012,
	"tenant_redemption_channel_create_failed": 20013,
	"tenant_redemption_channel_create_success": 20014,
	"tenant_redemption_channel_found": 20015,
	"tenant_redemption_channel_not_found": 20016,
	"tenant_redemption_channel_update_success": 20017,
	"tenant_redemption_channel_already_exist": 20018,

	//Tenant BGT Configuration
	"tenant_bgt_configuration_update_failed": 20112,
	"tenant_bgt_configuration_create_failed": 20113,
	"tenant_bgt_configuration_create_success": 20114,
	"tenant_bgt_configuration_found": 20115,
	"tenant_bgt_configuration_not_found": 20116,
	"tenant_bgt_configuration_update_success": 20117,
	"tenant_bgt_configuration_already_exist": 20118,

	"billing_cycle_not_found": 21101,
	"billing_cycle_found": 21102,
	"base_setting_save_success": 21103,
	"tax_setting_save_success": 21104,
	"tax_setting_found": 21105,
	"tax_setting_update_success": 21105,

	"customer_update_failed": 20212,
	"customer_create_failed": 20213,
	"customer_create_success": 20214,
	"customer_found": 20215,
	"customer_not_found": 20216,
	"customer_update_success": 20217,
	"customer_already_exist": 20218,
	"customer_cards_update_success": 20219,
	"customer_cards_update_failed": 20220,
	"customer_cards_remove_success": 20221,
	"customer_card_type_found": 20222,
	"customer_card_type_not_found": 20223,

	"comment_found": 20224,
	"comment_not_found": 20225,

	"comment_status_change_sucess": 20226,
	"comment_status_not_change_sucess": 20227,
	"customer_import_success": 20228,
	"customer_import_failed": 20229,
	"customer_cards_already_exist": 20230,

	"customer_fields_found": 20231,
	"customer_fields_not_found": 20232,

	//Customer Tier
	"customer_tier_update_failed": 20312,
	"customer_tier_create_failed": 20313,
	"customer_tier_create_success": 20314,
	"customer_tier_found": 20315,
	"customer_tier_not_found": 20316,
	"customer_tier_update_success": 20317,
	"customer_tier_already_exist": 20318,

	//Customer Tier Upgrade
	"customer_tier_upgrade_update_failed": 20412,
	"customer_tier_upgrade_create_failed": 20413,
	"customer_tier_upgrade_create_success": 20414,
	"customer_tier_upgrade_found": 20415,
	"customer_tier_upgrade_not_found": 20416,
	"customer_tier_upgrade_update_success": 20417,
	"customer_tier_upgrade_already_exist": 20418,


	//Customer Voucher Purchases
	"customer_voucher_purchase_update_failed": 20512,
	"customer_voucher_purchase_create_failed": 20513,
	"customer_voucher_purchase_create_success": 20514,
	"customer_voucher_purchase_found": 20515,
	"customer_voucher_purchase_not_found": 20516,
	"customer_voucher_purchase_update_success": 20517,
	"customer_voucher_purchase_already_exist": 20518,
	"customer_voucher_purchase_invalid_quantity": 20519,
	"voucher_no_longer_available": 20520,

	//Customer Voucher Purchases
	"customer_product_purchase_create_failed": 20612,
	"customer_product_purchase_create_success": 20613,
	"customer_product_purchase_found": 20614,
	"customer_product_purchase_not_found": 20615,
	"customer_product_purchase_already_purchased": 20616,
	"product_gifted_success": 20617,
	"product_gifted_failed": 20618,

	//Customer Offer Redemption
	"customer_offer_redemption_create_failed": 20650,
	"customer_offer_redemption_create_success": 20651,
	"customer_offer_redemption_found": 20652,
	"customer_offer_redemption_not_found": 20653,
	"customer_offer_redemption_already_redeemed": 20654,

	"update_field_not_available": 20655,
	"update_success": 20656,
	"confirm_password_does_not_match": 20557,


	'privileges_get_success': 20701,
	"not_allow_super_admin_privileges_updatation": 20702,
	"privileges_update_success": 20703,
	"permission_denies": 20704,

	'mid_info_exists': 20801,
	'mid_info_added_success': 20802,
	'mid_info_found': 20803,
	'mid_info_not_found': 20804,

	'tid_info_exists': 20901,
	'tid_info_added_success': 20902,

	// promocodes
	"promocode_target_not_found": 21001,
	"promocode_target_found": 21002,
	"promocode_added_success": 21003,
	"promocodes_not_found": 21004,
	"promocodes_found": 21005,
	"promocode_not_found": 21006,
	"promocode_found": 21007,
	"promocode_already_exist": 21008,
	"promocode_campaign_found": 21009,
	"promocode_campaign_not_found": 21010,
	"promocode_campaign_exist": 21011,
	"promocode_campaign_save_success": 21012,
	"promocode_modified_success": 21013,
	"promocodes_status_updated_success": 21014,
	"invalid_promocode": 21015,


	"not_allow_super_tenant_privileges_updatation": 20712,


	//Points
	'wallet_ledger_modify_success': 20903,
	'wallet_ledger_modify_failed': 20904,
	'wallet_ledger_data_found': 20905,
	'wallet_ledger_data_not_found': 20905,
	'points_found': 20910,
	'points_not_found': 20911,
	'tier_level_point_configuration_not_found': 20192,
	'base_tier_point_configuration_not_found': 20193,
	'points_added': 21123,
	'failed_to_add_points': 21124,
	'insufficient_points': 20912,
	'update_extend_validity_success': 20913,
	'extend_validity_not_found': 20914,
	'point_about_expire': 20915,
	'point_about_expire_not_found': 20916,

	'point_type_create_success': 20917,
	'master_point_type_create_failed': 20918,
	'point_type_update_failed': 20919,
	'point_type_update_success': 20920,
	'point_priority_update_failed': 20921,
	'point_priority_update_success': 20922,
	'wallet_point_types_found': 20923,
	'wallet_point_types_not_found': 20924,
	'master_point_type_not_found': 20925,
	'point_type_name_exist': 20926,
	'point_type_already_exist': 20927,

	'activity_master_user_not_found': 21001,
	'activity_master_user_found': 21002,
	'user_type_found': 21003,
	'user_type_not_found': 21004,
	'activity_update_success': 21005,
	"activity_decline": 21006,
	activities_found: 21007,
	activities_not_found: 21008,
	activity_failed: 21009,
	activity_success: 21010,
	activity_update_success: 21011,
	activity_update_failed: 21012,

	//Bank Master
	"bank_create_failed": 17313,
	"bank_create_success": 17314,
	"bank_found": 17315,
	"bank_not_found": 17316,
	"bank_update_failed": 17317,
	"bank_update_success": 17318,
	"bank_already_exist": 17319,

	//Deal Code Master
	"deal_code_create_failed": 17413,
	"deal_code_create_success": 17414,
	"deal_code_found": 17415,
	"deal_code_not_found": 17416,
	"deal_code_update_failed": 17417,
	"deal_code_update_success": 17418,
	"deal_code_already_exist": 17419,

	//Card Network Master
	"card_network_create_failed": 17513,
	"card_network_create_success": 17514,
	"card_network_found": 17515,
	"card_network_not_found": 17516,
	"card_network_update_failed": 17517,
	"card_network_update_success": 17518,
	"card_network_already_exist": 17519,

	//Card Linked Program
	"card_linked_program_create_failed": 17613,
	"card_linked_program_create_success": 17614,
	"card_linked_program_found": 17615,
	"card_linked_program_not_found": 17616,
	"card_linked_program_update_failed": 17617,
	"card_linked_program_update_success": 17618,
	"card_linked_program_already_exist": 17619,
	"card_linked_program_mid_tid_update_success": 17620,
	"card_linked_program_mid_tid_update_failed": 17621,
	"flat_file_upload_success": 17622,
	"flat_file_upload_failed": 17623,
	"flat_file_record_update_failed": 17624,

	"sms_activity_found": 18701,
	"sms_activity_not_found": 18702,
	"point_definition_master_found": 18703,
	"point_definition_master_not_found": 18704,
	"point_definition_master": 18707,
	"point_definition_master_update_success": 18708,
	"point_transaction_found": 18705,
	"point_transaction_not_found": 18706,


	//Tenant Program 
	"tenant_program_create_failed": 18921,
	"tenant_program_create_success": 18922,
	"tenant_program_found": 18923,
	"tenant_program_not_found": 18924,
	"tenant_program_update_failed": 18925,
	"tenant_program_update_success": 18926,
	"tenant_program_already_exist": 18927,


	"sms_template_found": 18801,
	"sms_template_not_found": 18802,
	"sms_template_created": 18803,
	"sms_template_created_failed": 18804,
	"sms_template_update_success": 18805,
	"sms_template_update_failed": 18806,

	"gift_card_template_store_failed": 18901,
	"gift_card_template_save_success": 18902,
	"gift_card_templates_not_found": 18903,
	"gift_card_templates_found": 18904,
	"category_template_update_success": 18905,
	"status_update_success": 18906,

	"tenant_document_uploaded_success": 18802,
	"tenant_document_uploaded_failed": 188023,
	"tenant_documents_found": 188024,
	"tenant_documents_not_found": 188024,
	"tenant_document_remove_success": 188025,
	"tenant_document_remove_failed": 188026,

	"tenant_branch_create_success": 188030,
	"tenant_branch_create_failed": 188031,
	"tenant_branch_update_success": 188032,
	"tenant_branch_update_failed": 188033,
	"tenant_branch_already_exist": 188034,
	"tenant_branch_not_found": 188035,
	"tenant_branch_found": 188036,

	"bulk_process_complete": 18803,
	"bulk_process_failed": 18802,
	"bulk_process_files_found": 18804,
	"bulk_process_files_not_found": 18806,
	"bulk_process_file_data_found": 18805,
	"bulk_process_file_data_not_found": 18807,
	"bulk_process_not_complete ": 18808,



	"wallet_create_failed": 20001,
	"wallet_create_success": 20002,
	"wallet_update_failed": 20003,
	"wallet_update_success": 20004,
	"wallet_found": 19100,
	"wallet_not_found": 19101,
	"wallet_already_exist": 19106,

	"dashboard_count_found": 4545,
	"dashboard_graph_found": 4546,
	"merchant_dashboard_data_rule_found": 5054,
	"merchant_dashboard_data_rule_not_found": 5055,
	"merchant_dashboard_graph_data_rule_found": 5656,
	"merchant_dashboard_graph_data_rule_not_found": 5657,
	"customer_tier_upgrade": 20101,

	"tag_master_details_already_exist": 19020,
	"tag_master_detail_added_failed": 19021,
	"tag_master_detail_added_successfully": 19022,
	"tag_master_details_found_failed": 19023,
	"tag_master_details_found_success": 19024,
	"tag_master_details_update_failed": 19025,
	"tag_master_details_update_success": 19026,

	// sales_office
	"sales_office_not_found": 20001,
	"sales_office_found": 20002,
	"sales_office_create_sucess": 20003,
	"sales_office_create_failed": 20004,
	"sales_office_update_success": 20005,
	"sales_office_update_failed": 20006,
	"sales_office_already_exists": 20007,

	// sales_users
	"sales_users_not_found": 20100,
	"sales_users_found": 20101,
	"sales_users_create_sucess": 20102,
	"sales_users_create_failed": 20103,
	"sales_users_update_success": 20104,
	"sales_users_update_failed": 20105,
	"sales_users_already_exists": 20106,


	//user_type_master
	"user_type_master_not_found": 20011,
	"user_type_master_found": 20012,
	"user_type_master_create_sucess": 20013,
	"user_type_master_create_failed": 20014,
	"user_type_master_update_success": 20015,
	"user_type_master_update_failed": 20016,
	"user_type_master_already_exists": 20017,

	"corporate_create_failed": 20101,
	"corporate_create_success": 20102,
	"corporate_update_failed": 20103,
	"corporate_update_success": 20104,
	"corporate_found": 20105,
	"corporate_not_found": 20106,
	"corporate_already_exist": 20107,

	"tenant_branch_management_create_failed": 20201,
	"tenant_branch_management_create_success": 20202,
	"tenant_branch_management_update_failed": 20203,
	"tenant_branch_management_update_success": 20204,
	"tenant_branch_management_found": 20205,
	"tenant_branch_management_not_found": 20206,
	"tenant_branch_management_already_exist": 20207,
	"html_templates_store_success": 19101,
	"html_template_found": 19102,
	"html_templates_not_found": 19103,

	"customer_segment_already_exist": 19200,
	"customer_segment_create_success": 19201,
	"customer_segments_found": 19202,
	"customer_segments_not_found": 19203,
	"customer_already_added_in_segment": 19204,
	"customer_added_in_segment": 19205,
	"customer_not_added_in_segment": 19206,
	"customer_removed_from_segment": 19207,


	"email_campaign_create_success": 19300,
	"mail_sent": 19301,
	"email_campaign_found": 19302,
	"email_campaign_not_found": 19303,
	"email_campaign_tags_found": 19304,
	"email_campaign_tags_not_found": 19305,
	"email_campaign_exist": 19306,


	"flat_file_model_create_failed": 20201,
	"flat_file_model_create_success": 20202,
	"flat_file_model_update_failed": 20203,
	"flat_file_model_update_success": 20204,
	"flat_file_model_found": 20205,
	"flat_file_model_not_found": 20206,
	"flat_file_model_already_exist": 20207,
	"flat_files_not_found": 21206,
	"flat_files_found": 21207,
	"flat_file_data_not_found": 21208,
	"flat_file_data_found": 21208,

	//settings
	"setting_modified_success": 20300,
	"setting_modified_failed": 20301,

	"consent_create_failed": 20301,
	"consent_create_success": 20302,
	"consent_update_failed": 20303,
	"consent_update_success": 20304,
	"consent_found": 20305,
	"consent_not_found": 20306,
	"consent_already_exist": 20307,
	"consent_id_update_failed": 20310,

	"consent_assign_customer_create_success": 20308,
	"consent_assign_customer_create_failed": 20309,

	"field_added": 20202020,
	"valid_token": 20401,
	"invalid_token": 20401,

	"convert_point_to_money": 20310,
	"log_out_success": 20311,

	"user_lock_point": 20401,
	"user_dont_have_insufficient_point": 20402,
	"unlock_data_successfully": 20403,
	"unlock_update_failed": 20404,
	"point_burn_successfully": 20405,

	"salutation_list_found": 20500,
	"salutation_list_not_found": 20501,

	"user_lock_point": 20401,
	"user_dont_have_insufficient_point": 20402,
	"unlock_data_successfully": 20403,
	"unlock_update_failed": 20404,
	"point_burn_successfully": 20405,

	"salutation_list_found": 20500,
	"salutation_list_not_found": 20501,

	"add_brand_success": 20600,
	"add_brand_failed": 20601,
	"brand_update_failed": 20602,
	"brand_update_success": 20603,

	"get_brands_success": 20602,
	"get_brands_failed": 20603,
	"email_provider_already_exist": 21001,
	"email_provider_add_failed": 21002,
	"email_provider_add_success": 21003,
	"email_providers_found": 21004,
	"email_providers_not_found": 21005,
	"email_provider_update_failed": 21006,
	"email_provider_update_success": 21007,

	"redeem_point_success": 21101,
	"redeem_point_failed": 21102,

	"excel_upload_failed": 21200,
	"customer_list_import_success": 21201,
	"excel_file_not_found": 21202,
	"invalid_excel_file": 21203,
	"no_data_found_in_file": 21204,
	"email_log_found": 21205,
	"email_log_not_found": 21206,

	"excel_upload_failed": 21200,
	"customer_list_import_success": 21201,
	"excel_file_not_found": 21202,
	"invalid_excel_file": 21203,
	"no_data_found_in_file": 21204,
	"redeemed_point_success": 21101,
	"redeem_point_update_failed": 21102,
	"city_create_failed": 30001,
	"city_create_success": 30002,
	"city_update_failed": 30003,
	"city_update_success": 30004,
	"city_found": 200100,
	"city_not_found": 200101,
	"city_already_exist": 200106,



	"zone_create_failed": 40001,
	"zone_create_success": 40002,
	"zone_update_failed": 40003,
	"zone_update_success": 40004,
	"zone_found": 21100,
	"zone_not_found": 21101,
	"zone_already_exist": 21106,

	"city_file_success": 21107,

	salutation_list_found: 20500,
	salutation_list_not_found: 20501,

	"tp_application_already_exits": 12010,
	"tp_application_register_success": 12011,
	"tp_application_register_failed": 12012,

	"tp_application_update_success": 12013,
	"tp_application_update_failed": 12014,

	"tp_application_found": 12015,
	"tp_application_not_found": 12016,

	"tp_application_status_change_sucess": 12017,
	"tp_application_status_change_failed": 12018,

	"point_transfer_failed": 60000,
	"point_transfer_sucess": 60001,



	//country
	"country_added_failed": 1200,
	"country_added_success": 1201,
	"get_countries_failed": 1202,
	"get_countries_success": 1203,
	"country_data_empty": 1204,
	"country_added_success": 7895,
	"country_added_failed": 7878,
	"country_master_list_found": 1010,
	"country_master_list_not_found": 1111,
	"country_master_data_found": 4141,
	"country_master_data_not_found": 4142,
	"country_update_success": 1236,
	"country_update_failed": 1237,
	"country_file_upload_success": 1445,


	//Language
	"language_found": 12000,
	"language_not_found": 12001,
	"language_added_success": 12002,
	"language_added_failed": 12003,
	"language_master_list_found": 12004,
	"messages_language_master_list_not_found": 78950,
	"language_update_success": 78780,
	"language_update_failed": 10100,
	"language_master_data_found": 11110,
	"language_master_data_not_found": 41410,

	// rbd 
	"rbd_added_failed": 9898,
	"rbd_added_success": 9899,
	"rbd_config_data_found": 9090,
	"rbd_config_data_not_found": 9091,
	"rbd_class_found": 1010,
	"rbd_class_not_found": 1111,
	"fare_family_found": 1212,
	"fare_family_not_found": 1213,
	"data_found": 1001,
	"data_not_found": 1002,
	"rbd_fare_family_by_id_failed": 1202,
	"rbd_class_by_id_failed": 1205,
	"rbd_configuration_update_success": 1204,
	"rbd_configuration_update_failed": 1205,
	"rbd_fare_family_by_id_failed": 1080,
	"rbd_primary_data_found": 1111,
	"rbd_primary_data_not_found": 1112,

	// airport city list
	"city_list_found": 1417,
	"city_list_not_found": 1418,

	user_group_already_exist: 21501,
	user_group_create_success: 21502,
	user_group_list_found: 21503,
	user_group_list_not_found: 21504,
	user_group_modified_success: 21505,
	user_group_member_found: 21506,
	user_group_member_not_found: 21507,
	user_group_already_active: 21508,
	user_group_already_inactive: 21509,
	user_group_status_updated: 21510,
	user_group_found: 21511,
	user_group_not_found: 21512,
	user_group_member_added: 21513,
	user_group_member_removed: 21514,
	user_group_disabled: 21515,
	user_group_email_sent_success: 21516,

	"source_removed": 2302,
	"source_remove_failed": 2303,
	"add_source_failed": 2304,
	"add_source": 2305,
	//dynamic reports
	"table_columns_update_success": 2300,
	"table_columns_update_failed": 2301,

	"source_removed": 2302,
	"source_remove_failed": 2303,
	"add_source_failed": 2304,
	"add_source": 2305,

	"merchant_already_added_in_favourite_list": 2400,
	"merchant_added_in_favourite_list": 2401,
	"merchant_not_found_in_favourite_list": 2402,
	"merchant_remove_from_favourite_list": 2403,


	//dynamic reports
	"type_not_found": 24001,
	"favourite_list_not_found": 24002,
	"favourite_remove_failed": 24003,
	"coupon_code_found": 24004,
	"coupon_code_not_found": 24005,
	"update_wowcher_status": 24006,

	"table_found": 2401,
	"table_not_found": 2402,
	"setting_added_success": 2403,
	"setting_adding_failed": 2404,
	"report_success": 2405,
	"report_failed": 2406,
	"remove_sucess": 2407,

	"add_sucess": 2408,
	"add_failed": 2409,
	"merchant_not_found": 2410,
	"merchant_found": 2411,

	"remove_failed": 2412,

	"invalid_order": 2413,
	"order_update_success": 2414,

	"get_recommended_data_found": 2415,
	"get_recommended_data_not_found": 2416,

	"recommended_list_found": 2417,
	"recommended_list_not_found": 2418,
	"report_found": 2419,
	"report_not_found": 2420,

	// DropDowns Origin And Destination TPM Filters
	"get_origin_destination_dropdown_found": 1450,
	"get_origin_destination_dropdown_not_found": 1451,


	"merchant_already_added_in_favourite_list": 1452,
	"offer_already_added_in_favourite_list": 1453,
	"product_already_added_in_favourite_list": 1454,
	"voucher_already_added_in_favourite_list": 1455,
	"already_remove_from_favourite_list": 1456,

	// General setting
	"lock_point_timeout_setting": 3000,
	"cc_token_timeout_setting": 36000,

	// Velocity check
	"velocity_modified_success": 32009,
	"velocity_modified_failed": 32010,
	"velocity_not_found": 32011,
	"velocity_found": 32012,
	// General setting
	"lock_point_timeout_setting": 3000,
	"cc_token_timeout_setting": 36000,
	/*-------------------------- Cron Codes Start --------------------*/
	cron_not_found: 21601,
	cron_found: 21602,
	cron_store_success: 21603,
	cron_already_exist: 21604,
	cron_already_running: 21605,
	cron_already_stopped: 21606,
	cron_action_updated: 21607,
	/*-------------------------- Cron Codes End --------------------*/

	/*------------------------ Api Privilages Start ---------------------------*/
	api_permission_not_found: 21701,
	api_permission_updated_success: 21702,
	api_permission_token_already_updated: 21703,
	api_permission_group_id_not_found: 21704,
	/*------------------------ Api Privilages End ---------------------------*/

	/*------------------------ Routes Start ---------------------------*/
	routes_found: 21801,
	routes_not_found: 21802,
	tenant_type_not_found: 21803,
	routes_tenant_type_updated_success: 21804,
	route_updated_success: 21805,
	route_permission_type_updated: 21806,
	api_permission_group_updated: 21807,
	inner_api_route_found: 21809,
	inner_api_added: 21010,
	inner_api_removed: 21011,
	tenant_types_found: 21012,
	inner_route_api_not_found: 21013,
	inner_api_already_exist: 21014,
	inner_api_not_found: 21015,
	/*------------------------ Routes End ---------------------------*/

	redemption_engine_processed_successfully: 98755,
	redemption_engine_process_failed: 98756,

	/* ****** partners start**** */
	partner_success: 22001,
	partner_failed: 22002,
	partner_update_success: 22003,
	partner_update_failed: 22004,
	partner_found: 22005,
	partner_not_found: 22006,
	/* ****** partners ends**** */

	user_type_not_found: 21901,
	group_inserted: 21902,
	group_insertion_failed: 21903,
	group_already_exist: 21904,
	already_enabled: 21905,
	already_disabled: 21906,
	group_status_updated: 21907,
	group_not_found: 21908,
	group_found: 21909,
	group_updated: 21910,
	users_found: 21911,
	api_group_found: 21912,
	route_added_success: 21913,
	route_removed: 21914,

	api_found: 21915,
	api_not_found: 21916,
	api_removed: 21917,
	users_not_found: 21918,
	api_group_not_found: 21919,

	"subscriptionMasterFound": 50000,
	"subscriptionMasterNotFound": 50001,
	"subscriptionPlanAlreadyExist": 50200,
	"subscriptionPlanFound": 50201,
	"subscriptionPlanNotFound": 50202,
	"subscriptionMasterAlreadyExist": 50204,

	"invalid_member_code": 50205,
	"referral_code_unavailable": 50206,
	"downloading_is_prosses": 50207,

	// ----------referral program type start-----------
	"referral_program_type_not_found": 50208,
	"referral_program_type_found": 50209,
	"referral_program_type_update_failed": 50210,
	"referral_program_type_update_success": 50211,
	"referral_program_type_create_failed": 50212,
	"referral_program_type_create_success": 50213,
	"referral_program_type_already_exist": 50214,
	// ----------referral program type End-----------

	// ----------referral Product Sub type start-----------
	"product_sub_type_create_failed": 1513,
	"product_sub_type_create_success": 1514,
	"product_sub_type_found": 1515,
	"product_sub_type_not_found": 1516,
	"product_sub_type_update_failed": 1517,
	"product_sub_type_update_success": 1518,
	"product_sub_type_already_exist": 1519,
	"product_sub_type_name_already_exist": 1520,
	"product_sub_type_code_already_exist": 1521,
	"product_sub_type_name_or_code_already_exist": 1522,
	// ----------referral Product Sub type End-----------

	// EMail Template //
	"email_template_found": 50215,
	"email_template_not_found": 50216,
	"email_template_created": 50217,
	"email_template_created_failed": 50218,
	"email_template_update_success": 50219,
	"email_template_update_failed": 50220,

	"notification_template_insert_success" : 52000,
	"notification_template_insert_fail" : 52001,
	"notification_template_update_success" : 52002,
	"notification_template_already_exist" : 52003,
	"push_template_status_update_success" : 52004, 
	"notification_deleted_successfully" : 52005,

	// Api Permission Module //
	"permisssion_module_insert_success":52006,
	"permisssion_module_insert_failed":52007,
	"permisssion_module_already_exist":52008,
	"permisssion_module_found":52009,
	"permisssion_module_not_found":52010,
	"permisssion_module_update_success":52011,
	"permisssion_module_update_failed":52012,
	"activity_status_update_success":52013,
	"activity_status_update_failed":52014,

	"email_logs_found": 112233,
	"email_logs_not_found": 112234,
	"sms_logs_found": 112235,
	"sms_logs_not_found": 112236,

		//Multi Tier Language
		"multi_tier_language_update_failed": 112237,
		"multi_tier_language_create_failed": 112238,
		"multi_tier_language_create_success": 112239,
		"multi_tier_language_found": 112240,
		"multi_tier_language_not_found": 112241,
		"multi_tier_language_update_success": 112242,
		"multi_tier_language_already_exist": 112243,





};
module.exports = status_codes;
module.exports.check_error_code = function (type, code) {
	switch (type) {
		case "DATABASE":
			switch (code) {
				case 1054:
					return {
						status_code: status_codes.database_table_column_not_exist,
						message: messages.database_table_column_not_exist
					};
					break;
				case 1146:
					return {
						status_code: status_codes.database_table_not_exist,
						message: messages.database_table_not_exist
					};
					break;
				case 1052:
					return {
						status_code: status_codes.database_column_ambiguous,
						message: messages.database_column_ambiguous
					};
					break;
				case 1064:
					return {
						status_code: status_codes.database_query_parse_error,
						message: messages.database_query_parse_error
					};
					break;
				case 1136:
					return {
						status_code: status_codes.database_query_column_count_error,
						message: messages.database_query_column_count_error
					};
					break;
				case 1062:
					return {
						status_code: status_codes.database_value_exist,
						message: messages.database_value_exist
					}
			}
			break;
		case "CUSTOM":
			return {
				status_code: status_codes[code],
				message: messages[code]
			};
			break;
		default:
			break;
	}
};