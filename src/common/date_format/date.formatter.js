var newId = require("uuid-pure").newId;
module.exports = class DateFormatter {

   static formatSqlDate(date) {
       if((date !="") && (date !=undefined) && date !=null){
            let inputDate = new Date(date);
            return (inputDate.getFullYear()+"-"+((inputDate.getMonth()>9) ? inputDate.getMonth()+1 : ("0"+(inputDate.getMonth()+1)))+"-"+((inputDate.getDate()>9) ? inputDate.getDate() : ("0"+inputDate.getDate())));
       } else {
           return "";
       }
    }
}
