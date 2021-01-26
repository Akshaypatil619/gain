/************** Load Files****************/
let messages = require("../../../config/messages.js");
let status_codes = require("../../../config/response_status_codes.js");
let responseMessages = require("../response/owner_login.response");
let knex = require("../../../config/knex.js");
let Queries = require("../queries/mysql/owner_login");
let Common_functions = require("../../core/common_functions.js");
let config = require("../../../config/config");
let encription_key = config.encription_key;
let otpGenerator = require('otp-generator');
/************** Generate Objects ****************/
let queries = new Queries();
let common_functions = new Common_functions();


module.exports = class Owner_login_model {
    async check_login(form_data, callback) {
        if(form_data['password'] !=null){
            let result = await queries.check_login("check_login", form_data).catch((err)=>{console.log("Errrrrrrr : ",err)});
            if(result.length>0){
               let passwordVerifivcation = await queries.check_login("check_credentials",form_data)
                if(passwordVerifivcation.length>0){
                        if (passwordVerifivcation.length === 0) {
                            return callback({status: false,code: status_codes.login_failed,message: messages.login_failed});
                        } else {
                            result[0]['token'] = await common_functions.create_token({ email: form_data['email'],owner_id :result[0]['owner_id'], phone: form_data['phone']});
                            return callback({status: true,code: status_codes.login_success,message: messages.login_success,values: result});
                        }
                    } else {
                        return callback({status: false,code: status_codes.inavalid_credentials,message: messages.inavalid_credentials});
                    }
            } else {
                return callback({status: false,code: status_codes.inavalid_credentials,message: messages.inavalid_credentials});
            }
        } else {
            console.log("in else");
            let result = await queries.check_login("check_login",form_data)
            console.log("result=",result);
            if(result.length>0){
                if(result[0].is_verified==1){
                    return callback({status: true,code: status_codes.user_verified,message: messages.user_verified, values: result});

                } else {
                    return callback({status: false,code: status_codes.user_not_verified,message: messages.user_not_verified,values: result});
                }
            } else {
                return callback({status: false,code: status_codes.inavalid_user,message: messages.inavalid_user});
            }
        }
    }
   
    async generateOTP(data, update = false) {
		const otp = otpGenerator.generate(4, { upperCase: false, specialChars: false, alphabets: false });
		data['otp'] = otp;

		if (!update)
			return knex('customer_send_otp').insert(data);
		else return knex('customer_send_otp').update({
			otp, counter: knex.raw('counter + 1')
		}).where('id', data.cso_id);
	}
   
	async verifyOwnerOTP(data) {
		const columns = {
			customer_id: 'customers.id',
			first_name: knex.raw(`cast(aes_decrypt(customers.first_name, '${encription_key}') as char(255))`),
			last_name: knex.raw(`cast(aes_decrypt(customers.last_name, '${encription_key}') as char(255))`),
			email: knex.raw(`cast(aes_decrypt(customers.email, '${encription_key}') as char(255))`),
			phone: knex.raw(`cast(aes_decrypt(customers.phone, '${encription_key}') as char(255))`),
			is_otp_valid: knex.raw(`timestampdiff(second, cso.created_at, now()) <= 900`),
			gender: 'gender',
			dob: 'dob',
            otp: 'cso.otp',
            cso_id: 'cso.id',
            user_name: knex.raw("CONCAT(CAST(AES_DECRYPT(customers.first_name,'" + encription_key + "') AS CHAR(255)),' ',CAST(AES_DECRYPT(customers.last_name,'" + encription_key + "') AS CHAR(255)))"),
            user_type: "master_user_type.name"
		};

        let otpDetails = await knex('customers').select(columns)
            .join("master_user_type", "master_user_type.id", "=", "customers.user_type_id")
            .where("master_user_type.name","Owner")
            .andWhereRaw(`cast(aes_decrypt(customers.email, '${encription_key}') as char(255)) = '${data.email}'`)
			.join('customer_send_otp as cso', 'cso.customer_id', 'customers.id')
            .orderBy('cso.created_at', 'desc')
            .limit(1);
            if (!otpDetails.length){
                return responseMessages.failed('invalid_user');
            } else if(otpDetails[0]['is_otp_valid']==0){
                return responseMessages.failed('otp_expired');
            } else {
                result = otpDetails[0];
                if (result.otp != data.otp){
                    return responseMessages.failed('invalid_otp');
                } else {
                    await knex("customer_send_otp").increment('counter', 1).where("customer_send_otp.id",result['cso_id'])
                    return responseMessages.success('otp_verified_success', result);
                }
            }
    }
    async resendOtp(data) {
        const columns = {
            first_name: knex.raw(`cast(aes_decrypt(customers.first_name, '${encription_key}') as char(255))`),
            last_name: knex.raw(`cast(aes_decrypt(customers.last_name, '${encription_key}') as char(255))`),
            email: knex.raw(`cast(aes_decrypt(customers.email, '${encription_key}') as char(255))`),
            phone: knex.raw(`cast(aes_decrypt(customers.phone, '${encription_key}') as char(255))`),
            is_otp_valid: knex.raw(`timestampdiff(second, cso.created_at, now()) <= 900`),
            otp: 'cso.otp',
            counter: 'cso.counter',
            cso_id: 'cso.id',
            customer_id: 'customers.id',
            user_name: knex.raw("CONCAT(CAST(AES_DECRYPT(customers.first_name,'" + encription_key + "') AS CHAR(255)),' ',CAST(AES_DECRYPT(customers.last_name,'" + encription_key + "') AS CHAR(255)))"),
            user_type: "master_user_type.name"
        };
        let otpDetails = await knex('customers').select(columns)
            .join("master_user_type", "master_user_type.id", "=", "customers.user_type_id")
            .where("master_user_type.name","Owner")
            .andWhereRaw(`cast(aes_decrypt(customers.email, '${encription_key}') as char(255)) = '${data.email}'`)
            .join('customer_send_otp as cso', 'cso.customer_id', 'customers.id')
            .orderBy('cso.created_at', 'desc')
            .limit(1);


            if (!otpDetails.length){
                return responseMessages.failed('invalid_user');
            } else if(otpDetails[0]['is_otp_valid']==0){
                return responseMessages.failed('otp_expired');
            } else {
                result = otpDetails[0];
                if (result.counter >= 4){
                    return responseMessages.failed('max_attempt_over');
                } else {
                   await knex("customer_send_otp").increment('counter', 1).where("customer_send_otp.id",result['cso_id']);
                   return responseMessages.success('otp_resend', result);
                }
            }
    }
    async savePassword(data) {
        const columns = {
                first_name: knex.raw(`cast(aes_decrypt(customers.first_name, '${encription_key}') as char(255))`),
                last_name: knex.raw(`cast(aes_decrypt(customers.last_name, '${encription_key}') as char(255))`),
                email: knex.raw(`cast(aes_decrypt(customers.email, '${encription_key}') as char(255))`),
                phone: knex.raw(`cast(aes_decrypt(customers.phone, '${encription_key}') as char(255))`),
                id: 'customers.id',
                user_name: knex.raw("CONCAT(CAST(AES_DECRYPT(customers.first_name,'" + encription_key + "') AS CHAR(255)),' ',CAST(AES_DECRYPT(customers.last_name,'" + encription_key + "') AS CHAR(255)))"),
                user_type: "master_user_type.name"
            };
           return knex('customers').select(columns)
            .join("master_user_type", "master_user_type.id", "=", "customers.user_type_id")
            .where("master_user_type.name","Owner")
			.whereRaw(`cast(aes_decrypt(customers.email, '${encription_key}') as char(255)) = '${data.email}'`)
			.then((result)=>{
                if(result.length>0){
                    let password = knex.raw("AES_ENCRYPT('" + data['password'] + "', '" + encription_key + "')");
                    return knex("customers").update({password: password, is_verified: 1,is_logged_in: 1}).where("customers.id",result[0].id)
                        .then((password)=>{
                            delete result[0]['id'];
                            result[0]['password'] = data['password'];
                            return responseMessages.success('password_saved',result);    
                        })
                } else {
                    return responseMessages.failed('invalid_user');        
                }
            })
     }

     async resetPassword(data) {
        const columns = {
                first_name: knex.raw(`cast(aes_decrypt(customers.first_name, '${encription_key}') as char(255))`),
                last_name: knex.raw(`cast(aes_decrypt(customers.last_name, '${encription_key}') as char(255))`),
                email: knex.raw(`cast(aes_decrypt(customers.email, '${encription_key}') as char(255))`),
                phone: knex.raw(`cast(aes_decrypt(customers.phone, '${encription_key}') as char(255))`),
                id: 'customers.id',
                user_name: knex.raw("CONCAT(CAST(AES_DECRYPT(customers.first_name,'" + encription_key + "') AS CHAR(255)),' ',CAST(AES_DECRYPT(customers.last_name,'" + encription_key + "') AS CHAR(255)))"),
                user_type: "master_user_type.name"
            };
           return knex('customers').select(columns)
            .join("master_user_type", "master_user_type.id", "=", "customers.user_type_id")
            .where("master_user_type.name","Owner")
			.whereRaw(`cast(aes_decrypt(customers.email, '${encription_key}') as char(255)) = '${data.email}'`)
			.then((result)=>{
                if(result.length>0){
                    let password = knex.raw("AES_ENCRYPT('" + data['password'] + "', '" + encription_key + "')");
                    return knex("customers").update({password: password}).where("customers.id",result[0].id)
                        .then((password)=>{
                            delete result[0]['id'];
                            result[0]['password'] = data['password'];
                            return responseMessages.success('password_reset',result);    
                        })
                } else {
                    return responseMessages.failed('invalid_user');        
                }
            })
     }

     async generateOTPForgotPassword(data) {
        let result = await queries.check_login("check_login", data).catch((err)=>{console.log("Errrrrrrr : ",err)});
        if(result.length>0){
                const otp_data = {
                    customer_id: result[0].owner_id,
                    mobile_number: result[0].phone,
                    email: result[0].email,
                    tenant_id: result[0].tenant_id,
                    type: 'login',
                    otp: otpGenerator.generate(4, { upperCase: false, specialChars: false, alphabets: false })
                };
                let otpResult = await knex("customer_send_otp").insert(otp_data);
                if(otpResult.length>0){
                    otp_data['user_name'] = result[0].first_name+" "+result[0].last_name;
                    otp_data['user_type'] = result[0].user_type;
                   return responseMessages.success('otp_sent', otp_data, data['language_code']);
                } else {
                   return responseMessages.failed('otp_failed', data['language_code']);
                }
            } else {
                return callback({status: false,code: status_codes.inavalid_user,message: messages.inavalid_user});          
        }    
    }
    
    
     async  getUnitInfo(cust_id){

       // let id= await knex('master_unit').select({tenant_customer_id:"tenant_customer_id"}).where("customer_id",cust_id);
       // let tenant_id=JSON.parse(JSON.stringify(id)); 
         let Coulumn_name=""; 
         let findId; 
        // if(tenant_id.length>0){
        //     Coulumn_name="master_unit.tenant_customer_id";
        //     findId=tenant_id[0].tenant_customer_id;
        // }else{
            Coulumn_name="master_unit.customer_id";
            findId=cust_id;
       // }     
        let Columns ={
                     
                        unit_title:"master_unit.unit_no",
                        unit_type: "master_unit.unit_type",
                        building_name:"master_building.name",
                        area:"master_property.area",
                        emirates:"master_emirate.name",
                        address:"master_property.address_line_1" ,
                        first_name: knex.raw(`cast(aes_decrypt(customers.first_name, '${encription_key}') as char(255))`),
                        last_name: knex.raw(`cast(aes_decrypt(customers.last_name, '${encription_key}') as char(255))`),
                        email: knex.raw(`cast(aes_decrypt(customers.email, '${encription_key}') as char(255))`),
                        phone: knex.raw(`cast(aes_decrypt(customers.phone, '${encription_key}') as char(255))`),
                    }
                    
                    
                  let data= await  knex('master_property')
                    .select(Columns)
                    .join ('master_building','master_property.id','master_building.property_id')
                    .join ('master_unit',  'master_building.id','master_unit.building_id')
                    .join ('master_emirate', 'master_property.emirate_id','master_emirate.id')
                    .join ('customers',Coulumn_name,'customers.id')
                    .where(Coulumn_name,findId)
                
                  
                
        return JSON.parse(JSON.stringify(data));
    }
    getEmailDate(){
        return new Date((new Date().getTime() + (new Date().getTimezoneOffset() * 60000)) + (3600000*4)).toLocaleString();
	}
	formatEmailDate(date){
		let today = new Date(date);
		return (((today.getDate()>9) ? today.getDate() : "0"+today.getDate())+"-"+((today.getMonth()>9) ? (today.getMonth()+1) : "0"+(today.getMonth()+1))+"-"+today.getFullYear()).toString();
	}
};