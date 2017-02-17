var moment = require("moment");
var jsonfile = require("jsonfile");
module.exports = {
    "updateLoginTime" : function(name, userInfo){
        try{
            var key = name;
            var users = userInfo.PERSON_INFO_EN_US;
            var person = users[key];
            person.lastLoginTime = moment().format("YYYY-MM-DD");
            users[key] = person;
            userInfo.PERSON_INFO_EN_US = users;
            var file = "personInfo.json";
            var obj = userInfo;
            jsonfile.writeFile(file, obj, {spaces: 2}, function (err){
               console.log(err);
           });
        }catch(e){
            return e.toString();
        }

    },
    "daysCalculation" : function (lastLoginTime){
        var currentDateStr = moment().format("YYYY-MM-DD");
        var currentDate = Date.parse(currentDateStr);
        var dayCount = 0;
        if(lastLoginTime !=""){
            var lastLoginDate = Date.parse(lastLoginTime);
            dayCount = (Math.abs(currentDate - lastLoginDate))/1000/60/60/24;
        }
        return dayCount;
    }
}