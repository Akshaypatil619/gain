let messages = require("../../config/messages.js");
let status_codes = require("../../config/response_status_codes.js");
let Common_functions = require("../core/common_functions.js");
let common_functions = new Common_functions();

module.exports.check_api_validation = async function (req, res, next) {
    let user_Token = req.header("USER_TOKEN");
    let API_TOKEN = req.header("API_TOKEN");
  
    if (API_TOKEN != "" && API_TOKEN != null && API_TOKEN != undefined  && API_TOKEN != "undefined" ) {
     
        // console.log("user_Token : ",user_Token," API_TOKEN : ",API_TOKEN);
        // console.log("API_TOKEN != global.API_TOKEN.tenant : ",(API_TOKEN != global.API_TOKEN.tenant));
        if (API_TOKEN != global.API_TOKEN.tenant) {
            res.json({
                status: false,
                status_code: status_codes.api_invalid_token,
                message: messages.api_invalid_token
            });
        } else {
            if (req.url !== "/api/tenant/login" &&
                req.url !== "/api/tenant/register" &&
                req.url !== "/api/tenant/generate_api_token" &&
                req.url !== "/api/tenant/user/login" ){
                if (user_Token == "" || user_Token == null || user_Token == undefined) {
                    res.json({
                        status: false,
                        status_code: status_codes.user_invalid_token,
                        message: messages.user_invalid_token
                    });
                } else {
                    let token_data = await common_functions.verify_token(user_Token);
                    if (token_data.token_info == undefined) {
                        if (token_data.err.name == 'TokenExpiredError')
                            return res.json({
                                status: false,
                                status_code: status_codes.session_timeout,
                                message: messages.session_timeout
                            });
                        return res.json({
                            status: false,
                            status_code: status_codes.user_invalid_token,
                            message: messages.user_invalid_token
                        });
                    }
                    else {
                        req['tenant_id'] = token_data.token_info.tenant_id;
                        req['tenant_user_id'] = token_data.token_info.tenant_user_id;
                        req['tenant_type_id'] = token_data.token_info.tenant_type_id;
                        // let tenant_data = tenant_setting.get_tenant_setting(common_functions.decryptData(token_data.token_info.tenant_user_id, 'credosyssolutions'));
                        // req['tenant_id'] = common_functions.decryptData(token_data.token_info.tenant_user_id, 'credosyssolutions');
                        // req['tenant_user_id'] = tenant_data['tenant_user_id'];
                        // req['tenant_branch_id'] = tenant_data['tenant_branch_id'];
                        // req['conversion_value'] = tenant_data['conversion_value'];
                        // req['currency_code'] = tenant_data['currency_code'];
                        // req['country_name'] = tenant_data['country_name'];
                        // req['base_point_rate'] = tenant_data['base_point_rate'];
                        // req['burn_point_rate'] = tenant_data['burn_point_rate'];
                        // req['selling_point_rate'] = tenant_data['selling_point_rate'];
                        // req['min_point'] = tenant_data['min_point'];
                        // req['tenant_type_id'] = tenant_data['tenant_type_id'];
                        next();
                    }

                }
            } else {
                next();
            }
        }
    } else {
       
       if(req.url.includes("/api/tenant/cron")){
            next();  
        }else{
        res.json({
            status: false,
            status_code: status_codes.api_invalid_token,
            message: messages.api_invalid_token
        });
      }
    }
};