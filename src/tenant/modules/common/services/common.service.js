'use strict';
let config = require('../../../../../config/config.js');
let commonModel = new (require('../models/common_model.' + config.db_driver))();
let commonResponse = require('../responses/common.response');
let knex = require('../../../../../config/knex.js');

module.exports = class commonService { 
    constructor() { }

    getEmirate(_data) {
        let returnResult = {};
        _data['table'] = 'master_emirate'
        _data['column'] = {
            id: 'id',
            name: 'name',
        };
        if (_data.school_id) data['where'] = {
            id: _data.school_id
        };
        if (_data.search) data['search'] = {
            name: _data.search
        };
        let obj = commonModel.getCommonData(_data);
        return obj.then(result => {
            if (result.length > 0) {
                returnResult['emirate_list'] = result;
                delete _data.limit;
                delete _data.offset;
                _data.column = {
                    total_records: knex.raw('COUNT(id)')
                };
                return commonModel.getCommonData(_data);
            } else throw new Error('emirate_not_found');
        }).then(total => {
            returnResult['total_records'] = total[0]['total_records'];
            return commonResponse.success('emirate_found', returnResult);
        }).catch(err => commonResponse.catch_error(err));
    }

    getCurriculum(_data) {
        let returnResult = {};
        _data['table'] = 'master_curriculum'
        _data['column'] = {
            id: 'id',
            name: 'name',
        };
        if (_data.school_id) data['where'] = {
            id: _data.school_id
        };
        if (_data.search) data['search'] = {
            name: _data.search
        };
        let obj = commonModel.getCommonData(_data);
        return obj.then(result => {
            if (result.length > 0) {
                returnResult['curriculum_list'] = result;
                delete _data.limit;
                delete _data.offset;
                _data.column = {
                    total_records: knex.raw('COUNT(id)')
                };
                return commonModel.getCommonData(_data);
            } else throw new Error('curriculum_not_found');
        }).then(total => {
            returnResult['total_records'] = total[0]['total_records'];
            return commonResponse.success('curriculum_found', returnResult);
        }).catch(err => commonResponse.catch_error(err));
    }
}