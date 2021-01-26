/************** Load Libraries ****************/
let dateFormat = require('dateformat');
let Validator = require('validatorjs');

/************** Load Files****************/
let messages = require("../response_codes/third_party_messages");
let status_codes = require("../response_codes/third_party_status_codes");
let Response_adapter = require("../../core/response_adapter");
let Common_functions = require("../../core/common_functions.js");
let knex = require("../../../config/knex.js");
let uuid = require('uuid');
let userModuleService = new (require('../modules/user/services/user.service'))();
let userValidator = new (require('../modules/user/validators/user.validator'))();
let userResponse = require('../modules/user/responses/user.response');
let defaultLanguage = require("../../common/default_language/default_language");
let send_mail = require("../../../config/send_mail.js");
let ResponseHandler = require("../../core/ResponseHandler.js");
const { customAlphabet } = require('nanoid');
let nanoid = customAlphabet('1234567890', 10);

/************** Generate Objects ****************/
let common_functions = new Common_functions();
let response_adapter = new Response_adapter();
let responseHandler = new ResponseHandler();

module.exports = class User_model {

    /** Fetch User Point Method
    *  Author :
    * @param {*} query_data 
    * @param {*} callback 
    */
    fetch_customer_points(query_data, callback) {
        let rules = {
            customer_id: "required",
            tenant_id: "required",
        };

        let validation = new Validator(query_data, rules);
        if (!validation.passes() && validation.fails()) {
            let errors = validation.errors.errors;
            return callback(response_adapter.response_error(false, status_codes.form_field_reqired, messages.form_field_reqired, errors));
        }

        let now = new Date();
        let pointsData = [];
        let columns = {
            point_ledger_id: "point_ledger.id",
            wallet_ledger_id: "point_ledger.wallet_ledger_id",
            // point_type_name: "master_point_type.point_type_name",
            credit_points: knex.raw("sum(case when point_ledger.transaction_type = 'credit' then point_ledger.points end)"),
            debit_points: knex.raw("sum(case when point_ledger.transaction_type = 'debit' then point_ledger.points end)")
        }
        let obj = knex().select(columns).from('point_ledger').innerJoin('wallet_ledger', function () {
            this.on('wallet_ledger.id', 'point_ledger.wallet_ledger_id')
                .on('wallet_ledger.is_used', '=', knex.raw('?', 0))
                .on(knex.raw(' DATE(wallet_ledger.end_date) '), '>=', knex.raw('?', dateFormat(now, "yyyy-mm-dd")))
                .on('wallet_ledger.customer_id', knex.raw('?', query_data.customer_id))

            if (query_data.point_type_id != null)
                this.on('wallet_ledger.point_type_id', knex.raw('?', query_data.point_type_id));
        })
            // .innerJoin('master_point_type', 'master_point_type.id', '=', 'wallet_ledger.point_type_id')
            .groupBy('point_ledger.wallet_ledger_id')
            // .orderBy("master_point_type.point_priority", "asc")
            .orderBy("wallet_ledger.id", "asc");
        obj.then(async (result) => {
            if (result.length > 0) {
                let totalPoints = 0;
                result.forEach((customer_points_data) => {
                    let tempData = {};
                    tempData['point_type_name'] = customer_points_data['point_type_name'];
                    tempData['credit_points'] = (customer_points_data['credit_points'] != null) ? customer_points_data['credit_points'] : 0;
                    tempData['debit_points'] = (customer_points_data['debit_points'] != null) ? customer_points_data['debit_points'] : 0;
                    tempData['available_points'] = (customer_points_data['credit_points'] - customer_points_data['debit_points']);
                    totalPoints += tempData['available_points'];
                    pointsData.push(tempData);
                });
                let returnData = { 'total_points': totalPoints, 'points_data': pointsData };

                let lockResult = await this.get_locked_points(query_data);
                if (lockResult.length > 0) {
                    returnData['total_points'] = parseInt(returnData.total_points) - parseInt(lockResult[0].lock_point);
                }
                return callback(response_adapter.response_success(true, status_codes.points_found, messages.points_found, returnData));
            } else {
                return callback(response_adapter.response_error(false, status_codes.points_not_found, messages.points_not_found));
            }
        }).catch(function (err) {
            let result = status_codes.check_error_code("DATABASE", err.errno);
            return callback(Object.assign({ "status": false }, result));
        });
    }
    /** get locked points
     *  Author :
     * @param {*} query_data 
     * @param {*} callback 
     */

    async get_locked_points(query_data) {
        let columns = {
            id: "lock_point.id",
            lock_point: knex.raw("IFNULL(sum(case when lock_point.burn = 0 then lock_point.lock_point end),0)"),
        }
        let setting_result = await knex("tenant_settings").select("*")
            .where("status", 1)
            .where("settings_name", 'lock_point_timeout_setting')
        let timeout = setting_result.length > 0 ? setting_result[0]['data'] : status_codes.lock_point_timeout_setting;

        return knex("lock_point").select(columns)
            .where("lock_point.lock", 1)
            .where("lock_point.burn", 0)
            .where("lock_point.customer_id", query_data.customer_id)
            .where(knex.raw("UNIX_TIMESTAMP(lock_point.created_at)+" + timeout), ">=", parseInt(new Date() / 1000));
    }

    /** Debit User Point Method
    *  Author :
    * @param {*} query_data 
    * @param {*} callback 
    */
    debit_points(form_data, callback) {
        let language_code = form_data['language_code'];
        delete form_data['language_code'];
        let now = new Date();
        let rules = {
            customer_id: "required",
            debit_points: "required",
            tenant_id: "required",
        };

        let fetchCreditPointByDebitAmount = (params) => {
            let columns = {
                point_ledger_id: "point_ledger.id",
                wallet_ledger_id: "point_ledger.wallet_ledger_id",
                credit_points: knex.raw("sum(case when point_ledger.transaction_type = 'credit' then point_ledger.points end)"),
                debit_points: knex.raw("sum(case when point_ledger.transaction_type = 'debit' then point_ledger.points end)")
            }
            return knex.select(columns).from('point_ledger').join('wallet_ledger', function () {
                this.on('wallet_ledger.id', 'point_ledger.wallet_ledger_id')
                    .on('wallet_ledger.is_used', '=', knex.raw('?', 0))
                    .on(knex.raw('DATE(wallet_ledger.end_date)'), '>=', knex.raw('?', dateFormat(now, "yyyy-mm-dd")))
                    .on('wallet_ledger.customer_id', knex.raw('?', params.customer_id))

                if (params.point_type_id != null)
                    this.on('wallet_ledger.point_type_id', knex.raw('?', params.point_type_id));
            })
                // .leftJoin('master_point_type', 'master_point_type.id', '=', 'wallet_ledger.point_type_id')
                .groupBy('point_ledger.wallet_ledger_id')
                .orderBy("wallet_ledger.id", "asc");
        }

        let validation = new Validator(form_data, rules);
        if (!validation.passes() && validation.fails()) {
            let errors = validation.errors.errors;
            return callback(response_adapter.response_error(false, status_codes.form_field_reqired, messages.form_field_reqired, errors));
        }

        let userDebitData = {
            tenant_id: form_data['tenant_id'],
            debit_points: form_data['debit_points'],
            customer_id: form_data['customer_id'],
            point_type_id: form_data['point_type_id'] || null,
        }
        fetchCreditPointByDebitAmount(userDebitData).then(async (pointResult) => {
            let pointLots = pointResult.map((lot) => {
                lot.availablePoints = lot.credit_points - lot.debit_points;
                return lot;
            });
            let totalAvailablePoints = pointLots.reduce((acc, lot) => {
                return acc + lot.availablePoints
            }, 0);
            let columns = {
                lock_point: knex.raw("sum(case when lock_point.burn = 0 then lock_point.lock_point end)"),
            }
            let setting_result = await knex("tenant_settings").select("data")
                .where("status", 1)
                .where("settings_name", 'lock_point_timeout_setting')
            // .where("tenant_id", form_data.tenant_id)

            let timeout;
            setting_result.length > 0 ? timeout = setting_result[0]['data'] : timeout = status_codes.lock_point_timeout_setting;

            let lockQuery = knex("lock_point").select(columns)
                .where("lock_point.lock", 1)
                .where("lock_point.burn", 0)
                .where("lock_point.customer_id", form_data.customer_id)
                .where(knex.raw("UNIX_TIMESTAMP(lock_point.created_at)+" + timeout), ">=", parseInt(new Date() / 1000));
            if (form_data.lock_point_id)
                lockQuery.whereNot('lock_point.id', form_data.lock_point_id);

            let lockResult = await lockQuery;

            if (lockResult.length > 0) {
                totalAvailablePoints = totalAvailablePoints - lockResult[0].lock_point;
            }

            if (totalAvailablePoints < form_data['debit_points']) {
                return callback(response_adapter.response_error(false, status_codes.insufficient_points, messages.insufficient_points));
            } else {
                let flagLots = [];
                let debitedPoints = 0;
                let pointLotsToBeDebited = [];
                let flagAvailablePointArr = [];
                // let transaction_id = uuid.v4();
                let transaction_id = nanoid();

                for (let lotData of pointLots) {
                    let data = {
                        'transaction_type': 'debit',
                        'transaction_id': transaction_id,
                        'transaction_label': form_data['transaction_label'] || '',
                        'activity_id': form_data['activity_id'] || '',
                        'description': form_data['description'] || '',
                        'activity_name': form_data['activity_name'] || '',
                        'wallet_ledger_id': lotData.wallet_ledger_id,
                        // 'tp_transaction_id': form_data.tp_transaction_id,
                    };
                    let currentDebitPointLot = form_data['debit_points'] - debitedPoints;

                    if (lotData.availablePoints >= (currentDebitPointLot)) {
                        data['points'] = currentDebitPointLot;
                        debitedPoints += data['points'];
                        pointLotsToBeDebited.push(data);
                        if (lotData.availablePoints == currentDebitPointLot) {
                            flagLots.push(lotData.wallet_ledger_id);
                        }
                        else {
                            flagAvailablePointArr.push({ id: lotData.wallet_ledger_id, available_points: parseInt(lotData.availablePoints) - parseInt(data['points']) })
                        }
                        break;
                    } else if (lotData.availablePoints > 0 && lotData.availablePoints < (currentDebitPointLot)) {
                        data['points'] = lotData.availablePoints;
                        debitedPoints += data['points'];
                        pointLotsToBeDebited.push(data);
                        flagLots.push(lotData.wallet_ledger_id);
                        continue;
                    }
                }

                if (flagLots.length > 0) {
                    await knex('wallet_ledger').update({ 'is_used': 1, 'available_points': 0 }).whereIn('wallet_ledger.id', flagLots);
                }

                if (flagAvailablePointArr.length > 0) {
                    for (let item of flagAvailablePointArr) {
                        await knex('wallet_ledger').update({ available_points: item.available_points }).where('wallet_ledger.id', item.id);
                    }
                }

                let customer_points;
                knex("point_ledger").insert(pointLotsToBeDebited).then(async function (id) {
                    let update_point_balance = {};
                    try {
                        customer_points = await knex('cc_account_summary').select('*').where('customer_id', form_data.customer_id);
                        update_point_balance['point_balance'] = parseInt(customer_points[0]['point_balance']) - parseInt(form_data.debit_points);
                        update_point_balance['debit'] = parseInt(customer_points[0]['debit']) + parseInt(form_data.debit_points);

                        await knex('cc_account_summary').update(update_point_balance).where('customer_id', form_data.customer_id);
                    } catch (e) {
                        console.log('Error : ', e)
                    }

                }).then(function (result) {
                    callback(response_adapter.response_success(true, status_codes.wallet_ledger_modify_success, messages.wallet_ledger_modify_success, { transaction_id: transaction_id, opening_balance: parseInt(customer_points[0]['point_balance']) }));
                }).catch(function (err) {
                    callback(response_adapter.response_error(false, status_codes.wallet_ledger_modify_failed, messages.wallet_ledger_modify_failed, err.message));
                });
            }
        })
    }

    /** Get User Point Balance Method
     *  Author :
     * @param {*} query_data 
     * @param {*} callback 
     */
    async getCCUserPointBalance(query_data, callback) {
        let rules = {
            customer_id: "required",
        };

        let validation = new Validator(query_data, rules);
        if (validation.passes() && !validation.fails()) {
            let point_details = await knex('cc_account_summary').select('*').where('customer_id', query_data.customer_id)

            if (point_details.length > 0) {
                let locked_points = await this.get_locked_points(query_data);
                if (locked_points.length > 0) {
                    point_details[0]['point_balance'] = parseInt(point_details[0]['point_balance']) - parseInt(locked_points[0].lock_point);
                }
                return callback(response_adapter.response_success(true, status_codes.get_user_point_success, messages.get_user_point_success, { 'point_balance': point_details[0]['point_balance'] }));
            }
            else {
                return callback(response_adapter.response_error(false, status_codes.points_not_found, messages.points_not_found));
            }
        }
        else {
            let errors = validation.errors.errors;
            return callback(response_adapter.response_error(false, status_codes.get_user_point_failed, messages.get_user_point_failed, errors));
        }
    }

    /** Add Point Method
     *  Author :
     * @param {*} form_data 
     * @param {*} callback 
     */
    async addCCUserPoint(form_data, callback) {
        let rules = {
            // description: "required",
            customer_id: "required",
            // type: "required",
            // voucher_code: "required"
        };
        let customer_data;
        let point_type_code = form_data['point_type_code'];
        delete form_data['point_type_code'];
        let tenant_id = form_data['tenant_id'];
        if (!form_data.hasOwnProperty('activity_code')) {
            rules['points'] = "required";
        }

        let language_code = form_data['language_code'];
        delete form_data['language_code'];

        let validation = new Validator(form_data, rules);
        if (validation.passes() && !validation.fails()) {

            form_data.type = 'parent';
            if (userValidator.checkType(form_data.type)) {
                let custDetails = await userModuleService.getCustomerPK({
                    customer_id: form_data.customer_id
                }, form_data.type);
                delete form_data.type;
                if (custDetails.status === false)
                    return callback(custDetails);
                else {
                    // form_data.customer_id = custDetails.values.customer_id;
                    knex.select()
                        .where("status", 1)
                        .where("settings_name", 'default_point_type_setting')
                        // .where("tenant_id", form_data['tenant_id'])
                        .table('tenant_settings')
                        .then(async (setting_result) => {
                            if (point_type_code == null || point_type_code == undefined || point_type_code == '' && setting_result.length > 0) {
                                form_data['point_type_id'] = setting_result[0]['data'];
                                form_data['transaction_label'] = form_data.description;
                                let activity_columns = { id: 'id', name: 'name', code: 'code' };
                                let defaultActivity = await knex('master_activity')
                                    .select(activity_columns)
                                    .where('code', form_data.activity_code == 'SHOP' ? form_data.activity_code : 'GPE');

                                if (defaultActivity.length == 0) return callback(response_adapter.response_error(false, status_codes.activity_not_found, messages[language_code].activity_not_found));

                                form_data['activity_id'] = defaultActivity[0]['id'];
                                form_data['activity_name'] = defaultActivity[0]['name'];
                                if (form_data['activity_code'] == 'SHOP' && !form_data.transaction_id) {
                                    let tentativePointObj = {
                                        transaction_id: uuid.v1(),
                                        title: 'Points Earned',
                                        transaction_type: 'credit',
                                        customer_id: form_data.customer_id,
                                        is_tentative: 1,
                                        status: 1,
                                        description: 'Shop tentative points',
                                        points: form_data.points,
                                        transaction_date: new Date(),
                                        transaction_status: 'pending',
                                        activity_id: form_data['activity_id'],
                                        activity: form_data['activity_name']
                                    };
                                    knex("customer_transaction").insert(tentativePointObj).then((t_result) => {
                                        return callback(response_adapter.response_success(true, status_codes.user_point_add_success, messages[language_code].user_tnt_point_add_success));
                                    }).catch((err) => {
                                        console.log('Error : ', err)
                                        return callback(response_adapter.response_error(false, status_codes.user_point_adding_failed, messages[language_code].user_point_adding_failed));
                                    });
                                } else {
                                    let checkShopTNTPoints = [];
                                    let tntTrxnId;
                                    if (form_data['activity_code'] == 'SHOP' && form_data.transaction_id) {
                                        checkShopTNTPoints = await knex("customer_transaction").select('*').where({ is_tentative: 1, transaction_status: 'pending', transaction_id: form_data.transaction_id, activity_id: form_data['activity_id'] });

                                        if (checkShopTNTPoints.length == 0) return callback(response_adapter.response_error(false, status_codes.user_tnt_point_not_found, messages[language_code].user_tnt_point_not_found));

                                        form_data['points'] = checkShopTNTPoints[0]['points'];
                                        tntTrxnId = form_data.transaction_id;
                                    }
                                    this.add_point_customer(form_data, (credit_point_result) => {
                                        if (credit_point_result.status) {
                                            delete form_data.transaction_label;
                                            delete form_data.point_type_id;
                                            delete form_data.tp_application_key;
                                            delete form_data.tenant_id;
                                            form_data.transaction_id = credit_point_result.values.transaction_id;

                                            form_data['opening_balance'] = credit_point_result.values.opening_balance;
                                            form_data['closing_balance'] = parseInt(credit_point_result.values.opening_balance) + parseInt(form_data.points);

                                            form_data['title'] = 'Points Earned';
                                            form_data['transaction_type'] = 'credit';
                                            form_data['activity'] = form_data['activity_name'];
                                            delete form_data['activity_name'];
                                            delete form_data['activity_code'];
                                            knex("customer_transaction").insert(form_data).then(async (t_result) => {
                                                if (checkShopTNTPoints.length > 0) {
                                                    await knex("customer_transaction").update({ transaction_status: 'approved' }).where({ is_tentative: 1, transaction_status: 'pending', transaction_id: tntTrxnId, activity_id: form_data['activity_id'] });
                                                }
                                                return callback(response_adapter.response_success(true, status_codes.user_point_add_success, messages[language_code].user_point_add_success));
                                            });
                                        } else {
                                            return callback(response_adapter.response_error(false, status_codes.user_point_adding_failed, messages[language_code].user_point_adding_failed));
                                        }
                                    });
                                }

                            } else {
                                form_data.points = typeof form_data.points === 'object' ? form_data.points[0] : form_data.points;
                                let activityResult;
                                knex.select("id").from("master_point_type")
                                    .where('point_type_name', point_type_code)
                                    .then(async (point_type) => {
                                        if (point_type.length > 0) {
                                            let activity_columns = {
                                                id: 'master_activity.id',
                                                name: 'master_activity.name',
                                                code: 'master_activity.code',
                                                language_code: 'activity_languages.language_code',
                                                title: 'activity_languages.title',
                                                description: 'activity_languages.description'
                                            };
                                            try {
                                                activityResult = await knex.select(activity_columns)
                                                    .from('master_activity')
                                                    .innerJoin('activity_languages', 'activity_languages.activity_id', '=', 'master_activity.id')
                                                    .where('code', form_data['activity_code'])
                                                    .where('activity_type', 'accrual')
                                            } catch (e) {
                                                console.log('Error : ', e)
                                            }
                                            form_data['point_type_id'] = point_type[0].id;
                                            form_data['transaction_label'] = activityResult[0]['description'];
                                            this.add_point_customer(form_data, async (credit_point_result) => {
                                                if (credit_point_result.status) {
                                                    delete form_data.transaction_label;
                                                    delete form_data.tp_application_key;
                                                    delete form_data.tenant_id;
                                                    delete form_data['activity_code'];

                                                    form_data.transaction_id = credit_point_result.values.transaction_id;
                                                    form_data['opening_balance'] = credit_point_result.values.opening_balance;
                                                    form_data['closing_balance'] = parseInt(credit_point_result.values.opening_balance) + parseInt(form_data.points);

                                                    form_data['transaction_date'] = new Date();
                                                    form_data['transaction_type'] = form_data['transaction_type'];
                                                    form_data['title'] = activityResult[0]['title'];
                                                    form_data['description'] = activityResult[0]['description'];
                                                    form_data['activity_id'] = activityResult[0]['id'];
                                                    form_data['activity'] = activityResult[0]['name'];

                                                    let trxn_result = await knex("customer_transaction").insert(form_data).returning('id');

                                                    let trxn_lang_res = [];
                                                    activityResult.map(async activity => {
                                                        let trxn_lang_data = {
                                                            title: activity.title,
                                                            description: activity.description,
                                                            language_code: activity.language_code,
                                                            transaction_id: credit_point_result['values']['transaction_id'],
                                                            transaction_table_id: trxn_result[0]
                                                        };
                                                        trxn_lang_res = await knex("transaction_languages").insert(trxn_lang_data);
                                                    });

                                                    let profile_report_data = {
                                                        current_balance: form_data['closing_balance'],
                                                        earned_points: knex.raw(" earned_points + " + form_data['points']),
                                                        last_transaction_date: form_data['transaction_date']
                                                    };
                                                    await knex("customer_profile_report").update(profile_report_data).where('customer_id', form_data['customer_id']);

                                                    customer_data = await knex('customers').select('*').where('id', form_data['customer_id']);

                                                    let transaction_report_data = {
                                                        customer_id: form_data['customer_id'],
                                                        first_name: customer_data[0]['first_name'],
                                                        last_name: customer_data[0]['last_name'],
                                                        email: customer_data[0]['email'],
                                                        phone: customer_data[0]['phone'],
                                                        points: form_data['points'],
                                                        amount: form_data['amount'],
                                                        trans_amount: form_data['trans_amount'],
                                                        activity_type: activityResult[0]['name'],
                                                        brand_name: form_data['brand'],
                                                        category: form_data['category'],
                                                        sub_category: form_data['sub_category'],
                                                        transaction_id: form_data['transaction_id'],
                                                        transaction_date: form_data['transaction_date'],
                                                        transaction_type: form_data['transaction_type'],
                                                        opening_balance: credit_point_result.values.opening_balance,
                                                        closing_balance: parseInt(credit_point_result.values.opening_balance) + parseInt(form_data.points),
                                                        membership_no: customer_data[0]['membership_no'],
                                                        country_code: customer_data[0]['country_code'],
                                                        activity_id: activityResult[0]['id'],
                                                    };

                                                    await knex("customer_transaction_report").insert(transaction_report_data);
                                                    await knex.raw("CALL updatePointOverallReport(?,?)", ['ttl_num_of_normal_pts', Number(form_data['points'])]);

                                                    if (trxn_lang_res.length == 0) {
                                                        return callback(response_adapter.response_error(false, status_codes.user_point_adding_failed, messages[language_code].user_point_adding_failed));
                                                    } else {

                                                        //Send Email
                                                        let col = {
                                                            f_name: knex.raw("CAST(AES_DECRYPT(customers.first_name,'rainbowfinance') AS CHAR(255))"),
                                                            l_name: knex.raw("CAST(AES_DECRYPT(customers.last_name,'rainbowfinance') AS CHAR(255))"),
                                                            email: knex.raw("CAST(AES_DECRYPT(customers.email,'rainbowfinance') AS CHAR(255))")
                                                        };
                                                        let cust_info = await knex.select(col)
                                                            .where("id", form_data['customer_id'])
                                                            .table('customers');

                                                        let email_columns = { subject: 'languages_for_email_templates.subject', body: 'languages_for_email_templates.body' };
                                                        let email_template_data_array = await knex('languages_for_email_templates')
                                                            .select(email_columns)
                                                            .innerJoin('email_templates', 'email_templates.id', '=', 'languages_for_email_templates.email_template_id')
                                                            .innerJoin('email_template_activities', function () {
                                                                this.on('email_template_activities.email_template_id', '=', 'email_templates.id')
                                                                    .andOn('email_template_activities.status', '=', 1)
                                                            })
                                                            .innerJoin('master_api_permission_modules', function () {
                                                                this.on('master_api_permission_modules.name', '=', knex.raw("'point transaction success'"))
                                                                    .andOn('master_api_permission_modules.id', '=', 'email_template_activities.activity_id')
                                                                    .andOn('master_api_permission_modules.status', '=', 1)
                                                            })
                                                            .where('language_code', language_code)
                                                            .where('email_templates.status', 1)

                                                        if (email_template_data_array.length > 0) {
                                                            let email_data = {
                                                                trxnType: 'Accumulated',
                                                                Username: cust_info[0]['f_name'] + " " + cust_info[0]['l_name'],
                                                                merchant: form_data['brand'],
                                                                time: new Date().toLocaleTimeString(),
                                                                transactionID: form_data['ty_transaction_id'],
                                                                amount: form_data['trans_amount'],
                                                                points: form_data.points,
                                                                openingBal: credit_point_result.values.opening_balance,
                                                                closingBal: parseInt(credit_point_result.values.opening_balance) + parseInt(form_data.points),
                                                            };

                                                            for (let i = 0; i < email_template_data_array.length; i++) {
                                                                let email_body = responseHandler.find_and_replace(email_template_data_array[i].body, email_data);
                                                                let email_info = {};
                                                                email_info = {
                                                                    'email': cust_info[0]['email'],
                                                                    'email_body': email_body,
                                                                    'email_subject': email_template_data_array[i].subject,
                                                                    'sender_user_type': 'tenant',
                                                                    'sender_user_id': tenant_id,
                                                                };

                                                                await send_mail.sending_mail(email_info, (emailResult) => {
                                                                    if (emailResult.status) {
                                                                        console.log('Email Sent !')
                                                                    }
                                                                });
                                                            }
                                                            return callback({ status: true, status_code: status_codes.user_point_add_success, values: { transaction_id: credit_point_result.values.transaction_id, fcm_token: customer_data[0].fcm_token } }
                                                            );
                                                        }
                                                    }
                                                } else {
                                                    return callback(response_adapter.response_error(false, status_codes.user_point_adding_failed, messages[language_code].user_point_adding_failed));
                                                }
                                            })
                                        }
                                    })
                            }
                        }).catch((err) => {
                            return callback(response_adapter.response_error(false, status_codes.user_point_adding_failed, messages[language_code].user_point_adding_failed, err.message));
                        });
                }
            } else return callback(userResponse.failed('type_error'));
        }
        else {
            let errors = validation.errors.errors;
            return callback(response_adapter.response_error(false, status_codes.form_field_reqired, messages[language_code].form_field_reqired, errors));
        }
    }

    /** Burn User Point Method
     *  Author :
     * @param {*} query_data 
     * @param {*} callback 
     */
    async burnLockPoints(query_data, callback) {
        let now = parseInt(new Date() / 1000);
        let rules = {
            customer_id: "required",
            // debit_points: "required",
            // tp_transaction_id: "required",
            lock_point_id: "required",
            description: "required",
            // type: "required"
            // voucher_code: "required"
        };
        let tenant_id = query_data['tenant_id'];
        let language_code = query_data['language_code'];
        delete query_data['language_code'];

        let validation = new Validator(query_data, rules);
        if (validation.passes() && !validation.fails()) {
            query_data.type = 'parent';
            if (userValidator.checkType(query_data.type)) {
                let custDetails = await userModuleService.getCustomerPK({ customer_id: query_data.customer_id }, query_data.type);
                delete query_data.type;
                if (custDetails.status == false) {
                    return callback(custDetails);
                } else {
                    query_data.customer_id = custDetails.values.customer_id;
                    knex("tenant_settings").select("data")
                        .where("status", 1)
                        .where("settings_name", 'lock_point_timeout_setting')
                        // .where("tenant_id", query_data.tenant_id)
                        .then((setting_result) => {
                            let timeout;
                            setting_result.length > 0 ? timeout = setting_result[0]['data'] : timeout = status_codes.lock_point_timeout_setting;
                            knex("lock_point").select('*')
                                .where("lock_point.id", query_data['lock_point_id'])
                                .where("lock_point.burn", 0)
                                .where("lock_point.customer_id", query_data.customer_id)
                                .where(knex.raw("UNIX_TIMESTAMP(lock_point.created_at)+" + timeout), ">=", parseInt(new Date() / 1000))
                                .then(async (result_data) => {
                                    var burn_point;
                                    if (result_data.length > 0) {

                                        burn_point = result_data[0].lock_point;

                                        let debit_point_data = {
                                            customer_id: query_data.customer_id,
                                            debit_points: burn_point,
                                            tenant_id: query_data.tenant_id,
                                            transaction_label: 'Points Debited',
                                            description: query_data['description'],
                                            activity_id: result_data[0].activity_id,
                                            activity_name: result_data[0].activity,
                                            lock_point_id: query_data['lock_point_id']
                                        }

                                        this.debit_points(debit_point_data, (point_debit) => {
                                            if (point_debit.status == true) {
                                                knex("lock_point")
                                                    .update({
                                                        "burn": true,
                                                        // "tp_transaction_id": query_data.tp_transaction_id,
                                                        "lock": false
                                                    })
                                                    .where({ "id": query_data.lock_point_id })
                                                    .then(async (update_lock_point) => {
                                                        let debit_point_data = {
                                                            transaction_id: point_debit.values.transaction_id,
                                                            points: burn_point,
                                                        }
                                                        delete query_data['lock_point_id'];
                                                        query_data.points = burn_point;
                                                        query_data.payment_method = "point";
                                                        delete query_data['debit_points'];
                                                        delete query_data['tp_application_key'];
                                                        query_data.transaction_id = point_debit.values.transaction_id;
                                                        if (point_debit) {
                                                            delete query_data.tenant_id
                                                            query_data['transaction_type'] = 'debit';
                                                            query_data['title'] = 'Points Debited';
                                                            query_data['activity_id'] = result_data[0].activity_id;
                                                            query_data['activity'] = result_data[0].activity;
                                                            query_data['opening_balance'] = point_debit.values.opening_balance;
                                                            query_data['closing_balance'] = parseInt(point_debit.values.opening_balance) - parseInt(burn_point);
                                                            query_data['transaction_date'] = new Date();
                                                            let trxn_result;
                                                            try {
                                                                trxn_result = await knex("customer_transaction").insert(query_data);

                                                                let activity_columns = {
                                                                    title: 'activity_languages.title',
                                                                    description: 'activity_languages.description',
                                                                    language_code: 'activity_languages.language_code'
                                                                };

                                                                let activityResult;
                                                                try {
                                                                    activityResult = await knex.select(activity_columns)
                                                                        .from('master_activity')
                                                                        .innerJoin('activity_languages', 'activity_languages.activity_id', '=', 'master_activity.id')
                                                                        .where('master_activity.id', result_data[0].activity_id)
                                                                        .where('activity_type', 'redemption');
                                                                } catch (e) {
                                                                    console.log('Error : ', e)
                                                                }

                                                                activityResult.map(async activity => {
                                                                    let trxn_lang_data = {
                                                                        title: activity.title,
                                                                        description: activity.description,
                                                                        language_code: activity.language_code,
                                                                        transaction_id: query_data['transaction_id'],
                                                                        transaction_table_id: trxn_result[0]
                                                                    };
                                                                    await knex("transaction_languages").insert(trxn_lang_data);
                                                                });

                                                                let profile_report_data = {
                                                                    current_balance: query_data['closing_balance'],
                                                                    redeemed_points: knex.raw(" redeemed_points + " + burn_point),
                                                                    last_transaction_date: query_data['transaction_date']
                                                                };
                                                                await knex("customer_profile_report").update(profile_report_data).where('customer_id', query_data['customer_id']);

                                                                let customer_data = await knex('customers').select('*').where('id', query_data['customer_id']);

                                                                let transaction_report_data = {
                                                                    customer_id: query_data['customer_id'],
                                                                    first_name: customer_data[0]['first_name'],
                                                                    last_name: customer_data[0]['last_name'],
                                                                    email: customer_data[0]['email'],
                                                                    phone: customer_data[0]['phone'],
                                                                    points: burn_point,
                                                                    amount: query_data['amount'],
                                                                    trans_amount: query_data['trans_amount'],
                                                                    brand_name: query_data['brand'],
                                                                    category: query_data['category'],
                                                                    sub_category: query_data['sub_category'],
                                                                    transaction_id: query_data['transaction_id'],
                                                                    transaction_date: query_data['transaction_date'],
                                                                    transaction_type: query_data['transaction_type'],
                                                                    opening_balance: point_debit.values.opening_balance,
                                                                    closing_balance: parseInt(point_debit.values.opening_balance) - parseInt(burn_point),
                                                                    membership_no: customer_data[0]['membership_no'],
                                                                    country_code: customer_data[0]['country_code'],
                                                                    activity_type: result_data[0].activity,
                                                                    brand_outlet: query_data['outlet_name'],
                                                                    offer_name: query_data['offer_title']
                                                                };

                                                                debit_point_data['fcm_token'] = customer_data[0]['fcm_token'];

                                                                await knex("customer_transaction_report").insert(transaction_report_data);
                                                                await knex.raw("CALL updatePointOverallReport(?,?)", ['ttl_used_pts', Number(burn_point)]);

                                                            } catch (e) {
                                                                console.log('Error : ', e);
                                                            }
                                                            if (trxn_result.length == 0) {
                                                                return callback(response_adapter.response_error(false, status_codes.user_burn_point_failed, messages[language_code].user_burn_point_failed));
                                                            } else {
                                                                //Send Email
                                                                let col = {
                                                                    f_name: knex.raw("CAST(AES_DECRYPT(customers.first_name,'rainbowfinance') AS CHAR(255))"),
                                                                    l_name: knex.raw("CAST(AES_DECRYPT(customers.last_name,'rainbowfinance') AS CHAR(255))"),
                                                                    email: knex.raw("CAST(AES_DECRYPT(customers.email,'rainbowfinance') AS CHAR(255))")
                                                                };
                                                                let cust_info = await knex.select(col)
                                                                    .where("id", query_data['customer_id'])
                                                                    .table('customers')
                                                                let email_columns = { subject: 'languages_for_email_templates.subject', body: 'languages_for_email_templates.body' };
                                                                let email_template_data_array = await knex('languages_for_email_templates')
                                                                    .select(email_columns)
                                                                    .innerJoin('email_templates', 'email_templates.id', '=', 'languages_for_email_templates.email_template_id')
                                                                    .innerJoin('email_template_activities', function () {
                                                                        this.on('email_template_activities.email_template_id', '=', 'email_templates.id')
                                                                            .andOn('email_template_activities.status', '=', 1)
                                                                    })
                                                                    .innerJoin('master_api_permission_modules', function () {
                                                                        this.on('master_api_permission_modules.name', '=', knex.raw("'point transaction success'"))
                                                                            .andOn('master_api_permission_modules.id', '=', 'email_template_activities.activity_id')
                                                                            .andOn('master_api_permission_modules.status', '=', 1)
                                                                    })
                                                                    .where('language_code', language_code)
                                                                    .where('email_templates.status', 1)

                                                                if (email_template_data_array.length > 0) {
                                                                    let email_data = {
                                                                        trxnType: 'Redeemed',
                                                                        Username: cust_info[0]['f_name'] + " " + cust_info[0]['l_name'],
                                                                        merchant: query_data['brand'],
                                                                        time: new Date().toLocaleTimeString(),
                                                                        transactionID: query_data['ty_transaction_id'],
                                                                        amount: query_data['trans_amount'],
                                                                        points: burn_point,
                                                                        openingBal: point_debit.values.opening_balance,
                                                                        closingBal: parseInt(point_debit.values.opening_balance) - parseInt(burn_point),
                                                                    };

                                                                    for (let i = 0; i < email_template_data_array.length; i++) {
                                                                        let email_body = responseHandler.find_and_replace(email_template_data_array[i].body, email_data);

                                                                        let email_info = {};
                                                                        email_info = {
                                                                            'email': cust_info[0]['email'],
                                                                            'email_body': email_body,
                                                                            'email_subject': email_template_data_array[i].subject,
                                                                            'sender_user_type': 'tenant',
                                                                            'sender_user_id': tenant_id,
                                                                        };

                                                                        await send_mail.sending_mail(email_info, (emailResult) => {
                                                                            if (emailResult.status) {
                                                                                console.log('Email Sent !')
                                                                            }
                                                                        });
                                                                    }
                                                                    return callback(response_adapter.response_success(true, status_codes.user_burn_point_success, messages[language_code].user_burn_point_success, (debit_point_data)));
                                                                }
                                                            }

                                                        } else {
                                                            return callback(response_adapter.response_error(false, status_codes.user_burn_point_failed, messages[language_code].user_burn_point_failed));
                                                        }
                                                    });
                                            } else {
                                                return callback(response_adapter.response_error(false, status_codes.insufficient_point, messages[language_code].insufficient_point));
                                            }
                                        });

                                    }
                                    else {
                                        return callback(response_adapter.response_error(false, status_codes.lock_point_already_used, messages[language_code].lock_point_already_used));
                                    }
                                }).catch((err) => callback(common_functions.catch_error(err)));
                        })
                }
            } else return callback(userResponse.failed('type_error'));
        }
        else {
            let errors = validation.errors.errors;
            return callback(response_adapter.response_error(false, status_codes.user_redeem_update_failed, messages[language_code].user_redeem_update_failed, errors));
        }
    }


    /** Burn User Point Method
   *  Author :
   * @param {*} query_data 
   * @param {*} callback 
   */
    async burnPoints(query_data, callback) {
        let now = parseInt(new Date() / 1000);
        let lock_point_timeout = {};
        let cust_info;
        let language_code = query_data['language_code'];
        let tenant_id = query_data['tenant_id'];
        let customer_id = query_data['customer_id'];
        let debit_points = query_data['debit_points'];
        delete query_data['language_code'];
        let rules = {
            customer_id: "required",
            debit_points: "required",
            // description: "required",
            activity: 'required',
            // type: "required",
        };
        let validation = new Validator(query_data, rules);

        if (validation.passes() && !validation.fails()) {
            query_data.type = 'parent';
            if (userValidator.checkType(query_data.type)) {
                let custDetails = await userModuleService.getCustomerPK({ customer_id: customer_id }, query_data['type']);
                delete query_data.type;
                if (custDetails.status == false) {
                    return callback(custDetails);
                } else {
                    let activityResult;
                    let activity_columns = {
                        id: 'master_activity.id',
                        name: 'master_activity.name',
                        code: 'master_activity.code',
                        title: 'activity_languages.title',
                        description: 'activity_languages.description'
                    };
                    try {
                        activityResult = await knex.select(activity_columns)
                            .from('master_activity')
                            .innerJoin('activity_languages', 'activity_languages.activity_id', '=', 'master_activity.id')
                            .where('code', query_data['activity'])
                            .where('activity_type', 'redemption')
                            .where('activity_languages.language_code', language_code);
                    } catch (e) {
                        console.log('Error : ', e)
                    }
                    query_data.activity_id = activityResult[0]['id'];
                    query_data.activity_name = activityResult[0]['name'];

                    // let burnActivity = await userModuleService.getActivityId(
                    //     { code: query_data.activity, type: 'redemption' });
                    // if (burnActivity.status == false)
                    //     return callback(burnActivity)
                    // else {
                    //     query_data.activity_id = burnActivity.values.activity_id;
                    //     query_data.activity_name = burnActivity.values.activity_name;
                    // }

                    query_data.customer_id = customer_id;
                    let burn_point = query_data['debit_points'];

                    let debit_point_data = {
                        customer_id: customer_id,
                        debit_points: burn_point,
                        description: activityResult[0]['description'],
                        tenant_id: query_data['tenant_id'],
                        transaction_label: 'Points Debited',
                        activity_id: query_data['activity_id'],
                        activity_name: query_data['activity_name'],
                        language_code: query_data['language_code']
                    }
                    this.debit_points(debit_point_data, async (point_debit) => {
                        if (point_debit.status == true) {

                            let debit_point_data = {
                                transaction_id: point_debit['values']['transaction_id'],
                                fcm_token: custDetails['values']['fcm_token'],

                            }
                            delete query_data['lock_point_id'];
                            query_data['points'] = burn_point;
                            query_data['payment_method'] = "point";
                            delete query_data['debit_points'];
                            delete query_data['tp_application_key'];
                            query_data['transaction_id'] = point_debit['values']['transaction_id'];
                            if (point_debit) {
                                delete query_data['tenant_id'];
                                query_data['activity'] = query_data['activity_name'];
                                delete query_data['activity_name'];
                                query_data['transaction_type'] = 'debit';
                                query_data['opening_balance'] = point_debit['values']['opening_balance'];
                                query_data['closing_balance'] = parseInt(point_debit['values']['opening_balance']) - parseInt(burn_point);
                                query_data['transaction_date'] = new Date();
                                query_data['title'] = activityResult[0]['title'] ? activityResult[0]['title'] : '-';
                                query_data['description'] = activityResult[0]['description'] ? activityResult[0]['description'] : '-';
                                let trxn_res;
                                try {
                                    trxn_res = await knex("customer_transaction").insert(query_data);

                                    let trxn_lang_data = {
                                        title: activityResult[0]['title'] ? activityResult[0]['title'] : '-',
                                        description: activityResult[0]['description'] ? activityResult[0]['description'] : '-',
                                        language_code: language_code,
                                        transaction_id: point_debit['values']['transaction_id'],
                                        transaction_table_id: trxn_res[0]
                                    };

                                    await knex("transaction_languages").insert(trxn_lang_data);

                                    let profile_report_data = {
                                        current_balance: query_data['closing_balance'],
                                        redeemed_points: knex.raw(" redeemed_points + " + burn_point),
                                        last_transaction_date: query_data['transaction_date']
                                    };

                                    await knex("customer_profile_report").update(profile_report_data).where('customer_id', customer_id);

                                    let customer_data = await knex('customers').select('*').where('id', customer_id);

                                    let transaction_report_data = {
                                        customer_id: customer_id,
                                        first_name: customer_data[0]['first_name'],
                                        last_name: customer_data[0]['last_name'],
                                        email: customer_data[0]['email'],
                                        phone: customer_data[0]['phone'],
                                        points: burn_point,
                                        activity_type: activityResult[0]['name'],
                                        transaction_id: query_data['transaction_id'],
                                        transaction_date: query_data['transaction_date'],
                                        transaction_type: query_data['transaction_type'],
                                        opening_balance: point_debit['values']['opening_balance'],
                                        closing_balance: parseInt(point_debit['values']['opening_balance']) - parseInt(burn_point),
                                        membership_no: customer_data[0]['membership_no'],
                                        country_code: customer_data[0]['country_code'],
                                        activity_id: activityResult[0]['id'],
                                    };

                                    await knex("customer_transaction_report").insert(transaction_report_data);

                                    await knex.raw("CALL updatePointOverallReport(?,?)", ['ttl_used_pts', Number(burn_point)]);

                                } catch (e) {
                                    console.log('Error : ', e);
                                }
                                //Send Email
                                let col = {
                                    f_name: knex.raw("CAST(AES_DECRYPT(customers.first_name,'rainbowfinance') AS CHAR(255))"),
                                    l_name: knex.raw("CAST(AES_DECRYPT(customers.last_name,'rainbowfinance') AS CHAR(255))"),
                                    email: knex.raw("CAST(AES_DECRYPT(customers.email,'rainbowfinance') AS CHAR(255))"),
                                    fcm_token: "customers.fcm_token"
                                };
                                cust_info = await knex.select(col)
                                    .where("id", customer_id)
                                    .table('customers')
                                let email_columns = { subject: 'languages_for_email_templates.subject', body: 'languages_for_email_templates.body' };
                                let email_template_data_array = await knex('languages_for_email_templates')
                                    .select(email_columns)
                                    .innerJoin('email_templates', 'email_templates.id', '=', 'languages_for_email_templates.email_template_id')
                                    .innerJoin('email_template_activities', function () {
                                        this.on('email_template_activities.email_template_id', '=', 'email_templates.id')
                                            .andOn('email_template_activities.status', '=', 1)
                                    })
                                    .innerJoin('master_api_permission_modules', function () {
                                        this.on('master_api_permission_modules.name', '=', knex.raw("'point transaction success'"))
                                            .andOn('master_api_permission_modules.id', '=', 'email_template_activities.activity_id')
                                            .andOn('master_api_permission_modules.status', '=', 1)
                                    })
                                    .where('language_code', language_code)
                                    .where('email_templates.status', 1)

                                if (email_template_data_array.length > 0) {
                                    let email_data = {
                                        trxnType: 'Redeemed',
                                        Username: cust_info[0]['f_name'] + " " + cust_info[0]['l_name'],
                                        merchant: '',
                                        time: new Date().toLocaleTimeString(),
                                        transactionID: point_debit['values']['transaction_id'],
                                        amount: '',
                                        points: burn_point,
                                        openingBal: point_debit['values']['opening_balance'],
                                        closingBal: parseInt(point_debit['values']['opening_balance']) - parseInt(burn_point),
                                    };

                                    for (let i = 0; i < email_template_data_array.length; i++) {
                                        let email_body = responseHandler.find_and_replace(email_template_data_array[i]['body'], email_data);

                                        let email_info = {};
                                        email_info = {
                                            'email': cust_info[0]['email'],
                                            'email_body': email_body,
                                            'email_subject': email_template_data_array[i]['subject'],
                                            'sender_user_type': 'tenant',
                                            'sender_user_id': tenant_id,
                                        };

                                        await send_mail.sending_mail(email_info, (emailResult) => {
                                            if (emailResult.status) {
                                                console.log('Email Sent !')
                                            }
                                        });
                                    }
                                }

                                if (trxn_res.length == 0) {
                                    return callback(response_adapter.response_error(false, status_codes.user_burn_point_failed, messages[language_code].user_burn_point_failed));
                                } else {
                                    let data = {
                                        points: debit_points,
                                        vouchers: "Testing",
                                        email: custDetails['values'].email,
                                        phone: custDetails['values'].phone,
                                        fcm_token: custDetails['values'].fcm_token,
                                        customer_id: custDetails['values'].customer_id
                                    }
                                    return callback(response_adapter.response_success(true, status_codes.user_burn_point_success, messages[language_code].user_burn_point_success, data));
                                }
                            }
                            else {
                                return callback(response_adapter.response_error(false, status_codes.user_burn_point_failed, messages[language_code].user_burn_point_failed));
                            }
                        } else {
                            return callback(response_adapter.response_error(false, status_codes.insufficient_point, messages.insufficient_point));
                        }
                    });
                }
            } else return callback(userResponse.failed('type_error'));
        }
        else {
            let errors = validation.errors.errors;
            return callback(response_adapter.response_error(false, status_codes.user_redeem_update_failed, messages.user_redeem_update_failed, errors));
        }
    }

    /** Lock User Point Method
     *  Author :
     * @param {*} query_data 
     * @param {*} callback 
     */
    async lockCCUserPoint(query_data, callback) {
        let data = {};
        let return_result = {};
        Object.assign(data, query_data);
        let form_data = {};
        delete data.cc_token;

        let rules = {
            customer_id: "required",
            lock_point: "required",
            lock_point_reason: "required",
            activity: 'required',
            // type: "required"
        };

        let language_code = query_data['lang_code'];
        if (language_code == "" || language_code == null || language_code == undefined) {
            let data = await defaultLanguage.getDefaultLanguage();
            language_code = (data.length > 0) ? data[0].language_code : "EN";
        }
        delete data['lang_code'];
        delete data['language_code'];

        let customerId = {
            customer_id: query_data.customer_id
        }
        let validation = new Validator(query_data, rules);
        if (validation.passes() && !validation.fails()) {
            query_data.type = 'parent';
            if (userValidator.checkType(query_data.type)) {
                let custDetails = await userModuleService.getCustomerPK(customerId, query_data.type);
                delete query_data.type;
                delete data.type;

                if (custDetails.status == false) {
                    return callback(custDetails);
                } else {
                    let burnActivity = await userModuleService.getActivityId(
                        { code: query_data.activity, type: 'redemption' });
                    if (burnActivity.status == false)
                        return callback(burnActivity)
                    else {
                        data.activity_id = burnActivity.values.activity_id;
                        data.activity = burnActivity.values.activity_name;
                    }
                    query_data.customer_id = custDetails.values.customer_id;
                    data.customer_id = custDetails.values.customer_id;
                    this.fetch_customer_points(query_data, (result) => {
                        console.log('Result  ', result)
                        if (result.status == true && result.values.total_points >= query_data.lock_point) {
                            knex("lock_point").insert(data).then((result) => {
                                return_result.lock_point_id = result[0];
                                form_data.lock_point_id = result[0];
                                form_data.cc_token = query_data.cc_token;
                                return knex("tp_lock_point").insert(form_data);
                            }).then((t_result) => {
                                if (t_result.length > 0)
                                    return callback(response_adapter.response_success(true, status_codes.user_lock_point_success, messages[language_code].user_lock_point_success, (return_result)));
                                else
                                    return callback(response_adapter.response_error(false, status_codes.user_lock_point_failed, messages[language_code].user_lock_point_failed));
                            }).catch((err) => callback(common_functions.catch_error(err)));
                        } else {
                            return callback(response_adapter.response_error(false, status_codes.insufficient_point, messages[language_code].insufficient_point));
                        }
                    });
                }
            } else return callback(userResponse.failed('type_error'));
        }
        else {
            let errors = validation.errors.errors;
            return callback(response_adapter.response_error(false, status_codes.user_lock_point_failed, messages[language_code].user_lock_point_failed, errors));
        }
    }


    /** Unlock User Point Method
     *  Author :
     * @param {*} query_data 
     * @param {*} callback 
     */
    async unlockCCUserPoint(query_data, callback) {
        let rules = {
            lock_point_id: "required",
            unlock_reason: "required",
        };

        let language_code = query_data['lang_code'];
        if (language_code == "" || language_code == null || language_code == undefined) {
            let data = await defaultLanguage.getDefaultLanguage();
            language_code = (data.length > 0) ? data[0].language_code : "EN";
        }
        delete query_data['lang_code'];

        let validation = new Validator(query_data, rules);
        if (validation.passes() && !validation.fails()) {
            knex.select('*')
                .from('lock_point')
                .where('lock_point.id', query_data['lock_point_id'])
                .where('lock_point.lock', 0)
                .then((result_data) => {
                    if (result_data.length > 0) {
                        return callback(response_adapter.response_success(true, status_codes.user_point_already_unlock, messages[language_code].user_point_already_unlock));
                    }
                    else {
                        knex("lock_point").update({ 'lock': false, 'unlock_reason': query_data.unlock_reason })
                            .where({ "id": query_data.lock_point_id })
                            .then((result) => {
                                if (result != 0)
                                    return callback(response_adapter.response_success(true, status_codes.user_unlock_point_success, messages[language_code].user_unlock_point_success));
                                else
                                    return callback(response_adapter.response_error(false, status_codes.user_unlock_update_failed, messages[language_code].user_unlock_update_failed));
                            }).catch((err) => callback(common_functions.catch_error(err)));
                    }
                })
        }
        else {
            let errors = validation.errors.errors;
            return callback(response_adapter.response_error(false, status_codes.user_unlock_update_failed, messages[language_code].user_unlock_update_failed, errors));
        }
    }

    /** add Point method
     *  Author :
     * @param {*} form_data 
     * @param {*} callback 
     */
    async add_point_customer(form_data, callback) {
        let data = {};
        Object.assign(data, form_data);
        let rules = {
            'point_type_id': 'required',
            'points': 'required',
            // 'transaction_label': 'required',
            // 'description': 'required',
            'customer_id': 'required',
        };
        let wallet_ledger_data = {
            customer_id: form_data.customer_id,
            // tenant_id: form_data.tenant_id,
            points: form_data.points,
            available_points: form_data.points,
            point_type_id: form_data.point_type_id,
        }
        let point_ledger_data = {
            points: form_data.points,
            activity_id: form_data.activity_id,
            activity_name: form_data.activity_name,
            transaction_type: 'credit',
            transaction_label: form_data.transaction_label,
            description: form_data.description,
        }
        // let transaction_id = uuid.v1();
        let transaction_id = nanoid();

        point_ledger_data['transaction_id'] = transaction_id;
        //Check Validation
        let validation = new Validator(form_data, rules);
        if (validation.passes() && !validation.fails()) {

            let getPointConfig = await global.rule_engine_instance.calculatePointExpiry({ point_type_id: form_data.point_type_id });

            if (!getPointConfig) {
                return callback(response_adapter.response_error(false, status_codes.tier_level_point_configuration_not_found, messages.tier_level_point_configuration_not_found));
            }

            wallet_ledger_data['start_date'] = getPointConfig['start_date'];
            wallet_ledger_data['end_date'] = getPointConfig['end_date'];
            let customer_points;
            knex("wallet_ledger")
                .insert(wallet_ledger_data)
                .then((id) => {
                    point_ledger_data['wallet_ledger_id'] = id;
                    return knex('point_ledger').insert(point_ledger_data);
                }).then(async function (result) {
                    let add_points = {};
                    let balance;
                    customer_points = await knex('cc_account_summary').select('*').where('customer_id', form_data.customer_id);
                    if (customer_points.length == 0) {

                        add_points['point_balance'] = form_data.points;
                        add_points['credit'] = form_data.points;
                        add_points['customer_id'] = form_data.customer_id;
                        balance = 0;

                        await knex('cc_account_summary').insert(add_points).where('customer_id', form_data.customer_id);

                    } else {
                        balance = customer_points[0]['point_balance'] ? customer_points[0]['point_balance'] : 0;
                        add_points['point_balance'] = balance + parseInt(form_data.points);
                        add_points['credit'] = parseInt(customer_points[0]['credit']) + parseInt(form_data.points);

                        await knex('cc_account_summary').update(add_points).where('customer_id', form_data.customer_id);
                    }

                    return callback(response_adapter.response_success(true, status_codes.points_added, messages.points_added, { transaction_id: transaction_id, opening_balance: balance }));
                }).catch((err) => {
                    console.log('Error :', err)
                    return callback(response_adapter.response_error(false, status_codes.failed_to_add_points, messages.failed_to_add_points, err.message));
                });
        } else {
            let errors = validation.errors.errors;
            return callback(response_adapter.response_error(false, status_codes.form_field_reqired, messages.form_field_reqired, errors));
        }
    }



    refundCCTransaction(query_data, callback) {
        let rules = {
            customer_id: "required",
            tp_transaction_id: "required",
            refund_points: "required"
        };

        let column = {
            customer_id: "customer_transaction.customer_id",
            points: "customer_transaction.points",
        };

        let validation = new Validator(query_data, rules);
        if (validation.passes() && !validation.fails()) {
            let form_data = {};
            knex.select(column)
                .where("customer_transaction.tp_transaction_id", query_data["tp_transaction_id"])
                .where("customer_transaction.customer_id", query_data["customer_id"])
                .from("customer_transaction")
                .then((result) => {
                    if (result.length > 0) {
                        form_data['tenant_id'] = query_data['tenant_id'];
                        form_data['points'] = query_data['refund_points'];
                        form_data['description'] = query_data['description'];
                        form_data['transaction_type'] = "credit";
                        form_data['customer_id'] = result[0].customer_id;
                        form_data['transaction_label'] = query_data['description'];
                        if (result[0].points < query_data['refund_points'])
                            return callback(response_adapter.response_error(false, status_codes.user_refund_points_less_than_transaction_points, messages.user_refund_points_less_than_transaction_points));
                        knex.select('*')
                            .from('customer_refunds_points')
                            .where('customer_refunds_points.tp_transaction_id', query_data['tp_transaction_id'])
                            .where('customer_refunds_points.customer_id', form_data['customer_id'])
                            .then((result_data) => {
                                if (result_data.length > 0) {
                                    return callback(response_adapter.response_error(false, status_codes.user_point_refund_already, messages.user_point_refund_already));
                                }
                                else {
                                    knex.select("id").from("master_point_type").limit(1).then((point_type) => {
                                        form_data['point_type_id'] = point_type[0].id;

                                        this.add_point_customer(form_data, (credit_point_result) => {
                                            form_data['refunds_reason'] = query_data['description'];
                                            form_data['tp_transaction_id'] = query_data['tp_transaction_id'];
                                            delete form_data.description;
                                            delete form_data.transaction_type;
                                            delete form_data.tenant_id;
                                            delete form_data.point_type_id;
                                            delete form_data.transaction_label;

                                            if (credit_point_result.status == true) {
                                                return knex("customer_refunds_points").insert(form_data).then((t_result) => {
                                                    if (t_result.length > 0) {
                                                        return callback(response_adapter.response_success(true, status_codes.user_point_refunded_success, messages.user_point_refunded_success));
                                                    } else {
                                                        return callback(response_adapter.response_error(false, status_codes.user_point_refund_failed, messages.user_point_refund_failed));
                                                    }
                                                }).catch((err) => callback(common_functions.catch_error(err)));
                                            }
                                        })
                                    })
                                }
                            }).catch((err) => callback(common_functions.catch_error(err)));
                    } else {
                        return callback(response_adapter.response_error(false, status_codes.user_point_required_transaction_id_for_refund, messages.user_point_required_transaction_id_for_refund));
                    }
                }).catch((err) => callback(common_functions.catch_error(err)));
        }
        else {
            let errors = validation.errors.errors;
            return callback(response_adapter.response_error(false, status_codes.user_profile_fetch_failed, messages.user_profile_fetch_failed, errors));
        }
    }

    /** Buy Point Method
     *  Author :
     * @param {*} form_data 
     * @param {*} callback 
     */
    buyCCUserPoint(form_data, callback) {
        let return_result = {};

        let rules = {
            customer_id: "required",
            points: "required",
            description: "required",
        };

        let validation = new Validator(form_data, rules);
        if (validation.passes() && !validation.fails()) {
            knex.select()
                .where("status", 1)
                .where("settings_name", 'default_point_type_setting')
                .where("tenant_id", form_data['tenant_id'])
                .table('tenant_settings')
                .then((setting_result) => {
                    if (setting_result.length > 0) {
                        form_data['point_type_id'] = setting_result[0]['data'];
                        form_data['transaction_label'] = form_data.description;

                        this.add_point_customer(form_data, (credit_point_result) => {
                            if (credit_point_result.status) {
                                delete form_data.transaction_label;
                                delete form_data.point_type_id;
                                delete form_data.tp_application_key;
                                form_data.transaction_id = credit_point_result.values.transaction_id
                                knex("customer_transaction").insert(form_data).then((t_result) => {
                                    return callback(response_adapter.response_success(true, status_codes.user_point_brought_success, messages.user_point_brought_success));
                                });
                            } else {
                                return callback(response_adapter.response_error(false, status_codes.user_point_buying_failed, messages.user_point_buying_failed));
                            }
                        })
                    } else {
                        knex.select("id").from("master_point_type")
                            .where('tenant_id', form_data.tenant_id)
                            .limit(1)
                            .orderBy('id', 'asc')
                            .then((point_type) => {
                                if (point_type.length > 0) {
                                    form_data['point_type_id'] = point_type[0].id;
                                    form_data['transaction_label'] = form_data.description;

                                    this.add_point_customer(form_data, (credit_point_result) => {

                                        if (credit_point_result.status) {
                                            delete form_data.transaction_label;
                                            delete form_data.point_type_id;
                                            delete form_data.tp_application_key;
                                            form_data.transaction_id = credit_point_result.values.transaction_id
                                            knex("customer_transaction").insert(form_data).then((t_result) => {
                                                return callback(response_adapter.response_success(true, status_codes.user_point_brought_success, messages.user_point_brought_success));
                                            });
                                        } else {
                                            return callback(response_adapter.response_error(false, status_codes.user_point_buying_failed, messages.user_point_buying_failed));
                                        }
                                    })
                                }
                            })
                    }
                }).catch((err) => {
                    return callback(response_adapter.response_error(false, status_codes.user_point_buying_failed, messages.user_point_buying_failed, err.message));
                });
        }
        else {
            let errors = validation.errors.errors;
            return callback(response_adapter.response_error(false, status_codes.form_field_reqired, messages.form_field_reqired, errors));
        }
    }

    async reversePoints(form_data, callback) {
        let rules = {
            customer_id: "required",
            transaction_id: "required",
        };

        let language_code = form_data['lang_code'];
        if (language_code == "" || language_code == null || language_code == undefined) {
            let data = await defaultLanguage.getDefaultLanguage();
            language_code = (data.length > 0) ? data[0]['language_code'] : "EN";
        }
        delete form_data['language_code'];

        let validation = new Validator(form_data, rules);
        if (validation.passes() && !validation.fails()) {

            let column = {
                customer_id: "customer_transaction.customer_id",
                points: "customer_transaction.points",
                refunded: knex.raw("case when customer_transaction.point_label = 'refund' then 1 else 0 end")
            };
            knex.select(column)
                .where("customer_transaction.transaction_id", form_data["transaction_id"])
                .where("customer_transaction.customer_id", form_data["customer_id"])
                .from("customer_transaction")
                .then(async (result) => {
                    if (result.length > 0) {
                        if (result[0]['refunded'] == 1) {
                            return callback(response_adapter.response_error(false, status_codes.user_point_refund_already, messages.user_point_refund_already));
                        } else {

                            let activityResult;
                            let activity_columns = {
                                id: 'master_activity.id',
                                name: 'master_activity.name',
                                code: 'master_activity.code',
                                title: 'activity_languages.title',
                                description: 'activity_languages.description'
                            };
                            try {
                                activityResult = await knex.select(activity_columns)
                                    .from('master_activity')
                                    .innerJoin('activity_languages', 'activity_languages.activity_id', '=', 'master_activity.id')
                                    .where('code', form_data['activity_code'])
                                    .where('activity_type', 'accrual')
                                    .where('activity_languages.language_code', language_code);
                            } catch (e) {
                                console.log('Error : ', e)
                            }

                            let setting_result = await knex.select('*')
                                .where("status", 1)
                                .where("settings_name", 'default_point_type_setting')
                                .table('tenant_settings');
                            if (setting_result.length > 0)
                                form_data['point_type_id'] = setting_result[0]['data'];

                            form_data['tenant_id'] = form_data['tenant_id'];
                            form_data['points'] = result[0]['points'];
                            form_data['transaction_type'] = "credit";
                            form_data['customer_id'] = result[0]['customer_id'];
                            form_data['transaction_label'] = activityResult[0]['description'];
                            form_data['activity_name'] = activityResult[0]['name'];

                            this.add_point_customer(form_data, async (credit_point_result) => {
                                if (credit_point_result.status == true) {
                                    let cust_data = {
                                        title: activityResult[0]['title'],
                                        payment_method: 'Point',
                                        points: form_data['points'],
                                        transaction_type: 'credit',
                                        customer_id: form_data['customer_id'],
                                        transaction_id: credit_point_result['values']['transaction_id'],
                                        transaction_status: 'approved',
                                        activity_id: activityResult[0]['id'],
                                        activity: activityResult[0]['name'],
                                        point_label: 'refund',
                                        opening_balance: credit_point_result['values']['opening_balance'],
                                        closing_balance: parseInt(credit_point_result['values']['opening_balance']) + parseInt(form_data['points']),
                                        transaction_date: new Date(),
                                        description: activityResult[0]['description']
                                    }

                                    try {
                                        await knex("customer_transaction")
                                            .update({ point_label: 'refund' })
                                            .where("customer_transaction.transaction_id", credit_point_result['values']['transaction_id'])
                                            .where("customer_transaction.customer_id", form_data["customer_id"]);

                                        let trxn_result = await knex("customer_transaction").insert(cust_data);

                                        let trxn_lang_data = {
                                            title: activityResult[0]['title'],
                                            description: activityResult[0]['description'],
                                            language_code: language_code,
                                            transaction_id: credit_point_result['values']['transaction_id'],
                                            transaction_table_id: trxn_result[0]
                                        };

                                        await knex("transaction_languages").insert(trxn_lang_data);

                                        let profile_report_data = {
                                            current_balance: parseInt(credit_point_result['values']['opening_balance']) + parseInt(form_data['points']),
                                            earned_points: knex.raw(" earned_points + " + form_data['points']),
                                            last_transaction_date: cust_data['transaction_date']
                                        };

                                        await knex("customer_profile_report").update(profile_report_data).where('customer_id', form_data['customer_id']);

                                        let customer_data = await knex('customers').select('*').where('id', form_data['customer_id']);

                                        let transaction_report_data = {
                                            customer_id: form_data['customer_id'],
                                            first_name: customer_data[0]['first_name'],
                                            last_name: customer_data[0]['last_name'],
                                            email: customer_data[0]['email'],
                                            phone: customer_data[0]['phone'],
                                            points: form_data['points'],
                                            activity_type: activityResult[0]['name'],
                                            transaction_id: credit_point_result['values']['transaction_id'],
                                            transaction_date: cust_data['transaction_date'],
                                            transaction_type: cust_data['transaction_type'],
                                            opening_balance: credit_point_result['values']['opening_balance'],
                                            closing_balance: parseInt(credit_point_result['values']['opening_balance']) + parseInt(form_data['points']),
                                            membership_no: customer_data[0]['membership_no'],
                                            country_code: customer_data[0]['country_code'],
                                            activity_id: activityResult[0]['id'],
                                        };

                                        await knex("customer_transaction_report").insert(transaction_report_data);

                                        await knex.raw("CALL updatePointOverallReport(?,?)", ['ttl_num_of_normal_pts', Number(form_data['points'])]);

                                    } catch (e) {
                                        console.log('Error : ', e);
                                    }
                                    return callback(response_adapter.response_success(true, status_codes.user_point_refunded_success, messages.user_point_refunded_success, { transaction_id: credit_point_result['values']['transaction_id'] }));
                                } else {
                                    return callback(credit_point_result);
                                }

                            }).catch(function (err) {
                                callback(response_adapter.response_error(false, status_codes.user_point_refund_failed, messages.user_point_refund_failed, err.message));
                            });
                        }
                    }
                }).catch(function (err) {
                    callback(response_adapter.response_error(false, status_codes.user_point_refund_failed, messages.user_point_refund_failed, err.message));
                });
        } else {
            let errors = validation.errors.errors;
            return callback(response_adapter.response_error(false, status_codes.user_profile_fetch_failed, messages.user_profile_fetch_failed, errors));
        }
    }
}