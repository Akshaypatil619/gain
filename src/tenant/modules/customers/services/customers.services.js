const xlsx = require('xlsx');
let Validator = require('validatorjs');
let Response_adapter = require("../../../../core/response_adapter");
let messages = require("../../../../../config/messages.js");
let status_codes = require("../../../../../config/response_status_codes.js");
let knex = require("../../../../../config/knex");
let Common_functions = require("../../../../core/common_functions.js");
let Queries = require("../queries/mysql/customer");
let config = require('../../../../../config/config');
let configkey = require("../../../../../config/config");
let encription_key = configkey.encription_key;
let response = new Response_adapter();
let common_functions = new Common_functions();
let responseMessages = require("../response/customer.response");
let customerModel = new (require("../models/customers_model." + config.db_driver))();
let queries = new Queries();

// let pointService = new (require("../../../../common/points/services/point.service"))();
module.exports = class CustomersService {

    /**
     * Add customer
     *
     * @param _data
     * @returns {*}
     */
	addCustomer(_data) {
		// prepare variables
		let data = {};
		let customerData = _data.customer;
		// let customerSocialLinks = _data.customer_social_links;

		// let customer_cards = _data.customer_cards;
		Object.assign(data, customerData);

		// get customer information
		// return customerModel.getCustomerInfo({
		// 	select: { id: 'customers.id' },
		// 	where: { email: data.email, contact: data.contact }
		// 		}).then((customers_result) => {
		let obj = customerModel.getCustomerInfo(customerData);
		return obj.then((customers_result) => {
			if (customers_result.length > 0) {
				throw new Error("customer_already_exist");
			} else {
				return customerModel.insertCustomerInfo(data);
			}
		}).then(async (customer_id) => {
			// customerSocialLinks['customer_id'] = customer_id;
			// await customerModel.insertCustomerSocialProfile(customerSocialLinks);
			return response.response_success(true, status_codes.customer_create_success, messages.customer_create_success, customer_id);
		}).catch((err) => common_functions.catch_error(err));
	}

    /**
     * Edit customer
     *
     * @param _data
     * @returns {*}
     */
	editCustomer(_data) {
		// prepare variables
		let data = {};
		let customerData = _data.customer;
		Object.assign(data, customerData);

		// delete unwanted variables
		delete data.tenant_id;
		delete data.customer_id;
		delete data.created_by;

		// get
		return customerModel.checkCustomerId(customerData)
			// customer found
			.then((result) => {
				if (result.length > 0) {
					return customerModel.getCustomerInfo(customerData)
				} else {
					throw new Error("customer_not_found")
				}
			})
			// customer already exists
			.then((customers_result) => {
				if (customers_result.length > 0) {
					throw new Error("customer_already_exist");
				} else {
					return customerModel.updateCustomer({
						update: data,
						where: { id: customerData['customer_id'] }
					});
				}
				// })
				// .then(async function (id) {
				// 	return customerModel.getCustomerSocialProfileInfo({
				// 		select: { id: 'id' },
				// 		where: { customer_id: customerData.customer_id }
				// 	})
				// })
				// .then(async (social_id) => {
				// 	if (social_id.length > 0) {
				// 		return customerModel.updateCustomerSocialProfileInfo({
				// 			data: customerSocialLinks,
				// 			where: { customer_id: customerData['customer_id'] }
				// 		});
				// 	} else {
				// 		customerSocialLinks['customer_id'] = customerData['customer_id'];
				// 		return customerModel.insertCustomerSocialProfile(customerSocialLinks);
				// 	}
			}).then((customer_social_links_id) => {
				return response.response_success(true, status_codes.customer_update_success, messages.customer_update_success);
			}).catch((err) => common_functions.catch_error(err));
	}

	//Get Customer By ID
	async getCustomerByID(_data) {
		let data = {};
		let customerData = _data.customer_id;
		Object.assign(data, customerData);
		return customerModel.getCustomerProfile({
			where: { id: _data.customer_id }
		})

			.then(async (customer_result) => {
				if (customer_result.length >= 1) {
					customer_result[0]['total_points'] = await customerModel.get_locked_points({ customer_id: _data.customer_id, total_points: customer_result[0]['total_points'] });
					return responseMessages.success("customer_found", customer_result);
				} else {
					throw new Error("customer_not_found")
				}
			})
			.catch(function (err) {
				console.log("Error : ", err)
				// return failed response to controller
				let error = (typeof err.errors != 'undefined') ? err.errors : err.message;
				return responseMessages.failed(responseMessages.hasOwnProperty(err.message) ? err.message : "customer_fetch_error", error)
			});

	}

	//Get Customer List With Filter
	async getCustomersList(_data) {
		let return_result = {};
		_data.columns = {
			customer_id: "customers.id",
			first_name: knex.raw("CAST(AES_DECRYPT(customers.first_name,'" + encription_key + "') AS CHAR(255))"),
			last_name: knex.raw("CAST(AES_DECRYPT(customers.last_name,'" + encription_key + "') AS CHAR(255))"),
			email: knex.raw("CAST(AES_DECRYPT(customers.email,'" + encription_key + "') AS CHAR(255))"),
			oam_commission: "customers.oam_commission",
			owner_commission: "customers.owner_commission",
			gain_commission: "customers.gain_commission",
			dob: "customers.dob",
			gender: "customers.gender",
			created_at: knex.raw("DATE_FORMAT(customers.created_at,'%b %d,%Y, %h:%i:%S %p')"),
			phone: knex.raw("CAST(AES_DECRYPT(customers.phone,'" + encription_key + "') AS CHAR(255))"),
			customer_unique_id: knex.raw("CAST(AES_DECRYPT(customers.customer_unique_id,'" + encription_key + "') AS CHAR(255))")
		};

		let obj = customerModel.getCustomersList(_data);
		return obj.then(async (result) => {
			if (result.length > 0) {
				return_result.customer_list = result;
				delete _data.limit;
				delete _data.offset;
				delete _data.columns;
				let countData = await customerModel.getCustomersList(_data);
				return_result.total_records = countData[0].total_records

				return response.response_success(true, status_codes.customer_found, messages.customer_found, (return_result));
			} else {
				throw new Error("customers_not_found")
			}
		}).catch((err) => common_functions.catch_error(err));
	}

    /**
     *
     *
     * @author Brijehs Kumar Khatri
     * @param {*} _data
     * @returns
     */
	async getTenantCustomersList(_data) {
		let returnResult = {};
		// columns 
		_data.columns = {
			customer_id: "customers.id",
			customer_unique_id: "customers.customer_unique_id",
			first_name: "customers.first_name",
			email: "customers.email",
			address_line1: "customers.address_line1",
			address_line2: "customers.address_line2",
			phone: "customers.phone",
			country_code: "customers.country_code",
			created_at: "customers.created_at",
		};
		// Get tenant customer list 
		return customerModel.getCustomersList(_data)
			.then(async (result) => {

				if (result.length > 0) {
					returnResult.list = result;
					delete _data.columns;
					// get tenant customer list count data
					let countData = await customerModel.getTenantCustomersList(_data);
					// store count in returnResult
					returnResult.totalRecords = countData[0].totalRecords
					//return response with result 
					return responseMessages.success("customer_found", returnResult);
				} else {
					// throw error customer not found
					throw new Error("customer_not_found");
				}
			}).catch(function (err) {
				let error = (typeof err.errors != 'undefined') ? err.errors : err.message;
				return responseMessages.failed(responseMessages.hasOwnProperty(err.message) ? err.message : "customer_fetch_error", error)
			});
	}

    /**
     *
     *
     * @author Brijehs Kumar Khatri
     * @param {*} _data
     * @returns
     */
	processCustomerCards(_data) {
		// batch insert customer cards
		return customerModel.batchInsertCustomerCards(_data)
			.then((result) => {
				// return success response
				return responseMessages.success("card_inserted_success");
			}).catch(function (err) {
				// return error response 
				let error = (typeof err.errors != 'undefined') ? err.errors : err.message;
				return responseMessages.failed(responseMessages.hasOwnProperty(err.message) ? err.message : "history_data_fetch_error", error)
			});
	}

    /**
     *
     *
     * @author Brijehs Kumar Khatri
     * @param {*} _data
     * @returns
     */
	removeCustomerCard(form_data) {
		// get customer card
		return customerModel.getCustomerCard(form_data)
			.then((result) => {
				// check card found or not
				if (result.length > 0) {
					// card found and check status active or inactive
					if (result[0].status == 0) {
						// throw error card already inactive
						throw new Error("card_already_removed")
					} else {
						// soft remove(inactive) card
						return customerModel.removeCustomerCard({ updateData: { status: 0 }, where: { id: form_data['customer_card_id'], } })
					}
				} else {
					// throw error card not found
					throw new Error("card_not_found")
				}
			})
			.then((data) => {
				// return response card removed
				return responseMessages.success("customer_card_removed_success");
			}).catch(function (err) {
				// return error response 
				let error = (typeof err.errors != 'undefined') ? err.errors : err.message;
				return responseMessages.failed(responseMessages.hasOwnProperty(err.message) ? err.message : "customer_card_removed_failed", error)
			});
	}

    /**
     *
     *
     * @author Brijehs Kumar Khatri
     * @param {*} _data
     * @returns
     */
	async getCustomerCardType(_data) {
		// promise for getting card type 
		let result = await new Promise(async (resolve, reject) => {
			// call a common function for getting card information
			await common_functions.GET_CARD_INFORMATION(_data['card_number'], (card_result) => {
				if (card_result) {
					// card information found
					resolve(responseMessages.success("customer_card_type_found", card_result));
				} else {
					//card information not found
					reject(responseMessages.failed("customer_card_type_not_found"));
				}
			});
		});
		// return result
		return result;
	}

    /**
     *
     *
     * @author Brijehs Kumar Khatri
     * @param {*} _data
     * @returns
     */
	comment(_data) {
		let data = {};
		let comment_tagData = [];
		// assign comment to data object
		Object.assign(data, _data.comment);
		let commentId = 0;
		// insert comment
		return customerModel.insertComment(data)
			.then((result) => {
				commentId = result
				// add comment id to tags
				_data.tagData.forEach(function (tag) {
					comment_tagData.push({
						customer_comment_id: result,
						note_tag_id: tag
					});
				});

				// Batch insert comment tag data
				return customerModel.batchInsertCommentTags(comment_tagData)
			})
			.then(function (newData) {
				// get inserted comment information
				return customerModel.getCommentById({ id: commentId });
			})
			.then((commentName) => {
				// return success response
				return responseMessages.success("comment_created", commentName);
			}).catch((err) => {
				// return failed response
				let error = (typeof err.errors != 'undefined') ? err.errors : err.message;
				return responseMessages.failed(responseMessages.hasOwnProperty(err.message) ? err.message : "comment_created_failed", error);
			});
	}

    /**
     *
     *
     * @author Brijehs Kumar Khatri
     * @param {*} query_data
     * @returns
     */
	commentList(query_data) {
		// Columns 
		query_data.columns = {
			id: "customer_comment.id",
			comment: "customer_comment.comment",
			starred: "customer_comment.starred",
			status: "customer_comment.status",
			comment_date: "customer_comment.created_at",
			tenant_name: "tenants.name",
			tag_name: "master_tag.tag_name",
			tag_type: "master_tag.tag_name",
			user_type: "master_tag.tag_name",
			tag_id: "master_tag.id",
			customer_comment_id: "comment_tags.customer_comment_id",
			note_tag_id: "comment_tags.note_tag_id"
		};
		// get comment list
		return customerModel.getComments(query_data)
			.then((data) => {
				if (data.length > 0) {
					let result = [];
					// format result
					data.forEach(function (obj) {
						if (!this[obj.id]) {
							this[obj.id] = {
								id: obj.id,
								comment: obj.comment,
								comment_date: obj.comment_date,
								starred: obj.starred,
								status: obj.status,
								tenant_name: obj.tenant_name,
								noteTags: []
							};
							result.push(this[obj.id]);
						}
						this[obj.id].noteTags.push({
							tag_id: obj.tag_id,
							tag_name: obj.tag_name,
							tag_type: obj.tag_type,
							user_type: obj.user_type
						});
					}, Object.create(null));
					// return comment list 
					return responseMessages.success("comment_found", result);
				} else {
					// throw error comment not found
					throw new Error("comment_not_found");
				}
			}).catch((err) => {
				// return error response
				let error = (typeof err.errors != 'undefined') ? err.errors : err.message;
				return responseMessages.failed(responseMessages.hasOwnProperty(err.message) ? err.message : "comment_not_found", error);
			});
	}

    /**
     *
     *
     * @param {*} _data
     * @returns
     */
	getCustomerAssignTags(_data) {
		// set comlumns
		_data.columns = {
			tag_name: "master_tag.tag_name",
			tag_id: "customer_assigned_source_tags.id",
			tag_master_id: "customer_assigned_source_tags.tag_id",
			status: "customer_assigned_source_tags.status",
		};
		// get customer assigned tags
		return customerModel.getCustomerAssignTags(_data)
			.then(function (result) {
				// check result 
				if (result.length > 0) {
					// tags found, return result
					return responseMessages.success("tag_master_found", result);
				} else {
					// tags not found, throw error tag not found
					throw new Error("tag_master_not_found")
				}
			}).catch(function (err) {
				// return error response
				let error = (typeof err.errors != 'undefined') ? err.errors : err.message;
				return responseMessages.failed(responseMessages.hasOwnProperty(err.message) ? err.message : "tag_master_not_found", error)
			});
	}

    /**
     *
     *
     * @author Brijehs Kumar Khatri
     * @param {*} _data
     * @returns
     */
	commentListByTag(_data) {
		// set columns
		_data.columns = {
			id: "customer_comment.id",
			comment: "customer_comment.comment",
			starred: "customer_comment.starred",
			status: "customer_comment.status",
			comment_date: "customer_comment.created_at",
			tenant_name: "tenants.name",
			note_tag_name: "master_tag.tag_name",
			note_tag_id: "master_tag.id",
		};
		// get comment list by tag
		return customerModel.commentListByTag(_data)
			.then((data) => {
				if (data.length > 0) {
					let result = [];
					// format result for response
					data.forEach(function (obj) {
						if (!this[obj.id]) {
							this[obj.id] = {
								id: obj.id,
								comment: obj.comment,
								comment_date: obj.comment_date,
								starred: obj.starred,
								status: obj.status,
								tenant_name: obj.tenant_name,
								noteTags: []
							};
							result.push(this[obj.id]);
						}
						this[obj.id].noteTags.push({
							note_tag_id: obj.note_tag_id,
							note_tag_name: obj.note_tag_name
						});
					}, Object.create(null));
					//return result
					return responseMessages.success("comment_found", result);
				} else {
					// throw error comment not found
					throw new Error("comment_not_found");
				}
			}).catch(function (err) {
				// return error
				let error = (typeof err.errors != 'undefined') ? err.errors : err.message;
				return responseMessages.failed(responseMessages.hasOwnProperty(err.message) ? err.message : "comment_not_found", error)
			});
	}

    /**
     *
     *
     * @author Brijehs Kumar Khatri
     * @param {*} query_data
     * @returns
     */
	updateCommentStarred(query_data) {
		// update comment status where comment_id matched
		return customerModel.updateComment({
			update: { starred: query_data["starred"] },
			where: { id: query_data['comment_id'] }
		})
			.then((result) => {
				if (result) {
					// return comment status updated
					return responseMessages.success("comment_status_change_success", result);
				} else {
					// throw error comment status already updated
					throw new Error("comment_status_already_updated");
				}
			})
			.catch(function (err) {
				// return error
				let error = (typeof err.errors != 'undefined') ? err.errors : err.message;
				return responseMessages.failed(responseMessages.hasOwnProperty(err.message) ? err.message : "comment_status_not_change", error)
			});
	}

    /**
     *
     *
     * @author Brijehs Kumar Khatri
     * @param {*} _data
     * @returns
     */
	checkUserValidation(_data) {
		// update customer email_verified false where customer_id matched
		return customerModel.updateCustomer({
			update: { email_verified: false },
			where: { email: _data['email'], id: _data['customer_id'] }
		})
			.then((result) => {
				if (result > 0) {
					// return result
					return responseMessages.success("validation_check_success", result);
				} else {
					// throw error validation check failed
					throw new Error("validation_check_failed");
				}
			})
			.catch(function (err) {
				// return error 
				let error = (typeof err.errors != 'undefined') ? err.errors : err.message;
				return responseMessages.failed(responseMessages.hasOwnProperty(err.message) ? err.message : "validation_check_failed", error)
			});
	}

    /**
     *
     *
     * @author Brijehs Kumar Khatri
     * @param {*} query_data
     * @returns
     */
	customerProfileStatusChange(query_data) {
		// update customer status where customer_id matched
		return customerModel.updateCustomer({
			update: { status: query_data.status },
			where: { id: query_data['customer_id'] }
		})
			.then((result) => {
				if (result) {
					// return result with customer status update
					return responseMessages.success("customer_status_updated", result);
				} else {
					// throw error customer status updated failed
					throw new Error("customer_status_updated_failed")
				}
			})
			.catch(function (err) {
				// return error
				let error = (typeof err.errors != 'undefined') ? err.errors : err.message;
				return responseMessages.failed(responseMessages.hasOwnProperty(err.message) ? err.message : "customer_status_updated_failed", error)
			});
	}

    /**
     *
     *
     * @author Brijehs Kumar Khatri
     * @param {*} _data
     * @returns
     */
	fetchBulkUploadFiles(_data) {
		// set columns
		_data.columns = {
			file_name: "bulk_process_files.file_name",
			process_id: "bulk_process_files.id",
			file_type: "bulk_process_files.file_type",
			created_at: "bulk_process_files.created_at",
		};
		// fetch bulk upload files
		let obj = customerModel.fetchBulkUploadFiles(_data);
		return obj.then((result) => {
			if (result.length > 0) {
				// return result
				return responseMessages.success("bulk_process_files_found", result);
			} else {
				// throw error bulk process files not found
				throw new Error("bulk_process_files_not_found");
			}
		})
			.catch(function (err) {
				// return error
				let error = (typeof err.errors != 'undefined') ? err.errors : err.message;
				return responseMessages.failed(responseMessages.hasOwnProperty(err.message) ? err.message : "bulk_process_files_fetch_err", error)
			});
	}

    /**
     *
     *
     * @author Brijehs Kumar Khatri
     * @param {*} query_data
     * @returns
     */
	fetchBulkUploadFileData(query_data) {
		// set columns
		query_data.columns = {
			record_data: "bulk_process_file_data.record_data",
			record_errors: "bulk_process_file_data.record_errors",
		};
		// fetch bulk upload file data where process id matched
		let obj = customerModel.fetchBulkUploadFileData({
			columns: query_data.columns,
			where: { process_id: query_data.process_id }
		})
		return obj.then((result) => {
			if (result.length > 0) {
				// bulk process files data found, return result
				return responseMessages.success("bulk_process_file_data_found", result);
			} else {
				// throw error bulk process file data not found
				throw new Error("bulk_process_file_data_not_found")
			}
		}).catch(function (err) {
			// return error
			let error = (typeof err.errors != 'undefined') ? err.errors : err.message;
			return responseMessages.failed(responseMessages.hasOwnProperty(err.message) ? err.message : "bulk_process_file_data_fetch_error", error)
		});
	}

    /**
     *
     *
     * @author Brijehs Kumar Khatri
     * @param {*} _data
     */
	/* async customerTierUpgrade(_data) {

		let data = {};
		let transaction_data = {};
		Object.assign(data, _data);
		delete data.current_tier_name;
		// check tier_point is not null
		if (_data["tier_point"] && _data["tier_point"] != null) {
			let pointResult = await pointService.debitPoints({
				debit_points: _data['tier_point'],
				customer_id: _data['customer_id'],
				tenant_id: _data['tenant_id'],
				from_user_type: "customer",
				from_user_id: _data['customer_id'],
				to_user_id: _data['tenant_id'],
				to_user_type: 'tenant',
				activityCode: 'MANUAL_UPGRADE_CUSTOMER_TIER',
				// pointTypeName:"accrual"
			});
			// check transaction status 
			if (pointResult['status'] !== true) {
				// transaction failed, return result 
				return {
					status: false,
					status_code: pointResult['status_code'],
					message: pointResult['message']
				}
			} else {
				// transaction success,
				transaction_data['transaction_id'] = pointResult.values.transaction_id;
				// update customer upgrades
				return customerModel.updateCustomerUpgrades({
					update: { status: false },
					where: { customer_id: _data['customer_id'] }
				})
					.then((customer_tier_upgrade) => {

						let now = new Date();
						let new_date = new Date().setDate(now.getDate() + parseInt(_data.time_period));
						data['expiry_date'] = new Date(new_date);
						// insert customer upgrades
						return customerModel.insertCustomerUpgrades(data);
					}).then(() => {
						// update customer for tier
						return customerModel.updateCustomer({
							update: { tier: _data['tier_id'] },
							where: { id: _data['customer_id'] }
						});
					}).then(async (res) => {
						// set transaction points data
						let transaction_point = {
							transaction_id: transaction_data.transaction_id,
							customer_id: _data.customer_id,
							tenant_id: _data.tenant_id,
							payment_method: "Point",
							points: _data.tier_point,
							description: "Current Tier Name Is:" + _data.current_tier_name + " & Upgrade To:" + _data.tier_name + "\n Tier Point:" + _data.tier_point + "\n Time Period:" + _data.time_period + "\n Transaction Type:" + _data.transaction_type
						}
						// insert customer transaction
						await customerModel.insertCustomerTransaction(transaction_point)
						// tier upgrade success, return success
						return responseMessages.success("customer_tier_upgrades_successfully");
					}).catch(function (err) {
						// return error response
						let error = (typeof err.errors != 'undefined') ? err.errors : err.message;
						return responseMessages.failed(responseMessages.hasOwnProperty(err.message) ? err.message : "customer_tier_upgrades_failed", error)
					});
			}

		} else {
			// queries.customer_tier_upgrade("update_status", form_data)
			customerModel.updateCustomerUpgrades({
				data: { status: false },
				where: { customer_id: _data['customer_id'] }
			})
				.then((customer_tier_upgrade) => {
					// return_data = customer_tier_upgrade;
					let now = new Date();
					let new_date = new Date().setDate(now.getDate() + parseInt(_data.time_period));
					data['expiry_date'] = new Date(new_date);

					return customerModel.insertCustomerUpgrades(data);
				}).then(() => {
					return customerModel.updateCustomer({
						update: { tier: _data['tier_id'] },
						where: { id: _data['customer_id'] }
					});
				}).then(async (res) => {
					let transaction_price = {
						customer_id: _data.customer_id,
						tenant_id: _data.tenant_id,
						payment_method: "Price",
						points: _data.tier_price,
						description: "Current Tier Name Is:" + _data.current_tier_name + " & Upgrade To:" + _data.tier_name + "\n Tier Price:" + _data.tier_price + "\n Time Period:" + _data.time_period + "\n Transaction Type:" + _data.transaction_type
					}
					await db_helper.cc_insert("customer_transaction", transaction_price)
					return responseMessages.success("customer_tier_upgrades_successfully");
				}).catch(function (err) {
					let error = (typeof err.errors != 'undefined') ? err.errors : err.message;
					return responseMessages.failed(responseMessages.hasOwnProperty(err.message) ? err.message : "customer_tier_upgrades_failed", error)
				});
		}
	} */

    /**
     *
     *
     * @author Brijehs Kumar Khatri
     * @param {*} query_data
     * @returns
     */
	getCustomerActivity(query_data) {
		// set columns
		query_data.columns = {
			wowcheresPurchase: "customer_voucher_purchases.created_at",
			lastFiveWowchersPurchase: "customer_voucher_purchases.voucher_purchase_rate",
			productPurchases: "customer_product_purchases.created_at",
			lastFiveProductPurchasesRate: "customer_product_purchases.product_purchase_rate",
		};
		// get customer activities
		let obj = customerModel.getCustomerActivities(query_data);
		return obj.then((result) => {
			// check result
			if (result.length > 0) {
				// result found
				result[0]['wowcheresPurchase'] = result[0].wowcheresPurchase.toLocaleString();
				result[0]['productPurchases'] = result[0].productPurchases.toLocaleString();
				// return activity result
				return responseMessages.success("activity_data_found", result);
			} else {
				// result not found, throw error activity data not found
				throw new Error("activity_data_not_found")
			}
		}).catch(function (err) {
			// throw error response
			let error = (typeof err.errors != 'undefined') ? err.errors : err.message;
			return responseMessages.failed(responseMessages.hasOwnProperty(err.message) ? err.message : "activity_data_fetch_error", error)
		});
	}

    /**
     *
     *
     * @author Brijehs Kumar Khatri
     * @param {*} _data
     * @returns
     */
	getHistoryList(_data) {
		// set columns
		_data.columns = {
			lastProductPurchasesAmount: "customer_product_purchases.product_purchase_rate",
			lastWowchersPurchasesAmount: "customer_voucher_purchases.voucher_purchase_rate",
			lastWowchersPurchasesTime: "customer_voucher_purchases.created_at",
			lastProductPurchasesTime: "customer_product_purchases.product_purchase_date",
			firstSeen: "customer_login_tokens.created_at",
			lastSeen: "customer_login_tokens.updated_at",
			totalProductPurchases: knex.raw("(select sum(customer_product_purchases.product_purchase_rate) from customer_product_purchases where customer_product_purchases.customer_id=?)", _data.customer_id),
			totalWowchesrPurchases: knex.raw("(select sum(customer_voucher_purchases.voucher_purchase_rate) f   rom customer_voucher_purchases where customer_voucher_purchases.customer_id=?)", _data.customer_id),
			totalSessions: knex.raw("(select count(customer_login_tokens.login_token) from customer_login_tokens where customer_login_tokens.customer_id=?)", _data.customer_id),
		};
		// get customer history list
		let obj = customerModel.getHistoryList(_data)
		return obj.then((result) => {
			// check result
			if (result.length > 0) {
				// result found
				result[0].totalPurchasesAmount = (result[0].totalProductPurchases + result[0].totalWowchesrPurchases);
				result[0]['firstSeen'] = result[0].firstSeen.toLocaleString();
				result[0]['lastSeen'] = result[0].lastSeen.toLocaleString();
				delete result[0].totalWowchesrPurchases;
				delete result[0].totalProductPurchases;
				// return history data
				return responseMessages.success("history_data_found", result);
			} else {
				// throw error history data not found
				throw new Error("history_data_not_found")
			}
		}).catch(function (err) {
			// return error response
			let error = (typeof err.errors != 'undefined') ? err.errors : err.message;
			return responseMessages.failed(responseMessages.hasOwnProperty(err.message) ? err.message : "history_data_fetch_error", error)
		});
	}

    /**
     *
     *
     * @author Brijehs Kumar Khatri
     * @param {*} _data
     * @returns
     */
	getCustomerGraphValue(_data) {
		let def_data = [{
			totalCustomerPointsCredit: 0,
			totalCustomerPointsDebit: 0,
			point_balance: 0
		}]
		// set columns
		_data.columns = {
			// totalCustomerProductPurchasesCount: knex.raw("(select count(customer_product_purchases.id) from customer_product_purchases where customer_product_purchases.customer_id =?)", _data.customer_id),
			// totalProductPurchasesCount: knex.raw("(select count(customer_product_purchases.id) from customer_product_purchases where customer_product_purchases.tenant_id=?)", _data.tenant_id),
			// totalCustomerOfferRedemptionsCount: knex.raw("(select count(offer_redemptions.customer_id) from offer_redemptions where offer_redemptions.customer_id=?)", _data.customer_id),
			// totalOfferRedemptionsCount: knex.raw("(select count(offer_redemptions.id) from offer_redemptions inner JOIN customers ON offer_redemptions.customer_id = customers.id where customers.tenant_id=?)", _data.tenant_id),
			// totalCustomerPointsTransacted: knex.raw("(select sum(case when wallet_ledger.customer_id =? AND point_ledger.transaction_type = 'debit' then wallet_ledger.points end) from wallet_ledger inner JOIN point_ledger ON point_ledger.wallet_ledger_id  = wallet_ledger.id where wallet_ledger.tenant_id=?)", [_data.customer_id, _data.tenant_id]),
			// totalPointsTransacted: knex.raw("(select sum(case when wallet_ledger.tenant_id =? AND point_ledger.transaction_type = 'debit' then wallet_ledger.points end) from wallet_ledger inner JOIN point_ledger ON point_ledger.wallet_ledger_id  = wallet_ledger.id where wallet_ledger.tenant_id=?)", [_data.tenant_id, _data.tenant_id]),
			// pointbalance: knex.raw("(select point_balance FROM cc_account_summery WHERE customer_id=?)", _data.customer_id),
			// totalLifeTimeValue: knex.raw("sum(case when wallet_ledger.customer_id =? then wallet_ledger.points end) as totalCustomerLifeTimeValue, sum(case when wallet_ledger.tenant_id =? then wallet_ledger.points end)", [_data.customer_id, _data.tenant_id]),
			// totalCustomerPointsCredit: knex.raw(" IFNULL(sum(case when point_ledger.transaction_type = 'credit'then point_ledger.points end),0) "),
			// totalCustomerPointsDebit: knex.raw(" IFNULL(sum(case when point_ledger.transaction_type = 'debit' then point_ledger.points end),0) "),
			totalCustomerPointsCredit: "cc_account_summary.credit",
			totalCustomerPointsDebit: "cc_account_summary.debit",
			point_balance: "cc_account_summary.point_balance"
		};
		_data.column = {
			totalPointsCredit: knex.raw(" IFNULL(sum(case when point_ledger.transaction_type = 'credit'then point_ledger.points end),0) "),
			totalPointsDebit: knex.raw(" IFNULL(sum(case when point_ledger.transaction_type = 'debit' then point_ledger.points end),0) "),
		};
		// get Customer Graph values
		return customerModel.getCustomerGraphValue(_data)
			.then(async (customer_points) => {
				if (customer_points) {
					if (customer_points.length > 0) {
						this.customer_point = customer_points;
					}
					else {
						this.customer_point = def_data;
					}
					return await customerModel.getTotalCustomerGraphValue(_data);
				}
			}).then(async (result) => {
				let pointlocked = await customerModel.get_points_locked(_data);
				let pointExpired = await customerModel.get_points_expired(_data);
				// check result
				if (result.length > 0) {
					// console.log("result sdfjehsfesdjncdlkc  dxk", result)
					// console.log("result----------------------", this.customer_point)
					// console.log("result[0].totalPointsCredit-------------", result[0].totalPointsCredit)
					// console.log("this.customer_point[0].totalCustomerPointsCredit", this.customer_point[0].totalCustomerPointsCredit)
					// console.log("result[0].totalPointsDebit", result[0].totalPointsDebit)
					// console.log("this.customer_point[0].totalCustomerPointsDebit", this.customer_point[0].totalCustomerPointsDebit)

					// result found
					// result[0]['customerPurchasesPercentage'] = Math.round((result[0].totalCustomerProductPurchasesCount / result[0].totalProductPurchasesCount) * 100);
					// result[0]['offerRedemptionsPercentage'] = Math.round((result[0].totalCustomerOfferRedemptionsCount / result[0].totalOfferRedemptionsCount) * 100);
					// result[0]['pointTransactedPercentage'] = Math.round((result[0].totalCustomerPointsTransacted / result[0].totalPointsTransacted) * 100);
					// result[0]['LifeTimeValuePercentage'] = Math.round((result[0].totalCustomerLifeTimeValue / result[0].totalLifeTimeValue) * 100);
					let totalPoints = this.customer_point[0].totalCustomerPointsCredit + this.customer_point[0].totalCustomerPointsDebit;
					result[0]['pointsCredit'] = Math.round((this.customer_point[0].totalCustomerPointsCredit / result[0].totalPointsCredit) * 100);
					console.log("result[0]['pointsCredit']", result[0]['pointsCredit']);
					result[0]['pointsDebit'] = Math.round((this.customer_point[0].totalCustomerPointsDebit / result[0].totalPointsDebit) * 100);
					console.log("result[0]['pointsDebit']", result[0]['pointsDebit']);
					result[0]['totalCustomerPointsCredit'] = this.customer_point[0].totalCustomerPointsCredit;
					console.log("result[0]['totalCustomerPointsCredit']", result[0]['totalCustomerPointsCredit']);
					result[0]['totalCustomerPointsDebit'] = this.customer_point[0].totalCustomerPointsDebit;
					console.log("result[0]['totalCustomerPointsDebit'] ", result[0]['totalCustomerPointsDebit']);
					result[0]['customerPointLocked'] = pointlocked[0].lock_point;
					result[0]['pointsLocked'] = Math.round((pointlocked[0].lock_point / totalPoints) * 100);
					result[0]['customerPointExpired'] = pointExpired[0].expired_point;
					result[0]['pointsExpired'] = Math.round((pointExpired[0].expired_point / totalPoints) * 100);

					// return graph values
					return responseMessages.success("graph_value_found", result);
				} else {
					// throw error graph value not found
					throw new Error("graph_value_not_found")
				}
			}).catch(function (err) {
				// return error
				let error = (typeof err.errors != 'undefined') ? err.errors : err.message;
				return responseMessages.failed(responseMessages.hasOwnProperty(err.message) ? err.message : "graph_value_fetch_error", error)
			});
	}

    /**
     *
     *
     * @author Brijehs Kumar Khatri
     * @param {*} _data
     * @returns
     */
	getCustomerTableColumns(_data) {
		// get customer Table columns
		return customerModel.getCustomerTableColumns(_data)
			.then((result) => {
				// check result
				if (result) {
					// columns found
					return responseMessages.success("customer_fields_found", result);
				} else {
					// throw error customer fields not found
					throw new Error("customer_fields_not_found");
				}
			}).catch(function (err) {
				// return error
				let error = (typeof err.errors != 'undefined') ? err.errors : err.message;
				return responseMessages.failed(responseMessages.hasOwnProperty(err.message) ? err.message : "customer_fields_fetch_error", error)
			});
	}

    /**
     *
     *
     * @author Brijehs Kumar Khatri
     * @param {*} _data
     * @returns
     */
	getCustomerAssignConsent(_data) {
		// set columns
		_data.columns = {
			id: "consent_master.id",
			name: "consent_master.name",
			status: knex.raw("Max(case when customer_assigned_consent.status is null then 0 ELSE 1 end)"),
			customer_id: "customer_assigned_consent.customer_id"
		};
		// get customer assign consent
		let obj = customerModel.getCustomerAssignConsent(_data);
		return obj.then((result) => {
			// check result
			if (result.length > 0) {
				// result found, return consents
				return responseMessages.success("consent_found", result);
			} else {
				// throw error consent not found
				throw new Error("consent_not_found")
			}
		}).catch(function (err) {
			// return result
			let error = (typeof err.errors != 'undefined') ? err.errors : err.message;
			return responseMessages.failed(responseMessages.hasOwnProperty(err.message) ? err.message : "consent_fetch_error", error)
		});
	}

    /**
     *
     *
     * @author Brijehs Kumar Khatri
     * @param {*} _data
     * @returns
     */
	customerDowngradeTier(_data) {
		let data = {};
		Object.assign(data, _data);

		// update customer upgrades status where customer_id matched
		return customerModel.updateCustomerUpgrades({
			update: { status: false },
			where: { customer_id: _data['customer_id'] }
		})
			.then((customer_tier_upgrade) => {
				// insert customer upgrades data
				return customerModel.insertCustomerUpgrades(data);
			}).then((customer_upgrades_id) => {
				// update customer upgrades expiry date where id matched
				return customerModel.updateCustomerUpgrades({
					update: { expiry_date: knex.raw("DATE_ADD(`created_at`, INTERVAL ? DAY)", [_data.time_period]) },
					where: { id: customer_upgrades_id[0] }
				})
			})
			.then(() => {
				// update tier of customer where customer id matched
				return customerModel.updateCustomer({
					update: { tier: _data['tier_id'] },
					where: { "id": _data['customer_id'] }
				})
			}).then((res) => {
				// return success response
				return responseMessages.success("customer_downgrade_tier_success");
			}).catch(function (err) {
				// return error
				let error = (typeof err.errors != 'undefined') ? err.errors : err.message;
				return responseMessages.failed(responseMessages.hasOwnProperty(err.message) ? err.message : "customer_downgrade_tier_failed", error)
			});
	}

    /**
     *
     *
     * @author Brijehs Kumar Khatri
     * @param {*} query_data
     * @param {*} callback
     * @returns
     */
	createDynamicField(query_data, callback) {
		// create dynamic field
		return customerModel.createDynamicField(query_data)
			.then(() => {
				// return success response
				return responseMessages.success("field_added");
			}).catch(function (err) {
				// return error
				let error = (typeof err.errors != 'undefined') ? err.errors : err.message;
				return responseMessages.failed(responseMessages.hasOwnProperty(err.message) ? err.message : "field_added_failed", error)
			});
	}

    /**
     *
     *
     * @author Brijehs Kumar Khatri
     * @param {*} _data
     * @returns
     */
	getSalesOfficeList(_data) {
		// set columns
		_data.columns = {
			id: "sales_offices.id",
			name: "sales_offices.name",
			status: "sales_offices.status"
		};
		// get sales office list
		return customerModel.getSalesOfficeList(_data)
			.then((result) => {
				// check result
				if (result.length > 0) {
					// return sales office list
					return responseMessages.success("sales_office_found", result);
				} else {
					// throw error sales office not found
					throw new Error("sales_office_not_found");
				}
			}).catch(function (err) {
				// return error
				let error = (typeof err.errors != 'undefined') ? err.errors : err.message;
				return responseMessages.failed(responseMessages.hasOwnProperty(err.message) ? err.message : "sales_office_fetch_error", error)
			});
	}

    /**
     *
     *
     * @author Brijehs Kumar Khatri
     * @param {*} query_data
     * @param {*} callback
     * @returns
     */
	/* async getCustomerPointTransferList(_data, callback) {
		// Debit points
		let listResult = await pointService.getTransferPointsList({
			user_type: "customer",
			user_id: _data['transfer_from'],
			limit: _data.limit,
			offset: _data.offset
		});

		// Check result
		if (listResult.status == true) {
			// Return success response with point debited
			return responseMessages.success("point_transfer_list_found", listResult.values);
		} else {
			// Return failed response with debit point error
			return responseMessages.failed("point_transfer_list_not_found", listResult.error ? listResult.error : listResult.message);
		}
	} */

	/* async customer_bulk_upload(form_data, callback) {
		let rules = {
			tenant_id: "required",
			// tenant_branch_id: "required",
		};
		let file_rules = {
			// first_name : "required",
			// dob : "required",
			// gender : "required",
			// email : "required|check_customer:"+form_data['tenant_id'],
			// phone : "required",
			// address_line1 : "required",
			// address_line2 : "required",

		}
		// file_rules = await filterCustomerFields(file_rules,'default_fields',form_data.tenant_id);
		Validator.registerAsync('check_customer', async function (value, tenant_id, attribute, passes) {
			value = common_functions.decryptData(value, form_data['tenant_id']);

			let customer = await queries.customer_bulk_upload("get_customer", {
				tenant_id: tenant_id,
				value: value,
			});

			if (!(customer.length > 0)) {
				passes();
			} else {
				passes(false, "Customer Already Exists.");
			}
		});

		let validation = new Validator(form_data, rules);
		if (validation.passes() && !validation.fails()) {
			let data = [];
			let recordData = [];
			let tenant_info = await knex('tenants')
				.select(['countries.id as country_id', 'customer_tiers.id as base_tier_id'])
				.join('countries', 'tenants.country_id', '=', 'countries.id')
				.join('customer_tiers', 'customer_tiers.tenant_id', '=', 'tenants.id')
				.where('tenants.id', form_data['tenant_id'])
				.groupBy('tenants.id');

			let workSheetData = [];

			if (form_data['is_excel'] == 1) {
				let workBook = xlsx.read(form_data['customer_bulk_upload_file'].data)
				let workSheet = workBook['Sheets'][Object.keys(workBook['Sheets'])[0]];
				workSheetData = xlsx.utils.sheet_to_json(workSheet);
			} else {
				workSheetData = await new Promise((resolve, reject) => {
					upload_files.uploadFile(form_data['customer_bulk_upload_file'], './uploads/tmp', form_data['customer_bulk_upload_file'].name, async (err, path) => {
						csv().fromFile(path).then((json) => {
							resolve(json);
						}).catch((err) => {
							reject(err)
						});
					});
				})
			}

			let fileData = {
				process_type: "customer_bulk_upload",
				file_name: form_data['customer_bulk_upload_file'].name,
				file_type: form_data['customer_bulk_upload_file'].name.split('.')[1],
				created_by_user: "tenant",
				tenant_id: form_data['tenant_id'],
				created_by: form_data['tenant_id'],
			}

			// let process = await knex('bulk_process_files').insert(fileData);
			let point_ledger_records = {};
			let tableName = '';
			let tableName2 = '';
			let data2 = [];
			let redemptionDetails = [];
			let accrualDetails = [];
			let counter = 0;
			for (let worksheetObj of workSheetData) {
				counter++;
				let worksheetObjValidation = new Validator(worksheetObj, file_rules);

				let canProcess = await new Promise((resolve, reject) => {
					worksheetObjValidation.passes(() => resolve(true));
					worksheetObjValidation.fails(() => resolve(false));
				});

				if (canProcess) {
					if (form_data['customer_bulk_upload_file'].name == 'Property_Mst.csv') {
						let obj = {
							id: worksheetObj['Prop_Id'],
							branch_name: worksheetObj['Short_Desc'],
							branch_description: worksheetObj['Prop_Desc'],
							branch_address: worksheetObj['Add1'] || '',
							point_of_contact_name: worksheetObj['Contact_Person'] || '',
							point_of_contact_phone_number: worksheetObj['Phone_No'] || '',
							point_of_contact_email: worksheetObj['Email_Id'] || '',
							created_by: form_data['tenant_id'],
							tenant_id: form_data['tenant_id'],
						}

						data.push(obj)
						tableName = 'tenant_branches';
					} else if (form_data['customer_bulk_upload_file'].name == 'Sales_Office_Mst.csv') {
						let obj = {
							id: worksheetObj['SOff_Id'],
							office_prefix: worksheetObj['Office_Prefix'],
							name: worksheetObj['Office_Name'],
							code: '',
							email_id: worksheetObj['Email_Id'] || '',
							contact_no: worksheetObj['Phone_No'] || '',
							address_line1: worksheetObj['Add1'] || '',
							address_line2: worksheetObj['Add2'] || '',
							created_by: form_data['tenant_id']
						}

						data.push(obj)
						tableName = 'sales_offices';
					} else if (form_data['customer_bulk_upload_file'].name == 'Sales_Rep_Mst.csv') {
						let obj = {
							id: worksheetObj['SRep_Id'],
							user_name: worksheetObj['SRep_Name'],
							designation: worksheetObj['Designation'] || '',
							email_id: worksheetObj['Email_Id'] || '',
							contact_no: worksheetObj['Phone_No'] || '',
							parent_user: 0,
							sales_office_id: worksheetObj['SOff_Id'],
							user_type: 1,
							created_by: form_data['tenant_id']
						}

						data.push(obj)
						tableName = 'sales_office_users';
					} else if (form_data['customer_bulk_upload_file'].name == 'User_Booker_Mst.csv') {
						let obj = {
							id: worksheetObj['SRep_Id'],
							user_name: worksheetObj['SRep_Name'],
							designation: worksheetObj['Designation'] || '',
							email_id: worksheetObj['Email_Id'] || '',
							contact_no: worksheetObj['Phone_No'] || '',
							parent_user: 0,
							sales_office_id: worksheetObj['SOff_Id'],
							user_type: 1,
							created_by: form_data['tenant_id']
						}

						data.push(obj)
						tableName = 'sales_office_users';
					} else if (form_data['customer_bulk_upload_file'].name == 'Company_Mst.csv') {

						let obj = {
							id: worksheetObj['Cmp_Id'],
							corporate_code: worksheetObj['Cmp_Code'],
							corporate_name: worksheetObj['Cmp_Name'],
							office_add1: worksheetObj['Add1'],
							office_add2: worksheetObj['Add2'],
							email_id: worksheetObj['Email_Id'],
							contact_no: worksheetObj['Phone_No'],
							contact_person: worksheetObj['Contact_Person'],
							created_by: form_data['tenant_id']
						}

						data.push(obj)
						tableName = 'corporate_master';
					} else if (form_data['customer_bulk_upload_file'].name == 'Company_Mst.csv') {

						let obj = {
							id: worksheetObj['Cmp_Id'],
							corporate_code: worksheetObj['Cmp_Code'],
							corporate_name: worksheetObj['Cmp_Name'],
							office_add1: worksheetObj['Add1'],
							office_add2: worksheetObj['Add2'],
							email_id: worksheetObj['Email_Id'],
							contact_no: worksheetObj['Phone_No'],
							contact_person: worksheetObj['Contact_Person'],
							created_by: form_data['tenant_id']
						}

						data.push(obj)
						tableName = 'corporate_master';
					} else if (form_data['customer_bulk_upload_file'].name == 'l_account_summery.csv') {

						let now = new Date();
						let obj = {
							customer_id: worksheetObj['customer_id'],
							tenant_id: form_data['tenant_id'],
							points: worksheetObj['balance_points'],
							point_type_id: 1,
							start_date: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
							end_date: new Date(now.getFullYear() + 5, now.getMonth() + 1, 0),
						}

						let pointObj = {
							transaction_id: uuid.v4(),
							wallet_ledger_id: 0,
							points: worksheetObj['balance_points']
						}

						data.push(obj)
						point_ledger_records[worksheetObj['customer_id']] = pointObj;
						tableName = 'wallet_ledger';
					} else if (form_data['customer_bulk_upload_file'].name == 'Booker_Mst.csv') {

						let obj = {
							id: worksheetObj['Bkr_Id'],
							tenant_id: form_data['tenant_id'],
							customer_unique_id: uuid.v4(),
							first_name: common_functions.encryptData(worksheetObj['Bkr_FirstName'], form_data['tenant_id']),
							last_name: common_functions.encryptData(worksheetObj['Bkr_LastName'], form_data['tenant_id']),
							dob: (worksheetObj['Birth_Date']) ? common_functions.encryptData(worksheetObj['Birth_Date'].substring(0, 4) + '-' + worksheetObj['Birth_Date'].substring(4, 6) + '-' + worksheetObj['Birth_Date'].substring(6, 8), form_data['tenant_id']) : '',
							email: common_functions.encryptData(worksheetObj['Email_Id'], form_data['tenant_id']),
							country_code: '+91',
							phone: common_functions.encryptData(worksheetObj['Phone_No'], form_data['tenant_id']),
							contact: common_functions.encryptData(worksheetObj['Mobile_No'], form_data['tenant_id']),
							password: 1234,
							country: worksheetObj['Country_Id'],
							state: '',
							city: '',
							address_line1: common_functions.encryptData(worksheetObj['Bkr_Add1'], form_data['tenant_id']),
							address_line2: common_functions.encryptData(worksheetObj['Bkr_Add2'], form_data['tenant_id']),
							gender: ['2', '3', '4'].indexOf(worksheetObj['Salut_Id']) > -1 ? 'female' : 'male',
							tier: worksheetObj['Salut_Id'] == 'G' ? 1 : 2,
							membership: 1,
							designation: worksheetObj['Bkr_Designation'],
							profile_pic: '',
							sign_up_with: '',
							email_verified: 1,
							sign_up_channel: 0,
							created_by: form_data['tenant_id'],
							created_by_user: 'Tenant',
						}
						let extra_fields = await this.filterCustomerFields(worksheetObj, 'extra_fields', form_data.tenant_id)
						Object.assign(obj, extra_fields);
						data.push(obj);
						tableName = 'customers';
					} else if (form_data['customer_bulk_upload_file'].name == 'Loyalty_Trans.csv') {
						if (parseInt(worksheetObj['Points']) == 0) {
							let redemptionDetailObj = {
								service_code: worksheetObj['Service_Code'],
								customer_id: worksheetObj['Bkr_Id'],
								transaction_date: (worksheetObj['Trans_Date']) ? worksheetObj['Trans_Date'].substring(0, 4) + '-' + worksheetObj['Trans_Date'].substring(4, 6) + '-' + worksheetObj['Trans_Date'].substring(6, 8) : '',
								points: worksheetObj['Redem_Points'],
								redeem_transaction_date: worksheetObj['Redem_Date'],
								redeem_voucher_no: worksheetObj['Redem_VouchNo'],
								alliance_id: worksheetObj['Alliance_Id'],
								redeem_status: worksheetObj['Redem_Status'],
								sales_office_id: worksheetObj['SOff_Id'],
								tenant_branch_id: worksheetObj['Prop_Id'],
							}
							redemptionDetails.push(redemptionDetailObj)
						} else {
							let obj = {
								service_code: worksheetObj['Service_Code'],
								customer_id: worksheetObj['Bkr_Id'],
								transaction_date: (worksheetObj['Trans_Date']) ? worksheetObj['Trans_Date'].substring(0, 4) + '-' + worksheetObj['Trans_Date'].substring(4, 6) + '-' + worksheetObj['Trans_Date'].substring(6, 8) : '',
								guest_name: worksheetObj['Guest_Name'],
								check_in_date: (worksheetObj['ChkIn_Date']) ? worksheetObj['ChkIn_Date'].substring(0, 4) + '-' + worksheetObj['ChkIn_Date'].substring(4, 6) + '-' + worksheetObj['ChkIn_Date'].substring(6, 8) : '',
								check_out_date: (worksheetObj['Trans_Date']) ? worksheetObj['Trans_Date'].substring(0, 4) + '-' + worksheetObj['Trans_Date'].substring(4, 6) + '-' + worksheetObj['Trans_Date'].substring(6, 8) : '',
								no_of_nights: worksheetObj['No_Of_Nights'],
								folio_bill_no: worksheetObj['Folio_Bill_No'],
								revenue: worksheetObj['Revenue'],
								bqt_company: worksheetObj['Bqt_Company'],
								bqt_event: worksheetObj['Bqt_Event'],
								bqt_event_date: (worksheetObj['Bqt_Event_Date']) ? worksheetObj['Bqt_Event_Date'].substring(0, 4) + '-' + worksheetObj['Bqt_Event_Date'].substring(4, 6) + '-' + worksheetObj['Bqt_Event_Date'].substring(6, 8) : '',
								points: worksheetObj['Points'],
								sales_office_id: worksheetObj['SOff_Id'],
								tenant_branch_id: worksheetObj['Prop_Id'],
							}
							accrualDetails.push(obj)
						}
						tableName = 'accrual_details';
					}
					// let customerObj = {
					//     customer_unique_id :  newId(10,10),
					//     country : tenant_info[0]['country_id'],
					//     tier : tenant_info[0]['base_tier_id'],
					//     tenant_branch_id : form_data['tenant_branch_id'],
					//     created_by_user : "tenant",
					//     created_by : form_data['tenant_id'],
					//     tenant_id : form_data['tenant_id'],
					// };
					// customer = await this.filterCustomerFields(customer,'default_fields',form_data.tenant_id);

				}

				recordData.push({
					'process_id': process[0],
					'record_data': JSON.stringify(worksheetObj),
					'record_errors': JSON.stringify(worksheetObjValidation.errors.errors),
				});
			}

			if (form_data['customer_bulk_upload_file'].name == 'l_account_summery.csv') {
				await knex('wallet_ledger').truncate();
				await knex('point_ledger').truncate();
			} else if (form_data['customer_bulk_upload_file'].name == 'Booker_Mst.csv') {
				await knex('customers').truncate();
			} else if (form_data['customer_bulk_upload_file'].name == 'Loyalty_Trans.csv') {
				await knex('accrual_details').truncate();
				await knex('redemption_details').truncate();
			}

			if (data.length > 0)
				await knex.batchInsert(tableName, data, 500000);
			if (tableName2 != '' && data2.length > 0) {
				await knex.batchInsert(tableName2, data2, 50000);
			}
			if (form_data['customer_bulk_upload_file'].name == 'l_account_summery.csv') {
				let walletRecords = await knex.from('wallet_ledger');
				let point_ledger_inser_data = [];

				for (let wallet_record of walletRecords) {
					if (typeof point_ledger_records[wallet_record.customer_id] != 'undefined') {
						point_ledger_records[wallet_record.customer_id].wallet_ledger_id = wallet_record.id;
						point_ledger_inser_data.push(point_ledger_records[wallet_record.customer_id]);
					}
				}
				await knex.batchInsert('point_ledger', point_ledger_inser_data, 50000);
			}
			if (form_data['customer_bulk_upload_file'].name == 'Loyalty_Trans.csv') {
				let batchSize = 25000;
				let accrualIndex = 0;
				let accrualObj = {};
				for (let accrualDet of accrualDetails) {
					if (typeof accrualObj[accrualIndex] == 'undefined')
						accrualObj[accrualIndex] = [];
					accrualObj[accrualIndex].push(accrualDet)
					if (accrualObj[accrualIndex].length > batchSize)
						accrualIndex++;
				}
				for (let index in accrualObj) {
					await knex.batchInsert('accrual_details', accrualObj[index], 500000);
				}

				let redemptionIndex = 0;
				let redemptionObj = {};
				for (let redemptionDet of redemptionDetails) {
					if (typeof redemptionObj[redemptionIndex] == 'undefined')
						redemptionObj[redemptionIndex] = [];
					redemptionObj[redemptionIndex].push(redemptionDet)
					if (redemptionObj[redemptionIndex].length > batchSize)
						redemptionIndex++;
				}
				for (let index in redemptionObj) {
					await knex.batchInsert('redemption_details', redemptionObj[index], 500000);
				}
			}
			// let insertCustomers = await knex.batchInsert('customers',customerData,5000);

			// let insertFileRecords = await knex.batchInsert('bulk_process_file_data',recordData,5000);

			return callback(response.response_success(true, status_codes.bulk_process_complete, messages.bulk_process_complete));
		} else {
			let errors = validation.errors.errors;
			return callback(response.response_error(false, status_codes.form_field_reqired, messages.form_field_reqired, errors));
		}
	} */

    /**
     *
     *
     * @author Brijehs Kumar Khatri
     * @param {*} bodyData
     * @param {*} callback
     * @returns
     */
	addTagInComment(bodyData, callback) {
		let comment_tagData = [];
		// add commentId in everytag
		bodyData.tagId.forEach(function (tag) {
			if (tag) {
				comment_tagData.push({
					customer_comment_id: bodyData.commentId,
					note_tag_id: tag
				});
			}
		});
		// batch insert comment tags
		return customerModel.batchInsertCommentTags(comment_tagData)
			.then(function (newData) {
				// return success response
				return responseMessages.success("comment_created", newData);
			})
			.catch(function (err) {
				// return error
				let error = (typeof err.errors != 'undefined') ? err.errors : err.message;
				return responseMessages.failed(responseMessages.hasOwnProperty(err.message) ? err.message : "comment_created_failed", error)
			});
	}

    /**
     *
     *
     * @author Brijehs Kumar Khatri
     * @param {*} bodyData
     * @param {*} callback
     * @returns
     */
	removeTagFromComment(bodyData, callback) {
		// update isDeleted where comment and tag id matched
		return customerModel.updateCommentTag({
			update: { isDeleted: 1 },
			where: { customer_comment_id: bodyData['commentId'], note_tag_id: bodyData['tagId'] }
		})
			.then(function (newData) {
				// return success response
				return responseMessages.success("comment_removed", newData);
			}).catch(function (err) {
				// return error
				let error = (typeof err.errors != 'undefined') ? err.errors : err.message;
				return responseMessages.failed(responseMessages.hasOwnProperty(err.message) ? err.message : "comment_removed_failed", error)
			});
	}


    /**
     *
     *
     * @author Brijehs Kumar Khatri
     * @param {*} form_data
     * @param {*} callback
     * @returns
     */
	async addTagInSource(form_data, callback) {
		let source_tag_data = form_data;
		// check tag_id
		if (form_data.tag_id == undefined || form_data.tag_id == '') {
			// store tag data in a variable
			let tag_data = {
				tag_name: form_data.tag_name,
				tag_type: 'source',
				user_type: 'tenant',
				created_by: form_data.tenant_id,
				tenant_id: form_data.tenant_id
			}
			// insert tag master data
			await customerModel.insertTagMaster(tag_data)
				.then(function (new_tag_id) {
					source_tag_data.tag_id = new_tag_id[0];
				})

		}

		delete source_tag_data.tag_name;
		delete source_tag_data.tenant_id;

		// insert customer assign tags
		return customerModel.insertCustomerAssignTags(source_tag_data)
			.then(function (newData) {
				// return success response
				return responseMessages.success("add_source_success", newData);
			})
			.catch(function (err) {
				// return error
				let error = (typeof err.errors != 'undefined') ? err.errors : err.message;
				return responseMessages.failed(responseMessages.hasOwnProperty(err.message) ? err.message : "add_source_failed", error)
			});

	}

    /**
     *
     *
     * @author Brijehs Kumar Khatri
     * @param {*} form_data
     * @param {*} callback
     * @returns
     */
	removeCustomerSource(form_data, callback) {
		//  update customer assign tag status where customer id and id is matched
		return customerModel.updateCustomerAssignTags({
			update: { status: 0 },
			where: { customer_id: form_data['customer_id'], id: form_data.tag_id }
		})
			.then(function (newData) {
				// return success response
				return responseMessages.success("source_removed", newData);
			})
			.catch(function (err) {
				// return error
				let error = (typeof err.errors != 'undefined') ? err.errors : err.message;
				return responseMessages.failed(responseMessages.hasOwnProperty(err.message) ? err.message : "source_removed_failed", error)
			});
	}

	async import_customers_cards(form_data, callback) {
		let rules = {
			tenant_id: "required",
		};
		let file_rules = {
			customer_id: "required",
			first_six_digit: "required",
			middle_number: "required",
			last_four_digits: "required",
			fourth_line_embossing: "required",

		}

		Validator.registerAsync('check_customer_cards', async function (value, customer_cards, attribute, passes) {
			let customer_has_card = await queries.import_customers_cards("get_customer_cards", {
				customer_cards: customer_cards,
				value: value
			})
				.then()
			if (customer_has_card.length > 0) {
				passes(false, "Customer Already Exists.");
			} else {
				passes();
			}
		});
		let validation = new Validator(form_data, rules);
		if (validation.passes() && !validation.fails()) {
			let customerCardsData = [];
			let recordData = [];

			let workBook = xlsx.read(form_data['customer_cards_bulk_upload'].data)
			let workSheet = workBook['Sheets'][Object.keys(workBook['Sheets'])[0]];
			let workSheetData = xlsx.utils.sheet_to_json(workSheet);

			let fileData = {
				process_type: "customer_cards_bulk_upload",
				file_name: form_data['customer_cards_bulk_upload'].name,
				file_type: form_data['customer_cards_bulk_upload'].name.split('.')[1],
				created_by_user: "tenant",
				tenant_id: form_data['tenant_id'],
				created_by: form_data['tenant_id'],
			}
			let process = await queries.import_customers_cards("insert", fileData);

			for (let customer of workSheetData) {
				file_rules['customer_id'] = 'required|check_customer_cards:' + customer['first_six_digit'] + +customer['middle_number'] + +customer['last_four_digits'];
				let customerValidation = new Validator(customer, file_rules);
				let canProcess = await new Promise((resolve, reject) => {
					customerValidation.passes(() => resolve(true));
					customerValidation.fails(() => resolve(false));
				});

				if (canProcess) {
					customerCardsData.push({
						'customer_id': customer['customer_id'],
						'tenant_id': form_data['tenant_id'],
						'created_by': form_data['tenant_id'],
						'issuer_identification_number': customer['first_six_digit'],
						'card_number': customer['middle_number'],
						'last_four_digits': customer['last_four_digits'],
						'fourth_line_embossing': customer['fourth_line_embossing'],
					});
				}
				recordData.push({
					'process_id': process[0],
					'record_data': JSON.stringify(customer),
					'record_errors': JSON.stringify(customerValidation.errors.errors),
				});
			}
			let insertFileRecords = await queries.import_customers_cards("betch_insert_customer_cards", customerCardsData);

			let insertFileRecord = await queries.import_customers_cards("batch_insert_bulk_process_file_data", recordData);

			if (insertFileRecords > 0) {
				return callback(response.response_success(true, status_codes.customer_import_success, messages.customer_import_success));
			} else {
				return callback(response.response_error(false, status_codes.customer_import_failed, messages.customer_import_failed));
			}
		} else {
			let errors = validation.errors.errors;
			return callback(response.response_error(false, status_codes.form_field_reqired, messages.form_field_reqired, errors));
		}
	}

	async fetch_dynamic_fields(query_data) {
		return JSON.parse('{"default_fields":[{"id":1,"tenant_id":1,"tenant_branch_id":1,"customer_unique_id":1,"first_name":1,"middle_name":1,"last_name":1,"dob":1,"email":1,"country_code":1,"phone":1,"contact":1,"password":1,"country":1,"state":1,"city":1,"address_line1":1,"address_line2":1,"latitude":1,"longitude":1,"gender":1,"tier":1,"membership":1,"designation":1,"profile_pic":1,"sign_up_with":1,"email_verified":1,"sign_up_channel":1,"column_1":1,"column_2":1,"column_3":1,"column_4":1,"column_5":1,"column_6":1,"column_7":1,"column_8":1,"column_9":1,"column_10":1,"column_11":1,"column_12":1,"column_13":1,"column_14":1,"column_15":1,"column_16":1,"column_17":1,"column_18":1,"column_19":1,"column_20":1,"column_21":1,"column_22":1,"column_23":1,"column_24":1,"column_25":1,"column_26":1,"column_27":1,"column_28":1,"column_29":1,"column_30":1,"column_31":1,"column_32":1,"column_33":1,"column_34":1,"column_35":1,"column_36":1,"column_37":1,"column_38":1,"column_39":1,"column_40":1,"column_41":1,"column_42":1,"column_43":1,"column_44":1,"column_45":1,"column_46":1,"column_47":1,"column_48":1,"column_49":1,"column_50":1,"column_51":1,"column_52":1,"column_53":1,"column_54":1,"column_55":1,"column_56":1,"column_57":1,"column_58":1,"column_59":1,"column_60":1,"column_61":1,"column_62":1,"column_63":1,"column_64":1,"column_65":1,"column_66":1,"column_67":1,"column_68":1,"column_69":1,"column_70":1,"column_71":1,"column_72":1,"column_73":1,"column_74":1,"column_75":1,"column_76":1,"column_77":1,"column_78":1,"column_79":1,"column_80":1,"column_81":1,"column_82":1,"column_83":1,"column_84":1,"column_85":1,"column_86":1,"column_87":1,"column_88":1,"column_89":1,"column_90":1,"column_91":1,"column_92":1,"column_93":1,"column_94":1,"column_95":1,"column_96":1,"column_97":1,"column_98":1,"column_99":1,"column_100":1,"status":1,"created_at":1,"created_by_user":1,"created_by":1,"column":1}],"extra_fields":[{"field_name":"Bkr_Code","display_field_name":"Booker Code","data_type":"varchar","data_type_id":"2","unique_id":"column_1","status":1},{"field_name":"Bkr_DisplayName","display_field_name":"Booker Name","data_type":"varchar","data_type_id":"2","unique_id":"column_2","status":1},{"field_name":"Cmp_Id","display_field_name":"Corporate ID","data_type":"varchar","data_type_id":"2","unique_id":"column_3","status":1},{"field_name":"Phone_Ext_No","display_field_name":"Phone Number (External)","data_type":"varchar","data_type_id":"2","unique_id":"column_4","status":1},{"field_name":"Phone_No_Res","display_field_name":"Phone Number (Residence)","data_type":"varchar","data_type_id":"2","unique_id":"column_5","status":1},{"field_name":"Fax_No","display_field_name":"Fax Number","data_type":"varchar","data_type_id":"2","unique_id":"column_6","status":1},{"field_name":"Enrollment_Date","display_field_name":"Enrollment Date","data_type":"varchar","data_type_id":"2","unique_id":"column_7","status":1},{"field_name":"Expire_Date","display_field_name":"Expiry Date","data_type":"varchar","data_type_id":"2","unique_id":"column_8","status":1},{"field_name":"SOff_Id","display_field_name":"Sales Office Id","data_type":"int","data_type_id":"1","unique_id":"column_9","status":1},{"field_name":"LSL_NO","display_field_name":"Loyalty Code","data_type":"varchar","data_type_id":"2","unique_id":"column_10","status":1},{"field_name":"Active_Flag","display_field_name":"Active Flag","data_type":"varchar","data_type_id":"2","unique_id":"column_11","status":1},{"field_name":"Status_Code","display_field_name":"Status Code","data_type":"varchar","data_type_id":"2","unique_id":"column_12","status":1},{"field_name":"Ctg_code","display_field_name":"Ctg code","data_type":"varchar","data_type_id":"2","unique_id":"column_13","status":1},{"field_name":"Bkr_Trvl","display_field_name":"Booker Travel","data_type":"varchar","data_type_id":"2","unique_id":"column_15","status":1},{"field_name":"Bkr_Decision","display_field_name":"Booker Decision","data_type":"varchar","data_type_id":"2","unique_id":"column_16","status":1},{"field_name":"Bkr_Booker","display_field_name":"Booker Booker","data_type":"varchar","data_type_id":"2","unique_id":"column_17","status":1},{"field_name":"Bkr_Mgt","display_field_name":"Booker Management","data_type":"varchar","data_type_id":"2","unique_id":"column_18","status":1},{"field_name":"Anniversary_Date","display_field_name":"Anniversary Date","data_type":"varchar","data_type_id":"2","unique_id":"column_19","status":1},{"field_name":"Comments","display_field_name":"Comments","data_type":"varchar","data_type_id":"2","unique_id":"column_20","status":1},{"field_name":"Info_Influence","display_field_name":"Info Influence","data_type":"varchar","data_type_id":"2","unique_id":"column_21","status":1},{"field_name":"Info","display_field_name":"Info","data_type":"varchar","data_type_id":"2","unique_id":"column_22","status":1},{"field_name":"Contact_Method_Code","display_field_name":"Contact Method Code","data_type":"varchar","data_type_id":"2","unique_id":"column_23","status":1},{"field_name":"Bkr_Prefered_Address","display_field_name":"Booker Preffered Address","data_type":"varchar","data_type_id":"2","unique_id":"column_24","status":1}]}')
		// if(this.dynamic_fields_model[query_data['tenant_id']])
		//     return this.dynamic_fields_model[query_data['tenant_id']];
		// return await new Promise(function (resolve, reject) {
		//     setting_model.get_setting({
		//         tenant_id: query_data['tenant_id'],
		//         settings_name: 'dynamic_customer_fields',
		//     }, (result) => {
		//         if (result.status == true && result.values.length > 0) {
		//             // this.dynamic_fields_model[query_data['tenant_id']] = result.values[0];
		//             resolve(JSON.parse(result.values[0].data));
		//         } else {
		//             resolve(null);
		//         }
		//     })
		// })
	}

	async filterCustomerFields(dataObj, filterType, tenant_id) {
		let returnObject = {};
		let dynamic_fields_model = await this.fetch_dynamic_fields({
			tenant_id: tenant_id
		});
		if (filterType == 'default_fields') {
			Object.assign(returnObject, dataObj)
			if (dynamic_fields_model) {
				for (let field in dynamic_fields_model['default_fields'][0]) {
					if (dynamic_fields_model['default_fields'][0][field] == 0 && dataObj.hasOwnProperty(field)) {
						delete returnObject[field];
					}
				}
			}
		} else if (filterType == 'extra_fields' && dynamic_fields_model) {
			for (let dynamic_columns of dynamic_fields_model['extra_fields']) {
				if (dynamic_columns.status == 1 && dataObj.hasOwnProperty(dynamic_columns.field_name)) {
					returnObject[dynamic_columns.unique_id] = dataObj[dynamic_columns.field_name];
				}
			}
		}
		return returnObject;
	}

	async fetchCustomerExtraFields(tenant_id) {
		let result = {};
		let dynamic_fields_model = await this.fetch_dynamic_fields({
			tenant_id: tenant_id
		});
		if (dynamic_fields_model) {
			for (let dynamic_columns of dynamic_fields_model['extra_fields']) {
				if (dynamic_columns.status == 1)
					result[dynamic_columns.field_name] = 'customers.' + dynamic_columns.unique_id;
			}
		}
		return result;
	}

    /************************************
     Customer Operation End
     ************************************/

	get_customer_primary_data(query_data, callback) {
		let return_result = {};
		let count = 6;
		let countries_model = new (require(global.appRoot + "/src/tenant/models/Country_model"))();
		let customer_tier_model = new (require(global.appRoot + "/src/tenant/models/Customer_tier_model"))();
		let tenant_user_model = new (require(global.appRoot + "/src/tenant/models/Tenant_user_model"))();
		let category_model = new (require(global.appRoot + "/src/tenant/models/Category_model"))();
		let school_service = new (require(global.appRoot + "/src/tenant/modules/school/services/school.service"))();
		countries_model.get_countries_list({}, (country_result) => {
			country_result.status === true ? return_result.countries = country_result.values : return_result.countries = undefined;
			return_(--count);
		});
		customer_tier_model.get_customer_tiers_list(query_data, (customer_tier_result) => {
			customer_tier_result.status === true ? return_result.customer_tiers = customer_tier_result.values : return_result.customer_tiers = undefined;
			return_(--count);
		});
		tenant_user_model.get_tenant_branch_list(query_data, (tenant_branch_list) => {
			tenant_branch_list.status === true ? return_result.tenant_branches = tenant_branch_list.values : return_result.tenant_branches = undefined;
			return_(--count);
		});

		category_model.get_category_list_for_partner(query_data, (category_list) => {
			category_list.status === true ? return_result.categories = category_list.values : return_result.categories = undefined;
			return_(--count);
		});
		(async function () {
			let school_list = await school_service.getSchool({});
			school_list.status === true ? return_result.school_list = school_list.values.school_list : return_result.school_list = undefined;
			return_(--count);
		})();
		this.getSourceList(source_list => {
			source_list.status === true ? return_result.source_list = source_list.values : return_result.source_list = undefined;
			return_(--count);
		});
		function return_(c) {
			if (c === 0) {
				if (Object.keys(return_result).length > 0) {
					return callback(response.success("data_found", return_result))
				} else {
					return callback(response.error("data_not_found"))
				}
			}
		}
	}

	getSourceList(callback) {
		knex('master_source').select({
			id: 'id',
			name: 'name'
		}).then(result => callback({ status: true, values: result }));
	}

};
