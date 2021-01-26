// let messages = require("../../config/messages.js");
let messages = require("../../../config/messages.js");
let status_codes = require("../../../config/response_status_codes.js");
let knex = require("../../../config/knex.js");

let CommonFunctions = require("../common_functions");
let common_functions = new CommonFunctions();

let SNS = require("../push_notifiction/sns_service");
let sns = new SNS();

let Push_notification_common_functions = require("../push_notifiction/common_push_notification_function");
let push_notification_common_functions = new Push_notification_common_functions();
let Response_adapter = require("../response_adapter");
let response = new Response_adapter();
module.exports = class SNS_model {
    constructor(){
    }
    add_SNS_provider(query_data, callback) {
        knex("tenants").select('*').where("id", query_data['tenant_id']).then((tenantResult) => {
            sns.createPlatfrom(query_data.data, query_data['platform_name']).then(function (success) {
                query_data.data['androidPlatformApplicationArn'] = success;
                var newData = query_data;
                // delete query_data['data'];
                newData['data'] = JSON.stringify(newData.data);
              knex.select("*").table("push_notification_providers")
                    .where('tenant_id', query_data['tenant_id'])
                    .then(function (result) {
                        if (result.length == 0) {
                            knex("push_notification_providers").insert(query_data).then((id) => {
                                // knex.select('*').table('tenants').where('id', query_data['tenant_id']).then((tenantData) => {
                                sns.createGlobalTopic(query_data.data, query_data['platform_name']).then(function (success) {
                                    let topicObj = {
                                        name: query_data['platform_name'],
                                        topic_arn: success,
                                        tenant_id: tenantResult[0]['id'],
                                        type: 'global',
                                    }
                                    knex("push_notification_topics").update({
                                        status: false
                                    }).where("tenant_id", tenantResult[0]['id']).where("type", 'global').then((updated) => {
                                        knex("push_notification_topics").insert(topicObj).then((result) => {
                                            return callback(response.response_success(true, status_codes.data_insert_success, messages.data_insert_success, result));
                                        }).catch((error) => {
                                            return callback(response.response_success(false, status_codes.data_insert_failed, messages.data_insert_failed, error.message));
                                        });
                                    }).catch((error) => {
                                        return callback(response.response_error(false, status_codes.push_notification_topic_reset_fail, messages.push_notification_topic_reset_fail, error));
                                    });

                                }).catch(function (error) {
                                    console.log(error);
                                });
                                // }).catch((error) => {
                                //     console.log(error);
                                // });
                            }).catch((err) => {
                                return callback(response.response_error(false, status_codes.data_insert_failed, messages.data_insert_failed, err.message));
                            });
                        } else {
                            knex("push_notification_providers").where('tenant_id', query_data['tenant_id']).update(query_data).then((id) => {
                                sns.createGlobalTopic(query_data.data, query_data['platform_name']).then(function (success) {
                                    let topicObj = {
                                        name: query_data['platform_name'],
                                        topic_arn: success,
                                        tenant_id: tenantResult[0]['id'],
                                        type: 'global',
                                    }
                                    knex("push_notification_topics").update({
                                        status: false
                                    }).where("tenant_id", tenantResult[0]['id']).where("type", 'global').then((updated) => {
                                        knex("push_notification_topics").insert(topicObj).then((result) => {
                                            return callback(response.response_success(true, status_codes.data_insert_success, messages.data_insert_success, result));
                                        }).catch((error) => {
                                            return callback(response.response_success(false, status_codes.data_insert_failed, messages.data_insert_failed, error.message));
                                        });
                                    }).catch((error) => {
                                        return callback(response.response_error(false, status_codes.push_notification_topic_reset_fail, messages.push_notification_topic_reset_fail, error));
                                    });
                                }).catch(function (error) {
                                    return callback(response.response_error(false, status_codes.push_notification_provider_update_fail, messages.push_notification_provider_update_fail, error));
                                });
                            }).catch((err) => {
                                return callback(response.response_error(false, status_codes.data_update_failed, messages.data_update_failed, err.message));
                            });
                        }
                    }).catch(function (err) {
                        return callback(response.response_error(false, status_codes.data_insert_failed, messages.data_insert_failed, err.message));
                    });
            }).catch(function (error) {
                console.log(error);
            });
        }).catch((error) => {
            return callback(response.response_error(false, status_codes.tenants_not_found, messages.tenants_not_found, error))
        });
    }

    broadcast_notification(providerData, body_data, callback) {
        push_notification_common_functions.get_notification_default_topic(body_data['tenant_id'], (topicData) => {
            if (topicData.status) {
                if (topicData.data.length > 0) {
                    sns.sendNotification(providerData.data[0], topicData.data[0], body_data, function (snsResponse) {
                        if (snsResponse.status) {
                            return callback(response.response_success(true, status_codes.push_notification_send, messages.push_notification_send, snsResponse.data));
                        } else {
                            return callback(response.response_error(false, status_codes.push_notification_send_fail, messages.push_notification_send_fail, snsResponse.data));
                        }
                    });
                } else {
                    return callback(response.response_error(false, status_codes.push_notification_topic_not_found, messages.push_notification_topic_not_found));
                }
            } else {
                callback(common_functions.catch_error(topicData.data));
            }
        });
    }

    send_notification(providerData, body_data, callback) {
        push_notification_common_functions.get_customer_data({
            tenant_id: body_data['tenant_id'],
            customer_id: body_data['customer_id']
        }, (userData) => {
            if (userData.status) {
                if (userData.data.length > 0) {
                    if (userData.data['end_pint'] != null || userData.data['end_pint'] != '') {
                        // push_notification_common_functions.insert_notification_history({
                        //         tenant_id: body_data['tenant_id'],
                        //         title: body_data['title'],
                        //         body: body_data['body'],
                        //         screen_to_redirect: body_data['redirectURL'],
                        //         image: body_data['image'],
                        //         type: 'custom',
                        //         destination: userData.data['end_pint']
                        // }, (result)=> {

                        // })
                        sns.sendNotification(providerData.data[0], userData.data[0], body_data, function (snsResponse) {
                            if (snsResponse.status) {
                                return callback(response.response_success(true, status_codes.push_notification_send, messages.push_notification_send, snsResponse.data));
                            } else {
                                return callback(response.response_error(false, status_codes.push_notification_send_fail, messages.push_notification_send_fail, snsResponse.data));
                            }
                        });
                    } else {
                        return callback(response.response_error(false, status_codes.end_point_not_exicest, messages.end_point_not_exicest, snsResponse.data));
                    }
                } else {
                    return callback(response.response_error(false, status_codes.push_notification_topic_not_found, messages.push_notification_topic_not_found));
                }
            } else {
                callback(common_functions.catch_error(userData.data));
            }
        });
    }

    create_end_point(customerData, body, callback) {
        push_notification_common_functions.get_notification_provider_data(customerData[0].tenant_id, (providerData) => {
            if (providerData.status) {
                if (providerData.data.length > 0) {
                    push_notification_common_functions.get_notification_default_topic(customerData[0].tenant_id, (topicData) => {
                        if (topicData.status) {
                           if (topicData.data.length > 0) {
                                var userData = {
                                    tenant_id: customerData[0].tenant_id,
                                    customer_id: customerData[0].id,
                                    device_id: body['device_id'],
                                    device_type: body['device_type'],
                                };
                                sns.createUserEndPoint(providerData.data[0], topicData.data[0], userData, (creationResult) => {
                                    if (creationResult.status) {
                                        knex("customers").update({
                                                device_id: body['device_id'],
                                                end_point: creationResult.data
                                            }).where("id", body['customer_id'])
                                            .then((updatedData) => {
                                                return callback(response.response_success(true, status_codes.push_notification_endpoint_created, messages.push_notification_endpoint_created, updatedData));
                                            }).catch((error) => {
                                                return callback(common_functions.catch_error(error));
                                            });
                                    } else {
                                        return callback(common_functions.catch_error(creationResult.data))
                                    }
                                });
                            } else {
                                return callback(response.response_error(false, status_codes.push_notification_topic_not_found, messages.push_notification_topic_not_found));
                            }
                        } else {
                            callback(common_functions.catch_error(topicData.data));
                        }
                    });
                } else {
                    return callback(response.response_error(false, status_codes.push_notification_provider_not_found, messages.push_notification_provider_not_found));
                }
            } else {
                callback(common_functions.catch_error(providerData.data));
            }
        });

    }

    delete_end_point(query_data, callback) {
        push_notification_common_functions.get_notification_provider_data(query_data.tenant_id, (providerData) => {
            if (providerData.status) {
                if (providerData.data.length > 0) {
                    // query_data.id?query_data.customer_id = query_data.id :'';

                    knex('customers').select('customers.end_point').where('customers.id', query_data['id']).then((customerData)=> {
                        if(customerData.length > 0 ){
                           query_data['end_point'] = customerData[0]['end_point'];
                            sns.deleteUserEndpoint(providerData.data[0], query_data, (snsResponse)=> {
                                if (snsResponse.status) {
                                    knex('customers').update({'customers.end_point': '', 'device_id': ''}).where('customers.id', query_data['id'])
                                    .then((result)=> {
                                       return callback(response.response_success(true, status_codes.end_point_deleted, messages.end_point_deleted, snsResponse.data));
                                    }).catch((error)=> {
                                        callback(common_functions.catch_error(error));
                                    });
                                } else {
                                    return callback(response.response_error(false, status_codes.delete_end_point_fail, messages.delete_end_point_fail, snsResponse.data));
                                }
                            });
                        } else {
                            return callback(response.response_error(false, status_codes.customer_end_point_not_found, messages.customer_end_point_not_found));
                        }
                    }).catch((error)=> {
                        callback(common_functions.catch_error(error));
                    }); 
                } else {
                    return callback(response.response_error(true, status_codes.push_notification_provider_not_found, messages.push_notification_provider_not_found));
                }
            } else {
                callback(common_functions.catch_error(providerData.data));
            }
        });
    }
};