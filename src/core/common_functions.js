let status_codes = require("../../config/response_status_codes.js");
let config = require("../../config/config.js");

let bcrypt = require('bcryptjs');
let CryptoJS = require("crypto-js");
let lookup = require('binlookup')();
let knex = require("../../config/knex.js");
let jwt = require('jsonwebtoken');
module.exports = class Common_functions {
    catch_error(err) {
        console.log("Error: ",err.message);
        console.log(err);
        let result = "";
        if (err.errno)
            result = status_codes.check_error_code("DATABASE", err.errno);
        else {
            result = status_codes.check_error_code("CUSTOM", err.message);

        }
        return (Object.assign({ "status": false }, result));
    }

    //Currency Conversion code start with upto 2 decimals
    other_to_base(value, conversion_value) {
        return (parseFloat(value) / parseFloat(conversion_value)).toFixed(2);
    }

    base_to_other(value, conversion_value) {
        return (parseFloat(value) * parseFloat(conversion_value)).toFixed(2);
    }

    //Currency Conversion code End

    // Currency To Point Conversion
    currency_convert_to_point(amount, conversion_value) {
        return (amount / conversion_value);
    }

    // fixed decimals from eg. 0.1000784512 to 0.10
    cc_parse_float(value, fixed_decimal) {
        return parseFloat(value).toFixed(fixed_decimal);
    }

    //Point Convert to Currency Conversion
    point_convert_to_currency(point, conversion_value) {
        return (point * conversion_value);
    }

    // FOR CUSTOMER CARD NUMBER ENCRYPT
    ENCRYPT_WITH_AES(param) {
        let key = CryptoJS.enc.Base64.parse("#base64Key#");
        let iv = CryptoJS.enc.Base64.parse("#base64IV#");

        let encrypted = CryptoJS.AES.encrypt(param, key, { iv: iv }).toString();

        /* do not delete comment part 
        let decrypted = CryptoJS.AES.decrypt(encrypted, key, {iv: iv});
        let plain_text = decrypted.toString(CryptoJS.enc.Utf8);
        */
        return encrypted;

    }

    GET_CARD_INFORMATION(param, callback) {
        lookup(param,
            function (err, data) {
                return callback(data);
            });
    }


    get_key_values(json_data, keys, return_reuslt = []) {
        for (var json in json_data) {
            if (this.isArray(json_data[json])) {
                return_reuslt = this.get_key_values(json_data[json], keys, return_reuslt)
            } else {
                console.log(json_data[json]);
                if (typeof json_data[json] == 'object') {
                    return_reuslt = this.get_key_values(json_data[json], keys, return_reuslt)
                } else {
                    if (keys.includes(json)) {
                        return_reuslt[json] = json_data[json];
                    }
                }
            }
        }
        return return_reuslt;
    }

    isArray(what) {
        return Object.prototype.toString.call(what) === '[object Array]';
    }

    query_filter_by_tenant_or_tenant_branch(tenant_id, tenant_branch_id) {
        if (tenant_branch_id == 0 || tenant_branch_id == null) {
            return ("customers.tenant_id=" + tenant_id)
        } else {
            return ("customers.tenant_branch_id=" + tenant_branch_id)
        }
    }

    password_encrypt(password) {
        const saltRounds = 15;
        let password_hash_value;
        if (typeof password !== null || typeof password !== undefined || typeof password !== string) {
            password_hash_value = bcrypt.hashSync(password, saltRounds);
            return password_hash_value
        } else {
            return password_hash_value = '';
        }
    }


    encryptData(data, key) {
        if (data != undefined && data != null && data != "" && data != "undefined" && data != "null") {
            // data = "a" + data + "a";
            // console.log("data === ", data, " === key === ", key);
            var iv = CryptoJS.enc.Hex.parse('clubclass');
            var encrypted = CryptoJS.AES.encrypt(data, key, { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
            // console.log("==========>", encrypted.toString());
            return encrypted.toString();
        }
        else {
            return "";
        }
    }

    decryptData(data, key) {
        if (data != undefined && data != null && data != "" && data != "undefined" && data != "null") {
            // console.log("data === ", data, " === key === ", key);
            var iv = CryptoJS.enc.Hex.parse('clubclass');
            var decrypted = CryptoJS.AES.decrypt(data, key, { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
            // console.log("==========>", decrypted.toString(CryptoJS.enc.Utf8));
            return decrypted.toString(CryptoJS.enc.Utf8);
        }
        else {
            return "";
        }
    }

    fetch_redemption_rates_columns() {
        return {
            redemption_rate_exists: knex.raw(' ( CASE when redemption_rates.id IS NULL then 0 else 1 end )'),
            rule_burn_mechanism: 'redemption_rates.rule_burn_mechanism',
            rule_burn_points: 'redemption_rates.rule_burn_points',
            rule_burn_cash: 'redemption_rates.rule_burn_cash',
        }
    }

    calculateRedemptionRates(burn_data, skuData) {
        let skuObj = {
            sku_burn_points: 0,
            sku_burn_cash: 0,
            sku_burn_mechanism: burn_data.mechanism,
        };

        switch (burn_data.mechanism) {
            case 'points_cash':
                skuObj['sku_burn_cash'] = skuData['sku_rate'] - parseFloat((skuData['sku_rate'] * burn_data.max_points_percent) / 100).toFixed(2)
                skuObj['sku_burn_points'] = parseInt((skuData['sku_rate'] - skuObj['sku_burn_cash']) / burn_data.rate);
                break;
            default:
                skuObj['sku_burn_points'] = parseInt(skuData['sku_rate'] / burn_data.rate);
                break;
        }
        return skuObj;
    }

    process_redemption_mechanism(sku) {
        if (sku.redemption_rate_exists != null && sku.redemption_rate_exists == 1) {
            sku['burn_mechanism'] = sku.rule_burn_mechanism;
            sku['burn_cash'] = sku.rule_burn_cash;
            sku['burn_points'] = sku.rule_burn_points;
        }
        else {
            sku['burn_mechanism'] = sku.sku_burn_mechanism;
            sku['burn_cash'] = sku.sku_burn_cash;
            sku['burn_points'] = sku.sku_burn_points;
        }
        for (let key of ['rule_burn_mechanism', 'rule_burn_cash', 'rule_burn_points', 'sku_burn_mechanism', 'sku_burn_cash', 'sku_burn_points'])
            if (typeof sku[key] != 'undefined')
                delete sku[key];
        return sku;
    }

    cc_checksum_hash(raw_data) {
        let checksum = CryptoJS.SHA3(raw_data, { outputLength: 224 }).toString();
        return checksum;
    }

    create_token(token_data){
        let login_token;
        console.log(config.expireTime,"token_data",token_data)
        token_data['iat'] = Math.floor(Date.now() / 1000);
        return new Promise((resolve,reject) =>{
            jwt.sign(token_data, 'clubclass', { expiresIn: config.expireTime }, function(err,token) {
                if (err) console.log(err)
                login_token = token;
                resolve(login_token);
            });    
        })
    }

    create_token_for_client(token_data){
        let login_token;
        token_data['iat'] = Math.floor(Date.now() / 1000);
        return new Promise((resolve,reject) =>{
            jwt.sign(token_data, 'clubclass', { expiresIn: config.clientExpire }, function(err,token) {
                login_token = token;
                resolve(login_token);
            });    
        })
    }

    verify_token(token){
        return new Promise((resolve,reject) =>{
            jwt.verify(token, 'clubclass', function (err, token_info) {
                let token_data = {
                err:err,
                token_info:token_info
               }
                resolve(token_data);
            });    
        })
    }
};