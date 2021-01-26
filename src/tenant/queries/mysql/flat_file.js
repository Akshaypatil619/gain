let dateFormat = require('dateformat');
let knex = require("../../../../config/knex.js");
let now = new Date();
module.exports = class Flat_file {

    add_flat_file_model(query_type, data) {
        switch (query_type) {
            case "get_flat_file":
                return knex("flat_file_models").select('id')
                    .where("name", data['name'])
                    .where('tenant_id', data['tenant_id'])
                break;
            case "insert":
                return knex("flat_file_models")
                    .insert(data);
                break;
        }
    }

    edit_flat_file_model(query_type, data) {
        switch (query_type) {
            case "get_flat_file":
                return knex("flat_file_models").select('id')
                    .where("name", data['name'])
                    .where('tenant_id', data['tenant_id'])
                    .whereNot('id', data['flat_file_model_id'])
                break;
            case "update":
                return knex("flat_file_models")
                    .where('id', data['flat_file_model_id'])
                    .update(data.data);
                break;
        }
    }
    get_flat_file_model_by_id(query_type, data) {
        switch (query_type) {
            case "get_flat_file":
                return knex.select(data.columns)
                    .from("flat_file_models")
                    .where("flat_file_models.id", data['flat_file_model_id'])
                    .groupBy('flat_file_models.id');
                break;
        }
    }
    get_flat_file_model_list(query_type, data) {
        switch (query_type) {
            case "get_list":
                return knex.select(data.columns)
                    .from("flat_file_models")
                    .where("flat_file_models.tenant_id", data['tenant_id'])

                break;
        }
    }
    change_flat_file_model_status(query_type, data) {
        switch (query_type) {
            case "update_status":
                return knex('flat_file_models')
                    .where("id", data['flat_file_model_id'])
                    .update({ status: data['status'] })
                break;
        }
    }
    upload_flat_file(query_type, data) {
        switch (query_type) {
            case "":
                break;
        }
    }
    fetch_flat_file_list(query_type, data) {
        switch (query_type) {
            case "fetch_list":
                let obj = knex.select(data.columns)
                    .from("accrual_process_files")
                    .where("flat_file_models.tenant_id", "=", data['tenant_id'])
                    .join('flat_file_models', 'accrual_process_files.flat_file_model_id', "=", "flat_file_models.id")
                    .orderBy('accrual_process_files.id', 'desc')

                if (data['flat_file_model_id']) {
                    obj.where("flat_file_models.id", "like", "%" + data['flat_file_model_id'] + "%");
                }

                if (data['file_name']) {
                    obj.where("accrual_process_files.file_name", "like", "%" + data['file_name'] + "%")
                }

                if (data['start_date'] && data['start_date']) {
                    obj.whereBetween('accrual_process_files.created_at', [data['start_date'], data['end_date']]);
                } else if (data['start_date'] && !data['end_date']) {
                    obj.whereBetween('accrual_process_files.created_at', [data['start_date'], dateFormat(now, "yyyy-mm-dd 23:59:59")]);
                }
                
                
                return obj
                break;
        }
    }
    fetch_flat_file_data(query_type, data) {
        switch (query_type) {
            case "fetch_data":
                let obj = knex("accrual_process_file_data")
                    .select("*")
                    .leftJoin('accrual_details_' + accrual_process[0].flat_file_model_id, 'accrual_details_' + accrual_process[0].flat_file_model_id + '.flat_file_record_id', "=", 'accrual_process_file_data.flat_file_record_id')
                    .leftJoin('point_ledger', 'point_ledger.transaction_id', "=", 'accrual_details_' + accrual_process[0].flat_file_model_id + '.transaction_id')
                    .where('accrual_process_file_data.accrual_process_id', "=", data['accrual_process_id'])
                    .groupBy('accrual_process_file_data.id')

               
                return obj;
                break;
        }
    }
    process_flat_files(query_type, data) {
        switch (query_type) {
            case "get_process_file":
                knex('accrual_process_files')
                    .select(knex.raw("accrual_process_files.id as accrual_process_id"), 'accrual_process_files.file_hash')
                    .where('is_processed', 0)
                    .where('accrual_process_files.flat_file_model_id', data.flat_file_model_id);
                break;
            case "get_flat_file_module":
                return knex('flat_file_models')
                    .select('*')
                    .where('status', 1)
                    .where('tenant_id', data.tenant_id);
                break;
            case "insert_file_record":
                return knex('accrual_process_files').insert(data);
                break;
            case "update_accrual_file":
                return knex('accrual_process_files')
                    .update(data.objData)
                    .where('id', data.accrual_process_id);
                break;
            case "batch_insert_accrual_details":
                return knex.batchInsert('accrual_process_file_data', data, 50000)
                break;
            case "get_accrual_details":
                return knex('accrual_details_' + searchObj['flat_file_model_id'])
                    .select('id')
                    .where(searchObj['record_id_column'], searchObj['record_id']);
                break;
            case "get_error_codes":
                return knex('error_codes_master')
                    .select(['error_code', 'error_slug'])
                break;
            case "":
                return knex('accrual_details_' + data.flat_file_model_id)
                    .insert(data.data);
                break;
            case "":
                return knex('customers')
                    .select({ customer_id: 'customers.id' })
                    .where('tenant_id', params.tenant_id)
                    .where(customer_identification_column, params.customer_identification_column_value)
                break;
            case "get_processed_files":
                return knex('accrual_process_files')
                    .where('flat_file_model_id', data.flat_file_model_id)
                    .where('file_hash', data.fileHash.md5).
                    where('is_processed', 1)

                break;
        }
    }
}