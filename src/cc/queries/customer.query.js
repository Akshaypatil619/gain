let knex = require("../../../config/knex");
var newId = require("uuid-pure").newId;
let config = require("../../../config/config");
let encription_key = config.encription_key;
let response = require("../response/customer.response");

module.exports = class CustomerModel {

    consumeCouponCode(data) {
        return knex('coupon_codes').update({ is_used: 1 }).where('id', data.coupon_code_id);
    }

    checkCouponCode(data) {
        return knex('merchant_coupons').select({
            coupon_code_id: 'coupon_codes.id',
            customer_id: 'coupon_codes.customer_id',
            customer_unique_id: knex.raw("CAST(AES_DECRYPT(customers.customer_unique_id,'" + encription_key + "') AS CHAR(255))"),
        }).join('coupon_codes', function () {
            this.on('coupon_codes.coupon_id', 'merchant_coupons.id')
                .on(knex.raw(`coupon_codes.code = '${data.coupon_code}'`))
                .on('coupon_codes.is_used', 0)
                .on('coupon_codes.status', 1)
                .on(knex.raw('coupon_codes.customer_id is not null'))
        }).join('customers', 'customers.id', 'coupon_codes.customer_id');
    }

    assignCoupon(data) {
        return knex('coupon_codes')
            .update({ customer_id: data.id })
            .where('id', data.coupon_code_id)
            .where('code', data.coupon_code);
    }

    getCouponCode(data, merchant_code) {
        return knex('merchant_coupons').select({
            coupon_code_id: 'coupon_codes.id',
            coupon_code: 'coupon_codes.code'
        }).join('master_user_type', 'master_user_type.id', 'merchant_coupons.user_type_id')
            .join('coupon_codes', function () {
                this.on('coupon_codes.coupon_id', 'merchant_coupons.id')
                    .on(knex.raw('coupon_codes.valid_till >= now()'))
                    .on(knex.raw('coupon_codes.customer_id is null'))
                    .on('coupon_codes.is_used', 0)
                    .on('coupon_codes.status', 1)
            }).where('master_user_type.code', data.user_type)
            .where('merchant_coupons.merchant_code', merchant_code)
            .where('merchant_coupons.status', 1)
            .groupBy('merchant_coupons.id')
            .limit(1);
    }

    get_customer_id(customer_unique_id) {
        return knex('customers').select('customers.id as id', 'master_user_type.code as user_type')
            .join('master_user_type', 'master_user_type.id', 'customers.user_type_id')
            .whereRaw(`CAST(AES_DECRYPT(customers.customer_unique_id, '${encription_key}') AS CHAR(255)) = '${customer_unique_id}'`);
    }


    getProfile(formData) {
        let columns = {
            first_name: knex.raw("CAST(AES_DECRYPT(customers.first_name,'" + encription_key + "') AS CHAR(255))"),
            last_name: knex.raw("CAST(AES_DECRYPT(customers.last_name,'" + encription_key + "') AS CHAR(255))"),
            email: knex.raw("CAST(AES_DECRYPT(customers.email,'" + encription_key + "') AS CHAR(255))"),
            phone: knex.raw("CAST(AES_DECRYPT(customers.phone,'" + encription_key + "') AS CHAR(255))"),
            dob: "customers.dob",
            user_type: "master_user_type.code",
            country_code: 'countries.country_code',
            customer_id: "customers.id"
        }

        return knex("customers").select(columns)
            .leftJoin('countries', 'countries.id', 'customers.country_id')
            .join('master_user_type', 'master_user_type.id', 'customers.user_type_id')
            .whereIn('master_user_type.code', ['owner', 'tenant', 'family'])
            .whereRaw(`CAST(AES_DECRYPT(customers.customer_unique_id, '${encription_key}') AS CHAR(255)) = '${formData.customer_unique_id}'`)
            .where('customers.status', 1)
            .then(async user => {
                if (user.length > 0) {
                    return response.success('user_found', user[0]);
                } else {
                    return response.failed('user_not_found');
                };
            }).catch(err => response.catch_error(err));

    }

    async getDefaultUnit(data) {
        let customer_id = data.customer_id;
        let family_customer_id = null;
        let referrer_user_type = null;

        if (data.user_type == 'family') {
            family_customer_id = customer_id;

            const referrerDetails = await knex('customers').select({
                referrer_id: 'customers.referrer_id',
                referrer_user_type: 'master_user_type.code'
            }).join('customers as rc', 'rc.id', 'customers.referrer_id')
                .join('master_user_type', 'master_user_type.id', 'rc.user_type_id')
                .where('customers.id', customer_id);

            if (!referrerDetails.length || !referrerDetails[0].referrer_id) return [];

            customer_id = referrerDetails[0].referrer_id;
            referrer_user_type = referrerDetails[0].referrer_user_type;
        }

        const columns = {
            address_line_1: 'address_line_1',
            address_line_2: 'address_line_2',
            unit_no: 'master_unit.unit_no',
            unit_title: 'master_unit.title',
            area: 'area',
            emirate: 'master_emirate.name',
            owner_commission: 'oam.owner_commission',
            tenant_discount: 'oam.tenant_discount',
            referrer_user_type: knex.raw(`'${referrer_user_type}'`),
            building_code: 'master_building.code',
            oam_code: knex.raw("CAST(AES_DECRYPT(oam.oam_code,'" + encription_key + "') AS CHAR(255))")
        }

        let obj = knex('master_property').select(columns)
            .join('master_emirate', 'master_emirate.id', 'emirate_id')
            .join('master_building', 'master_building.property_id', 'master_property.id')
            .join('master_unit', 'master_unit.building_id', 'master_building.id')
            .join('customers as oam', 'oam.id', 'master_property.oam_id')
            .limit(1);

        if (data.user_type == 'tenant') {
            obj.where('master_unit.tenant_customer_id', customer_id)
        } else if (data.user_type == 'owner') {
            obj.where('master_unit.customer_id', customer_id)
                .where('master_unit.is_default', 1);
        } else if (data.user_type == 'family') {

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

    getCustomerDetails(data) {
        const columns = {
            customer_id: 'customers.id',
            first_name: knex.raw(`cast(aes_decrypt(customers.first_name, '${encription_key}') as char(255))`),
            last_name: knex.raw(`cast(aes_decrypt(customers.last_name, '${encription_key}') as char(255))`),
            email: knex.raw(`cast(aes_decrypt(customers.email, '${encription_key}') as char(255))`),
            phone: knex.raw(`cast(aes_decrypt(customers.phone, '${encription_key}') as char(255))`),
            customer_unique_id: knex.raw(`cast(aes_decrypt(customers.customer_unique_id, '${encription_key}') as char(255))`),
            user_type: 'master_user_type.code',
            referrer_user_type: 'rcmut.code'
        }
        return knex('customers').select(columns)
            .join('master_user_type', 'customers.user_type_id', 'master_user_type.id')
            .leftJoin('customers as rc', 'rc.id', 'customers.referrer_id')
            .leftJoin('master_user_type as rcmut', 'rcmut.id', 'rc.user_type_id')
            .whereRaw(`customers.customer_unique_id = cast(aes_encrypt('${data.customer_unique_id}', '${encription_key}') as char(255))`)
    }

    async getUnitDetails(data) {
        let obj = knex('master_unit').select('id')
            .where('status', 1);

        if (data.user_type == 'tenant') {
            obj.where('tenant_customer_id', data.customer_id);
        } else if (data.user_type == 'owner') {
            obj.where('customer_id', data.customer_id);
        } else if (data.user_type == 'family') {

            const referrerDetails = await knex('customers').select({
                referrer_id: 'customers.referrer_id',
                referrer_user_type: 'master_user_type.code'
            }).join('customers as rc', 'rc.id', 'customers.referrer_id')
                .join('master_user_type', 'master_user_type.id', 'rc.user_type_id')
                .where('customers.id', data.customer_id);

            let referrer_id = referrerDetails[0].referrer_id;
            let referrer_user_type = referrerDetails[0].referrer_user_type;

            if (referrer_user_type == 'owner') {
                obj.where('master_unit.customer_id', referrer_id);
            } else {
                obj.where('master_unit.tenant_customer_id', referrer_id);
            }

        }

        return obj;
    }

    async getPropertyDetails(data, custDetails) {
        const columns = {
            address_line_1: 'address_line_1',
            address_line_2: 'address_line_2',
            title: 'master_unit.title',
            unit_id: 'master_unit.id',
            unit_no: 'master_unit.unit_no',
            // is_default: 'master_unit.is_default',
            building_name: 'master_building.name',
            building_code: 'master_building.code',
            area: 'master_property.area',
            emirate_name: 'master_emirate.name',
            unit_type: 'master_unit.unit_type',
            price: knex.raw(`case when master_unit.unit_type = 'rent' then master_unit.rent_amount
                when master_unit.unit_type = 'sale' then master_unit.sale_amount else null end`),
            owner_first_name: knex.raw("CAST(AES_DECRYPT(customers.first_name,'" + encription_key + "')AS CHAR(255))"),
            owner_last_name: knex.raw("CAST(AES_DECRYPT(customers.last_name,'" + encription_key + "')AS CHAR(255))"),
            owner_mobile_email: knex.raw("CAST(AES_DECRYPT(customers.email,'" + encription_key + "')AS CHAR(255))"),
            owner_mobile_number: knex.raw("CAST(AES_DECRYPT(customers.phone,'" + encription_key + "')AS CHAR(50))"),
        }

        let obj = knex('master_property').select(columns)
            .join('master_emirate', 'master_emirate.id', 'master_property.emirate_id')
            .join('master_building', 'master_building.property_id', 'master_property.id')
            .join('master_unit', 'master_unit.building_id', 'master_building.id')
            .leftJoin('customers', 'customers.id', 'master_unit.customer_id')
            .whereIn('master_unit.id', data.map(e => e.id));

        if (custDetails.user_type == 'owner') {
            obj.select('master_unit.is_default as is_default')
        } else if (custDetails.user_type == 'family') {

            const referrerDetails = await knex('customers').select({
                referrer_id: 'customers.referrer_id',
                referrer_user_type: 'master_user_type.code'
            }).join('customers as rc', 'rc.id', 'customers.referrer_id')
                .join('master_user_type', 'master_user_type.id', 'rc.user_type_id')
                .where('customers.id', custDetails.customer_id);

            if (referrerDetails.length && referrerDetails[0].referrer_user_type == 'owner') {
                obj.leftJoin('family_has_unit', function () {
                    this.on('family_has_unit.unit_id', 'master_unit.id')
                        .on('family_has_unit.customer_id', custDetails.customer_id)
                        .on('family_has_unit.status', 1);
                });

                obj.select({ is_default: knex.raw('case when family_has_unit.id is not null then 1 else 0 end') });
            }

        }

        return obj;
    }

    async setDefaultUnit({ unit_id, customer_id, user_type } = {}) {
        if (user_type == 'owner') {
            await knex('master_unit').update('is_default', 0).where({ customer_id });

            return knex('master_unit').update("is_default", 1).where({ id: unit_id });
        } else if (user_type == 'family') {
            await knex('family_has_unit').update('status', 0).where({ customer_id });

            return knex('family_has_unit').insert({ unit_id, customer_id });
        }
    }

    setLoggedInFlag(customer_id) {
        return knex('customers').update('is_logged_in', 1).where('id', customer_id);
    }

    customerLogin(data) {
        let columns = {
            id: "customers.id",
            status: knex.raw(`(case when mut.code = 'tenant' then customers.status = 1 and mu.tenant_customer_id = customers.id 
                else customers.status end)`),
            first_name: knex.raw("CAST(AES_DECRYPT(customers.first_name,'" + encription_key + "') AS CHAR(255))"),
            user_name: knex.raw("CONCAT(CAST(AES_DECRYPT(customers.first_name,'" + encription_key + "') AS CHAR(255)),' ',CAST(AES_DECRYPT(customers.last_name,'" + encription_key + "') AS CHAR(255)))"),
            email: knex.raw("CAST(AES_DECRYPT(customers.email,'" + encription_key + "') AS CHAR(255))"),
            phone: knex.raw("CAST(AES_DECRYPT(customers.phone,'" + encription_key + "') AS CHAR(255))"),
            fcm_token: "customers.fcm_token",
            user_type: "mut.name"
        }
        let query = knex("customers").select(columns)
            .where(function () {
                this.andWhereRaw(`CAST(AES_DECRYPT(customers.email, '${encription_key}') AS CHAR(255)) = '${data.input}'`)
                    .orWhereRaw(`CAST(AES_DECRYPT(customers.phone, '${encription_key}') AS CHAR(255)) = '${data.input}'`)
            }).join('master_user_type as mut', 'mut.id', 'customers.user_type_id')
            .leftJoin('master_unit as mu', 'mu.id', 'customers.unit_id')
            // .whereRaw(`(case when mut.code = 'tenant' then (cast(customers.tenant_joining_date as date) <= current_date()
            //     and cast(customers.tenant_leaving_date as date) >= current_date()) else 1 end)`)
            // .whereRaw(`(case when mut.code = 'tenant' then mu.tenant_customer_id = customers.id else 1 end)`)
            .whereIn('mut.code', ['owner', 'tenant', 'family'])
            .orderBy('customers.created_at', 'desc')
            .limit(1);
        return query;
    }

    referralLogin(data) {
        let query = knex.select("*")
            .where("customer_referral.email", data['input'])
            .orWhere("customer_referral.phone", data['input'])
            .table('customer_referral');
        return query;
    }
    updateReferralStatus(data) {
        return knex("customer_referral").update({ customer_id: data['customer_id'], is_active: 1, registered_date: knex.raw("NOW()"), 'rule_transaction': 0 }).where("customer_referral.id", data['id']);
    }
    async addCustomerRecords(form_data) {
        let data = {};
        let country_id = await knex('countries').where("code", form_data['country_code']);
        if (country_id.length > 0) {
            country_id = country_id[0].id
        } else {
            country_id = 0;
        }
        return knex('customer_tiers').select('id').where('tenant_id', form_data.tenant_id).limit(1).orderBy('id', 'asc')
            .then((tier_result) => {
                data['tier_id'] = tier_result[0].id;
                data['tenant_id'] = form_data['tenant_id'];
                data['gender'] = form_data['gender'];
                data['first_name'] = knex.raw("AES_ENCRYPT('" + form_data['first_name'] + "', '" + encription_key + "')");
                data['last_name'] = knex.raw("AES_ENCRYPT('" + form_data['last_name'] + "', '" + encription_key + "')");
                data['email'] = knex.raw("AES_ENCRYPT('" + form_data['email'] + "', '" + encription_key + "')");
                data['country_code'] = form_data['country_code'];
                data['country_id'] = country_id;
                data['isd'] = form_data['country_code'];
                data['membership_no'] = form_data['country_code'] + Math.floor(Math.random() * 10000000000) + this.getRandomInt(9);
                form_data['affiliate_token'] = newId(15);
                data['phone'] = knex.raw("AES_ENCRYPT('" + form_data['phone'] + "', '" + encription_key + "')");
                return knex("customers").insert(data).then((res) => {
                    return res;
                })
            })
    }
    getRandomInt(max) {
        return Math.floor(Math.random() * Math.floor(max));
    }
    createCustomerLogs(data) {
        let customerQuery = '(' + knex.raw("CAST(AES_DECRYPT(customers.email,'" + encription_key + "')AS CHAR(255))") + '="' + data.input + '" OR ' + knex.raw("CAST(AES_DECRYPT(customers.phone,'" + encription_key + "')AS CHAR(255))") + '="' + data.input + '")';
        return knex.select("*")
            .where(knex.raw(customerQuery))
            .table('customers')
            .then((res) => {
                return knex("customer_logs").insert({ customer_id: res[0].id, fcm_token: data['fcm_token'], device_id: data['device_id'], os: data['os'] }).then((result) => {
                    return result;
                })
            })
    }
    updateRegisteredStatusAndDate(data) {
        let customerQuery = '(' + knex.raw("CAST(AES_DECRYPT(customers.email,'" + encription_key + "')AS CHAR(255))") + '="' + data.input + '" OR ' + knex.raw("CAST(AES_DECRYPT(customers.phone,'" + encription_key + "')AS CHAR(255))") + '="' + data.input + '")';
        return knex.select("*")
            .where(knex.raw(customerQuery))
            .table('customers')
            .then((res) => {
                return knex("referral_app_report").update({ is_registred: 1, registered_date: knex.raw("CURRENT_TIMESTAMP") }).where("referral_app_report.customer_id", res[0].id).then((result) => {
                    return result;
                })
            })
    }
    createCustomerAccountCCSummary(data) {
        let customerQuery = '(' + knex.raw("CAST(AES_DECRYPT(customers.email,'" + encription_key + "')AS CHAR(255))") + '="' + data['email'] + '" OR ' + knex.raw("CAST(AES_DECRYPT(customers.phone,'" + encription_key + "')AS CHAR(255))") + '="' + data['phone'] + '")';
        let query = knex.select("*")
            .where(knex.raw(customerQuery))
            .table('customers');
        query.then((res) => {
            return knex("cc_account_summary").insert({ customer_id: res[0].id }).then((result) => {
                return result;
            })
        })
    }

    updateCustomerRecord(data, input) {
        let customerQuery = '(' + knex.raw("CAST(AES_DECRYPT(customers.email,'" + encription_key + "')AS CHAR(255))") + '="' + input + '" OR ' + knex.raw("CAST(AES_DECRYPT(customers.phone,'" + encription_key + "')AS CHAR(255))") + '="' + input + '")';
        return knex.select("*")
            .where(knex.raw(customerQuery))
            .table('customers')
            .then((res) => {
                return knex("customers").update(data).where("customers.id", res[0].id).then((result) => {
                    return result;
                });
            })
    }

    updateTenantCron() {
        return knex('master_unit as mu')
            .innerJoin('customers as c', 'mu.tenant_customer_id', 'c.id')
            .update({ 'mu.tenant_customer_id': knex.raw('null') })
            .whereRaw('mu.tenant_customer_id is not null')
            .whereRaw('cast(c.tenant_leaving_date as date) < current_date()')
            .orWhere('c.status', 0)
            .then(() => {
                return knex('master_unit as mu')
                    .innerJoin('customers as c', 'c.unit_id', 'mu.id')
                    .update({ 'mu.tenant_customer_id': knex.raw('c.id') })
                    .whereRaw('mu.tenant_customer_id is null')
                    .whereRaw('cast(c.tenant_joining_date as date) = current_date()')
                    .where('c.status', 1);
            });
    }
}
