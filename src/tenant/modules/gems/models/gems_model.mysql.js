'use strict';
let dateFormat = require('dateformat');
let knex = require('../../../../../config/knex.js');
let responseHandler = new (require("../../../../core/ResponseHandler.js"))();
let send_mail = require("../../../../../config/send_mail.js");

module.exports = class gemsModel { 
    constructor() { }

    checkProcessStatus(data) {
        return knex('flat_file_process_logs').select('id')
            .where('name', data.name)
            .where('process_status', 0);
    }

    logProcess(data) {
        return knex('flat_file_process_logs').insert(data);
    }

    getPendingThankYouCustomers(data) {
        return knex('thank_you_customers').select(data.columns)
            .leftJoin('master_school','master_school.id','thank_you_customers.school_id')
            .leftJoin('master_product','master_product.id','thank_you_customers.product_id')
            .where('update_status', 0);
    }

    getAllProcessIds() {
        return knex('thank_you_customers').select({
            id: knex.raw('GROUP_CONCAT(DISTINCT process_id)')
        }).where('update_status', 0);
    }

    updateProcessStatus(process_id) {
        return knex('thank_you_customers').update('update_status', 1)
            .where('process_id', process_id);
    }

    generateCustomerReports(_data) {
        let tyKnex = knex.thankYouPlatform;
        return tyKnex('mst_gems_login').select({
            'Customer_ID': 'login_user_id',
            'Device_Type': 'login_platform',
            'User_Type': 'login_user_type',
            'Last_Login_Date': tyKnex.raw('MAX(login_date)')
        }).where('login_user_status', 1)
        .where('login_date', '>=', tyKnex.raw(' CAST("' + dateFormat(_data.start_date, 'yyyy-mm-dd 00:00:00') + '" as datetime) '))
        .where('login_date', '<=', tyKnex.raw(' CAST("' + dateFormat(_data.end_date, 'yyyy-mm-dd 23:59:59') + '" as datetime) '))
        .groupBy('Customer_ID', 'Device_Type')
        .orderBy('Last_Login_Date')
    }

    generateFnFReports(_data) {
        return knex('customer_referral').select({
            'First_Name': 'customer_referral.first_name',
            'Last_Name': 'customer_referral.last_name',
            'Email': 'customer_referral.email',
            'Phone': 'customer_referral.phone',
            'Gender': 'customer_referral.gender',
            'Is_Active': 'customer_referral.is_active',
            'Primary_Member_Customer_ID': 'customers.gems_customer_id',
            'Primary_Member_First_Name': 'customers.first_name',
            'Primary_Member_Last_Name': 'customers.last_name',
            'Primary_Member_Email': 'customers.email',
            'Primary_Member_Phone': 'customers.phone',
            'Primary_Member_Gender': 'customers.gender',
            'Primary_Member_Type (Staff/Parent)': 'master_member_type.name'
        }).join('customers', 'customers.id', 'customer_referral.referrer_customer_id')
        .join('master_member_type', 'master_member_type.id', 'customers.member_type_id')
        .where('customer_referral.created_at', '>=', knex.raw(' CAST("' + dateFormat(_data.start_date, 'yyyy-mm-dd 00:00:00') + '" as datetime) '))
        .where('customer_referral.created_at', '<=', knex.raw(' CAST("' + dateFormat(_data.end_date, 'yyyy-mm-dd 23:59:59') + '" as datetime) '))
        .orderBy('customer_referral.created_at');
    }

    generateLoginReports(_data) {
        let tyKnex = knex.thankYouPlatform;
        let commonSelect = ' login_user_status = 1) THEN login_user_id ELSE NULL END';
        
       return tyKnex('mst_gems_login').select({
        'Date (DD/MM/YYYY)': tyKnex.raw('cast(login_date as date)'),
        'Android app Parent': tyKnex.raw(' count(distinct case when (login_platform = "android" and login_user_type = "parent" and ' + commonSelect + ' )'),
        'Android app staff': tyKnex.raw(' count(distinct case when (login_platform = "android" and login_user_type = "staff" and ' + commonSelect + ' )'),
        'F&F Android app': tyKnex.raw(' count(distinct case when (login_platform = "android" and login_user_type = "referral" and ' + commonSelect + ' )'),
        'Android app total': tyKnex.raw(' count(distinct case when (login_platform = "android" and ' + commonSelect + ' )'),
        'IOS app Parent': tyKnex.raw(' count(distinct case when (login_platform = "ios" and login_user_type = "parent" and ' + commonSelect + ' )'),
        'Ios app staff': tyKnex.raw(' count(distinct case when (login_platform = "ios" and login_user_type = "staff" and ' + commonSelect + ' )'),
        'Ios App F&F': tyKnex.raw(' count(distinct case when (login_platform = "ios" and login_user_type = "referral" and ' + commonSelect + ' )'),
        'Ios App total': tyKnex.raw(' count(distinct case when (login_platform = "ios" and ' + commonSelect + ' )'),
        'Total Logged in Customer Unique': tyKnex.raw(' count(distinct case when ( ' + commonSelect + ' )')
       }).groupByRaw('cast(login_date as date)')
       .where('login_date', '>=', knex.raw(' CAST("' + dateFormat(_data.start_date, 'yyyy-mm-dd 00:00:00') + '" as datetime) '))
       .where('login_date', '<=', knex.raw(' CAST("' + dateFormat(_data.end_date, 'yyyy-mm-dd 23:59:59') + '" as datetime) '))
    }

    sendWelcomeEmail(emailDetails) {
        knex("email_templates")
        .select("*")
        .where("template_name", 'welcome_parent')
        .orWhere("template_name", 'welcome_staff')
        .orWhere("template_name", 'welcome_new_ppid')
        .limit(3).orderBy("id", "desc")
        .then(async (template_result) => {
            if (template_result.length > 0) {
                let staffTemplate = template_result.filter(v => v.template_name == 'welcome_staff')[0];
                let parentTemplate = template_result.filter(v => v.template_name == 'welcome_parent')[0];
                let newPpidTemplate = template_result.filter(v => v.template_name == 'welcome_new_ppid')[0];
                
                for(let key in emailDetails) {
                    await new Promise(async keyResolve => {
                        for(let data of emailDetails[key]) {
                            await new Promise(resolve => {
                                setTimeout(() => {
                                    let templateBody = (key == 'staff' ? staffTemplate.body :
                                        key == 'parent' ? parentTemplate.body :
                                        newPpidTemplate.body);
                                    let subject = (key == 'staff' ? staffTemplate.subject :
                                        key == 'parent' ? parentTemplate.subject :
                                        newPpidTemplate.subject);
                                    let templateId = (key == 'staff' ? staffTemplate.id :
                                        key == 'parent' ? parentTemplate.id :
                                        newPpidTemplate.id);

                                    let body = responseHandler.find_and_replace(templateBody, data);
                                    send_mail.sending({
                                        email: data.email,
                                        email_body: body,
                                        email_subject: subject,
                                        template_id: templateId
                                    });
                                    resolve();
                                }, 1000);
                            });
                        };
                        keyResolve();
                    });
                }
            }
        });
    }

    insertDownloadLink(link){
       return knex('cc_download').insert(link);
    }

    get_cc_customers() {
        return knex('customers').select({
            gems_customer_id: knex.raw("CASE WHEN master_member_type.code='referral' THEN customers.id ELSE customers.gems_customer_id END"),
            first_name: "customers.first_name",
            last_name: "customers.last_name",
            member_type: "master_member_type.name",
            email: "customers.email",
            phone: "customers.phone",
            emirates: knex.raw("CASE WHEN master_member_type.code='referral' THEN '-' ELSE master_product.name END"),
            school_name: knex.raw("CASE WHEN master_member_type.code='referral' THEN '-' ELSE master_school.name END"),
            school_code: knex.raw("CASE WHEN master_member_type.code='referral' THEN '-' ELSE master_school.code END"),
            gems_staff_id: knex.raw("CASE WHEN master_member_type.code='referral' THEN '-' ELSE customers.gems_staff_id END"),
            gems_parent_id: knex.raw("CASE WHEN master_member_type.code='referral' THEN '-' ELSE customers.gems_parent_portal_id END"),
            is_referral: "customers.is_referral",
            logged_in: knex.raw("CASE WHEN master_member_type.code='referral' THEN 'Y' ELSE '-' END"),
            status: knex.raw("case when customers.status = 1 then 'Active' else 'Inactive' end"),
            created_at: knex.raw("DATE_FORMAT(customers.created_at,'%b %d,%Y, %h:%i:%S %p')")
        }).leftJoin('master_product', 'master_product.id', '=', 'customers.product_id')
        .leftJoin('master_school', 'master_school.id', '=', 'customers.school_id') 
        .leftJoin('countries', 'customers.country_id', '=', 'countries.id') 
        .leftJoin("master_member_type", "master_member_type.id", "=", "customers.member_type_id");
        // .where('customers.status',1)
    }

    get_inactive_referrals() {
        return knex('customer_referral').select({
            gems_customer_id: knex.raw("'-'"),
            first_name: 'customer_referral.first_name',
            last_name: 'customer_referral.last_name',
            member_type: 'master_member_type.name',
            email: 'customer_referral.email',
            phone: 'customer_referral.phone',
            emirates: knex.raw("'-'"),
            school_name: knex.raw("'-'"),
            school_code: knex.raw("'-'"),
            gems_staff_id: knex.raw("'-'"),
            gems_parent_id: knex.raw("'-'"),
            is_referral: 1,
            logged_in: knex.raw("'N'"),
            status: knex.raw("case when customer_referral.status = 1 then 'Active' else 'Inactive' end"),
            created_at: knex.raw("DATE_FORMAT(customer_referral.created_at,'%b %d,%Y, %h:%i:%S %p')")
        }).leftJoin('master_member_type', 'master_member_type.code', knex.raw("'referral'"))
        .whereRaw('customer_referral.customer_id is null');
        // .where('customer_referral.status',1);
    }

    get_ty_customer_logins() {
        let tyKnex = knex.thankYouPlatform;
        return tyKnex('mst_gems_login').select({
            gems_customer_id: tyKnex.raw('distinct login_user_id')
        }).where('login_user_status', 1)
        .where('login_user_type', '!=', 'referral');
    }
}