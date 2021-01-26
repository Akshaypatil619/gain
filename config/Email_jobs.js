/* ------------------------ Load Libraries------------------------ */
let nodemailer = require('nodemailer');

/* ------------------------ Load Files------------------------ */
let knex = require("./knex");

module.exports = class Email_jobs {
    constructor() {
    }

    /* ------------------------ Get Email Provider ------------------------ */
    get_email_provider(email_provider) {
        let find = 0;
        return new Promise((resolve, reject) => {
            /* ------------------------ Get Email Provider of Perticular User ------------------------ */
            knex("email_providers")
                .where({
                    user_type: email_provider.user_type,
                    user_id: email_provider.user_id,
                    id: email_provider.provider_id,
                })
                .then((smtp_result) => {
                    /* ------------------------ Check Email Provider is exist ------------------------ */
                    if (smtp_result.length > 0) {
                        find = 1;
                        /* ------------------------ Pass Email Provider Result to Promise's Resolve ------------------------ */
                        resolve(smtp_result);
                    } else {
                        /* ------------------------ Email Provider not Founded and get default email provider ------------------------ */
                        return knex("email_providers")
                            .where({
                                user_type: email_provider.user_type,
                                user_id: email_provider.user_id,
                                is_set_default: 1
                            });
                    }
                })
                .then((smtp_result) => {
                    /* ------------------------ Check Default Email Provider of User ------------------------ */
                    if (find === 0) {
                        if (smtp_result.length > 0) {
                            /* ------------------------ Pass Email Provider Result to Promise's Resolve ------------------------ */
                            resolve(smtp_result)
                        } else {
                            /* ------------------------ Also Default Email Provider not sets ------------------------ */
                            throw new Error("email_provider_not_found");
                        }
                    }
                })
                .catch((err) => console.log(err));
        });
    }

    /* ------------------------ Preferring Mail For Send ------------------------ */
    async preferring_mails(email_data, callback) {

        let emails = email_data.emails;
        let email_provider = email_data.email_provider;

        /* ------------------------ Get Email Provider Data ------------------------ */
        let emailProvider = await this.get_email_provider(email_provider);
        /* ------------------------ Check Email Provider is found then get values of result ------------------------ */
        if (emailProvider.status === true) {
            emailProvider = emailProvider.values
        }
        /* ------------------------ Convert Email Provider String data to JSON Object ------------------------ */
        let email_provider_data = JSON.parse(emailProvider[0].data);
        let current_class = this;
        let i = 0;
        let step = 0;
        let IntervalAfterCount = 20;

        /* ------------------------ Check Email Provider ------------------------ */
        if (email_provider_data.providers_name.toLowerCase() === "sendgrid") {
            /* ------------------------ Email Provider is Sendgrid ------------------------ */
            let personalizations = [];
            let sendgrid_mail;
            for (; i < emails.length; i++) {
                if (i % IntervalAfterCount === 0 && step !== i / IntervalAfterCount) {
                    break;
                }

                if(i===0){
                    emails[i].email = "fahad.kheratkar@vernost.in"
                }
                if(i===1){
                    emails[i].last_name = "Khatri";
                    emails[i].email = "brijesh.khatri@vernost.in"
                }
                personalizations.push({
                    to: [{email:emails[i].email}],
                    substitutions: {
                        "{{salutation}}": emails[i].salutation,
                        "{{last_name}}": emails[i].last_name
                    },
                    subject:emails[i].email_subject
                });
            }
            sendgrid_mail = {
                personalizations: personalizations,
                from: {
                    "email": "admin@clubclass.in",
                    "name": "ClubClass"
                },
                "reply_to": {
                    "email": "admin@clubclass.in",
                    "name": "ClubClass"
                },
                content: [{
                    "type": "text/html",
                    value: ""
                }]
            };

            var request = require('request');
            request.post({
                "headers": {
                    "content-type": "application/json",
                    Authorization: "Bearer " + email_provider_data.api_key
                },
                url: 'https://api.sendgrid.com/v3/mail/send',
                "body": JSON.stringify(sendgrid_mail)
            }, function (error, response, body) {
                console.log(error);
                console.log(response);
                console.log(body) // Print the google web page.
            });
            // step = i / IntervalAfterCount;
            //
            // let interval = setInterval(function () {
            //     for (; i < emails.length; i++) {
            //         if (i % IntervalAfterCount === 0 && step !== i / IntervalAfterCount) {
            //             break;
            //         }
            //         current_class.mails({
            //             email_provider_data: email_provider_data,
            //             email: emails[i],
            //             transporter: transporter
            //         }, function (result) {
            //             if (result.status === true) {
            //                 let now = new Date();
            //                 knex("email_campaign_sent_status")
            //                     .where("uuid", result.values.uuid)
            //                     .update({
            //                         sent_status: 1,
            //                         sent_date_time: now
            //                     }).then((update_result) => {
            //                     console.log(result.values.uuid + " updated");
            //                 }).catch((err) => console.log(err));
            //             }
            //         });
            //     }
            //     step = i / IntervalAfterCount;
            //     if (i === emails.length) {
            //         clearInterval(interval);
            //     }
            // }, 60000);
        } else {
            /* ------------------------ Email Provider is SMTp ------------------------ */

            /* ------------------------ Create Transport ------------------------ */
            let transportor_data = {
                host: email_provider_data.outgoing_host,
                port: parseInt(email_provider_data.outgoing_port),
                secure: (parseInt(email_provider_data.outgoing_port) === 465), // true for 465, false for other ports
                requiredTLS: (parseInt(email_provider_data.outgoing_port) === 587), // true for 465, false for other ports
                auth: {
                    user: email_provider_data.username, // generated ethereal user
                    pass: email_provider_data.password // generated ethereal password
                }
            };
            let transporter = nodemailer.createTransport(transportor_data);

            /* ------------------------ Verify Mail Transport ------------------------ */
            transporter.verify(function (error, success) {
                if (error) {
                    console.log(error);
                } else {
                    console.log('Server is ready to take our messages');
                    /* ------------------------ Process for Bulk or Single Email sending ------------------------ */
                    for (; i < emails.length; i++) {
                        if (i % IntervalAfterCount === 0 && step !== i / IntervalAfterCount) {
                            break;
                        }
                        current_class.mails({
                            email_provider_data: email_provider_data,
                            email: emails[i],
                            transporter: transporter
                        }, function (result) {
                            // console.log(result);
                            // console.log(result.status == true);
                            if (result.status == true) {
                                try {
                                    let now = new Date();
                                    let query = knex("email_campaign_sent_status")
                                        .where("uuid", result.values.uuid)
                                        .update({
                                            sent_status: 1,
                                            sent_date_time: now
                                        });
                                    query.then((update_result) => {
                                        // console.log(result.values.uuid + " updated");
                                    }).catch((err) => console.log(err));
                                } catch (e) {
                                    console.log(e);
                                }
                            }
                        });
                    }
                    step = i / IntervalAfterCount;

                    let interval = setInterval(function () {
                        for (; i < emails.length; i++) {
                            if (i % IntervalAfterCount === 0 && step !== i / IntervalAfterCount) {
                                break;
                            }
                            current_class.mails({
                                email_provider_data: email_provider_data,
                                email: emails[i],
                                transporter: transporter
                            }, function (result) {
                                if (result.status === true) {
                                    let now = new Date();
                                    knex("email_campaign_sent_status")
                                        .where("uuid", result.values.uuid)
                                        .update({
                                            sent_status: 1,
                                            sent_date_time: now
                                        }).then((update_result) => {
                                        console.log(result.values.uuid + " updated");
                                    }).catch((err) => console.log(err));
                                }
                            });
                        }
                        step = i / IntervalAfterCount;
                        if (i === emails.length) {
                            clearInterval(interval);
                        }
                    }, 60000);

                }
            });
        }
        return;

        return callback({
            status: "success"
        });
    }

    /* ------------------------ Send Mail ------------------------ */
    mails(data, callback) {
        let email_provider_data = data.email_provider_data;
        let email = data.email;
        let transporter = data.transporter;
        /* ------------------------ Set Email Pixel for Tracking ------------------------ */
        email.email_body += "<img src='" + email.base_url + "api/track_email.jpg?_ut=" + email.user_type + "&_ui=" + email.user_id + "&c=" + email.uuid + "' height='1' width='1'>";

        /* ------------------------ Create Mail Optinos ------------------------ */
        let mailOptions = {
            to: email.email,
            from: email.from_address,
            replyTo: "admin@clubclass.in",
            subject: email.email_subject,
            html: email.email_body,
        };

        let current_class = this;

        /* ------------------------ Send Mail with Transport ------------------------ */
        let send_mail_status = transporter.sendMail(mailOptions, function (error, response) {
            /* ------------------------ Check Error ------------------------ */
            if (error) {
                /* ------------------------ Console Error ------------------------ */
                console.log(error);
                /* ------------------------ Return False means error ------------------------ */
                return callback({
                    status: false,
                    error: error,
                    id: email.id
                });
                // return error;
            } else {
                // /* ------------------------ Console response ------------------------ */
                /* ------------------------ Save Email Response ------------------------ */
                current_class.save_response(email, email_provider_data, response);
                /* ------------------------ Return True means Email Sent ------------------------ */
                return callback({
                    status: true,
                    id: email.id,
                    values: email
                });

            }
        });

        // return send_mail_status;
    }

    /* ------------------------ Save Sent Email Response ------------------------ */
    save_response(user_data, smtp_data, response) {
        /* ------------------------ Save Email Response with User data, email provider and Email Response For Tracking ------------------------ */
        knex("track_email")
            .insert({
                user_type: user_data.user_type,
                user_id: user_data.user_id,
                pxl_id: user_data.uuid,
                track_code: 0,
                accepted: response.accepted.toString(),
                rejected: response.rejected.toString(),
                envelopeTime: response.envelopeTime.toString(),
                messageTime: response.messageTime.toString(),
                messageSize: response.messageSize.toString(),
                response: response.response.toString(),
                envelope: JSON.stringify(response.envelope),
                messageId: response.messageId.toString(),
                email_provider: JSON.stringify(smtp_data)
            }, "id")
            .then((insert_id) => {
                // console.log("Track info:" + insert_id);
            })
            .catch((err) => console.log(err));
    }
};