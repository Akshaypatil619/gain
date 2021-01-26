let nodemailer = require('nodemailer');

let config = require("./config.js");
let knex = require("./knex");
let Common_functions = require("../src/core/common_functions");
let Response_adapter = require("../src/core/response_adapter");

let now = new Date();
let common_functions = new Common_functions();
let response = new Response_adapter();
console.log(process.env.NODE_ENV);

let smtpConfig = {
	host: config.smtp_host,
	port: config.smtp_port,
	secure: config.smtp_secure, // true for 465, false for other ports
	auth: {
		user: config.email_user, // generated ethereal user
		pass: config.email_password // generated ethereal password
	}
};

module.exports.sending_gmail = function (data, callback) {
	let transporter = nodemailer.createTransport({
		service: 'gmail',
		// 	host: 'smtp.gmail.com',
		// port: 465,
		auth: {
			// user: "credosyssolutionsindia@gmail.com",
			// pass: "command2112",
			user: "mohd.islam56@gmail.com",
			pass: "Auradeeh@123",
		}
	});
	let mailOptions = {
		from: 'Rainbow <Rainbow>',
		to: data.email,
		subject: data.email_subject,
		html: data.email_body,
	};
	return transporter.sendMail(mailOptions, function (error, info) {
		if (error) {
			console.log("ERROR : ", error);
			callback({
				status: false,
				error: error,
				id: data.id
			});
		} else {
			callback({
				status: true,
				id: data.id,
				values: data
			});
		}
	});
};

module.exports.sending_mail = function (data, callback) {
	get_credentials({
		user_type: data.sender_user_type,
		user_id: data.sender_user_id
	}, function (smtp_config) {
		if (smtp_config.status == true) {
			data.email_body += "<img src='" + data.base_url + "api/track_email.jpg?_ut=" + data.user_type + "&_ui=" + data.user_id + "&c=" + data.uuid + "' height='1' width='1'>";
			// console.log('ffffffffsmtp_config.values', smtp_config.values);
			let transporter = nodemailer.createTransport(smtp_config.values);

			let mailOptions = {
				to: data.email,
				from: 'rainbowrewards@rainbowfinserv.com',
				subject: data.email_subject,
				html: data.email_body,
			};
			transporter.verify(function (error, success) {
				if (error) {
					console.log('Error : ', error);
				} else {
					console.log('Server is ready to take our messages');
				}
			});

			return transporter.sendMail(mailOptions, function (error, response) {
				if (error) {
					console.log(error);
					callback({
						status: false,
						error: error,
						id: data.id
					});
					return error;
				} else {
					save_response(response);
					callback({
						status: true,
						id: data.id,
						values: data
					});
					return true;
				}
			});
		}
	});
};

module.exports.sending = function (data, callback) {
	const sgMail = require('@sendgrid/mail');
	sgMail.setApiKey(config.sendgrid_api_key);
	const msg = {
		to: data.email,
		from: config.from_email,//'ClubClass <admin@clubclass.in>',
		bcc: config.bcc,
		subject: data.email_subject,
		html: data.email_body,
	};
	let log_obj = {
		from_email: config.from_email,
		to_email: data.email,
		template_id: data.template_id,
		body: data.email_body,
		subject: data.email_subject
	}
	sgMail.send(msg)
		.then(async () => {
			log_obj['email_status'] = 1;

			await knex('email_logs').insert(log_obj);
		}).catch(async (error) => {
			log_obj['email_status'] = 0;
			log_obj['error'] = typeof error == 'object' ? JSON.stringify(error) : error.toString();

			await knex('email_logs').insert(log_obj);
		});
};

