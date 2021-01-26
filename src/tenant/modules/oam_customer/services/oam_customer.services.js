let knex = require("../../../../../config/knex.js");
let config = require("../../../../../config/config");
let encription_key = config.encription_key;
/************** Generate Objects ****************/
let responseMessages = require("../response/oam_customer.response");
let oamCustomerModel = new (require("../models/oam_customer_model." + config.db_driver))();

module.exports = class OamCustomerService {
    /**
     * Add Member Type
     *
     * @param _data
     * @returns {*}
     * Author abhishek ghosh
     */
    async add_oam_customer(_data) {
        let data = {};
        let oamCustomerData = _data;
        Object.assign(data, oamCustomerData);
        console.log('FORMDATA',_data)
        // data['first_name'] = knex.raw("AES_ENCRYPT('" + data['first_name'] + "', 'rainbowfinance')");
        // data['last_name'] = knex.raw("AES_ENCRYPT('" + data['last_name'] + "', 'rainbowfinance')");
        // data['email'] = knex.raw("AES_ENCRYPT('" + data['email'] + "', 'rainbowfinance')");
        // data['phone'] = knex.raw("AES_ENCRYPT('" + data['phone'] + "', 'rainbowfinance')");
        // console.log('TESTDATA',data);
        
        return oamCustomerModel.getOamCustomer(_data.oam_customer)
            .then((oamCustomerDataObj) => {
                if (oamCustomerDataObj.length > 0) {
                    throw new Error("oam_customer_already_exist")
                } else {
                    return oamCustomerModel.insertoamCustomer(_data.oam_customer);
                }
            })
            .then(async (id) => {
                if (id) {
                    return responseMessages.success("oam_customer_created_successfully");
                }
                else {
                    throw new Error("oam_customer_created_fail");
                }
            })
            .catch(function (err) {
                // return failed response to controller
                let error = (typeof err.errors != 'undefined') ? err.errors : err.message;
                return responseMessages.failed(responseMessages.hasOwnProperty(err.message) ? err.message : "rule_activity_created_fail", error)
            });
    }

    /**
     * Get Oam Customer type with filter
     * 
     * @param {*} data 
     */
    async get_oam_customer() {
        let return_result = {};
        // get oam customer list
        let columns = {
			customer_id: "customers.id",
			first_name: knex.raw("CAST(AES_DECRYPT(customers.first_name,'" + encription_key + "') AS CHAR(255))"),
			last_name: knex.raw("CAST(AES_DECRYPT(customers.last_name,'" + encription_key + "') AS CHAR(255))"),
			email: knex.raw("CAST(AES_DECRYPT(customers.email,'" + encription_key + "') AS CHAR(255))"),
			phone:"customers.phone",
			address_line1:"customers.address_line1",
			address_line2:"customers.address_line2",
			manager:"customers.manager",
			oam_commission:"customers.oam_commission",
			owner_commission:"customers.owner_commission",
			gain_commission:"customers.gain_commission",
			status:"customers.status",
			is_email_verified:"customers.is_email_verified",
			is_phone_verified:"customers.is_phone_verified",
			dob: "customers.dob",
			gender: "customers.gender",
			created_at: knex.raw("DATE_FORMAT(customers.created_at,'%b %d,%Y, %h:%i:%S %p')"),
			phone: knex.raw("CAST(AES_DECRYPT(customers.phone,'" + encription_key + "') AS CHAR(255))"),
			// nationality_id: "customers.nationality_id",
			// city: "master_city.city_name",
			customer_unique_id: knex.raw("CAST(AES_DECRYPT(customers.customer_unique_id,'" + encription_key + "') AS CHAR(255))")
		};
        return oamCustomerModel.get_oam_customer_list(columns)
            .then(async (result) => {
                if (result.length > 0) {
                    return_result.oam_customer_list = result;
                    // return result;
                    return oamCustomerModel.get_total_oam_customer_count()
                        .then(async (countData) => {
                            console.log(countData[0]);
                            return_result.total_Records = countData[0].total_record;
                            console.log('test',return_result);
                            return responseMessages.success("oam_customer_found", return_result);
                        })

                } else {
                    throw new Error("oam_customer_not_found");
                }
            })
            .catch(function (err) {
                let error = (typeof err.errors != 'undefined') ? err.errors : err.message;
                return responseMessages.failed(responseMessages.hasOwnProperty(err.message) ? err.message : "oam_customer_update_fail", error)
            });
    }


    /**
    *  Edit Member Type
    *
    * @param _data
    * @returns {*}
    */
    edit_oam_customer(form_data) {
            console.log(form_data);
            let data = {};
            let oamCustomerData = form_data.oam_customer;
            Object.assign(data, oamCustomerData);
            delete data.id;
            delete data.created_at;
            console.log('DATA TO UPDTAE' , data);
            return oamCustomerModel.getOamCustomerData( {
                select: { id: 'customers.id' },
                where: { id: oamCustomerData['id'] }
                })
            .then((oam_customer_result) => {
                if (oam_customer_result.length > 0) {
                    console.log('oam_customer_result',oam_customer_result)
                    return oamCustomerModel.updateOamCustomer({
                        update: data,
                        where: { id: oamCustomerData['id'] }
                    });
                } else {
                    throw new Error("oam_customer_already_exist");
 
                }
            })
            .then(async (member_type_id) => {
                return responseMessages.success("oam_customer_updated_successfully");

            })
            .catch(function (err) {
                let error = (typeof err.errors != 'undefined') ? err.errors : err.message;
                return responseMessages.failed(responseMessages.hasOwnProperty(err.message) ? err.message : "member_type_update_fail", error)
            });
    }

    //Get Member Type By ID
    get_oam_customer_type_by_id(form_data) {
        let data = {};
        let oamCustomerData = form_data.oam_customer.id;

        Object.assign(data, oamCustomerData);
        
        return oamCustomerModel.get_oam_customer_by_id({
            where: { id: form_data['oam_customer']['id'] }
        })
            .then((oam_customer_result) => {
                console.log('FNFDATA',oam_customer_result);
                if (oam_customer_result.length >= 1) {
                    return responseMessages.success("oam_customer_found", oam_customer_result);
                } else {
                    throw new Error("oam_customer_found")
                }
            })
            .catch(function (err) {
                // return failed response to controller
                let error = (typeof err.errors != 'undefined') ? err.errors : err.message;
                return responseMessages.failed(responseMessages.hasOwnProperty(err.message) ? err.message : "oam_customer_fetch_error", error)
            });

    }


    /**
     *  Member Type Status
     *
     * @param _data
     * @returns {*}
     */
    
};
