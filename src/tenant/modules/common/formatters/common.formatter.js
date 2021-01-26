'use strict';
module.exports = class commonFormatter { 
    constructor() { }

    getCommonList(req) {
        return {
            limit: req.query.limit ? parseInt(req.query.limit) : undefined,
            offset: req.query.offset ? parseInt(req.query.offset) : undefined,
            search: req.query.search ? req.query.search : undefined
        }
    }
}