module.exports.send_bulk_mail = function (user_data, data) {
	let current_class = this;
	let i = 0;
	let step = 0;
	let IntervalAfterCount = 20;
	get_credentials(user_data, function (smtp_config) {
		if (smtp_config.status == true) {
			for (; i < data.length; i++) {
				if (i % IntervalAfterCount === 0 && step !== i / IntervalAfterCount) {
					break;
				}
				current_class.mails(user_data, data[i], smtp_config.values, function (result) {

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

			let interval = setInterval(function () {
				for (; i < data.length; i++) {
					if (i % IntervalAfterCount === 0 && step !== i / IntervalAfterCount) {
						break;
					}
					current_class.mails(user_data, data[i], smtp_config.values, function (result) {
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
				if (i === data.length) {
					clearInterval(interval);
				}
			}, 60000);
		}
	});

};

module.exports.mails = function (user_data, data, smtp_config = null, callback) {
	if (smtp_config === null) {
		get_credentials(user_data, function (smtp_result) {
			send_custom_mail(smtp_result.values, data, function (result) {
				callback(result);
			})
		});
	} else {
		send_custom_mail(smtp_config, data, function (result) {
			callback(result);
		})
	}
};


function send_custom_mail(smtpConfig, data, callback) {

	let transporter = nodemailer.createTransport(smtpConfig);
	data.email_body += "<img src='" + data.base_url + "api/track_email.jpg?_ut=" + data.user_type + "&_ui=" + data.user_id + "&c=" + data.uuid + "' height='1' width='1'>";

	let mailOptions = {
		to: data.email,
		from: 'Club Class <admin@clubclass.com>',
		bcc: 'fahad@credosys.in',
		replyTo: "admin@clubclass.com",
		subject: data.email_subject,
		html: data.email_body,
		dsn: {
			id: 'some random message specific id',
			return: 'headers',
			notify: ['failure', 'delay', 'success'],
			recipient: 'fahad@credosys.in'
		}
	};
	transporter.verify(function (error, success) {
		if (error) {
			console.log(error);
		} else {
			console.log('Server is ready to take our messages');
		}
	});
	console.log("idel Status:" + transporter.isIdle().toString());

	let send_mail_status = transporter.sendMail(mailOptions, function (error, response) {
		if (error) {
			console.log(error);
			callback({
				status: false,
				error: error,
				id: data.id
			});
			return error;
		} else {
			console.log(response);
			save_response(response);
			callback({
				status: true,
				id: data.id,
				values: data
			});
			return true;
		}
	});


	console.log("idel Status:" + transporter.isIdle().toString());
	return send_mail_status;
}

function save_response(response) {
	knex("track_email")
		.insert({
			user_type: data.user_type,
			user_id: data.user_id,
			pxl_id: data.uuid,
			track_code: 2,
			accepted: response.accepted.toString(),
			rejected: response.rejected.toString(),
			envelopeTime: response.envelopeTime.toString(),
			messageTime: response.messageTime.toString(),
			messageSize: response.messageSize.toString(),
			response: response.response.toString(),
			envelope: JSON.stringify(response.envelope),
			messageId: response.messageId.toString()
		}, "id")
		.then((insert_id) => {

		})
		.catch((err) => console.log(err));
}

function get_credentials(user_data, callback) {

	let query_obejct = knex("email_providers")
		.select({
			data: "email_providers.data"
		})
		.where({
			user_id: user_data.user_id,
			user_type: user_data.user_type,
			status: 1,
			is_set_default: 1
		});
	query_obejct.then((result) => {
		if (result.length > 0) {
			let email_provider = JSON.parse(result[0].data);
			if (email_provider !== undefined) {
				let smtpConfig = {};
				if (email_provider.providers_name.toLowerCase() === 'smtp') {
					smtpConfig = {
						host: email_provider.outgoing_host,
						port: email_provider.outgoing_port,
						secure: true, // true for 465, false for other ports
						auth: {
							user: email_provider.username, // generated ethereal user
							pass: email_provider.password // generated ethereal password
						}
					};

				} else if (email_provider.providers_name.toLowerCase() === 'sendgrid') {
					smtpConfig = {
						host: email_provider.outgoing_host,
						port: email_provider.outgoing_port,
						secure: false, // true for 465, false for other ports
						auth: {
							user: email_provider.username, // generated ethereal user
							pass: email_provider.password // generated ethereal password
						},

					};
				}
				smtpConfig.secure = smtpConfig.outgoing_port == 465;
				return callback(response.success("email_provider_found", smtpConfig));
			} else {
				return callback(response.errpr("email_provider_not_found"));
			}
		} else {
			throw new Error("email_provider_not_found");
		}
	}).catch((err) => callback(common_functions.catch_error(err)));

}