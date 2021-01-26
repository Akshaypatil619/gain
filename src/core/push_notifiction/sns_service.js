// var AWS = require('aws-sdk');
var Promise = require('promise');
module.exports = class Push_notification_model {
    
    
    configureSNS_SDK(data) {
        AWS.config.update({
            accessKeyId: data.accessKeyId,
            secretAccessKey: data.secretAccessKey
        });
        AWS.config.region = 'us-east-1';
        return AWS;
    };

    createPlatfrom(data, platformName) {
        this.configureSNS_SDK(data);
        return new Promise(function (resolve, reject) {
            const sns = new AWS.SNS();
            var params = {
                Name: platformName.replace(' ', '_'),
                Platform: "GCM",
                Attributes: {
                    PlatformCredential: data.PlatformCredential
                }
            };

            /*
                Create PlatformApplication Where you can register users mobile endpoints .
            */
            sns.createPlatformApplication(params, function (err, data) {
                if (err) {
                    reject(err);
                } else {
                    resolve(data.PlatformApplicationArn);
                    // retrive PlatformApplicationArn
                }
            });
        });
    };

    createGlobalTopic(data, topicName) {
        this.configureSNS_SDK(data);
        return new Promise(function (resolve, reject) {
            const sns = new AWS.SNS();
            var params = {
                Name: topicName.replace(' ', '_') /* required */
            };
            sns.createTopic(params, function (error, data) {
                if (error) {
                    reject(error);
                } else {
                    resolve(data.TopicArn);
                }
            });
        });
    }

    createUserEndPoint(providerData, topicData, userData, callback) {
        // createPlatfrom(providerData).then((PlatformApplicationArn) => {
        this.configureSNS_SDK(providerData.data);
        var PlatformApplicationArn;
        if (userData['device_type'].toLowerCase() == 'ios') {
            PlatformApplicationArn = providerData.data.iosPlatformApplicationArn
        } else {
            PlatformApplicationArn = providerData.data.androidPlatformApplicationArn
        }
        const sns = new AWS.SNS();
        var params = {
            PlatformApplicationArn: PlatformApplicationArn,
            Token: userData['device_id'], // every phone is given token when phone download and register to your app.   STRING
            CustomUserData: userData['customer_id'].toString(), // you can write any thing about user so that you can identify him
        };
        sns.createPlatformEndpoint(params, function (err, endpointData) {
            if (err) {
                return callback({
                    status: false,
                    data: err
                });
            } else {
                sns.subscribe({
                    Protocol: 'application',
                    TopicArn: topicData['topic_arn'],
                    Endpoint: endpointData.EndpointArn
                }, function (err, subscriptionIds) {
                    if (err) {
                        return callback({
                            staus: false,
                            data: err
                        });
                    } else {
                        return callback({
                            status: true,
                            data: endpointData.EndpointArn
                        });
                    }
                });
            }
        });
        // });
    }

    sendNotification(providerData, userData, notificationData, callback) {
       
        this.configureSNS_SDK(providerData.data);
        const sns = new AWS.SNS();
        // console.log(sns);
        var payload = {
            default: '',
            GCM: {
                notification: {
                    title: notificationData['title'],
                    body: notificationData['body'],
                    click_action: notificationData['click_action']
                },
                data: {
                    // source: 'Hardik'
                }
            },
            APNS_SANDBOX: {
                aps: {
                    alert: notificationData['body']
                    // alert: JSON.stringify({
                    //     title: notificationData['title'],
                    //     body: notificationData['body']
                    // })
                }
            }

        };
        payload.GCM = JSON.stringify(payload.GCM);
        payload.APNS_SANDBOX = JSON.stringify(payload.APNS_SANDBOX);
        payload = JSON.stringify(payload);
        var params = {
            Message: payload,
            MessageStructure: 'json',
            TargetArn: userData['end_point']
            // TopicArn: userData['topicArn']
        };
        sns.publish(params, function (err, data) {
            if (err) {
                return callback({
                    status: false,
                    data: err
                });
            } else {
                // res.send(data);
                return callback({
                    status: true,
                    data: data
                });
            }
        });
    }

    deleteUserEndpoint(providerData, userData, callback) {
        this.configureSNS_SDK(providerData.data);
        var PlatformApplicationArn;
        if (userData['device_type'].toLowerCase() == 'ios') {
            PlatformApplicationArn = providerData.data.iosPlatformApplicationArn
        } else {
            PlatformApplicationArn = providerData.data.androidPlatformApplicationArn
        }
        const sns = new AWS.SNS();
        var endPointArn = {EndpointArn: userData['end_point']}
        sns.deleteEndpoint(endPointArn, function(error, data) {
            if(error) {
                // console.log(error);
                return callback({
                    status: false,
                    data: error
                });
            } else {
                return callback({
                    status: true,
                    data: data
                });
            }
        });
    }

};