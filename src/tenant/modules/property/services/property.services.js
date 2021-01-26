/************** Generate Objects ****************/
let responseMessages = require("../response/property.response");
let property_model = new (require("../models/property_model.mysql"))();
var { nanoid } = require("nanoid");
let Upload_files = require("../../../../core/upload_files");
let upload_files = new Upload_files();
module.exports = class PropertyService {

    /**
     * Get  property with filter
     * 
     * @param {*} data 
     */
    async get_property_list(form_data) {
        let return_result = {};
        let propertyQuery = property_model.get_property_list(form_data);
            return_result.total_Records = (await propertyQuery).length;
                if (return_result.total_Records > 0) {
                    return_result.property_list =await propertyQuery.limit(form_data['limit']).offset(form_data['offset']);
                    return responseMessages.success("property_found", return_result);
                } else {
                    return responseMessages.failed("property_not_found");
                }
            }


    async get_update_unit_data() {
        let return_result = {};
        return property_model.get_update_unit_data("get_furnishing_list")
            .then(async (result) => {
                return_result.furnishing_list = result;
                return_result.broker_list = await property_model.get_update_unit_data("get_broker_list")
                return_result.amenity_list = await property_model.get_update_unit_data("get_amenity_list")
                return responseMessages.success("get_update_unit_data", return_result);

            })
            .catch(function (err) {
                let error = (typeof err.errors != 'undefined') ? err.errors : err.message;
                return responseMessages.failed(responseMessages.hasOwnProperty(err.message) ? err.message : "get_update_unit_data_fail", error)
            });
    }

    async updateHotSelling(form_data) {
        return property_model.updateHotSelling(form_data)
            .then(async (returnId) => {
                if (returnId > 0) {
                    return responseMessages.success("property_hot_selling_updated");
                } else {
                    return responseMessages.success("property_hot_selling_not_updated");
                }
            })
            .catch(function (err) {
                let error = (typeof err.errors != 'undefined') ? err.errors : err.message;
                return responseMessages.failed(responseMessages.hasOwnProperty(err.message) ? err.message : "property_update_fail", error)
            });
    }


    async updateUnitMaster(form_data) {
        let imgArray = form_data.images;
        let update_id = form_data.unit_id;
        let amenities = form_data['amenity_id'];
        delete form_data['amenity_id'];
        delete form_data["images"];
        let amenityObj = [];
        let reference_number = form_data['reference_number'];
        delete form_data['reference_number'];
        return property_model.updateUnitMaster("update_unit_status", form_data)
            .then(async (returnId) => {
                let unit_transactions = await property_model.updateUnitMaster("create_transaction", form_data);
                if (unit_transactions[0] > 0) {
                    let updateData = {
                        id: form_data['unit_id'],
                        unit_type: form_data['unit_type']
                    };
                    if(!(reference_number ==null && reference_number ==undefined && reference_number =="")){
                        updateData['reference_number'] = reference_number;   
                    }
                    await property_model.updateUnitMaster("master_unit", updateData);
                    amenities.forEach(element => {
                        amenityObj.push({ unit_id: unit_transactions[0], amenity_id: element })
                    });
                    await property_model.updateUnitMaster("create_amenity", amenityObj);
                    let image_file = [];
                    if (imgArray != null) {
                        if (Array.isArray(imgArray)) {
                            for (let i = 0; i < imgArray.length; i++) {
                                image_file.push({
                                    path: "./uploads/images/unit",
                                    file_name: nanoid(10)+ imgArray[i].name,
                                    file: imgArray[i],
                                    return_file_name: 'image'
                                });
                            }
                        } else {
                            image_file.push({
                                path: "./uploads/images/unit",
                                file_name: nanoid(10) + imgArray.name,
                                file: imgArray,
                                return_file_name: 'image'
                            });
                        }
                        await upload_files.upload_Multiple_Files(image_file, async function (err, files) {
                            if (err) {

                            } else {
                                let obj = [];
                                for (let i = 0; i < files["image"].length; i++) {
                                    obj.push({ unit_id: unit_transactions[0], path: files["image"][i].replace(".", "") });
                                }
                                console.log("unit_transactions[0]=",unit_transactions[0]); 
                                await property_model.InsertUnitImage(obj);
                            }
                        });

                    }
                    return responseMessages.success("update_unit_master_updated");
                } else {
                    return responseMessages.success("update_unit_master_not_updated");
                }
            })
            .catch(function (err) {
                console.log("SSSSSSSSFFFFFFFFFFFFFFFFFFFFFFFFFFFFF : ", err);
                let error = (typeof err.errors != 'undefined') ? err.errors : err.message;
                return responseMessages.failed(responseMessages.hasOwnProperty(err.message) ? err.message : "property_update_fail", error)
            });
    }


    async update_property_master(form_data) {

        let imgArray = form_data.images;
        let amenityArray = JSON.parse(form_data.amenity_id);
        let update_id = form_data.id;
        delete form_data["images"];
        delete form_data["amenity_id"];
        return property_model.update_property_master(form_data)
            .then(async (returnId) => {

                if (returnId > 0) {

                    let image_file = [];

                    if (imgArray != null) {

                        if (Array.isArray(imgArray)) {

                            for (let i = 0; i < imgArray.length; i++) {
                                image_file.push({
                                    path: "./uploads/images/property",
                                    file_name: nanoid(10) + imgArray[i].name,
                                    file: imgArray[i],
                                    return_file_name: 'image'
                                });
                            }
                        } else {

                            image_file.push({
                                path: "./uploads/images/property",
                                file_name: nanoid(10) + imgArray.name,
                                file: imgArray,
                                return_file_name: 'image'
                            });

                        }
                        await upload_files.upload_Multiple_Files(image_file, async function (err, files) {
                            if (err) {

                                console.log("Error : ", err);
                            } else {

                                let obj = [];
                                for (let i = 0; i < files["image"].length; i++) {
                                    obj.push({ property_id: update_id, path: files["image"][i].replace(".", "") });
                                }

                                await property_model.InsertPropertyImage(obj);
                                // update_result =  {
                                // 	image: files['image'],
                                // };
                                // await knex("master_broker").update("master_broker.image_path", update_result.image).where("master_broker.id", broker_id[0]);
                                // return callback(response.response_success(true, status_codes.broker_template_created, messages.broker_template_created));
                            }
                        });

                    }

                    if (amenityArray) {
                        let obj1 = [];

                        for (let i = 0; i < amenityArray.length; i++) {
                            obj1.push({ property_id: update_id, amenity_id: amenityArray[i].id })
                        }
                        await property_model.InsertPropertyAmenities(obj1, update_id);
                    }

                    return responseMessages.success("update_unit_master_updated");
                } else {
                    return responseMessages.success("update_unit_master_not_updated");
                }
            })
            .catch(function (err) {
                let error = (typeof err.errors != 'undefined') ? err.errors : err.message;
                return responseMessages.failed(responseMessages.hasOwnProperty(err.message) ? err.message : "property_update_fail", error)
            });
            
    }
    async update_building(form_data) {
        let building_broker = form_data['building_broker'];
        delete form_data['building_broker'];
        return property_model.update_building("building",form_data)
            .then(async (returnId) => {
                console.log("GGGGGGGGGGG",returnId);
                await property_model.update_building("broker",building_broker)
                if (returnId > 0) {
                    return responseMessages.success("building_updated");
                } else {
                    return responseMessages.success("building_not_updated");
                }
            })
            .catch(function (err) {
                let error = (typeof err.errors != 'undefined') ? err.errors : err.message;
                return responseMessages.failed(responseMessages.hasOwnProperty(err.message) ? err.message : "building_update_fail", error)
            });
    }



    async updateUnitType(form_data) {
        return property_model.updateUnitType(form_data)
            .then(async (returnId) => {
                if (returnId > 0) {
                    return responseMessages.success("unit_type_updated");
                } else {
                    return responseMessages.success("unit_type_not_updated");
                }
            })
            .catch(function (err) {
                let error = (typeof err.errors != 'undefined') ? err.errors : err.message;
                return responseMessages.failed(responseMessages.hasOwnProperty(err.message) ? err.message : "property_update_fail", error)
            });
    }
  
    async getBuilding(form_data) {
        let return_result = {};
        return property_model.getBuilding(form_data)
            .then(async (countData) => {
                if (countData.length > 0) {
                    return_result.total_Records = countData.length;
                    return property_model.getBuilding(form_data).limit(form_data.limit).offset(form_data.offset)
                        .then(async (result) => {
                            return_result.building_list = result;
                            return responseMessages.success("building_found", return_result);
                        })

                } else {
                    throw new Error("building_not_found");
                }
            })
            .catch(function (err) {
                let error = (typeof err.errors != 'undefined') ? err.errors : err.message;
                return responseMessages.failed(responseMessages.hasOwnProperty(err.message) ? err.message : "property_update_fail", error)
            }); console.log("amenityArray.length", amenityArray.length);
    }

    async total_building_list(form_data) {
        let return_result = {};
        return property_model.total_building_list(form_data)
            .then(async (countData) => {
                if (countData.length > 0) {
                    return_result.total_Records = countData.length;
                    return property_model.total_building_list(form_data).limit(form_data.limit).offset(form_data.offset)
                        .then(async (result) => {
                            console.log("resultresultresultresultresult : ",result);
                            return_result.building_list = result;
                            return responseMessages.success("building_found", return_result);
                        })

                } else {
                    throw new Error("building_not_found");
                }
            })
            .catch(function (err) {
                let error = (typeof err.errors != 'undefined') ? err.errors : err.message;
                return responseMessages.failed(responseMessages.hasOwnProperty(err.message) ? err.message : "property_update_fail", error)
            });   console.log("amenityArray.length",amenityArray.length);
    }

    async getUnitbyid(form_data) {
        let return_result = {};
        return property_model.getUnitbyid(form_data)
            .then(async (countData) => {
                if (countData.length > 0) {
                    countData[0].amenity_id = countData[0].amenity_id ? countData[0].amenity_id.split(','): [];
                    return_result.images = await property_model.getUnitMasterImages(form_data);
                    return_result.unit_details = countData;
                    return responseMessages.success("unit_found", return_result);
                } else {
                    throw new Error("unit_not_found");
                }
            })
            .catch(function (err) {
                let error = (typeof err.errors != 'undefined') ? err.errors : err.message;
                return responseMessages.failed(responseMessages.hasOwnProperty(err.message) ? err.message : "property_update_fail", error)
            });
    }

    async get_unit_transaction(form_data) {
        let return_result = {};
        return_result.total_records = (await property_model.get_unit_transaction(form_data)).length;
        if ((return_result.total_records > 0) && Number(form_data.limit)>0) {
                return_result.unit_list = await property_model.get_unit_transaction(form_data)
                    .limit(parseInt(form_data['limit']))
                    .offset(parseInt(form_data['offset']));
                return responseMessages.success("unit_found", return_result);
        } else {
            return responseMessages.failed("unit_not_found");

        }
    }

    async update_unit_transaction(form_data) {
        let transaction = await property_model.update_unit_transaction("transaction",form_data);
        if(transaction>0){
            let unit = await property_model.update_unit_transaction("unit",form_data);
            if(unit>0){
                return responseMessages.success("transaction_updated");    
            } else {
                return responseMessages.failed("transaction_not_updated");
            }
        } else {
            return responseMessages.failed("transaction_not_updated");
        }
    }


    async viewImages(form_data) {
        console.log("in vie imges");
        let return_result = {};
        return property_model.getUnitMasterImages(form_data)
            .then(async (imgData) => {
                let imgArray = JSON.parse(JSON.stringify(imgData));
                console.log("in vie imges", imgArray);
                if (imgArray.length > 0) {
                    return_result["img_details"] = imgArray;
                    return responseMessages.success("unit_found", return_result);
                } else {
                    throw new Error("image_not_found");
                }
            })
            .catch(function (err) {
                let error = (typeof err.errors != 'undefined') ? err.errors : err.message;
                return responseMessages.failed(responseMessages.hasOwnProperty(err.message) ? err.message : "property_update_fail", error)
            });
    }




    async view_property_images(form_data) {
        let return_result = {};
        return property_model.view_property_images(form_data)
            .then(async (imgData) => {
                let imgArray = JSON.parse(JSON.stringify(imgData));
                console.log("in vie imges", imgArray);
                if (imgArray.length > 0) {
                    return_result["img_details"] = imgArray;
                    return responseMessages.success("unit_found", return_result);
                } else {
                    throw new Error("image_not_found");
                }
            })
            .catch(function (err) {
                let error = (typeof err.errors != 'undefined') ? err.errors : err.message;
                return responseMessages.failed(responseMessages.hasOwnProperty(err.message) ? err.message : "property_update_fail", error)
            });
    }

    async view_unit_images(form_data) {
        let return_result = {};
        return property_model.view_unit_images(form_data)
            .then(async (imgData) => {
                let imgArray = JSON.parse(JSON.stringify(imgData));
                if (imgArray.length > 0) {
                    return_result["img_details"] = imgArray;
                    return responseMessages.success("unit_found", return_result);
                } else {
                    throw new Error("image_not_found");
                }
            })
            .catch(function (err) {
                let error = (typeof err.errors != 'undefined') ? err.errors : err.message;
                return responseMessages.failed(responseMessages.hasOwnProperty(err.message) ? err.message : "property_update_fail", error)
            });
    }


    async delete_img_by_id(form_data) {
        let return_result = {};
        return property_model.delete_img_by_id(form_data)
            .then(async (countData) => {
                //     console.log("countData",countData)
                //  let body={};
                //   body["id"]=form_data["unit_id"];

                // return_result.images = await property_model.getUnitMasterImages(body);
                //  return_result.unit_details = countData;
                return responseMessages.success("unit_found", return_result);

            })
            .catch(function (err) {
                let error = (typeof err.errors != 'undefined') ? err.errors : err.message;
                return responseMessages.failed(responseMessages.hasOwnProperty(err.message) ? err.message : "property_update_fail", error)
            });
    }



    async delete_img_by_id(form_data) {
        let return_result = {};
        return property_model.delete_img_by_id(form_data)
            .then(async (countData) => {
                //     console.log("countData",countData)
                //  let body={};
                //   body["id"]=form_data["unit_id"];

                // return_result.images = await property_model.getUnitMasterImages(body);
                //  return_result.unit_details = countData;
                return responseMessages.success("unit_found", return_result);

            })
            .catch(function (err) {
                let error = (typeof err.errors != 'undefined') ? err.errors : err.message;
                return responseMessages.failed(responseMessages.hasOwnProperty(err.message) ? err.message : "property_update_fail", error)
            });
    }



    async delete_property_img_by_id(form_data) {
        let return_result = {};
        return property_model.delete_property_img_by_id(form_data)
            .then(async (countData) => {
                return responseMessages.success("unit_found", return_result);
            })
            .catch(function (err) {
                let error = (typeof err.errors != 'undefined') ? err.errors : err.message;
                return responseMessages.failed(responseMessages.hasOwnProperty(err.message) ? err.message : "property_update_fail", error)
            });
    }

    async delete_unit_img_by_id(form_data) {
        let return_result = {};
        return property_model.delete_unit_img_by_id(form_data)
            .then(async (countData) => {
                return responseMessages.success("unit_found", return_result);
            })
            .catch(function (err) {
                let error = (typeof err.errors != 'undefined') ? err.errors : err.message;
                return responseMessages.failed(responseMessages.hasOwnProperty(err.message) ? err.message : "property_update_fail", error)
            });
    }

    async getUnit(form_data) {
        let return_result = {};
        return property_model.getUnit(form_data)
            .then(async (countData) => {
                if (countData.length > 0) {
                    return_result.total_Records = countData.length;
                    return property_model.getUnit(form_data).limit(form_data.limit).offset(form_data.offset)
                        .then(async (result) => {
                            return_result.unit_list = result;
                            return responseMessages.success("unit_found", return_result);
                        })

                } else {
                    throw new Error("unit_not_found");
                }
            })
            .catch(function (err) {
                let error = (typeof err.errors != 'undefined') ? err.errors : err.message;
                return responseMessages.failed(responseMessages.hasOwnProperty(err.message) ? err.message : "property_update_fail", error)
            });
    }

    async get_master_property_type_List(form_data) {
        // return variable
        let return_result = {};

        return property_model.get_master_property_type_List()
            .then(async (result) => {
                if (result.length > 0) {
                    return_result.master_property_type_List = result;
                    // return result;
                    return property_model.get_total_master_property_type_count(form_data)
                        .then(async (countData) => {
                            console.log(countData[0]);
                            return_result.total_Records = countData[0].total_record;
                            console.log(return_result);
                            return responseMessages.success("property_type", return_result);
                        })

                } else {
                    throw new Error("property_type_not_found");
                }
            })
            .catch(function (err) {
                let error = (typeof err.errors != 'undefined') ? err.errors : err.message;
                return responseMessages.failed(responseMessages.hasOwnProperty(err.message) ? err.message : "property_type_update_fail", error)
            });
    }


    async get_property_elevation(form_data) {
        // return variable
        let return_result = {};

        return property_model.get_property_elevation()
            .then(async (result) => {
                if (result.length > 0) {

                    // return result;


                    return responseMessages.success("property_type", result);

                } else {
                    throw new Error("property_type_not_found");
                }
            })
            .catch(function (err) {
                let error = (typeof err.errors != 'undefined') ? err.errors : err.message;
                return responseMessages.failed(responseMessages.hasOwnProperty(err.message) ? err.message : "property_type_update_fail", error)
            });
    }




    async getAmenityList(form_data) {
        // return variable
        let return_result = {};

        return property_model.getAmenityList()
            .then(async (result) => {
                if (result.length > 0) {

                    // return result;
                    console.log("result0000---->", result);

                    return responseMessages.success("property_type", result);

                } else {
                    throw new Error("property_type_not_found");
                }
            })
            .catch(function (err) {
                let error = (typeof err.errors != 'undefined') ? err.errors : err.message;
                return responseMessages.failed(responseMessages.hasOwnProperty(err.message) ? err.message : "property_type_update_fail", error)
            });
    }

    async getBrokerList(form_data) {
        // return variable
        let return_result = {};

        return property_model.getBrokerList()
            .then(async (result) => {
                if (result.length > 0) {

                    // return result;
                    console.log("result0000---->", result);

                    return responseMessages.success("property_type", result);

                } else {
                    throw new Error("property_type_not_found");
                }
            })
            .catch(function (err) {
                let error = (typeof err.errors != 'undefined') ? err.errors : err.message;
                return responseMessages.failed(responseMessages.hasOwnProperty(err.message) ? err.message : "property_type_update_fail", error)
            });
    }

  

    //Get property By ID
    async get_property_by_id(form_data) {
        console.log("form_data in service=", form_data);
        let data = {};
        let finalresponse = {};
        let property_data = form_data.id;

        Object.assign(data, property_data);

        return property_model.get_property_by_id(form_data.id)
            .then(async (p_result) => {
                let property_data = JSON.parse(JSON.stringify(p_result));

                if (property_data.length > 0) {

                    let amenity_data = await property_model.get_amenitydata(form_data.id)

                    finalresponse["property_data"] = p_result;
                    finalresponse["amenity_data"] = amenity_data;
                    return responseMessages.success("property_found", finalresponse);

                } else {

                    throw new Error("property_not_found")
                }
            })
            .catch(function (err) {
                // return failed response to controller
                let error = (typeof err.errors != 'undefined') ? err.errors : err.message;
                return responseMessages.failed(responseMessages.hasOwnProperty(err.message) ? err.message : "property_fetch_error", error)
            });

    }
    async view_amenity_images(form_data) {
        let return_result = {};
        return property_model.view_amenity_images(form_data)
            .then(async (imgData) => {
                let imgArray = JSON.parse(JSON.stringify(imgData));
                if (imgArray.length > 0) {
                    return_result["img_details"] = imgArray;
                    return responseMessages.success("unit_found", return_result);
                } else {
                    throw new Error("image_not_found");
                }
            })
            .catch(function (err) {
                let error = (typeof err.errors != 'undefined') ? err.errors : err.message;
                return responseMessages.failed(responseMessages.hasOwnProperty(err.message) ? err.message : "property_update_fail", error)
            });
    }
    async delete_amenity_img_by_id(form_data) {
        let return_result = {};
        return property_model.delete_amenity_img_by_id(form_data)
            .then(async (countData) => {
                return responseMessages.success("unit_found", return_result);
            })
            .catch(function (err) {
                let error = (typeof err.errors != 'undefined') ? err.errors : err.message;
                return responseMessages.failed(responseMessages.hasOwnProperty(err.message) ? err.message : "property_update_fail", error)
            });
    }


   
      //Get building By ID
   async get_Building_by_id(form_data) {
    console.log("form_data in service=",form_data);
    let data = {};
    let finalresponse={};
    let building_data = form_data.id;

    Object.assign(data, building_data);

    return property_model.get_Building_by_id(form_data.id)
        .then(async (p_result) => {
                let building_data=JSON.parse(JSON.stringify(p_result));
             
            if (building_data.length >0) {
              
               // let amenity_data= await property_model.get_amenitydata(form_data.id)
               
                finalresponse["building_data"]=p_result;
              //  finalresponse["amenity_data"]=amenity_data;
                return responseMessages.success("Buildingid_found", finalresponse);

            } else {
              
                throw new Error("building_not_found")
            }
        })
        .catch(function (err) {
            // return failed response to controller
            let error = (typeof err.errors != 'undefined') ? err.errors : err.message;
            return responseMessages.failed(responseMessages.hasOwnProperty(err.message) ? err.message : "property_fetch_error", error)
        });

}

};
