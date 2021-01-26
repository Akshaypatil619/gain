/************** Load Files****************/
let messages = require("../../../config/messages.js");
let status_codes = require("../../../config/response_status_codes.js");
let Response_adapter = require("../../core/response_adapter");
let Queries = require("../queries/mysql/download");

/************** Generate Objects ****************/
let response = new Response_adapter();
let queries = new Queries();

module.exports = class Download_model {

    get_download_list(query_data, callback) {
        // console.log(query_data);
        let return_result = {};
        var obj = queries.get_download_list("get_download_list", query_data)

        obj.then((result) => {
            // console.log('result', result);
            return_result.download_list = result;
            if (result.length > 0) {
                let query_object = queries.get_download_list("get_total_counts", query_data).then((t_result) => {
                    return_result.total_records = t_result[0].total_record;
                    return callback(response.response_success(true, status_codes.data_found, messages.data_found, (return_result)));
                }).catch(function (err) {
                    let return_result = status_codes.check_error_code("DATABASE", err.errno);
                    return callback(Object.assign({ "status": false }, return_result));
                });
            } else {
                return callback(response.response_error(false, status_codes.data_not_found, messages.data_not_found));
            }
        }).catch(function (err) {
            // console.log(err);
            let return_result = status_codes.check_error_code("DATABASE", err.errno);
            return callback(Object.assign({ "status": false }, return_result));
        });
    }
};