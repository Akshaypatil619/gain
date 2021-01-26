'use strict';
var nodemailer = require('nodemailer');
var campaign = require('campaign');
var email_provider = require('./email_provider');
var config = require('../../config/config.js');
// var jade = require('campaign-jade');
const path = require('path');
let knex = require("../../config/knex")
module.exports.email = async function (data, callback) {
    
    var findPath = function(){
        let activity_path = 'api/client'+ data.path;
        return new Promise((resolve, reject) => {
            var obj = knex.select(['master_api_permission_modules.*',knex.raw('email_templates.id as template_id'),'email_templates.subject']).from('master_api_permission_modules')
            .join('email_templates','email_templates.activity_id','=','master_api_permission_modules.id')
            .where("master_api_permission_modules.path", "=", activity_path)
            .where("master_api_permission_modules.api_user","=",'client')
            obj.then((result) => {
                if (result.length > 0) {
                    result[0].full_path = path.join(global.appRoot, "uploads/email_templates" + "/" + data['tenant_id'] + "/template_name_" + result[0].template_id + ".jade")                
                    resolve(result[0]);
                }            
            }).catch((err) => {
                console.log('ERROR OCCURED.')
                reject(err);
            });
        })
    }
    
    let smtp = nodemailer.createTransport({
        service: 'Gmail',
        auth: {                                                                                
            user: config.email_user,
            pass: config.email_password
        }
    });
    let layout_template = await findPath();
    var client = campaign({
        provider: email_provider({
            transport: smtp,
        }),
        layout: path.join(global.appRoot, "uploads/email_templates/test_email.jade"),
        trap: false, 
        // templateEngine: jade,
    });

    client.send(layout_template.full_path, {
        trap: false,
        from: config.email_user,
        to: data.to,
        subject: layout_template.subject,
        linkedData : data.email_data,
    }, function (err, data) {
        if (err) {
            console.log(err);
        } else {
            console.log(data);
        }
    });
}