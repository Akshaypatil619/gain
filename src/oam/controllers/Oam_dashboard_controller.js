"use strict";

let Validator = require('validatorjs');

let dashboardService = new(require('../services/Oam_dashboard.service'))();
let dashboardValidator = new (require('../validators/Oam_dashboard.validators'))();
let dashboardFormatter = new (require('../formatters/Oam_dashboard.formatter'))();
let dashboardResponse = require("../response/Oam_dashboard.response");
module.exports = class Oam_profile_Controller{
    constuctor(){

    }

    async dashboard(req, res) {
        let returnResponse = {};
        let formData = dashboardFormatter.dashboard(req);
        let rules = dashboardValidator.dashboard();
        let validation = new Validator(formData, rules);
        if (validation.passes() && !validation.fails())
          returnResponse = await dashboardService.dashboard(formData);
        else
          returnResponse = dashboardResponse.failed(
            "form_fields_required",
            validation.errors.errors
          );
    
        res.json(returnResponse);
      }

     
}