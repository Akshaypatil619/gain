let config = require('../../../../../config/config');
/************** Generate Objects ****************/
let responseMessages = require("../response/coupon.response");
let couponModel = new (require("../models/coupon." + config.db_driver))();
let Client = require('node-rest-client').Client;
let client = new Client();
var xlsx = require("xlsx");
var { nanoid } = require("nanoid");
const moment = require('moment');
module.exports = class CouponService {


	async addCoupon(form_data) {
		console.log("in service");
		let returnResult = {};
		let coupon_id;
		let coupon_codes = [];
		let valid_till;
		return couponModel.checkCampaignId(form_data)
			.then(async (camp_id) => {
				if (camp_id.length > 0) {
					return responseMessages.failed("duplicate_camp", "");
				} else {
					let merchant_id = await couponModel.isMerchantExist(form_data);
					if (merchant_id.length > 0) {
						return responseMessages.failed("duplicate_merchant", "");
					} else {


						if (form_data.type == 'system') {
							let cpn_id = await couponModel.addCoupon(form_data);
							if (cpn_id.length > 0) {
								coupon_id = cpn_id[0];
								valid_till = new Date(form_data.valid_till);

								for (let i = 0; i < form_data.quantity; i++) {
									const newId = nanoid(form_data.postfix_length);


									coupon_codes.push({
										coupon_id: coupon_id,
										code: form_data.prefix + newId,
										valid_till: valid_till
									})

								}

							} else {
								return responseMessages.failed("failed_add_coupon", "");
							}

						} else {


							var workbook = xlsx.read(form_data.cc_file.data);
							var sheet_name_list = workbook.SheetNames;

							var upload_data = xlsx.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]], {
								raw: false,

								defval: null, dateNF: 'yyyy-mm-dd'
							});

							console.log("upload_data=", upload_data);
							if (upload_data != undefined) {


								for (let i = 0; i < upload_data.length; i++) {

									let validDate = moment(upload_data[i]["Valid Till"]).format();
									coupon_codes.push({
									    code: upload_data[i]["Coupon Code"],
										valid_till: validDate
									})

								}



								let isDuplicate = await this.checkDuplicateCoupon(coupon_codes)

								if (isDuplicate) {
									return responseMessages.failed("duplicate_code", "");

								} else {


									let cpn_id = await couponModel.addCoupon(form_data);
									console.log("*cpn_id=",cpn_id);
									if (cpn_id.length <= 0) {
										return responseMessages.failed("failed_add_coupon", "");
									}else{
										console.log("cpn_id=",cpn_id);
										coupon_id = cpn_id[0];

										for(let i=0;i<coupon_codes.length;i++){
											coupon_codes[i]["coupon_id"]=coupon_id;
										}
									}
								}



							} else {

								return responseMessages.failed("failed_add_coupon", "");

							}


						}
console.log("adding codes=",coupon_codes);
						await couponModel.addCouponCode(coupon_codes);
						return responseMessages.success("add_coupon_success", "");


					}





				}


			}).catch(function (err) {
				let error = (typeof err.errors != 'undefined') ? err.errors : err.message;
				return responseMessages.failed(responseMessages.hasOwnProperty(err.message) ? err.message : "failed_add_coupon", error)
			});

	}



	async getMerchantCode() {

		return new Promise((resolve, reject) => {

			var args = {
				data: {},
				headers: { "Content-Type": "application/json" }
			};

			let merchant_url = config.merchant_list_url;


			client.post(merchant_url, function (data, response) {


				console.log("api result==>", data);
				if (data.status) {
					resolve(data.values);
				}

			});

		})

	}


	async checkDuplicateCoupon(upload_codes) {
		console.log("in duplicate", upload_codes);
		let status = false;

		let record = await couponModel.getCouponCodes();
		console.log("record=", record);

		for (let i = 0; i < upload_codes.length; i++) {
			let indx = record.map(x => x.code).indexOf(upload_codes[i].code);
			console.log("indx=", indx);
			if (indx > -1) {
				status = true;
				break;
			}
		}
		return status;

	}

};
