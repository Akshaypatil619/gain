"use strict";
let Html_template_model = require("../models/Html_template_model");
let html_template_model = new Html_template_model();

module.exports = class Html_template_controller{
    constructor() {
    }
    upload_template(req,res,next){
        let form_data = {
            tenant_id:req.tenant_id,
            name:req.body.name,
            template:req.body.template,
            description:req.body.description,
            status:req.body.status,
        };
        html_template_model.upload_template(form_data,(result)=>{
           res.json(result);
        });
    }

    get_templates(req,res,next){
        let query_data = {};
        query_data['tenant_id'] = req['tenant_id'];
        query_data['limit'] = parseInt(req.query.limit);
        query_data['offset'] = parseInt(req.query.offset);
        
        html_template_model.get_templates(query_data,(result)=>{
            res.json(result);
        });
    }
};