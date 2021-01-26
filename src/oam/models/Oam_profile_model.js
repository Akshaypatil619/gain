'use strict';
let knex = require('../../../config/knex.js');
let config = require("../../../config/config");
let encription_key = config.encription_key;

module.exports = class Oam_profile_model {
  constructor() { }



  get_user_details(data) {
    let id = data.columns.log_in_userID;
    delete data.columns.id;
    let columns = {
      "first_name": knex.raw("CAST(AES_DECRYPT(customers.first_name,'" + encription_key + "') AS CHAR(255))"),
      "last_name": knex.raw("CAST(AES_DECRYPT(customers.last_name,'" + encription_key + "') AS CHAR(255))"),
      "email": knex.raw("CAST(AES_DECRYPT(customers.email,'" + encription_key + "') AS CHAR(255))"),
      "phone": knex.raw("CAST(AES_DECRYPT(customers.phone,'" + encription_key + "') AS CHAR(255))"),
      "address_line2": "customers.address_line2",
      "address": "customers.address_line1",
      "oam_commission": "customers.oam_commission",
      "owner_commission": "customers.owner_commission",
      "gain_commission": "customers.gain_commission",
      "image_path": "customers.image_path",

    }
    return knex.select(columns).from('customers').where('id', id);
  }


  get_password(data) {
    console.log("44",data)
    let id = data.columns.id;
    let columns = {
      "password": knex.raw("CAST(AES_DECRYPT(customers.password,'" + encription_key + "') AS CHAR(255))"),

    }
    return knex.select(columns).from('customers').where('id', id);
  }

  update_password(data) {
    console.log("ppp",data)
    let newpassword = data.new_password;
    let password = knex.raw("AES_ENCRYPT('" + newpassword + "', '" + encription_key + "')");
    return knex('customers').update("password", password)
      .where("id", data.id)
  }

  update_data(data) {
    let id = data.columns.id;
    let Email = data.columns.email;
    let Name = data.columns.first_name;
    let Last_name = data.columns.last_name;
    let Phone = data.columns.phone;

    let first_name = knex.raw("AES_ENCRYPT('" + Name + "', '" + encription_key + "')");
    let last_name = knex.raw("AES_ENCRYPT('" + Last_name + "', '" + encription_key + "')");
    let email = knex.raw("AES_ENCRYPT('" + Email + "', '" + encription_key + "')");
    let phone = knex.raw("AES_ENCRYPT('" + Phone + "', '" + encription_key + "')");


    return knex("customers")
      .where('id', '=', data.columns.id)

      .update({
        first_name: first_name,
        last_name: last_name,
        phone: phone,
        address_line1: data.columns.address_line1,
        address_line2: data.columns.address_line2,
        gain_commission: data.columns.gain_commission,
        owner_commission: data.columns.owner_commission,
        oam_commission: data.columns.oam_commission
      })
  }

  validatePhoneNumber(data) {
    let Phone = data.columns.phone;
    let phone = knex.raw("AES_ENCRYPT('" + Phone + "', '" + encription_key + "')");


    return knex("customers").select()
      .where("phone", phone)
      .whereNot("id", data.columns.id)

  }
  addMyMedia(_data) {
    return knex('customers').update("image_path", _data.image_path)

      .where("id", _data.id)
  }
}
