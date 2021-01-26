const config = {
	app_env: process.env.app_env,

	db_driver: process.env.db_driver,
	db_host: process.env.db_host,
	db_username: process.env.db_username,
	db_password: process.env.db_password,
	db_name: process.env.db_name,
	db_port: process.env.db_port,

	sftp_host: process.env.sftp_host,
	sftp_port: process.env.sftp_port,
	sftp_username: process.env.sftp_username,
	sftp_password: process.env.sftp_password,
	sftp_base_path: process.env.sftp_base_path,

	port: process.env.port,
	secretKey: process.env.secretKey,
	email_user: process.env.email_user,
	email_password: process.env.email_password,
	base_url: process.env.base_url,
	jwt_token_secret: process.env.jwt_token_secret,
	users_inactive_offset: process.env.users_inactive_offset,
	clientExpire: process.env.clientExpire,
	expireTime: process.env.expireTime,
	check_api_permission: process.env.check_api_permission,

	sendgrid_api_key: process.env.sendgrid_api_key,
	from_email: process.env.from_email,
	to_email: process.env.to_email,
	url: process.env.url,

	mPointsAuthorization: process.env.mPointsAuthorization,
	mPointsAPIHost: process.env.mPointsAPIHost,

	encription_key: process.env.encription_key,

	cc_token_expire_time: process.env.cc_token_expire_time,
	cc_token_secret_key: process.env.cc_token_secret_key,
	geo_radius: process.env.geo_radius,

	sms_user: process.env.sms_user,
	sms_password: process.env.sms_password,
	sms_source: process.env.sms_source,
	sms_api: process.env.sms_api,
	sms_type: process.env.sms_type,
	sms_dlr: process.env.sms_dlr,
	dialing_code: process.env.dialing_code,
	merchant_list_url: process.env.merchant_list_url,
	
	adminPort: process.env.adminPort,
	oamPort: process.env.oamPort,
	ownerPort: process.env.ownerPort,

	s3path: process.env.s3path
}

module.exports = config;