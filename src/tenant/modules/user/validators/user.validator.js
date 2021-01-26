var root_folder = "../../../../../";
module.exports = class UserValidator {
    /**
     * @description Check login validator
     * @author Brijesh Kumar Khatri
     * @param {*} type
     * @returns
     */
	checkLogin(type) {

		let returnValidator = {};
		switch (type) {
			case '':
			default:
				returnValidator = {
					username: "required",
					password: "required",
				};
				break;
		}
		return returnValidator;
	}

    /**
     * @description Generate api token validator
     * @author Brijesh Kumar Khatri
     * @param {*} type
     * @returns
     */
	generateApiToken(type) {
		let returnValidator = {};
		switch (type) {
			case '':
			default:
				returnValidator = {};
				break;
		}
		return returnValidator;
	}

    /**
     * @description Get module permissions validator
     * @author Brijesh Kumar Khatri
     * @param {*} type
     * @returns
     */
	getModulePermissions(type) {
		let returnValidator = {};
		switch (type) {
			case '':
			default:
				returnValidator = {};
				break;
		}
		return returnValidator;
	}

    /**
     * @description activate or deactivate tenant user validator
     * @author Brijesh Kumar Khatri
     * @param {*} type
     * @returns
     */
	activateOrDeactivateTenantUser(type) {
		let returnValidator = {};
		switch (type) {
			case '':
			default:
				returnValidator = {};
				break;
		}
		return returnValidator;
	}

    /**
     * @description add redemption channel validator
     * @author Brijesh Kumar Khatri
     * @param {*} type
     * @returns
     */
	addRedemptionChannel(type) {
		let returnValidator = {};
		switch (type) {
			case '':
			default:
				returnValidator = {
					redemption_channel_id: "required",
					burn_redemption_rate: "required",
				};
				break;
		}
		return returnValidator;
	}

    /**
     * @description edit redemption channel validator
     * @author Brijesh Kumar Khatri
     * @param {*} type
     * @returns
     */
	editRedemptionChannel(type) {
		let returnValidator = {};
		switch (type) {
			case '':
			default:
				returnValidator = {
					redemption_channel_id: "required"
				};
				break;
		}
		return returnValidator;
	}

    /**
     * @description get redemption channel validator
     * @author Brijesh Kumar Khatri
     * @param {*} type
     * @returns
     */
	getRedemptionChannel(type) {
		let returnValidator = {};
		switch (type) {
			case '':
			default:
				returnValidator = {};
				break;
		}
		return returnValidator;
	}

    /**
     * @description get profile validator
     * @author Brijesh Kumar Khatri
     * @param {*} type
     * @returns
     */
	getProfile(type) {
		let returnValidator = {};
		switch (type) {
			case '':
			default:
				returnValidator = {
					tenant_id: "required"
				};
				break;
		}
		return returnValidator;
	}

    /**
     * @description edit profile validator
     * @author Brijesh Kumar Khatri
     * @param {*} type
     * @returns
     */
	editProfile(type) {
		let returnValidator = {};
		switch (type) {
			case '':
			default:
				returnValidator = {
					base_point_rate: "required",
					selling_point_rate: "required",
					aging_mechanism: "required",
					round_off_type: "required",
					round_off_threshold: "required",
				};
				break;
		}
		return returnValidator;
	}

    /**
     * @description get rule types validator
     * @author Brijesh Kumar Khatri
     * @param {*} type
     * @returns
     */
	getRuleTypes(type) {
		let returnValidator = {};
		switch (type) {
			case '':
			default:
				returnValidator = {};
				break;
		}
		return returnValidator;
	}

    /**
     * @description add tenant user validator
     * @author Brijesh Kumar Khatri
     * @param {*} type
     * @returns
     */
	addTenantUser(type) {
		let returnValidator = {};
		switch (type) {
			case '':
			default:
				returnValidator = {
					name: "required",
					email: "required",
					phone: "required",
					role: "required",
					status: "required",
					created_by: "required"
				};
				break;
		}
		return returnValidator;
	}

    /**
     * @description edit tenant user validator
     * @author Brijesh Kumar Khatri
     * @param {*} type
     * @returns
     */
	editTenantUser(type) {
		let returnValidator = {};
		switch (type) {
			case '':
			default:
				returnValidator = {
					tenant_user_id: "required",
					name: "required",
					email: "required",
					phone: "required",
					role: "required",
					status: "required",
				};
				break;
		}
		return returnValidator;
	}

    /**
     * @description get tenant user list validator
     * @author Brijesh Kumar Khatri
     * @param {*} type
     * @returns
     */
	getTenantUsersList(type) {
		let returnValidator = {};
		switch (type) {
			case '':
			default:
				returnValidator = {};
				break;
		}
		return returnValidator;
	}

    /**
     * @description get tenant user by id validator
     * @author Brijesh Kumar Khatri
     * @param {*} type
     * @returns
     */
	getTenantUserById(type) {
		let returnValidator = {};
		switch (type) {
			case '':
			default:
				returnValidator = {};
				break;
		}
		return returnValidator;
	}

    /**
     * @description get tenant user by email validator
     * @author Brijesh Kumar Khatri
     * @param {*} type
     * @returns
     */
	getTenantUserByEmail(type) {
		let returnValidator = {};
		switch (type) {
			case '':
			default:
				returnValidator = {};
				break;
		}
		return returnValidator;
	}

    /**
     * @description update tenant user details validator
     * @author Brijesh Kumar Khatri
     * @param {*} type
     * @returns
     */
	updateTenantUserDetails(type) {
		let returnValidator = {};
		switch (type) {
			case '':
			default:
				returnValidator = {
					tenant_id: "required",
					tenant_user_id: "required",
					name: "required",
					email: "required",
					phone: "required",
				};
				break;
		}
		return returnValidator;
	}

    /**
     * @description change password validator
     * @author Brijesh Kumar Khatri
     * @param {*} type
     * @returns
     */
	changePassword(type) {
		let returnValidator = {};
		switch (type) {
			case '':
			default:
				returnValidator = {
					tenant_user_id: "required",
					email: "required",
					new_password: "required",
					old_password: "required",
				};
				break;
		}
		return returnValidator;
	}

    /**
     * @description get group codes validator
     * @author Brijesh Kumar Khatri
     * @param {*} type
     * @returns
     */
	getGroupCodes(type) {
		let returnValidator = {};
		switch (type) {
			case '':
			default:
				returnValidator = {};
				break;
		}
		return returnValidator;
	}

    /**
     * @description get tenant branch list validator
     * @author Brijesh Kumar Khatri
     * @param {*} type
     * @returns
     */
	getTenantBranchList(type) {
		let returnValidator = {};
		switch (type) {
			case '':
			default:
				returnValidator = {
					tenant_id: "required"
				};
				break;
		}
		return returnValidator;
	}

    /**
     * @description get dashboard count validator
     * @author Brijesh Kumar Khatri
     * @param {*} type
     * @returns
     */
	getDashboardCount(type) {
		let returnValidator = {};
		switch (type) {
			case '':
			default:
				returnValidator = {
					// start_date: "required|date",
					// end_date: "required|date",
				};
				break;
		}
		return returnValidator;
	}

    /**
     * @description get dashboard graph validator
     * @author Brijesh Kumar Khatri
     * @param {*} type
     * @returns
     */
	getDashboardGraph(type) {
		let returnValidator = {};
		switch (type) {
			case '':
			default:
				returnValidator = {
					start_date: "required|date",
					end_date: "required|date",
				};
				break;
		}
		return returnValidator;
	}

	test(type) {
		let returnValidator = {};
		switch (type) {
			case '':
			default:
				returnValidator = {};
				break;
		}
		return returnValidator;
	}

    /**
     * @description unlock assign point validator
     * @author Brijesh Kumar Khatri
     * @param {*} type
     * @returns
     */
	unlockAssignPoint(type) {
		let returnValidator = {};
		switch (type) {
			case '':
			default:
				returnValidator = {
					lock_point_id: "required",
					customer_id: "required",
				};
				break;
		}
		return returnValidator;
	}

    /**
     * @description point redeem tenant validator
     * @author Brijesh Kumar Khatri
     * @param {*} type
     * @returns
     */
	pointRedeemTenant(type) {
		let returnValidator = {};
		switch (type) {
			case '':
			default:
				returnValidator = {};
				break;
		}
		return returnValidator;
	}

    /**
     * @description get email track details validator
     * @author Brijesh Kumar Khatri
     * @param {*} type
     * @returns
     */
	getEmailTrackDetails(type) {
		let returnValidator = {};
		switch (type) {
			case '':
			default:
				returnValidator = {};
				break;
		}
		return returnValidator;
	}

	overallPoints(type) {
		let returnValidator = {};
		switch (type) {
			case '':
			default:
				returnValidator = {
					// date: "required|date",
					start_date: "required|date",
					end_date: "required|date",
				};
				break;
		}
		return returnValidator;
	}

}