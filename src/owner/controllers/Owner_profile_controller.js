"use strict";

let Validator = require('validatorjs');

let profileService = new (require('../services/Owner_profile.service'))();
let profileValidator = new (require('../validators/Owner_profile.validator'))();
let profileFormatter = new (require('../formatters/Owner_profile.formatter'))();
let profileResponse = require("../response/Owner_profile.response");
module.exports = class Oam_profile_Controller {
  constuctor() {

  }

  async get_user_details(req, res) {
    console.log("gggggggggggg", req.body)
    let returnResponse = {};
    let formData = profileFormatter.get_user_details(req);
    let rules = profileValidator.get_user_details();
    let validation = new Validator(formData, rules);
    if (validation.passes() && !validation.fails())
      returnResponse = await profileService.get_user_details(formData);
    else
      returnResponse = profileResponse.failed(
        "form_fields_required",
        validation.errors.errors
      );

    res.json(returnResponse);
  }

  async get_password(req, res) {
    let returnResponse = {};
    let formData = profileFormatter.get_password(req);
    let rules = profileValidator.get_password();
    let validation = new Validator(formData, rules);
    if (validation.passes() && !validation.fails())
      returnResponse = await profileService.get_password(formData);
    else
      returnResponse = profileResponse.failed(
        "form_fields_required",
        validation.errors.errors
      );
    res.json(returnResponse);
  }

  async update_data(req, res) {
    let returnResponse = {};
    let formData = profileFormatter.update_data(req);
    let rules = profileValidator.update_data();
    let validation = new Validator(formData, rules);
    if (validation.passes() && !validation.fails())
      returnResponse = await profileService.update_data(formData);
    else
      returnResponse = profileResponse.failed(
        "form_fields_required",
        validation.errors.errors
      );
    res.json(returnResponse);
  }

  async addMyMedia(req, res) {
    let returnResponse = {};
    let formData = profileFormatter.addMyMedia(req);
    let rules = profileValidator.addMyMedia();
    let validation = new Validator(formData, rules);
    if (validation.passes() && !validation.fails()) {
      returnResponse = await profileService.addMyMedia(formData);
    }
    else {
      returnResponse = profileResponse.form_field_required;
      returnResponse.errors = validation.errors.errors;
      res.status(400);
    }
    return res.json(returnResponse);
  }


}