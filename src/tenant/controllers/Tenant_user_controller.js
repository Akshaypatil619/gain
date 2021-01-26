"use strict";
let Tenant_user_modal = require("../models/Tenant_user_model");
let Common_function = require("../../core/common_functions");

let common_function = new Common_function();
let tenant_user_model = new Tenant_user_modal();

module.exports = class Tenant_user_controller {
    constructor() {}

    check_login(req, res, next) {
        let username = req.body.username;
        let password = req.body.password;
        let user_agent = req.header("USER_AGENT");
        console.log("username,password : ",username,password);
        tenant_user_model.check_login(username, password, user_agent, function (result) {
            res.json(result);
        });
    }
    generate_api_token(req, res, next) {
        tenant_user_model.generate_api_token(res);
    }
    get_module_permissions(req, res, next) {
        let tenant_user_id = req['tenant_user_id'];
        tenant_user_model.get_module_permissions(tenant_user_id, function (result) {
            res.json(result);
        });
    }

    activate_or_deactivate_tenant_user(req, res, next) {
        let tenant_user_id = req['tenant_user_id'];
        let activation_tenant_user_id = req.body.activation_id;
        let status = req.body.status;
        tenant_user_model.activate_or_deactivate_tenant_user(tenant_user_id, activation_tenant_user_id, status, function (result) {
            res.json(result);
        });

    }

    add_redemption_channel(req, res, next) {
        let form_data = {};
        try {
            form_data['created_by'] = req['tenant_user_id'];
            form_data['redemption_channel_id'] = req.body.redemption_channel_id;
            form_data['burn_redemption_rate'] = common_function.other_to_base(req.body.burn_redemption_rate, req['conversion_value']);
            form_data['burn_redemption_rate']  = parseFloat(isNaN(form_data['burn_redemption_rate'])?undefined:form_data.burn_redemption_rate);
            form_data['tenant_id'] = req['tenant_id'];
        } catch (e) {
        }
        console.log()
        tenant_user_model.add_redemption_channel(form_data, function (result) {
            res.json(result);
        });

    }

    edit_redemption_channel(req, res, next) {
        let form_data = {};
        try {
            form_data['redemption_channel_id'] = req.body.redemption_channel_id;
            form_data['burn_redemption_rate'] = common_function.other_to_base(req.body.burn_redemption_rate, req['conversion_value']);
        } catch (e) {

        }
        tenant_user_model.edit_redemption_channel(req['tenant_id'], form_data, function (result) {
            res.json(result);
        });

    }
    get_redemption_channel(req, res) {
        tenant_user_model.get_redemption_channel(function (result) {
            res.json(result);
        });
    }


    get_tenant(req, res, next) {
        let tenant_id = req['tenant_id'];
        tenant_user_model.get_tenant(tenant_id, (data) => {
            res.json(data);
        })
    }

    edit_tenant(req, res, next) {
        let form_data = {};
        let tenant_id = req['tenant_id'];
        try {
            form_data['base_point_rate'] = common_function.cc_parse_float(req.body.base_point_rate,2) ;
            form_data['selling_point_rate'] = common_function.cc_parse_float(req.body.selling_point_rate,2);
            form_data['aging_mechanism'] = req.body.aging_mechanism;
            form_data['round_off_type'] = req.body.round_off_type;
            form_data['round_off_threshold'] = req.body.round_off_threshold;
            form_data['base_burn_mechanism'] = req.body.base_burn_mechanism;
            form_data['base_max_burn_points_percent'] = req.body.base_max_burn_points_percent;
            form_data['base_burn_point_rate'] = common_function.cc_parse_float(req.body.base_burn_point_rate,2);            
        } catch (e) {}
        
        tenant_user_model.edit_tenant(tenant_id, form_data, function (result) {
            res.json(result);
        });
    }

    get_rule_types(req, res) {
        tenant_user_model.get_rule_types(function (result) {
            res.json(result);
        });
    }

    add_tenant_user(req, res) {
        let formData = {
            tenant_id: req['tenant_id'],
            data: {
                name: req.body.name,
                tenant_id: req['tenant_id'],
                email: req.body.email,
                phone: req.body.phone,
                role: req.body.role,
                branch_id: req.body.branch_id,
                status: req.body.status,
                created_by: req['tenant_user_id']
            }
        };
        tenant_user_model.add_tenant_user(formData, function (result) {
            res.json(result);
        });
    }

    edit_tenant_user(req, res) {
        let formData = {
            tenant_id: req['tenant_id'],
            data: {
                tenant_user_id: req.params.id,
                name: req.body.name,
                email: req.body.email,
                phone: req.body.phone,
                role: req.body.role,
                branch_id: req.body.branch_id,
                status: req.body.status,
            }
        };

        tenant_user_model.edit_tenant_user(formData, function (result) {
            res.json(result);
        });
    }

    get_tenant_users_list(req, res) {
        let queryData = {
            tenant_id: req['tenant_id'],
            merchant_id: req.params.merchant_id,
            limit: parseInt(req.query.limit),
            offset: parseInt(req.query.offset),
            search: req.query.search,
            from_date: req.query.from_date,
            to_date: req.query.to_date
        };
        tenant_user_model.get_tenant_users_list(queryData, (result) => {
            res.json(result);
        });
    }

    get_tenant_user_by_id(req, res) {
        let queryData = {
            tenant_id: req['tenant_id'],
            tenant_user_id: req.params.id
        };
        tenant_user_model.get_tenant_user_by_id(queryData, (result) => {
            res.json(result);
        });
    }

    get_tenant_user_by_id_email(req, res)
    {
        let formData =  {
                tenant_user_id : req.body.tenant_id,
                tenant_user_email : req.body.tenant_email
            
        };
        tenant_user_model.get_tenant_user_by_id_email(formData, function (result) {
            res.json(result);
        });
    }


    update_tenant_userDetails(req, res) {
        let queryData = {
            tenant_id: req['tenant_id'],
            userID: req.body.userID,
            name: req.body.name,
            emailId: req.body.emailId,
            phoneNo: req.body.phoneNo,
            
        };

        tenant_user_model.update_tenant_userDetails(queryData, (result) => {
            res.json(result);
        });
    }

    change_password(req, res)
    {
        let old_password = req.body.oldPswd;
        let new_password = req.body.newPswd;
       // let user_agent = req.header("USER_AGENT");
        let id = req.body.userID;
        let emailId = req.body.emailId;
        tenant_user_model.change_password(old_password, new_password, id, emailId, function (result) {
            res.json(result);
        });

    }


    get_group_codes(req, res) {
        tenant_user_model.get_group_codes(function (result) {
            res.json(result);
        });
    }

    get_tenant_branch_list(req, res) {
        let query_data = {
            tenant_id: req['tenant_id'],
        }
        tenant_user_model.get_tenant_branch_list(query_data, (result) => {
            res.json(result);
        });
    }

    /***
	* Description : Fetch Dashboard Count.
    * Params : Req,res.
    * Author : Fahad.
    ***/
   get_dashboard_count(req, res, next) {
        let query_data = {};
        query_data['tenant_id'] = req['tenant_id'];
        query_data['start_date'] = req.query.start_date;
        query_data['end_date'] = req.query.end_date;
        
        tenant_user_model.get_dashboard_count(query_data, function (result) {
            res.json(result);
        });
    }
    
    /***
	* Description : Fetch Dashboard Graph.
    * Params : Req,res.
    * Author : Fahad.
    ***/
    get_dashboard_graph(req, res, next) {
        let query_data = {};
        query_data['tenant_id'] = req['tenant_id'];
        query_data['start_date'] = req.query.start_date;
        query_data['end_date'] = req.query.end_date;
        
        tenant_user_model.get_dashboard_graph(query_data, function (result) {
            res.json(result);
        });
    }

    test(req,res,next){

        global.rule_engine_instance.process_activity(req,res,{
            tenant_id:req['tenant_id'],
            customer_id : 1048,
            gender : 'female',
            age : 22,
            activity_transaction_amount : 3000,
            isInternationalTransaction : false,
        })
        res.json({'success':true});
    }

    unlock_assign_point(req, res){
        let form_data = {
            tenant_id: req['tenant_id'],
            customer_id:req.body.customer_id,
            lock_point_id: req.body.lock_point_id,
            unlock_reason: req.body.unlock_reason,
            unlock_by:req['tenant_id']
        }
        tenant_user_model.unlock_assign_point(form_data, (result) => { res.json(result); });
    }

    point_redeem_tenant(req, res){
        let query_data = {};
        query_data['tenant_id'] = req['tenant_id'];
        query_data['debit_points'] = req.body.required_point;
        query_data['customer_id'] = req.body.customer_id;
        query_data['code'] = req.body.code;
        query_data['redem_info'] = req.body.redem_info;
        query_data['alliance_data'] = req.body.alliance_data;
        console.log("data",query_data);
        tenant_user_model.point_redeem_tenant(query_data, (result)=>{ 
            res.json(result)
        });
    }


};
