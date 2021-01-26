const query = new (require('../models/cron_model.mysql'))();
const knex = require('../../../../../config/knex');
const response = require('../response/cron.response');
let config = require("../../../../../config/config");
let encription_key = config.encription_key;

module.exports = class CronModel {

    constructor() {}

   

  async  getBrandList(formData) {
        const columns = {
            brand_name: knex.raw('DISTINCT transaction_history.brand_name')
        };
        let brandRecords =  query.getBrandList(columns, formData);
            return brandRecords.then(async buildings => {
                if (buildings.length > 0) {
                    return response.success('building_found', buildings);
                } else {
                    return response.failed('building_not_found');
                };
            }).catch(err => {
                response.failed(err)
            });
    }

  

   


}