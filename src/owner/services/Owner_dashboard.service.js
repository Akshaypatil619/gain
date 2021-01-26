let dashboardResponse = require('../response/Owner_dashboard.response');

const dashboardModel = new (require("../models/Owner_dashboard_model"))();

module.exports = class Oam_dashboard_service {
    constructor() {

    }
    dashboard(_data) {
        return dashboardModel.dashboard(_data).then(result => {
            return dashboardResponse.success("dashboard_data_found", result);
        }).catch(err => dashboardResponse.catch_error(err));
    }


}