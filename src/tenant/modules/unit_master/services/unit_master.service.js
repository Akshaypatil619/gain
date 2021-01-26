'use strict';
let config = require('../../../../../config/config.js');
let unit_master_model = new (require('../models/unit_master_model.' + config.db_driver))();
let unit_master_response = require('../responses/unit_master.response');

module.exports = class schoolService {
    constructor() { }

    async get_all_unit_master(_data) {
        let return_result = {};
        return_result.total_records = (await unit_master_model.get_all_unit_master("get_unit_master", _data)).length;
        return_result.unit_master_list = await unit_master_model.get_all_unit_master("get_unit_master", _data).limit(parseInt(_data['limit']))
            .offset(parseInt(_data['offset']));
        for (const unit of return_result.unit_master_list) {
            let imageData = await unit_master_model.get_all_unit_master("get_unit_master_has_images", unit);
            let amenitiesData = await unit_master_model.get_all_unit_master("get_unit_master_has_amenities", unit);
            unit['images'] = imageData;
            unit['amenities'] = amenitiesData;
        }
        if (return_result.unit_master_list.length > 0) {
            // returnResult['unit_master_list'] = unitMasterData;
            // returnResult['total_record'] = unitMasterData.length;
            return unit_master_response.success('unit_master_found', return_result);
        } else {
            return unit_master_response.failed('unit_master_not_found');
        }
    }

    async get_rent_unit_list(_data) {
        let get_rent_unit_list = await unit_master_model.get_rent_unit_list("get_rent_unit_list");
        console.log("get_rent_unit_list=",get_rent_unit_list);
        if (get_rent_unit_list.length > 0) {
            return unit_master_response.success('unit_master_found', get_rent_unit_list);
        } else {
            return unit_master_response.failed('unit_master_not_found');
        }
    }


    async get_owner_unit_list(_data) {
        let get_owner_unit_list = await unit_master_model.get_rent_unit_list("get_owner_unit_list");
        console.log("get_owner_unit_list=",get_owner_unit_list);
        if (get_owner_unit_list.length > 0) {
            return unit_master_response.success('unit_master_found', get_owner_unit_list);
        } else {
            return unit_master_response.failed('unit_master_not_found');
        }
    }


}