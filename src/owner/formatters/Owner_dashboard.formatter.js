
module.exports = class Oam_dashboard_formatter{

    constructor() {

    }
    dashboard(req) {
        let query_data = {};
        query_data['owner_id'] = req.owner_id;
        query_data['date'] = req.query.date;
        // query_data['start_date'] = req.query.start_date;
        // query_data['end_date'] = req.query.end_date;
        return query_data;
            
    }

    

}