var newId = require("uuid-pure").newId;
module.exports = class CustomersFormatter {

    /**
     * Add customer formatter
     *
     * @param req
     * @returns {Array}
     */
	addCustomer(req) {
		
		let data = [];
		data['customer'] = {};
		// data['customer_social_links'] = {};
		// data['customer_cards'] = {};
		try {
			//Customer Info 
			// data['customer']['tier_id'] = req.body.tier;
			data['customer']['id'] = req.body.customer_id
			data['customer']['first_name'] = req.body.first_name;
			data['customer']['last_name'] = req.body.last_name;


			data['customer']['email'] = req.body.email;
			data['customer']['phone'] = req.body.phone;
			data['customer']['gender'] = req.body.gender;
			data['customer']['dob'] = new Date(req.body.dob);

			data['customer']['city'] = req.body.city;
			// data['customer']['nationality_id'] = req.body.nationality_id;
			data['customer']['country_code'] = req.body.country_code;
			data['customer']['country_id'] = req.body.country_id;
			data['customer']['language_code'] = req.query.language_code;
			// data['customer']['contact'] = req.body.mobile_no;
			// data['customer']['country_id'] = req.body.country; 
			// data['customer']['gender'] = req.body.gender;
			// data['customer']['designation'] = req.body.designation;
			// data['customer']['country_code'] = req.body.country_code;
			// data['customer']['customer_unique_id'] = newId(10, 10);
			// data['customer']['member_type_id'] = req.body.member_Id;
			// data['customer']['member_code'] = req.body.member_code;
		} catch (e) {
			//
			console.log(e);
		}
		return data;
		
		
	}

    /**
     * Edit customer formatter
     *
     * @param req
     */
	editCustomer(req) {
		let data = {};
		data.customer = {};
		// data.customer_social_links = {};
		// data.customer_cards = {};
		try {
			//Customer data
			data['customer']['customer_id'] = req.body.customer_id
			data['customer']['first_name'] = req.body.first_name;
			data['customer']['last_name'] = req.body.last_name;


			data['customer']['email'] = req.body.email;
			data['customer']['phone'] = req.body.phone;
			data['customer']['gender'] = req.body.gender;
			data['customer']['dob'] = new Date(req.body.dob);

			data['customer']['city'] = req.body.city;
			// data['customer']['nationality_id'] = req.body.nationality_id;
			data['customer']['country_code'] = req.body.country_code;
			data['customer']['country_id'] = req.body.country_id;
		} catch (e) {
			//
		}
		data['customer']['tenant_id'] = req['tenant_id'];
		// data['customer']['created_by'] = req['tenant_user_id'];
		return data;
	}

    /**
     * Formatter
     *
     * @param req
     * @return data
     */
	getCustomerByID(req) {
		let data = {};
		data.tenant_id = req.tenant_id;
		data.customer_id = req.params.customer_id;
		return data;
	}

    /**
     * Customer list formatter
     *
     * @param {*} req
     * @returns
     */
	getCustomersList(req) {
		let data = {
			tenant_id: req['tenant_id'],
			name: req.query.name,
			email: req.query.email,
			phone: req.query.phone,
			customer_unique_id: req.query.customer_unique_id,
			limit: parseInt(req.query.limit),
			offset: parseInt(req.query.offset),
			customer_id: req.query.customer_id,
			from_date: req.query.start_date,
			to_date: req.query.end_date,
		};
		return data;
	}

    /**
     * Tenant customer list formatter
     *
     * @param {*} req
     * @returns
     */
	getTenantCustomersList(req) {
		let data = {};
		data['tenant_id'] = req['tenant_id'];
		data['customer_id'] = req.query.customer_id;
		data['limit'] = parseInt(req.query.limit);
		data['offset'] = parseInt(req.query.offset);
		data['search'] = req.query.search;
		data['from_date'] = req.query.from_date;
		data['to_date'] = req.query.to_date;
		return data;
	}

    /**
     * Customer card process formatter
     *
     * @param {*} req
     * @returns
     */
	processCustomerCards(req) {
		let data = {};
		data['tenant_id'] = req['tenant_id'];
		data['created_by'] = req['tenant_user_id'];

		try {
			data['card_data'] = req.body['card_data'];
			data['customer_id'] = req.body['customer_id'];
		} catch (e) {
			//
		}
		return data;
	}

    /**
     * Remove customer card formatter
     *
     * @param {*} req
     * @returns
     */
	removeCustomerCard(req) {
		let data = {};
		data['customer_card_id'] = req.body['card_id'];
		data['customer_id'] = req.body['customer_id'];
		return data;
	}

    /**
     * Get customer card type formatter
     *
     * @param {*} req
     * @returns
     */
	getCustomerCardType(req) {
		let data = {};
		data['card_number'] = req.body['card_number'];
		return data;
	}

    /**
     * Comment formatter
     *
     * @param {*} req
     * @returns
     */
	comment(req) {
		let data = {};
		data.comment = {};
		data['comment']['customer_id'] = req.body.customer_id;
		data['comment']['comment'] = req.body.comment;
		data['comment']['tenant_id'] = req['tenant_id'];
		data['comment']['created_by'] = req['tenant_id'];
		data['tagData'] = req.body.note_tag;
		return data;
	}

    /**
     * Comment list formatter
     *
     * @param {*} req
     * @returns
     */
	commentList(req) {
		let data = {
			tenant_id: req['tenant_id'],
			limit: parseInt(req.query.limit),
			offset: parseInt(req.query.offset),
			search: req.query.search,
			customer_id: req.query.customer_id,
		};
		return data;
	}

    /**
     * Customer assigned tags formatter
     *
     * @param {*} req
     * @returns
     */
	getCustomerAssignTags(req) {
		let data = {
			tenant_id: req['tenant_id'],
			customer_id: req.query.customer_id,
		};
		return data;
	}

    /**
     * COmment list by tag formatter
     *
     * @param {*} req
     * @returns
     */
	commentListByTag(req) {
		let data = {};
		data['tenant_id'] = req['tenant_id'];
		data['limit'] = parseInt(req.query.limit);
		data['offset'] = parseInt(req.query.offset);
		data['search'] = req.query.search;
		data['customer_id'] = req.params.customer_id;
		if (req.params.tags) {
			data['tags'] = req.params.tags.split(",");
		}
		return data;
	}

    /**
     *
     *
     * @param {*} req
     * @returns
     */
	updateCommentStarred(req) {
		let data = {};
		data['tenant_id'] = req['tenant_id'];
		data['comment_id'] = req.query.comment_id;
		data['starred'] = req.query.starred;
		return data;
	}

    /**
     *
     *
     * @param {*} req
     * @returns
     */
	checkUserValidation(req) {
		let data = {}
		data['customer_id'] = req.body.customer_id;
		data['email'] = req.body.email;
		data['tenant_id'] = req['tenant_id'];
		data['created_by'] = req['tenant_id'];
		return data;
	}

    /**
     *
     *
     * @param {*} req
     * @returns
     */
	customerProfileStatusChange(req) {
		let data = {};
		data['customer_id'] = req.body.customer_id;
		data['status'] = req.body.status;
		data['tenant_id'] = req['tenant_id'];
		return data;
	}

    /**
     *
     *
     * @param {*} req
     * @returns
     */
	fetchBulkUploadFiles(req) {
		let data = {};
		try {
			data['tenant_id'] = req['tenant_id'];
			data['limit'] = parseInt(req.query.limit);
			data['offset'] = parseInt(req.query.offset);
			data['search'] = req.query.search;
			data['from_date'] = req.query.from_date;
			data['to_date'] = req.query.to_date;
			data['process_type'] = req.query.process_type;
		} catch (e) {
			console.log(e)
		}
		return data;
	}

    /**
     *
     *
     * @param {*} req
     * @returns
     */
	fetchBulkUploadFileData(req) {
		let data = {};
		try {
			data['tenant_id'] = req['tenant_id'];
			data['process_id'] = req.query.process_id;
		} catch (e) {
			console.log(e)
		}
		return data;
	}

    /**
     *
     *
     * @param {*} req
     * @returns
     */
	customerTierUpgrade(req) {
		let data = {};
		try {
			data['tenant_id'] = req['tenant_id'];
			data['customer_id'] = req.body['customer_id'];
			data['time_period'] = req.body['time_period'];
			data['tier_id'] = req.body['tier_id'];
			data['tier_name'] = req.body['tier_name'];
			data['lapse_policy'] = req.body['lapse_policy'];
			data['transaction_type'] = req.body['transaction_type'];
			data['created_by'] = req['tenant_id'];
			// query_data['current_tier_name'] = req.body['current_tier_name'];

		} catch (e) {
			console.log(e)
		}

		if (req.body['tier_price']) {
			data['tier_price'] = req.body['tier_price'];
		} else {
			data['tier_point'] = req.body['tier_point'];
		}
		return data;
	}

    /**
     *
     *
     * @param {*} req
     * @returns
     */
	getCustomerActivity(req) {
		let data = {};
		try {
			data['tenant_id'] = req['tenant_id'];
			data['customer_id'] = req.query.customer_id;
		} catch (error) {
			console.log(error)
		}
		return data
	}

    /**
     *
     *
     * @param {*} req
     * @returns
     */
	getHistoryList(req) {
		let data = {};
		try {
			data['tenant_id'] = req['tenant_id'];
			data['customer_id'] = req.query.customer_id;
		} catch (error) {
			console.log(error)
		}
		return data
	}

    /**
     *
     *
     * @param {*} req
     * @returns
     */
	getCustomerGraphValue(req) {
		let data = {};
		try {
			data['tenant_id'] = req['tenant_id'];
			data['customer_id'] = req.query.customer_id;
		} catch (error) {
			console.log(error)
		}
		return data;
	}

    /**
     *
     *
     * @param {*} req
     * @returns
     */
	getCustomerTableColumns(req) {
		let data = {};
		try {
			data['tenant_id'] = req['tenant_id'];
		} catch (error) {
			console.log(error)
		}
		return data;
	}

    /**
     *
     *
     * @param {*} req
     * @returns
     */
	getCustomerAssignConsent(req) {
		let data = {};
		data['customer_id'] = req.query.customer_id;
		data['limit'] = parseInt(req.query.limit);
		data['offset'] = parseInt(req.query.offset);
		data['search'] = req.query.search;
		return data
	}

    /**
     *
     *
     * @param {*} req
     * @returns
     */
	customerDowngradeTier(req) {
		let query_data = {};
		try {
			query_data['tenant_id'] = req['tenant_id'];
			query_data['customer_id'] = req.body['customer_id'];
			query_data['time_period'] = req.body['time_period'];
			query_data['tier_id'] = req.body['tier_id'];
			query_data['tier_name'] = req.body['tier_name'];
			query_data['lapse_policy'] = req.body['lapse_policy'];
			query_data['tier_price'] = req.body['tier_price'];
			query_data['created_by'] = req['tenant_id'];
		} catch (error) {
			console.log(error)
		}
		return query_data;
	}

    /**
     *
     *
     * @param {*} req
     * @returns
     */
	createDynamicField(req) {
		let data = {};
		try {
			data['tenant_id'] = req['tenant_id'];
			data['field_name'] = req.body.field_name;
			data['length'] = req.body.length;

		} catch (error) {
			console.log(error)
		}
		return data;
	}

    /**
     *
     *
     * @param {*} req
     * @returns
     */
	getSalesOfficeList(req) {
		let data = {};
		try {
			data['tenant_id'] = req['tenant_id'];

		} catch (error) {
			console.log(error)
		}
		return data;
	}

    /**
     *
     *
     * @param {*} req
     * @returns
     */
	getCustomerPointTransferList(req) {
		let data = {};
		data['tenant_id'] = req['tenant_id'];
		data['transfer_from'] = req.query.customer_id;
		data['transfer_to'] = req.query.customer_id;
		data['limit'] = req.query.limit;
		data['offset'] = req.query.offset;
		return data;
	}

    /**
     *
     *
     * @param {*} req
     * @returns
     */
	addTagInComment(req) {
		let data = {};
		data = req.body;
		return data;
	}

    /**
     *
     *
     * @param {*} req
     * @returns
     */
	removeTagFromComment(req) {
		let data = {};
		data['commentId'] = req.body.commentId;
		data['tagId'] = req.body.tagId;
		return data;
	}

    /**
     *
     *
     * @param {*} req
     * @returns
     */
	addTagInSource(req) {
		let data = {};
		data['tenant_id'] = req['tenant_id'];
		data['tag_name'] = req.body.tag_name;
		data['customer_id'] = req.body.customer_id;
		data['tag_id'] = req.body.tag_id;
		return data;
	}

    /**
     *
     *
     * @param {*} req
     * @returns
     */
	removeCustomerSource(req) {
		let data = {};
		data['customer_id'] = req.body.customer_id;
		data['tag_id'] = req.body.tag_id;
		return data;
	}
}
