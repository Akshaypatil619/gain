var bcrypt = require('bcryptjs');
let config = require("../../../../../config/config");
let knex = require("../../../../../config/knex");
let userModel = new (require("../models/mysql/user_model.mysql.js"));
let responseMessages = require("../response/user.response");
let Common_functions = require("../../../../../src/core/common_functions.js");
let common_functions = new Common_functions();
var generator = require('generate-password');
let TrackEmail = require("../../../../../src/core/Email_track_code/TrackEmail.js");
let trackEmail = new TrackEmail();

module.exports = class UserService {
	/**
	 * @description Check login service
	 * @author Brijesh Kumar Khatri
	 * @param {*} _data
	 * @returns
	 */
	checkLogin(_data) {
		let tenantInfo = {};
		// check credential
		return userModel.checkLogin(_data)
			.then(async function (result) {

				// check user exist
				if (result.length > 0) {
					// compare password is matched or not
					var getPassword = bcrypt.compareSync(_data.password, result[0].password);
				} else {
					// user not exist throw error
					throw new Error("login_failed");
				}

				// check password is matched
				if (getPassword !== true) {
					// invalid password, throw error 
					throw new Error("password_dose_not_match");
				} else {
					console.log("false34", getPassword);
					// Password is valid

					//check user account is activated
					if (result['activated'] === 0) {
						// user account deactivated, throw error 
						throw new Error("deactivate_tenant");
					}
					// store user id in _data

					_data.tenant_user_id = result[0].tenant_user_id;
					// userModel.getTenantUserInfo(_data)
					// .then((res) => console.log("res"));

					let encryptData = {}
					let token_data = {};

					// encrypt tenant id and secret key
					// encryptData.tenant_user_id = common_functions.encryptData(result[0]['tenant_user_id'].toString(), 'credosyssolutions');
					// encryptData.tenant_id = common_functions.encryptData(result[0]['tenant_id'].toString(), 'credosyssolutions');
					// encryptData.secret_key = common_functions.encryptData('clubclass', 'credosyssolutions');

					encryptData.tenant_user_id = result[0]['tenant_user_id'];
					encryptData.tenant_id = result[0]['tenant_id'];
					encryptData.tenant_type_id = result[0]['tenant_type_id'],
					encryptData.secret_key = 'clubclass';

					// create login JWT token
					let login_token = await common_functions.create_token(encryptData);

					// create token object for store in database
					token_data = {
						'tenant_id': result[0]['tenant_id'],
						'tenant_user_id': result[0]['tenant_user_id'],
						'tenant_type_id': result[0]['tenant_type_id'],
						'login_token': login_token,
						'agent_type': _data.user_agent,
						'created_at': knex.raw("CURRENT_TIMESTAMP"),
						'updated_at': knex.raw("CURRENT_TIMESTAMP")
					};
					tenantInfo = result;
					tenantInfo[0]['token'] = login_token;

					//store result in database
					return userModel.saveToken(token_data);
				}
			})
			.then(function (token_result) {
				// success response 
				return responseMessages.success("login_success", tenantInfo);
			})
			.catch(function (err) {
				console.log("tenantInfo1234", err)
				// return error response
				let error = (typeof err.errors != 'undefined') ? err.errors : err.message;
				return responseMessages.failed(responseMessages.hasOwnProperty(err.message) ? err.message : "login_failed", error)
			});
	}

	// generateApiToken(_data) {

	// }

	// getModulePermissions(_data) {

	// }

	// activateOrDeactivateTenantUser(_data) {

	// }

	/**
	 * @description add redemption channel service
	 * @author Brijesh Kumar Khatri
	 * @param {*} _data
	 * @returns
	 */
	addRedemptionChannel(_data) {
		let data = {};
		Object.assign(data, _data);
		// insert redemption channel;
		return userModel.insertRedemptionChannel(data)
			.then((tenant_redemption_channel_id) => {
				// success response
				return responseMessages.success("tenant_redemption_channel_create_success", tenant_redemption_channel_id);
			}).catch(function (err) {
				// return error response
				let error = (typeof err.errors != 'undefined') ? err.errors : err.message;
				return responseMessages.failed(responseMessages.hasOwnProperty(err.message) ? err.message : "tenant_redemption_channel_error", error)
			});

	}

	/**
	 * @description Edit redemption channel
	 * @author Brijesh Kumar Khatri
	 * @param {*} _data
	 * @returns
	 */
	editRedemptionChannel(_data) {
		let data = {};
		data.insert = {};
		Object.assign(data.insert, _data);
		delete data.redemption_channel_id;
		// update redemption channel
		return userModel.updateRedemptionChannel({
			where: { 'id': _data.redemption_channel_id },
			data: data.insert
		})
			.then((tenant_redemption_channel_id) => {
				// success response
				return responseMessages.success("tenant_redemption_channel_update_success", tenant_redemption_channel_id);
			})
			.catch(function (err) {
				// return error response
				let error = (typeof err.errors != 'undefined') ? err.errors : err.message;
				return responseMessages.failed(responseMessages.hasOwnProperty(err.message) ? err.message : "tenant_redemption_channel_error", error)
			});
	}

	/**
	 * @description Get redemption channel
	 * @author Brijesh Kumar Khatri
	 * @param {*} _data
	 * @returns
	 */
	getRedemptionChannel(_data) {
		let data = {
			columns: {
				id: "redemption_channel_master.id",
				name: "redemption_channel_master.name",
				code: "redemption_channel_master.code"
			}
		};

		// get redemption channel
		return userModel.getRedemptionChannel(data)
			.then((result) => {
				// check redemption channel found
				if (result.length > 0) {
					// success response
					return responseMessages.success("tenant_redemption_channel_found", result);
				} else {
					// throw error
					throw new Error("tenant_redemption_channel_not_found");
				}
			}).catch(function (err) {
				// return error response
				let error = (typeof err.errors != 'undefined') ? err.errors : err.message;
				return responseMessages.failed(responseMessages.hasOwnProperty(err.message) ? err.message : "tenant_redemption_channel_error", error)
			});
	}

	/**
	 * @description Get profile
	 * @author Brijesh Kumar Khatri
	 * @param {*} _data
	 * @returns
	 */
	getProfile(_data) {
		// get profile
		return userModel.getProfile(_data)
			.then((result) => {
				// check profile exist
				if (result.length > 0) {
					// success response
					return responseMessages.success("profile_found", result);
				} else {
					// throw error
					throw new Error("profile_not_found");
				}
			})
			.catch(function (err) {
				// return error response
				let error = (typeof err.errors != 'undefined') ? err.errors : err.message;
				return responseMessages.failed(responseMessages.hasOwnProperty(err.message) ? err.message : "profile_fetch_error", error)
			});
	}

	/**
	 * @description Edit profile
	 * @author Brijesh Kumar Khatri
	 * @param {*} _data
	 * @returns
	 */
	editProfile(_data) {
		let data = {};
		Object.assign(data, _data);
		delete data.tenant_id;
		data['is_base_configuration_complete'] = 1;
		// update profile
		return userModel.updateProfile({
			tenant_id: _data.tenant_id,
			data: data
		})
			.then((result) => {
				// success response
				return responseMessages.success("profile_update_success", result);
			})
			.catch(function (err) {
				// return error response
				let error = (typeof err.errors != 'undefined') ? err.errors : err.message;
				return responseMessages.failed(responseMessages.hasOwnProperty(err.message) ? err.message : "profile_updating_failed", error)
			});
	}

	/**
	 * @description Get rule types
	 * @author Brijesh Kumar Khatri
	 * @param {*} _data
	 * @returns
	 */
	getRuleTypes(_data) {
		let data = {
			columns: {
				id: "master_rule_type.id",
				name: "master_rule_type.name",
				rule_priority: "master_rule_type.rule_priority",
				slug: "master_rule_type.slug"
			}
		};
		// get rule types
		return userModel.getRuleTypes(data)
			.then((result) => {
				// check rule type exist
				if (result.length > 0) {
					// success response
					return responseMessages.success("rule_type_found", result);
				} else {
					// failed response
					return responseMessages.failed("rule_type_not_found");
				}
			})
			.catch(function (err) {
				// return error response
				let error = (typeof err.errors != 'undefined') ? err.errors : err.message;
				return responseMessages.failed(responseMessages.hasOwnProperty(err.message) ? err.message : "rule_type_fetch_error", error)
			});
	}

	/**
	 * @description add tenant user 
	 * @author Brijesh Kumar Khatri
	 * @param {*} _data
	 * @returns
	 */
	addTenantUser(_data) {
		let data = _data;
		let mail_pass = {};
		let newTenantUserId;
		let password;
		// get tenant user 
		return userModel.getTenantUser(_data)
			.then((result) => {
				// check tenant user exist
				if (result.length > 0) {
					// check phone or email exist
					if (data.phone === result[0].phone) {
						throw new Error("phone_already_exist")
					} else {
						throw new Error("email_already_exist")
					}
				} else {
					// generate password
					password = generator.generate({
						length: 6,
						numbers: true
					});
					mail_pass.readable_password = password;
					data.password = common_functions.password_encrypt(password);

					// add tenant user 
					return userModel.addTenantUser(data)

				}
			}).then((id) => {
				// return success response
				// console.log("data",data,_data)
				newTenantUserId = id;
				// userModel.sendTemplateMail({
				// 	member_name: data.name,
				// 	password: mail_pass.readable_password,
				// 	email: data.email,
				// 	url: config.url,
				// }, 'Welcome Email');
				return userModel.getTenantSettingData(id)
			}).then(tenantSettingData => {
				// tenantSettingProvider.set_tenant_setting(tenantSettingData[0].tenant_user_id, {
				// 	tenant_id: tenantSettingData[0]['tenant_id'],
				// 	tenant_user_id: tenantSettingData[0]['tenant_user_id'],
				// 	tenant_branch_id: tenantSettingData[0]['branch_id'],
				// 	conversion_value: tenantSettingData[0].conversion_value,
				// 	currency_code: tenantSettingData[0].currency_code,
				// 	country_name: tenantSettingData[0].name,
				// 	base_point_rate: tenantSettingData[0].base_point_rate,
				// 	burn_point_rate: tenantSettingData[0].burn_point_rate,
				// 	selling_point_rate: tenantSettingData[0].selling_point_rate,
				// 	min_point: tenantSettingData[0].min_point,
				// 	tenant_type_id: tenantSettingData[0].tenant_type_id
				// });
				let post_data = {
					email_data: { Username: _data.name, password: password, email: _data.email },
					email: _data.email
				}
				return { status: true, status_code: "SUC56665", message: "User created successfully", post_data };
				// response_adapter
				// return newTenantUserId;
				// response_adapter.response(req,res, {status: true, message: "User created successfully"});
				// return responseMessages.success("tenant_user_create_success", {
				// 	id: newTenantUserId
				// });
			})
			.catch(function (err) {
				// return error response
				let error = (typeof err.errors != 'undefined') ? err.errors : err.message;
				return responseMessages.failed(responseMessages.hasOwnProperty(err.message) ? err.message : "add_tenant_error", error)
			});
	}

	/**
	 * @description Edit tenant user
	 * @author Brijesh Kumar Khatri
	 * @param {*} _data
	 * @returns
	 */
	editTenantUser(_data) {
		let data = _data.data;
		// Check tenant user exist
		return userModel.checkTenantUserExist(_data)
			.then((result) => {
				// check result
				if (result.length > 0) {
					// check phone or email exist
					if (data.phone === result[0].phone) {
						// throw message key that want to show in error
						throw new Error("phone_already_exist")
					} else {
						// throw message key that want to show in error
						throw new Error("email_already_exist")
					}
				} else {
					// get tenant user id
					return userModel.getTenantUserId(_data)
				}
			}).then((id) => {
				// check id found
				if (id.length > 0) {
					// id found
					data.id = data.tenant_user_id;
					delete data.tenant_user_id;
					// edit tenant user
					return userModel.editTenantUser(data);
				} else {
					// throw message key that want to show in error
					throw new Error("tenant_user_does_not_exist")
				}
			}).then((id) => {
				// success response
				return responseMessages.success("tenant_user_details_updated_success");
			})
			.catch(function (err) {
				// return error response
				let error = (typeof err.errors != 'undefined') ? err.errors : err.message;
				return responseMessages.failed(responseMessages.hasOwnProperty(err.message) ? err.message : "update_details_error", error)
			});
	}

	/**
	 * @description Get tenant users list
	 * @author Brijesh Kumar Khatri
	 * @param {*} _data
	 * @returns
	 */
	getTenantUsersList(_data) {
		let return_result = {};
		_data.columns = {
			tenant_user_id: "tenant_users.id",
			role_id: "master_tenant_user_role.id",
			role_name: "master_tenant_user_role.name",
			name: "tenant_users.name",
			email: "tenant_users.email",
			phone: "tenant_users.phone",
			status: knex.raw("if(tenant_users.status=1,'Active','Inactive')"),
			created_by: "tenant_user_creator.name",
			created_time: "tenant_users.created_at"
		};
		// get tenant users list
		let obj = userModel.getTenantUsers(_data);
		delete _data.limit;
		delete _data.offset;
		_data.columns = {
			total_records: knex.raw("COUNT(*)")
		};
		//get tenant user count
		let totalObj = userModel.getTenantUsers(_data)

		return obj.then((t_result) => {
			// check list length
			if (t_result.length > 0) {
				// user list found
				return_result.tenant_users_list = t_result;
				// get count
				return totalObj;
			} else {
				// throw error
				throw new Error("tenant_user_does_not_exist");
			}
		})
			.then((result) => {
				// check count found
				if (result.length > 0) {
					// store count
					return_result.tenant_users_total_record = result[0].total_records;
				}
				// return success response
				return responseMessages.success("tenant_user_list_fetched_success", return_result);
			})
			.catch(function (err) {
				// return error response
				let error = (typeof err.errors != 'undefined') ? err.errors : err.message;
				return responseMessages.failed(responseMessages.hasOwnProperty(err.message) ? err.message : "tenant_user_fetch_error", error)
			});
	}

	/**
	 * @description Get tenant user by id
	 * @author Brijesh Kumar Khatri
	 * @param {*} _data
	 * @returns
	 */
	getTenantUserById(_data) {
		_data.columns = {
			role_id: "master_tenant_user_role.id",
			role_name: "master_tenant_user_role.name",
			name: "tenant_users.name",
			email: "tenant_users.email",
			phone: "tenant_users.phone",
			status: knex.raw("if(tenant_users.status=1,'Active','Inactive')"),
			status_code: "tenant_users.status",
			created_by: "tenant_user_creator.name",
			created_time: "tenant_users.created_at"
		};

		// get tenant user by id
		return userModel.getTenantUserById(_data)
			.then((result) => {
				// check result
				if (result.length > 0) {
					// return success response
					return responseMessages.success("tenant_user_found", result);
				} else {
					// throw error
					throw new Error('tenant_user_does_not_exist');
				}
			})
			.catch(function (err) {
				// return error response
				let error = (typeof err.errors != 'undefined') ? err.errors : err.message;
				return responseMessages.failed(responseMessages.hasOwnProperty(err.message) ? err.message : "tenant_user_fetch_error", error)
			});
	}

	/**
	 * @description Get tenant user by email
	 * @author Brijesh Kumar Khatri
	 * @param {*} _data
	 * @returns
	 */
	getTenantUserByEmail(_data) {
		// get tenant user by email
		return userModel.getTenantUserByEmail(_data)
			.then((result) => {
				// check result
				if (result.length > 0) {
					// success response
					return responseMessages.success("tenant_user_found", result);
				} else {
					// throw error
					throw new Error("tenant_user_does_not_exist");
				}
			})
			.catch(function (err) {
				// return error response
				let error = (typeof err.errors != 'undefined') ? err.errors : err.message;
				return responseMessages.failed(responseMessages.hasOwnProperty(err.message) ? err.message : "tenant_user_fetch_error", error)
			});
	}

	/**
	 * @description Update tenant user details
	 * @author Brijesh Kumar Khatri
	 * @param {*} _data
	 * @returns
	 */
	updateTenantUserDetails(_data) {
		// update tenant user details
		return userModel.updateTenantUserDetails(_data)
			.then((result) => {
				// success response
				return responseMessages.success("user_details_updated", result);
			})
			.catch(function (err) {
				// return error response
				let error = (typeof err.errors != 'undefined') ? err.errors : err.message;
				return responseMessages.failed(responseMessages.hasOwnProperty(err.message) ? err.message : "tenant_user_fetch_error", error)
			});
	}

	/**
	 * @description Change password
	 * @author Brijesh Kumar Khatri
	 * @param {*} _data
	 * @returns
	 */
	changePassword(_data) {
		_data.columns = {
			password: "tenant_users.password",
			name: "tenant_users.name",
		}
		console.log("result", _data);
		return userModel.getTenantUserById(_data).then(async function (result) {
			_data.name = result[0].name;
			var verifyOldPswd = bcrypt.compareSync(_data.old_password, result[0].password);
			if (verifyOldPswd !== true) {
				throw new Error("old_password_incorrect");
			}
			else {
				let hashPswd = common_functions.password_encrypt(_data.new_password)
				await userModel.changePassword({
					id: _data.tenant_user_id,
					emailId: _data.email,
					hashPswd: hashPswd
				})
			}
		}).then((result) => {

			userModel.sendTemplateMail({
				member_name: _data.name,
				password: _data.new_password,
				email: _data.email,
			}, 'change_password');
			return responseMessages.success("password_changed");
		})
			.catch(function (err) {
				let error = (typeof err.errors != 'undefined') ? err.errors : err.message;
				return responseMessages.failed(responseMessages.hasOwnProperty(err.message) ? err.message : "password_change_error", error)
			});
	}

	/**
	 * @description Get group codes
	 * @author Brijesh Kumar Khatri
	 * @param {*} _data
	 */
	getGroupCodes(_data) {
	}

	/**
	 * @description Get tenant branch list
	 * @author Brijesh Kumar Khatri
	 * @param {*} _data
	 * @returns
	 */
	getTenantBranchList(_data) {
		// get tenant branch list
		return userModel.getTenantBranchList(_data)
			.then((tenant_branches) => {
				// check result
				if (tenant_branches.length == 0) {
					// throw error
					throw new Error('tenant_branch_not_found');
				} else {
					// success response
					return responseMessages.success("tenant_branch_found", tenant_branches);
				}
			})
			.catch(function (err) {
				// return error response
				let error = (typeof err.errors != 'undefined') ? err.errors : err.message;
				return responseMessages.failed(responseMessages.hasOwnProperty(err.message) ? err.message : "tenant_branch_fetch_error", error)
			});

	}

	/**
	 * @description Get dashboard count
	 * @author Brijesh Kumar Khatri
	 * @param {*} _data
	 * @returns
	 */
	/* async getDashboardCount(_data) {
		try {
			// get point and customer counts
			let pointCount = await userModel.getDashboardPointCount(_data);
			let memberCount = await userModel.getDashboardCustomerCount(_data);
			let parentCount = await userModel.getDashboardPerantCount(_data);
			let staffCount = await userModel.getDashboardStaffCount(_data);

			// map data
			pointCount.map((pointData) => {
				pointData.total_liability_point = pointData.total_accrual_point - (pointData.total_redeemed_point + pointData.total_expired_point);
			});
			// return data
			return responseMessages.success("dashboard_data_found", { pointCount, memberCount, parentCount, staffCount });
		} catch (err) {
			logger_service.log(err);
			// return error response
			let error = (typeof err.errors != 'undefined') ? err.errors : err.message;
			return responseMessages.failed(responseMessages.hasOwnProperty(err.message) ? err.message : "dashboard_data_fetch_error", error)
		}
	} */

	async getDashboardCount(data) {
		let result = {
			total_commission: 0,
			current_commission: 0,
			total_buildings: 0,
			total_owners: 0,
			total_tenants: 0,
			total_active_owners: 0,
			total_active_tenants: 0
		};

		// commission query
		const commission_cols = {
			total_commission: knex.raw('sum(reward)'),
			current_commission: knex.raw(`sum(case when cast(current_date as date) >= DATE_SUB(LAST_DAY(NOW()),INTERVAL DAY(LAST_DAY(NOW()))-
			  1 DAY) then reward else 0 end )`)
		}

		let commissionQuery = knex('reward_history').select(commission_cols)
			.where({ user_type: 'gain' });
	  
			if(data['date']){
				commissionQuery.whereRaw("MONTH(reward_history.created_at)="+data['date'].split('-')[1])
				commissionQuery.andWhereRaw("YEAR(reward_history.created_at)="+data['date'].split('-')[0])
			  } else {
				commissionQuery.whereRaw("MONTH(reward_history.created_at)=MONTH(CURRENT_DATE())")
				commissionQuery.andWhereRaw("YEAR(reward_history.created_at)=YEAR(CURRENT_DATE())")
			  }
			  const commissions = await commissionQuery;
		 if (commissions.length > 0) {
			result.total_commission = commissions[0].total_commission ? commissions[0].total_commission: 0;
			result.current_commission = commissions[0].current_commission ? commissions[0].current_commission : 0;
		}


		// owner query
		let totalOwnerQuery = knex('customers').count('* AS ownerCount').where("customers.user_type_id", 2);
		if (data['date']) {
			totalOwnerQuery.whereRaw("MONTH(customers.created_at)=" + data['date'].split('-')[1])
			totalOwnerQuery.andWhereRaw("YEAR(customers.created_at)=" + data['date'].split('-')[0])
		} else {
			totalOwnerQuery.whereRaw("MONTH(customers.created_at)=MONTH(CURRENT_DATE())")
			totalOwnerQuery.andWhereRaw("YEAR(customers.created_at)=YEAR(CURRENT_DATE())")
		}

		const totalOwners = await totalOwnerQuery;
		if (totalOwners.length > 0)
			result.total_owners = totalOwners[0].ownerCount;


		// tenant query
		let totalTenantQuery = knex('customers').count('* AS tenantCount').where("customers.user_type_id", 3);
		if (data['date']) {
			totalTenantQuery.whereRaw("MONTH(customers.created_at)=" + data['date'].split('-')[1])
			totalTenantQuery.andWhereRaw("YEAR(customers.created_at)=" + data['date'].split('-')[0])
		} else {
			totalTenantQuery.whereRaw("MONTH(customers.created_at)=MONTH(CURRENT_DATE())")
			totalTenantQuery.andWhereRaw("YEAR(customers.created_at)=YEAR(CURRENT_DATE())")
		}

		const totalTenant = await totalTenantQuery;
		if (totalTenant.length > 0)
			result.total_tenants = totalTenant[0].tenantCount;


		// customer queries
		const cust_cols = {
			total_buildings: knex.raw('count(distinct mb.id)'),
			total_active_owners: knex.raw('count(distinct case when owners.is_logged_in = 1 then owners.id else null end)'),
			total_active_tenants: knex.raw('count(distinct case when mu.tenant_customer_id is not null then mu.tenant_customer_id else null end)')
		}

		let customerQuery = knex('master_property as mp').select(cust_cols)
			.join('master_building as mb', 'mb.property_id', 'mp.id')
			.join('master_unit as mu', 'mu.building_id', 'mb.id')
			.join('customers as owners', 'owners.id', 'mu.customer_id')
			if(data['date']){
				customerQuery.whereRaw("MONTH(owners.created_at)="+data['date'].split('-')[1])
				customerQuery.andWhereRaw("YEAR(owners.created_at)="+data['date'].split('-')[0])
			} else {
				customerQuery.whereRaw("MONTH(owners.created_at)=MONTH(CURRENT_DATE())")
				customerQuery.andWhereRaw("YEAR(owners.created_at)=YEAR(CURRENT_DATE())")
			}
			const customers = await customerQuery;	
		  if (customers.length > 0) {
			result.total_buildings = customers[0].total_buildings;
			result.total_active_owners = customers[0].total_active_owners;
			result.total_active_tenants = customers[0].total_active_tenants;
		}

		return responseMessages.success("dashboard_data_found", result);
	}



	/**
	 * @description get dashboard graph 
	 * @author Brijesh Kumar Khatri
	 * @param {*} _data
	 * @returns
	 */
	/* async getDashboardGraph(_data) {
		try {
			// get graph values
			let graph_data = await userModel.getDashboardGraph(_data);
			//success response
			if (graph_data.length == 0) {
				graph_data[0] = {};
				graph_data[0].date = new Date();
				graph_data[0].total_accrued_points = 0;
				graph_data[0].total_redeemed_points = 0
			}
			return responseMessages.success("dashboard_graph_found", graph_data);
		} catch (err) {

			logger_service.log(err);
			// return error response
			let error = (typeof err.errors != 'undefined') ? err.errors : err.message;
			return responseMessages.failed(responseMessages.hasOwnProperty(err.message) ? err.message : "dashboard_graph_data_fetch_error", error)
		}
	} */

	test(_data) {

	}

	/**
	 * @description unlock assign point
	 * @author Brijesh Kumar Khatri
	 * @param {*} _data
	 * @returns
	 */
	unlockAssignPoint(_data) {
		let data = {};
		Object.assign(data, _data);
		delete data.customer_id;
		delete data.tenant_id;
		delete data.lock_point_id;
		// unlock assign points
		return userModel.unlockAssignPoint({
			data: data,
			lock_point_id: _data['lock_point_id']
		})
			.then(function (result) {
				// success response
				return responseMessages.success("unlock_point_successfully");
			})
			.catch(function (err) {
				// return error response
				let error = (typeof err.errors != 'undefined') ? err.errors : err.message;
				return responseMessages.failed(responseMessages.hasOwnProperty(err.message) ? err.message : "unlock_point_error", error)
			});
	}

	pointRedeemTenant(_data) {

	}

	/**
	 * @description Get email track details
	 * @author Brijesh Kumar Khatri
	 * @param {*} _data
	 * @returns
	 */
	getEmailTrackDetails(_data) {
		return new Promise((resolve, reject) => {
			trackEmail.get_track_details(_data, (result) => {
				resolve(result);
			});
		})
	}

	// async overallPoints(data) {
	// 	try {
	// 		let result = await userModel.overallPoints(data);
	// 		return responseMessages.success("dashboard_data_found", result);
	// 	} catch (err) {
	// 		logger_service.log(err);
	// 		let error = (typeof err.errors != 'undefined') ? err.errors : err.message;
	// 		return responseMessages.failed(responseMessages.hasOwnProperty(err.message) ? err.message : "dashboard_data_fetch_error", error)
	// 	}
	// }

}