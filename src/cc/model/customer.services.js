let Response_adapter = require("../../core/response_adapter");
/************** Generate Objects ****************/
let responseMessages = require("../response/customer.response");
let customerModel = new (require("../queries/customer.query"))();
const rewards = new (require('../../core/rewards/rewards'))();

module.exports = class CustomerService {

    async consumeCoupon(data) {
        const couponDetails = await customerModel.checkCouponCode(data);
        if (!couponDetails.length)
            return responseMessages.failed('coupon_code_not_found', null, 'EN');

        data.customer_unique_id = couponDetails[0].customer_unique_id;

        return this.addTransaction(data).then(async result => {
            if (result.status) {
                await customerModel.consumeCouponCode(couponDetails[0]);

                return responseMessages.success('coupon_consumed_success', null, 'EN')
            } else return result;
        });
    }

    async getCouponCode(data) {
        return customerModel.get_customer_id(data.customer_unique_id)
            .then(async custDetails => {
                if (!custDetails.length)
                    return responseMessages.failed('user_not_found', null, 'EN');

                const couponDetails = await customerModel.getCouponCode(custDetails[0], data.merchant_code);
                if (!couponDetails.length)
                    return responseMessages.failed('coupon_code_not_found', null, 'EN');

                await customerModel.assignCoupon(Object.assign(custDetails[0], couponDetails[0]));

                const responseData = {
                    coupon_code: couponDetails[0].coupon_code
                }

                return responseMessages.success('coupon_code_found', responseData, 'EN');
            })
    }

    async disputeTransaction(data) {
        return rewards.dispute_transaction(data)
            .then(result => {
                if (!result.status)
                    return responseMessages.failed('transaction_' + result.message, null, 'EN');

                else return responseMessages.success('transaction_dispute_success', null, 'EN');
            });
    }

    async getTransactions(data) {
        return rewards.get_transactions()
            .then(records => responseMessages.success('transactions_found', records, 'EN'));
    }

    async getCustomerTransactions(data) {
        return customerModel.get_customer_id(data.customer_unique_id)
            .then(async custDetails => {
                if (!custDetails.length)
                    return responseMessages.failed('user_not_found', null, 'EN');

                const transactions = await rewards.get_customer_transactions(custDetails[0]);
                if (!transactions.length)
                    return responseMessages.failed('customer_transaction_not_found', null, 'EN');

                let returnResponse = { total_records: transactions.length, transaction_list: [] };

                if (data.limit) {
                    // returnResponse.transaction_list = await rewards.get_customer_transactions(custDetails[0])
                    //     .limit(data.limit).offset(data.offset);
                    returnResponse.transaction_list = transactions.slice(data.offset, data.offset + data.limit);
                }

                return responseMessages.success('customer_transactions_found', returnResponse, 'EN');
            });
    }

    async addTransaction(data) {
        return customerModel.get_customer_id(data.customer_unique_id)
            .then(custDetails => {
                if (!custDetails.length)
                    return responseMessages.failed('user_not_found', null, 'EN');

                delete data.customer_unique_id;
                return rewards.add_transaction({
                    customer_id: custDetails[0].id, user_type: custDetails[0].user_type,
                    transaction_data: data, transaction_status: 'pending'
                }).then(result => {
                    if (result.status) return responseMessages.success('transaction_added', null, 'EN');
                    else return responseMessages.failed(result.message, result.error, 'EN');
                });
            })
    }

    async GetProfile(data) {
        return customerModel.getProfile(data)
            .then(async (result) => {
                if (!result.status) return result;

                const defaultUnit = await customerModel.getDefaultUnit(result.values);
                if (defaultUnit.length)
                    Object.assign(result.values, defaultUnit[0]);

                const totalRewards = await rewards.getRewards(result.values.customer_id, result.values.user_type);
                if (totalRewards.length)
                    Object.assign(result.values, totalRewards[0]);
                else {
                    result.values.total_rewards = 0;
                    rewards.addDefaultEntry(result.values.customer_id, result.values.user_type).then()
                };

                delete result.values.customer_id;

                return result;
            });
    }

    async getUnitList(form_data) {
        const language_code = form_data.language_code;
        const custDetails = await customerModel.getCustomerDetails(form_data);

        if (!custDetails.length)
            return responseMessages.failed('customer_not_found', language_code);

        const unitDetails = await customerModel.getUnitDetails(custDetails[0]);

        // if (!unitDetails.length)
        //     return responseMessages.failed('unit_not_found', language_code);

        const propertyDetails = await customerModel.getPropertyDetails(unitDetails, custDetails[0]);

        delete custDetails[0].customer_id;
        let returnResponse = custDetails[0];
        returnResponse.unit_details = propertyDetails;

        return responseMessages.success('unit_details_found', returnResponse, language_code);
    }

    async setDefaultUnit(form_data) {
        const language_code = form_data.language_code;
        const custDetails = await customerModel.getCustomerDetails(form_data);

        if (!custDetails.length)
            return responseMessages.failed('customer_not_found', language_code);

        if (custDetails[0].user_type != 'owner' && !(custDetails[0].user_type == 'family' && custDetails[0].referrer_user_type == 'owner'))
            return responseMessages.failed('invalid_user_type', language_code);

        const unitDetails = await customerModel.getUnitDetails(custDetails[0]);

        if (!unitDetails.length)
            return responseMessages.failed('unit_not_found', language_code);

        else if (!unitDetails.some(e => form_data.unit_id == e.id))
            return responseMessages.failed('invalid_unit', language_code);

        let updateObj = {
            unit_id: form_data.unit_id, user_type: custDetails[0].user_type,
            customer_id: custDetails[0].customer_id
        };

        await customerModel.setDefaultUnit(updateObj);

        customerModel.setLoggedInFlag(updateObj.customer_id).then();

        return responseMessages.success('default_unit_updated', null, language_code);
    }

    async customerLogin(form_data) {
        const language_code = form_data['language_code'];
        const custDetails = await customerModel.customerLogin(form_data);

        if (!custDetails.length)
            return responseMessages.failed('invalid_credential', language_code);

        if (!custDetails[0].status)
            return responseMessages.failed('customer_inactive', language_code);

        return responseMessages.success('customer_found', custDetails, language_code);
    }


    updateReferralStatus(data) {
        return customerModel.updateReferralStatus(data)
            .then(async (result) => {
                return result;
            });
    }
    async createCustomerLogs(data) {
        return customerModel.createCustomerLogs(data)
            .then(async (result) => {
                return result;
            });
    }
    async updateRegisteredStatusAndDate(data) {
        return customerModel.updateRegisteredStatusAndDate(data)
            .then(async (result) => {
                return result;
            });
    }
    async createCustomerAccountCCSummary(data) {
        return customerModel.createCustomerAccountCCSummary(data);
    }
    async updateCustomerRecord(data, input) {
        return customerModel.updateCustomerRecord(data, input);
    }




    addCustomerRecords(form_data) {
        return customerModel.addCustomerRecords(form_data)
            .then(async (result) => {
                return result;
            });
    }

    updateTenantCron() {
        return customerModel.updateTenantCron();
    }
};
