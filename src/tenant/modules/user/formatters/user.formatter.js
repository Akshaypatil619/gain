var Common_function = require("../../../../../src/core/common_functions");
var common_function = new Common_function();
module.exports = class UserFormatter {
    /**
     * @description Check login formatter
     * @author Brijesh Kumar Khatri
     * @param {*} req
     * @returns
     */
	checkLogin(req) {

		let data = {
			username: req.body.username,
			password: req.body.password,
			user_agent: req.header("USER_AGENT")
		}
		return data;
	}

    /**
     * @description Generate api token formatter
     * @author Brijesh Kumar Khatri
     * @param {*} req
     */
	generateApiToken(req) {

	}

    /**
     * @description Get module permission formatter
     * @author Brijesh Kumar Khatri
     * @param {*} req
     */
	getModulePermissions(req) {

	}

    /**
     * @description Active or deactivate tenant user formatter
     * @author Brijesh Kumar Khatri
     * @param {*} req
     */
	activateOrDeactivateTenantUser(req) {

	}

    /**
     * @description Add redemption channel formatter
     * @author Brijesh Kumar Khatri
     * @param {*} req
     * @returns
     */
	addRedemptionChannel(req) {
		let data = {};
		data.tenant_id = req.tenant_id;
		data.redemption_channel_id = req.body.redemption_channel_id;
		data.burn_redemption_rate = req.body.burn_redemption_rate;
		return data;
	}

    /**
     * @description edit redemption channel formatter
     * @author Brijesh Kumar Khatri
     * @param {*} req
     * @returns
     */
	editRedemptionChannel(req) {
		let data = {};
		data.tenant_id = req.tenant_id;
		data.redemption_channel_id = req.body.redemption_channel_id;
		data.burn_redemption_rate = req.body.burn_redemption_rate;
		return data;
	}

    /**
     * @description Get redemption channel formatter
     * @author Brijesh Kumar Khatri
     * @param {*} req
     */
	getRedemptionChannel(req) {

	}

    /**
     * @description Get profile formatter
     * @author Brijesh Kumar Khatri
     * @param {*} req
     * @returns
     */
	getProfile(req) {
		let data = {
			tenant_id: req.tenant_id
		};
		return data;
	}

    /**
     * @description Edit profile formatter
     * @author Brijesh Kumar Khatri
     * @param {*} req
     * @returns
     */
	editProfile(req) {
		let data = {};
		data.tenant_id = req['tenant_id'];
		try {
			data['base_point_rate'] = common_function.cc_parse_float(req.body.base_point_rate, 2);
			data['selling_point_rate'] = common_function.cc_parse_float(req.body.selling_point_rate, 2);
			data['aging_mechanism'] = req.body.aging_mechanism;
			data['round_off_type'] = req.body.round_off_type;
			data['round_off_threshold'] = req.body.round_off_threshold;
			data['base_burn_mechanism'] = req.body.base_burn_mechanism;
			data['base_max_burn_points_percent'] = req.body.base_max_burn_points_percent;
			data['base_burn_point_rate'] = common_function.cc_parse_float(req.body.base_burn_point_rate, 2);
		} catch (e) {
			//
		}
		return data;
	}

    /**
     * @description Get rule types formatters
     * @author Brijesh Kumar Khatri
     * @param {*} req
     */
	getRuleTypes(req) {

	}

    /**
     * @description Add tenant user formatter
     * @author Brijesh Kumar Khatri
     * @param {*} req
     * @returns
     */
	addTenantUser(req) {
		let data = {
			tenant_id: req.tenant_id,
			name: req.body.name,
			email: req.body.email,
			phone: req.body.phone,
			role: req.body.role,
			status: req.body.status,
			created_by: req.tenant_id,
		}
		return data;
	}

    /**
     * @description Edit tenant user formatter
     * @author Brijesh Kumar Khatri
     * @param {*} req
     * @returns
     */
	editTenantUser(req) {
		let data = {
			tenant_id: req['tenant_id'],
			data: {
				tenant_user_id: req.params.id,
				name: req.body.name,
				email: req.body.email,
				phone: req.body.phone,
				role: req.body.role,
				status: req.body.status,
			}
		};
		console.log(data);
		return data;
	}

    /**
     * @description Get tenant users list formatter
     * @author Brijesh Kumar Khatri
     * @param {*} req
     * @returns
     */
	getTenantUsersList(req) {
		let data = {
			tenant_id: req['tenant_id'],
			merchant_id: req.params.merchant_id,
			limit: parseInt(req.query.limit),
			offset: parseInt(req.query.offset),
			search: req.query.search,
			from_date: req.query.from_date,
			to_date: req.query.to_date
		};
		return data;
	}

    /**
     * @description Get tenant user by id formatter
     * @author Brijesh Kumar Khatri
     * @param {*} req
     * @returns
     */
	getTenantUserById(req) {
		let data = {
			tenant_id: req['tenant_id'],
			tenant_user_id: req.params.id
		};
		return data;
	}

    /**
     * @description Get tenant user by email formatter
     * @author Brijesh Kumar Khatri
     * @param {*} req
     * @returns
     */
	getTenantUserByEmail(req) {
		let data = {
			tenant_user_id: req.tenant_id,
			tenant_user_email: req.body.tenant_email
		}
		return data;
	}

    /**
     * @description Update tenant user details formatter
     * @author Brijesh Kumar Khatri
     * @param {*} req
     * @returns
     */
	updateTenantUserDetails(req) {
		let data = {
			tenant_id: req['tenant_id'],
			tenant_user_id: req.body.tenant_user_id,
			name: req.body.name,
			email: req.body.email,
			phone: req.body.phone,

		};
		return data;
	}

    /**
     * @description Change password formatter
     * @author Brijesh Kumar Khatri
     * @param {*} req
     * @returns
     */
	changePassword(req) {
		let data = {
			tenant_user_id: req.body.tenant_user_id,
			email: req.body.email,
			new_password: req.body.newPswd,
			old_password: req.body. oldPswd
		};
		return data;
	}

    /**
     * @description Get group codes formatter
     * @author Brijesh Kumar Khatri
     * @param {*} req
     */
	getGroupCodes(req) {

	}

    /**
     * @description Get tenant branch list formatter
     * @author Brijesh Kumar Khatri
     * @param {*} req
     * @returns
     */
	getTenantBranchList(req) {
		let data = {};
		data.tenant_id = req.tenant_id;
		return data;
	}

    /**
     * @description Get dashboard count formatter
     * @author Brijesh Kumar Khatri
     * @param {*} req
     * @returns
     */
	getDashboardCount(req) {
		let data = {};
		data['tenant_id'] = req['tenant_id'];
		data['date'] = req.query.date;
 		data['start_date'] = req.query.start_date;
		data['end_date'] = req.query.end_date;
		return data;
	}

    /**
     * @description Get dashboard graph formatter
     * @author Brijesh Kumar Khatri
     * @param {*} req
     * @returns
     */
	getDashboardGraph(req) {
		let data = {};
		data['tenant_id'] = req['tenant_id'];
		data['start_date'] = req.query.start_date;
		data['end_date'] = req.query.end_date;
		return data;
	}

	test(req) {

	}

    /**
     * @description unlock assign point formatter
     * @author Brijesh Kumar Khatri
     * @param {*} req
     * @returns
     */
	unlockAssignPoint(req) {
		let data = {};
		data.tenant_id = req.tenant_id;
		data.lock_point_id = req.body.lock_point_id;
		data.customer_id = req.body.customer_id;
		data.unlock_reason = req.body.unlock_reason;
		data.unlock_by = req['tenant_id'];
		return data;
	}

    /**
     * @description Point redeem tenant formatter
     * @author Brijesh Kumar Khatri
     * @param {*} req
     */
	pointRedeemTenant(req) {

	}

    /**
     * @description Get email track details formatter
     * @author Brijesh Kumar Khatri
     * @param {*} req
     * @returns
     */
	getEmailTrackDetails(req) {
		let data = {
			user_type: "tenant",
			user_id: req['tenant_id'],
			limit: parseInt(req.query.limit),
			offset: parseInt(req.query.offset)
		};
		return data;
	}

	overallPoints(req) {
		let data = {};
		data['tenant_id'] = req['tenant_id'];
		// data['date'] = req.query.date;
		data['start_date'] = req.query.start_date;
		data['end_date'] = req.query.end_date;
		return data;
	}

}