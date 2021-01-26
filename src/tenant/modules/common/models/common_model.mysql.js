'use strict';
let knex = require('../../../../../config/knex.js');
module.exports = class commonModel { 
    constructor() { }

    getCommonData(data) {
        let queryObj = knex(data.table)
            .select(data.column);
        if (data.where) Object.keys(data.where).forEach(val => {
            queryObj.where(val, data.where[val]);
        });
        if (data.whereIn) Object.keys(data.whereIn).forEach(val => {
            queryObj.whereIn(val, data.whereIn[val]);
        });
        if (data.whereNot) Object.keys(data.whereNot).forEach(val => {
            queryObj.whereNot(val, data.whereNot[val]);
        });
        if (data.search) Object.keys(data.search).forEach(val => {
            queryObj.where(val, 'like', '%' + data.search[val] + '%');
        });
        if (data.leftJoin) Object.keys(data.leftJoin).forEach(val => {
            queryObj.leftJoin(val, Object.keys(data.leftJoin[val])[0], Object.values(data.leftJoin[val])[0]);
        });
        if (data.limit) queryObj.limit(data.limit);
        if (data.offset) queryObj.offset(data.offset);
        return queryObj;
    }
}