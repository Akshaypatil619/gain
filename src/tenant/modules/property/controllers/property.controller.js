"use strict";
let Validator = require('validatorjs');
let PropertyTypeService = require("../services/property.services");
let property_service = new PropertyTypeService();
let property_formatter = new (require('../formatters/property.formatter'))();
let property_validator = new (require("../validators/property.validators"));
let responseMessages = require("../response/property.response");
let config = require('../../../../../config/config');

module.exports = class PropertyController {
    /**
     * Constructor
     */
    constructor() { }

    /**
     * Get all property list
     *
     * @param {*} req
     * @param {*} res
     * @returns {Promise<void>}
     */
    async get_property(req, res) {
        // returnResponse variable use for returning data to client request
        let returnResponse = {}

        // Format request data
        let formData = property_formatter.get_property_list(req);
      
     
        // Getting ruleActivity Validator
        let rules = property_validator.get_property_list('master_property');

        // Check and store validation data
        let validation = new Validator(formData, rules);
        
        if (validation.passes() && !validation.fails()) {
            returnResponse = await property_service.get_property_list(formData);
        } else {
            returnResponse = validation.errors.errors;
        }

        return res.json(returnResponse);
    }

    async updateHotSelling(req, res) {
        let formData = property_formatter.updateHotSelling(req);
        let returnResponse = await property_service.updateHotSelling(formData);
        return res.json(returnResponse);
    }

    async updateUnitMaster(req, res) {
        let returnResponse;
     
        let formData = property_formatter.updateUnitMaster(req);
       
        let rules = property_validator.updateUnitMaster();
        let validation = new Validator(formData, rules);

        if (validation.passes() && !validation.fails()) {
           
             returnResponse = await property_service.updateUnitMaster(formData);
             
        } else {
            returnResponse = validation.errors.errors;
        }

    
        return res.json(returnResponse);
    }

    // async update_building(req, res) {
    //     let returnResponse;
     
    //     let formData = property_formatter.updateUnitMaster(req);
       
    //     let rules = property_validator.updateUnitMaster();
    //     let validation = new Validator(formData, rules);

    //     if (validation.passes() && !validation.fails()) {
           
    //          returnResponse = await property_service.updateUnitMaster(formData);
             
    //     } else {
    //         returnResponse = validation.errors.errors;
    //     }

    
    //     return res.json(returnResponse);
    // }

    async update_building(req, res) {
        let returnResponse;
        let formData = property_formatter.update_building(req);
     
        let rules = property_validator.update_building();
        let validation = new Validator(formData, rules);

        if (validation.passes() && !validation.fails()) {
         
             returnResponse = await property_service.update_building(formData);
            
        } else {
            returnResponse = validation.errors.errors;
        }
        return res.json(returnResponse);
    }

    async update_property_master(req, res) {
        let returnResponse;
      
        let formData = property_formatter.update_property_master(req);
     
        let rules = property_validator.update_property_master();
        let validation = new Validator(formData, rules);

        if (validation.passes() && !validation.fails()) {
         
             returnResponse = await property_service.update_property_master(formData);
            
        } else {
            returnResponse = validation.errors.errors;
        }

    
        return res.json(returnResponse);
    }

  
    async getBuilding(req, res) {
        console.log("in building");
        let returnResponse = {}
        let formData = property_formatter.getBuilding(req);
       
        let rules = property_validator.getBuilding();
        let validation = new Validator(formData, rules);
        
        if (validation.passes() && !validation.fails()) {
            console.log("pases");
            returnResponse = await property_service.getBuilding(formData);
        } else {
            returnResponse = validation.errors.errors;
        }

        return res.json(returnResponse);
    }

    async total_building_list(req, res) {
        let returnResponse = {}
        let formData = property_formatter.total_building_list(req);
       
        let rules = property_validator.total_building_list();
        let validation = new Validator(formData, rules);
        
        if (validation.passes() && !validation.fails()) {
            returnResponse = await property_service.total_building_list(formData);
        } else {
            returnResponse = validation.errors.errors;
        }

        return res.json(returnResponse);
    }

    async getUnitbyid(req,res){
        let returnResponse = {}
     
        let formData = property_formatter.getUnitbyid(req);
        let rules = property_validator.getUnitbyid();
        let validation = new Validator(formData, rules);
        
        if (validation.passes() && !validation.fails()) {
            returnResponse = await property_service.getUnitbyid(formData);
        } else {
            returnResponse = validation.errors.errors;
        }

        return res.json(returnResponse);
    }


    async viewImages(req,res){
        let returnResponse = {}
  
        let formData = property_formatter.viewImages(req);
        let rules = property_validator.viewImages();

     
        let validation = new Validator(formData, rules);
        
        if (validation.passes() && !validation.fails()) {
            returnResponse = await property_service.viewImages(formData);
        } else {
            returnResponse = validation.errors.errors;
        }

        return res.json(returnResponse);
    }


    async view_property_images(req,res){
        let returnResponse = {}
      
        let formData = property_formatter.viewImages(req);
        let rules = property_validator.viewImages();

 
        let validation = new Validator(formData, rules);
        
        if (validation.passes() && !validation.fails()) {
            returnResponse = await property_service.view_property_images(formData);
        } else {
            returnResponse = validation.errors.errors;
        }

        return res.json(returnResponse);
    }

    async view_unit_images(req,res){
        let returnResponse = {}
      
        let formData = property_formatter.view_unit_images(req);
        let rules = property_validator.view_unit_images();

 
        let validation = new Validator(formData, rules);
        
        if (validation.passes() && !validation.fails()) {
            returnResponse = await property_service.view_unit_images(formData);
        } else {
            returnResponse = validation.errors.errors;
        }

        return res.json(returnResponse);
    }



    async delete_img_by_id(req,res){
     
        let returnResponse = {}
       
        let formData = property_formatter.delete_img_by_id(req);
      
        let rules = property_validator.delete_img_by_id();

       
        let validation = new Validator(formData, rules);
        
        if (validation.passes() && !validation.fails()) {
            returnResponse = await property_service.delete_img_by_id(formData);
        } else {
            returnResponse = validation.errors.errors;
        }

        return res.json(returnResponse);
    }


   async delete_property_img_by_id(req,res){
     
        let returnResponse = {}
       
        let formData = property_formatter.delete_property_img_by_id(req);
     
        let rules = property_validator.delete_property_img_by_id();

       
        let validation = new Validator(formData, rules);
        
        if (validation.passes() && !validation.fails()) {
            returnResponse = await property_service.delete_property_img_by_id(formData);
        } else {
            returnResponse = validation.errors.errors;
        }

        return res.json(returnResponse);
    }

    async delete_unit_img_by_id(req,res){
     
        let returnResponse = {}
       
        let formData = property_formatter.delete_unit_img_by_id(req);
     
        let rules = property_validator.delete_unit_img_by_id();

       
        let validation = new Validator(formData, rules);
        
        if (validation.passes() && !validation.fails()) {
            returnResponse = await property_service.delete_unit_img_by_id(formData);
        } else {
            returnResponse = validation.errors.errors;
        }

        return res.json(returnResponse);
    }



    async getUnit(req, res) {
        let returnResponse = {}
        let formData = property_formatter.getUnit(req);
     
        let rules = property_validator.getUnit();
        let validation = new Validator(formData, rules);
        
        if (validation.passes() && !validation.fails()) {
            returnResponse = await property_service.getUnit(formData);
        } else {
            returnResponse = validation.errors.errors;
        }

        return res.json(returnResponse);
    }

    async get_unit_transaction(req, res) {
        let returnResponse = {}
        let formData = property_formatter.get_unit_transaction(req);
     
        let rules = property_validator.get_unit_transaction();
        let validation = new Validator(formData, rules);
        
        if (validation.passes() && !validation.fails()) {
            returnResponse = await property_service.get_unit_transaction(formData);
        } else {
            returnResponse = validation.errors.errors;
        }

        return res.json(returnResponse);
    }

    async update_unit_transaction(req, res){
        let returnResponse = {}
        let formData = property_formatter.update_unit_transaction(req);
        if(formData['unit_type']=="sale"){
            formData['sale_amount']= Number(req.body.amount);
        } else {
            formData['rent_amount']= Number(req.body.amount);
        }
        let rules = property_validator.update_unit_transaction();
        if(formData['unit_type']=="sale"){
            rules['sale_amount']= "required";
        } else {
            rules['rent_amount']= "required";
        }
        let validation = new Validator(formData, rules);
        
        if (validation.passes() && !validation.fails()) {
            returnResponse = await property_service.update_unit_transaction(formData);
        } else {
            returnResponse = validation.errors.errors;
        }
        return res.json(returnResponse);
    }

    async updateUnitType(req, res) {
        let formData = property_formatter.updateUnitType(req);
        let returnResponse = await property_service.updateUnitType(formData);
        return res.json(returnResponse);
    }
    
    async get_update_unit_data(req,res){
let returnResponse
        returnResponse = await property_service.get_update_unit_data();
        return res.json(returnResponse);
    }


  /**
     *  Country list
     * 
     * @param {*} req 
     * @param {*} res 
     */
    async get_master_property_type_List(req, res) {
        let returnResponse = {}

        let form_data = property_formatter.get_master_property_type_List(req);
        
        let rules = property_validator.get_master_property_type('master_property_type');
        
        let validation = new Validator(form_data, rules);

        // Check validation is passed or failed
        if (validation.passes() && !validation.fails()) {
           
            returnResponse = await property_service.get_master_property_type_List(form_data);
        } else {
            returnResponse = responseMessages.form_field_required;

            returnResponse.errors = validation.errors.errors;
        }
        res.json(returnResponse);
    }

   async get_property_elevation (req, res) {
        let returnResponse = {}

        let form_data = property_formatter.get_property_elevation(req);
        
        let rules = property_validator.get_property_elevation();
        
        let validation = new Validator(form_data, rules);

        // Check validation is passed or failed
        if (validation.passes() && !validation.fails()) {
           
            returnResponse = await property_service.get_property_elevation(form_data);
        } else {
            returnResponse = responseMessages.form_field_required;

            returnResponse.errors = validation.errors.errors;
        }
        res.json(returnResponse);
    }
    
    

    async getAmenityList (req, res) {
        let returnResponse = {}

        let form_data = property_formatter.getAmenityList(req);
        
        let rules = property_validator.getAmenityList();
        
        let validation = new Validator(form_data, rules);

        // Check validation is passed or failed
        if (validation.passes() && !validation.fails()) {
           
            returnResponse = await property_service.getAmenityList(form_data);
        } else {
            returnResponse = responseMessages.form_field_required;

            returnResponse.errors = validation.errors.errors;
        }
        res.json(returnResponse);
    }
    
    get_broker_list(req, res) {
        let query_data = {};
        query_data['limit'] = parseInt(req.query.limit);
        query_data['offset'] = parseInt(req.query.offset);
        query_data['name'] = req.query.name;
        query_data['email'] = req.query.email;
        query_data['phone'] = req.query.phone;
        query_data['from_date'] = req.query.start_date,
        query_data['to_date'] = req.query.end_date,
        broker_model.get_broker_list(query_data, function (result) {
            res.json(result);
        });
    }
    async getBrokerList (req, res) {
        let returnResponse = {}

        let form_data = property_formatter.getBrokerList(req);
        
        let rules = property_validator.getBrokerList();
        
        let validation = new Validator(form_data, rules);

        // Check validation is passed or failed
        if (validation.passes() && !validation.fails()) {
           
            returnResponse = await property_service.getBrokerList(form_data);
        } else {
            returnResponse = responseMessages.form_field_required;

            returnResponse.errors = validation.errors.errors;
        }
        res.json(returnResponse);
    }


    /**
  * Get member_type by id
  *
  * @param {*} req
  * @param {*} res
  * @returns {Promise<void>}
  */
 async get_property_by_id(req, res) {
    // returnResponse variable use for returning data to client request
    let returnResponse = {}
    // Format request data
    let form_data = property_formatter.get_property_by_id(req);
  


    // Getting member type validation
    let rules = property_validator.get_property_by_id();

    // Check and store validation data
    let validation = new Validator(form_data, rules);
    // Check validation is passed or failed
    if (validation.passes() && !validation.fails()) {
        
        /**
         * Validation success
         */
        // call add member type service and store response in returnResponse variable
        returnResponse = await property_service.get_property_by_id(form_data);
    } else {
        /*
            //Validation fail
        */
        // store return code and message in returnResponse variable
        returnResponse = responseMessages.form_field_required;
        // Getting errors of validation and store in returnResponse variable
        returnResponse.errors = validation.errors.errors;
    }
    // return response to client request
    return res.json(returnResponse);
 }

 async view_amenity_images(req,res){
    let returnResponse = {}
  
    let formData = property_formatter.view_amenity_images(req);
    let rules = property_validator.view_amenity_images();


    let validation = new Validator(formData, rules);
    
    if (validation.passes() && !validation.fails()) {
        returnResponse = await property_service.view_amenity_images(formData);
    } else {
        returnResponse = validation.errors.errors;
    }

    return res.json(returnResponse);
}

async delete_amenity_img_by_id(req,res){
 
    let returnResponse = {}
   
    let formData = property_formatter.delete_amenity_img_by_id(req);
 
    let rules = property_validator.delete_amenity_img_by_id();

   
    let validation = new Validator(formData, rules);
    
    if (validation.passes() && !validation.fails()) {
        returnResponse = await property_service.delete_amenity_img_by_id(formData);
    }
} 

//  async get_Building_by_id(req, res) {
//     let returnResponse = {}
//     let form_data = property_formatter.get_Building_by_id(req);
//        let rules = property_validator.get_Building_by_id();
//     let validation = new Validator(form_data, rules);
//     if (validation.passes() && !validation.fails()) {
//         returnResponse = await property_service.get_Building_by_id(form_data);
//     } else {
//         returnResponse = responseMessages.form_field_required;
//         returnResponse.errors = validation.errors.errors;
//     }
//     return res.json(returnResponse);
//  }

 async get_Building_by_id(req, res) {
    let returnResponse = {}
    let formData = property_formatter.get_Building_by_id(req);
   
    let rules = property_validator.get_Building_by_id();
    let validation = new Validator(formData, rules);
    
    if (validation.passes() && !validation.fails()) {
        returnResponse = await property_service.get_Building_by_id(formData);
    } else {
        returnResponse = validation.errors.errors;
    }

    return res.json(returnResponse);
}


}
