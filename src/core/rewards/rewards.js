const knex = require('../../../config/knex');
const uuid = require('uuid');

module.exports = class Rewards {

    constructor() { }

    async settle_owner_rewards() {
        const transDetails = await knex('reward_history').select('id', 'customer_id', 'reward',
            'unit_id', 'building_id', 'property_id')
            .where({ user_type: 'owner', status: 1, is_settled: 0 });

        for (let data of transDetails) {
            await knex('user_rewards').update({ settled_rewards: knex.raw(`settled_rewards + ${data.reward}`) })
                .where('customer_id', data.customer_id);

            await knex('unit_owner_rewards').update({ settled_rewards: knex.raw(`settled_rewards + ${data.reward}`) })
                .where({ unit_id: data.unit_id, building_id: data.building_id, property_id: data.property_id, is_settled: 0, status: 1 });

            await knex('unit_owner_rewards').update({ is_settled: 1 }).where({ unit_id: data.unit_id, building_id: data.building_id, 
                property_id: data.property_id, is_settled: 0, status: 1, settled_rewards: knex.raw(`total_rewards`) });

            const oamCustDetails = await knex('master_property').select('customers.id as customer_id')
                .join('customers', 'customers.id', 'master_property.oam_id')
                .where('master_property.id', data.property_id);

            if (oamCustDetails.length)
                await knex('user_rewards').update({ owners_settled_rewards: knex.raw(`owners_settled_rewards + ${data.reward}`) })
                    .where({ customer_id: oamCustDetails[0].customer_id, user_type: 'oam', status: 1 });

            await knex('reward_history').update({ is_settled: 1 }).where('id', data.id);
        }
    }

    async distribute_rewards() {
        let gainCustomerId = await knex('customers').select('customers.id as id')
            .join('master_user_type', 'master_user_type.id', 'customers.user_type_id')
            .whereRaw("master_user_type.code = 'gain'")
            .limit(1);
        if (!gainCustomerId.length) return;
        else gainCustomerId = gainCustomerId[0].id;

        const transDetails = await knex('transaction_history').select('*')
            .whereRaw("transaction_status = 'pending'")
            .whereRaw('coupon_code is null')
        // .whereRaw('created_at + interval 2 day < now()');

        for (let data of transDetails) {
            const passOnCommission = (data.merchant_discount / 100) * data.amount;

            if (passOnCommission && passOnCommission > 0) {

                const ownerCommission = (data.owner_commission / 100) * passOnCommission;
                const oamCommission = (data.oam_commission / 100) * passOnCommission;
                const gainCommission = (data.gain_commission / 100) * passOnCommission;

                let transData = {
                    transaction_history_id: data.id,
                    cc_transaction_id: data.cc_transaction_id,
                    ty_transaction_id: data.ty_transaction_id,
                    unit_id: data.unit_id,
                    building_id: data.building_id,
                    property_id: data.property_id
                }

                if (data.user_type == 'owner') {

                    transData.reward = ownerCommission;
                    await this.award_user(data.customer_id, 'owner', transData);

                    transData.reward = oamCommission;
                    await this.award_user(data.oam_id, 'oam', transData);

                    transData.reward = gainCommission;
                    await this.award_user(gainCustomerId, 'gain', transData);

                    transData.reward = ownerCommission;
                    await this.update_unit_owner_rewards(transData);

                } else if (data.user_type == 'tenant') {

                    transData.reward = oamCommission;
                    await this.award_user(data.oam_id, 'oam', transData);

                    transData.reward = gainCommission;
                    await this.award_user(gainCustomerId, 'gain', transData);

                } else if (data.user_type == 'family') {

                    if (data.referrer_type == 'owner') {

                        transData.reward = ownerCommission;
                        await this.award_user(data.referrer_id, 'owner', transData);

                        transData.reward = oamCommission;
                        await this.award_user(data.oam_id, 'oam', transData);

                        transData.reward = gainCommission;
                        await this.award_user(gainCustomerId, 'gain', transData);

                        transData.reward = ownerCommission;
                        await this.update_unit_owner_rewards(transData);

                    } else if (data.referrer_type == 'tenant') {

                        transData.reward = oamCommission;
                        await this.award_user(data.oam_id, 'oam', transData);

                        transData.reward = gainCommission;
                        await this.award_user(gainCustomerId, 'gain', transData);

                    }

                }

                await knex('transaction_history').update({ transaction_status: 'success' }).where('id', data.id);
            }
        }
    }

    async award_user(customer_id, user_type, data) {
        const userRewards = await knex('user_rewards').select('total_rewards', 'settled_rewards', 'id')
            .where('customer_id', customer_id).where('user_type', user_type);
        if (!userRewards.length) await this.addDefaultEntry(customer_id, user_type);

        let running_total_rewards = 0, running_settled_rewards = 0;

        if (userRewards.length > 0) {
            running_total_rewards = userRewards[0].total_rewards;
            running_settled_rewards = userRewards[0].settled_rewards;
        }

        // keeping the running_total_rewards as the sum of current transaction and total transactions till date
        running_total_rewards += data.reward;

        const rewardHistoryData = Object.assign(data, {
            customer_id, user_type, running_total_rewards, running_settled_rewards, is_settled: user_type == 'tenant' ? 1 : 0
        });
        await knex('reward_history').insert(rewardHistoryData);

        let userRewardsData = { total_rewards: knex.raw(`total_rewards + ${data.reward}`) };
        if (user_type == 'tenant') userRewardsData.settled_rewards = knex.raw(`settled_rewards + ${data.reward}`);

        await knex('user_rewards').update(userRewardsData)
            .where('customer_id', customer_id).where('user_type', user_type);

    }

    async update_unit_owner_rewards(data) {
        const unit_owner_rewards = await knex('unit_owner_rewards').select('id').where({
            unit_id: data.unit_id, building_id: data.building_id, property_id: data.property_id, is_settled: 0
        });

        if (!unit_owner_rewards.length)
            await knex('unit_owner_rewards').insert({
                unit_id: data.unit_id, building_id: data.building_id,
                property_id: data.property_id, total_rewards: data.reward
            });
        else await knex('unit_owner_rewards').update({ total_rewards: knex.raw(`total_rewards + ${data.reward}`) })
            .where('id', unit_owner_rewards[0].id);
    }

    async dispute_transaction(data) {
        const transactionDetails = await knex('transaction_history').select('id', 'transaction_status', 'created_at',
            knex.raw('(created_at + interval 2 day >= now()) as dispute_allowed'))
            .where('id', data.transaction_id).where('status', 1);

        if (!transactionDetails.length) return { status: false, message: 'not_found' };
        else if (transactionDetails[0].transaction_status != 'pending') return { status: false, message: 'not_pending' }
        else if (!transactionDetails[0].dispute_allowed) return { status: false, message: 'time_exceeded' }

        await knex('transaction_history').update('transaction_status', 'rejected').where('id', data.transaction_id);

        return { status: true };
    }

    async get_transactions() {
        const columns = {
            transaction_id: 'id',
            transaction_status: 'transaction_status',
            cc_transaction_id: 'cc_transaction_id',
            ty_transaction_id: 'ty_transaction_id',
            merchant_code: 'merchant_code',
            merchant_name: 'merchant_name',
            offer_title: 'offer_title',
            brand_name: 'brand_name',
            created_at: 'created_at'
        };

        return knex('transaction_history').select(columns).where('status', 1);
    }

    async get_customer_transactions(data) {
        let referrer_user_type = null;
        let family_customer_id = null;
        let customer_id = data.id;

        if (data.user_type == 'family') {
            family_customer_id = customer_id;

            const referrer_details = await knex('customers').select({
                referrer_id: 'customers.referrer_id',
                referrer_user_type: 'master_user_type.code'
            }).join('customers as rc', 'rc.id', 'customers.referrer_id')
                .join('master_user_type', 'master_user_type.id', 'rc.user_type_id')
                .where('customers.id', customer_id);

            if (!referrer_details.length || !referrer_details[0].referrer_id) return [];

            customer_id = referrer_details[0].referrer_id;
            referrer_user_type = referrer_details[0].referrer_user_type;
        }

        const columns = {
            transaction_status: 'th.transaction_status',
            ty_transaction_id: 'th.ty_transaction_id',
            cc_transaction_id: 'th.cc_transaction_id',
            amount: 'th.amount',
            merchant_discount: 'th.merchant_discount',
            coupon_code: 'th.coupon_code',
            merchant_code: 'th.merchant_code',
            merchant_name: 'th.merchant_name',
            offer_title: 'th.offer_title',
            brand_name: 'th.brand_name',
            offer_image: 'th.offer_image',
            outlet_code: 'th.outlet_code',
            brand_code: 'th.brand_code',
            offer_expiry: 'th.offer_expiry',
            category_name: 'th.category_name',
            bill_amount: 'th.bill_amount',
            save_amount: 'th.save_amount',
            offer_type: 'th.offer_type',
            enquiry_code: 'th.enquiry_code',
            reward: 'rh.reward',
            created_at: 'th.created_at',
            is_settled: 'rh.is_settled'
        };

        let query = knex('transaction_history as th').select(columns)
            .leftJoin('reward_history as rh', function () {
                this.on('rh.transaction_history_id', 'th.id')
                    .on('rh.customer_id', customer_id)
                    .on('rh.status', 1);
            }).where({ 'th.status': 1 });

        if (data.user_type == 'family')
            query.where('th.customer_id', family_customer_id);
        else query.where('th.customer_id', customer_id);

        return query.orderBy("th.created_at", "desc");
    }

    async add_transaction({ customer_id, user_type, transaction_data, transaction_status } = {}) {
        let property_details = await this.get_property_details({ customer_id, user_type });
        if (!property_details.length) return { status: false, message: 'property_details_not_found' };

        const cc_transaction_id = uuid.v1(), { unit_id, building_id, property_id, gain_commission, oam_commission,
            owner_commission, tenant_discount, referrer_id, referrer_type, owner_id, oam_id } = property_details[0];

        Object.assign(transaction_data, {
            customer_id, user_type, transaction_status, cc_transaction_id,
            unit_id, building_id, property_id, gain_commission, oam_commission,
            owner_commission, tenant_discount, referrer_id, referrer_type, owner_id, oam_id
        });

        return knex('transaction_history').insert(transaction_data).returning('id')
            .then(async transHistoryId => {
                const passOnCommission = (transaction_data.merchant_discount / 100) * transaction_data.amount;

                if (passOnCommission && passOnCommission > 0) {
                    const tenantDiscount = (transaction_data.tenant_discount / 100) * passOnCommission;

                    let transData = {
                        transaction_history_id: transHistoryId[0],
                        ty_transaction_id: transaction_data.ty_transaction_id,
                        cc_transaction_id, unit_id, building_id, property_id
                    }

                    if (user_type == 'tenant') {
                        transData.reward = tenantDiscount;
                        await this.award_user(customer_id, 'tenant', transData);
                    } else if (user_type == 'family' && referrer_type == 'tenant') {
                        transData.reward = tenantDiscount;
                        await this.award_user(referrer_id, 'tenant', transData);
                    }
                }


                return { status: true };
            }).catch(err => {
                return { status: false, message: 'db_error', error: err };
            });
    }

    async get_property_details({ customer_id, user_type } = {}) {
        let referrer_user_type = null;
        let family_customer_id = null;

        if (user_type == 'family') {
            family_customer_id = customer_id;

            const referrer_details = await knex('customers').select({
                referrer_id: 'customers.referrer_id',
                referrer_user_type: 'master_user_type.code'
            }).join('customers as rc', 'rc.id', 'customers.referrer_id')
                .join('master_user_type', 'master_user_type.id', 'rc.user_type_id')
                .where('customers.id', customer_id);

            if (!referrer_details.length || !referrer_details[0].referrer_id) return [];

            customer_id = referrer_details[0].referrer_id;
            referrer_user_type = referrer_details[0].referrer_user_type;
        }

        let obj = knex('master_unit').select({
            unit_id: 'master_unit.id',
            building_id: 'master_unit.building_id',
            property_id: 'master_building.property_id',
            gain_commission: 'oam.gain_commission',
            oam_commission: 'oam.oam_commission',
            owner_commission: 'oam.owner_commission',
            tenant_discount: 'oam.tenant_discount',
            owner_id: 'master_unit.customer_id',
            oam_id: 'oam.id',
            referrer_id: knex.raw(user_type == 'family' ? `'${customer_id}'` : 'null')
        }).join('master_building', 'master_building.id', 'master_unit.building_id')
            .join('master_property', 'master_property.id', 'master_building.property_id')
            .join('customers as oam', 'oam.id', 'master_property.oam_id')
            .where('master_unit.status', 1)
            .limit(1);

        if (user_type == 'tenant') {
            obj.where('master_unit.tenant_customer_id', customer_id);
        } else if (user_type == 'owner') {
            obj.where('master_unit.is_default', 1);
            obj.where('master_unit.customer_id', customer_id)
        } else if (user_type == 'family') {
            obj.select({ referrer_type: knex.raw(`'${referrer_user_type}'`) });

            if (referrer_user_type == 'owner') {
                obj.join('family_has_unit', function () {
                    this.on('family_has_unit.unit_id', 'master_unit.id')
                    this.on('family_has_unit.customer_id', family_customer_id)
                    this.on('family_has_unit.status', 1)
                }).where('master_unit.customer_id', customer_id);
            } else {
                obj.where('master_unit.tenant_customer_id', customer_id);
            }

        } else return [];

        return obj;
    }

    getRewards(customer_id, user_type) {
        return knex('user_rewards').select({ total_rewards: knex.raw('total_rewards - settled_rewards') })
            .where({ customer_id, user_type });
    }

    addDefaultEntry(customer_id, user_type) {
        return knex('user_rewards').insert({ customer_id, user_type });
    }

}