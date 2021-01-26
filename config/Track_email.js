/* ------------------------ Load Libraries------------------------ */
let Imap = require('imap');
let inspect = require('util').inspect;

/* ------------------------ Load Files------------------------ */
let knex = require("./knex");

module.exports = class Track_email {
    constructor() {
    }

    check_email_status() {
        knex("track_email")
            .select({
                "messageIds": knex.raw("GROUP_CONCAT(messageId)"),
                "email_provider": "track_email.email_provider",
            })
            .where({
                track_code: 0
            })
            .groupBy("email_provider")
            .then((track_email_result) => {
                if (track_email_result.length > 0) {
                    for (let i = 0; i < track_email_result.length; i++) {
                        let email_provider;
                        try {
                            email_provider = JSON.parse(track_email_result[i].email_provider);
                            if (email_provider.host === 'smtp.sendgrid.net') {
                                console.log("Sendgrid Tracking");
                            }
                            else {
                                let email_message_ids = [];
                                let fetchMessageIds = track_email_result[i].messageIds.split(",");
                                // console.log("SMTP Tracking");
                                // console.log({
                                //     user: email_provider.username,
                                //     password: email_provider.password,
                                //     host: email_provider.incoming_host,
                                //     port: email_provider.incoming_port,
                                //     tls: true
                                // });
                                let imap_data = {
                                    user: email_provider.username,
                                    password: email_provider.password,
                                    host: email_provider.incoming_host,
                                    port: email_provider.incoming_port,
                                    tls: true
                                };
                                let imap = new Imap(imap_data);

                                imap.once('error', function (err) {
                                    console.log("Connection Failed");
                                });

                                imap.once('ready', function () {
                                    function openInbox(cb) {
                                        imap.openBox('INBOX', true, cb);
                                    }

                                    openInbox(function (err, box) {
                                        if (err) throw err;
                                        imap.search(['UNSEEN', ['SINCE', 'September 06, 2018'],
                                            ['HEADER', 'SUBJECT', 'Delivery Status Notification (Failure)']
                                        ], function (err, results) {
                                            console.log("---results----", results);
                                            let f = imap.fetch(results, {
                                                // markSeen: true,
                                                bodies: 'HEADER.FIELDS (FROM TO SUBJECT DATE)',
                                                struct: true
                                            });
                                            f.on('message', function (msg, seqno) {
                                                console.log('Message #%d', seqno);
                                                let prefix = '(#' + seqno + ') ';
                                                msg.on('body', function (stream, info) {
                                                    let buffer = '';
                                                    stream.on('data', function (chunk) {
                                                        buffer += chunk.toString('utf8');
                                                    });
                                                    stream.once('end', function () {
                                                        console.log(prefix + 'Parsed header: %s', inspect(Imap.parseHeader(buffer)));
                                                    });
                                                });
                                                msg.once('attributes', function (attrs) {
                                                    let msg = attrs;
                                                    msg.struct.forEach(function (ele) {
                                                        if (ele[0] && ele[0].envelope) {
                                                            console.log("BK-----------", ele[0].envelope);
                                                            email_message_ids.push(ele[0].envelope.messageId);
                                                            console.log("---ele[0].envelope----", ele[0].envelope.messageId);
                                                        }
                                                    });
                                                    let uid = attrs.uid;
                                                    imap.addFlags(uid, ['\\Seen'], function (err) {
                                                        if (err) {
                                                            console.log(err);
                                                        } else {
                                                            console.log("Marked as read!")
                                                        }
                                                    });
                                                    console.log(prefix + 'Attributes: %s',);
                                                });
                                                msg.once('end', function () {
                                                    console.log(prefix + 'Finished');
                                                });
                                            });
                                            f.once('error', function (err) {
                                                console.log('Fetch error: ' + err);
                                            });
                                            f.once('end', function () {
                                                console.log('Done fetching all messages!');
                                                imap.end();
                                            });
                                        });
                                    });
                                });
                                imap.once('end', function () {
                                    knex("track_email")
                                        .whereIn("messageId", email_message_ids)
                                        .update({
                                            track_code: 2
                                        })
                                        .then((result) => {
                                            console.log("Track Email Status Result stored");
                                            for (let ind = 0; ind < email_message_ids.length; ind++) {
                                                let index = fetchMessageIds.indexOf(email_message_ids[ind]);
                                                if (index > -1) {
                                                    fetchMessageIds.splice(index, 1);
                                                }
                                            }
                                            if (fetchMessageIds.length > 0) {
                                                return knex("track_email")
                                                    .whereIn("messageId", fetchMessageIds)
                                                    .update({
                                                        track_code: 1
                                                    })
                                            }
                                            console.log(fetchMessageIds);
                                        })
                                        .then((result) => {
                                        })
                                        .catch((err) => console.log(err));
                                });
                                imap.connect();
                            }
                            // console.log(track_email_result[i].messageIds);
                        } catch (e) {
                            console.log("Email provider is not found.")
                        }
                    }
                } else {
                    console.log("All Emails Tracked");
                }
            }).catch((err) => console.log(err));
    }

};