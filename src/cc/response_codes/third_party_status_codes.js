let messages = require("./third_party_messages");
let status_codes = {


    "get_tp_application_cc_token_success": 'CC001',
    "get_tp_application_cc_token_failed": 'CC002',
    "tp_application_already_exists": 'CC003',
    "tp_application_key_required": 'CC004',
    'incorrect_customer_id': 'CC005',

    "invalid_tp_application_key": 'CC0011',
    "invalid_cc_token": 'CC0012',
    "tenant_configuration_issue": 'CC0013',
    "cc_token_expire": "CC0014",


    "wallet_ledger_modify_success": 'CC011',
    "wallet_ledger_modify_failed": 'CC012',

    "insufficient_point": 'CC013',

    "point_transaction_not_found": 'CC014',
    "point_transaction_found": 'CC015',

    'points_found': 'CC016',
    'points_not_found': 'CC017',

    "get_user_point_success": 'CC4001',
    "get_user_point_failed": 'CC4002',
    "session timeout": 'CC4003',

    "user_lock_point_success": 'CC5001',
    "user_lock_point_failed": 'CC5002',
    "'insufficient_point": 'CC5003',
    "user_point_already_lock": 'CC5004',


    "user_burn_point_success": 'CC6001',
    "user_burn_point_failed": 'CC6002',
    "lock_point_already_used": 'CC6003',
    "tp_transaction_id_already_used": 'CC6004',
    "user_burn_points_less_than_lock_points": 'CC6005',


    "user_unlock_point_success": 'CC7001',
    "user_unlock_update_failed": 'CC7002',
    "user_point_already_unlock": 'CC7003',

    "user_point_revert_success": 'CC8001',
    "user_point_revert_failed": 'CC8002',

    "user_point_brought_success": 'CC9001',
    "user_point_buying_failed": 'CC9002',

    "user_point_refunded_success": 'CC10001',
    "user_point_required_transaction_id_for_refund": 'CC10002',
    "user_refund_points_less_than_transaction_points": 'CC10004',
    "user_point_refund_already": 'CC10003',
    "user_point_refund_failed": 'CC10005',

    "user_profile_fetched_success": 'CC11001',
    "user_profile_fetch_failed": 'CC11002',

    "invalidate_token_success": 'CC3001',
    "invalidate_token_failed": 'CC3002',

    "validate_token_success": 'CC2001',
    "invalidate_token": 'CC2002',

    'points_added': 21123,
    'failed_to_add_points': 21124,

    "get_customer_id_failed": "CC22001 ",
    "get_customer_id_success": "CC22002 ",

    "customer_create_failed": 'CC22003',
    "customer_create_success": 'CC22004',

    "customer_update_failed": 'CC220033',
    "customer_update_success": 'CC220044',
    "duplicate_mobile_no": "CC220045",
    "invalid_natinality_id": "DUP0012",
    "refferal_and_reffree_both_are_same": "SAM3454",

    "customer_language_failed": 'CC220034',
    "customer_language_success": 'CC220045',

    "user_point_add_success": 'CC12001',
    "user_point_adding_failed": 'CC12002',

    "ponts_credited_success": 'CC13001',
    "account_does_not_exist": 'CC13002',
    "activity_items_added_success": 'CC13003',
    "invalid_activity_id": 'CC13004',
    "activity_entry_type_required": 'CC13005',

    "already_updated_activity_id": "CC13006",
    "activity_not_found": "CC13007",
    "user_tnt_point_not_found": "CC13008",

    "otp_send_success": "CC20006",
    "otp_send_failed": "CC20007",
    "otp_verified_success": "CC20008",
    "invalid_otp": "CC20009",
    "otp_expired": "CC20010",
    "otp_resend": "CC20011",
    "max_attempt_over": "CC20012",
    "invalid_credential": "CC20013",

    "promocode_not_found": "CC20080",
    "promocode_found": "CC20081",
    "promocode_validate": "CC20082",
    "promocode_expire": "CC20083",

    "cc_customer_birthday": "cc30001",
    "customer_not_found": "cc30002",
    "invalid_customer": "INV30002",
    "customer_referral_added": "CRF30002",
    "customer_referral_not_added": "CRF30002",
    "alreday_reffered": "CRF30003",
    "send_eamil_each_five_months": "cc30003",
    "every_week_registration": "cc30004",

    "point_expiry_one_day_remaing": "cc30005",
    "point_expiry_one_week_remaing": "cc30006",
    "point_expiry_two_week_remaing": "cc30007",
    "point_not_found": "cc30008",

    "Email_template_not_found": "cc30005",
    "fcm_token_deleted": "DEL30006",
    // General setting
    "lock_point_timeout_setting": 3000,
    "cc_token_timeout_setting": 36000,

    "transaction_found": "TR1001",
    "transaction_not_found": "TR1002",
    "customer_already_exist": "TR1003",
    "country_does_not_exist": "TR1004",

    "customer_activated": "CS0011",
    "customer_inactivated": "CS0012",
    "customer_status_inactive": "CS0013",
    "customer_referral_found": "CR0011",
    "customer_referral_not_found": "CR0012",

    "token_update_success": 'CC20084',
    "token_update_failed": 'CC20085',

    "notification_deleted_successfully": "CN0011",
    "notification_not_found": "CN0012",
    "notification_found": "CN0013",

    "hot_selling_properties_not_found": "CN0012",
    "hot_selling_properties_found": "CN0013",

    "otp_cron_sucess": "CC20086",
    "otp_cron_failed": "CC20087",
    "email_already_exist": "CC20089",
    "phone_already_exist": "CC20090"

}
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
