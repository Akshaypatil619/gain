
let knex = require("../../../config/knex");
var DateDiff = require('date-diff');

module.exports = class DefaultLanguage {

    static async getDefaultLanguage(){
       return knex("master_languages").select("master_languages.language_code").where("master_languages.is_default",1);
    }
    static async attributeOperation(data) {
        var diff = new DateDiff(new Date(),new Date(data['dob']));
        let currentAge = parseInt(diff.years());
        let cityName = await knex("master_city").select("master_city.city_name").where("master_city.id", Number(data['city'])); 
        let cityRecords = await knex("attribute_has_values").select("attribute_has_values.value").where("attribute_has_values.value",cityName[0].city_name);
        let ageRecords = await knex("attribute_has_values").select("attribute_has_values.value").where("attribute_has_values.value",currentAge);
        if(cityRecords.length==0){
            await knex("attribute_has_values").insert({attribute_id: 1, value: cityName[0].city_name}); 
        }
        if(ageRecords.length==0){
            await knex("attribute_has_values").insert({attribute_id: 2, value: currentAge}); 
        }
    }
    static async appendReponseMessages(inputLanguageCode){
        let filePath = [
                        "src/cc/response_codes/third_party_messages.js",
                        "src/cc/modules/customer/response/customer.response.js",
                        "src/cc/modules/city/response/city.response.js",
                        "src/cc/modules/product/response/product.response.js",
                        "src/cc/modules/user/responses/user.response.js",
                        "src/tenant/modules/cron_job/response/cron.response.js"
                    ];
                        
        let languageData = await this.getDefaultLanguage();
        
        //    filePath.forEach((file,index) => {
        //        console.log("fileindexfileindex : ",file,index);
        //         try{
        //             fs.readFile(file,"utf8", function(err, data) { 
        //                 if (err) throw err; 
        //                      let resData = data.substring(data.indexOf("=")+1, data.indexOf("};")+1);
        //                      const messages = JSON.parse(resData); 
        //                      let rawJson = JSON.stringify(messages[languageData[0].language_code]); 
        //                      messages[inputLanguageCode] = JSON.parse(rawJson.replace(new RegExp(languageData[0].language_code,"g"), inputLanguageCode)); 
        //                      let finalResult = data.slice(0, data.indexOf("};"))+',"'+inputLanguageCode+'":'+JSON.stringify(messages[inputLanguageCode])+data.slice(data.indexOf("};"))
        //                      fs.writeFile(file, finalResult, err => {
        //                          if (err) {
        //                              console.log('Error writing file', err)
        //                          } else {
        //                              console.log('Successfully wrote file')
        //                          }
        //                      })
        //                  });               
        //         } catch(err){
        //             console.log("catchcatchcatchcatchcatchcatchcatchcatch : ",err);
        //         }       
        //    });
     }
}
