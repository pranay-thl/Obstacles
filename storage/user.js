var mongoutils = require("./mongoutils");
const when = require("when");

function checkLogin(username, password) {
    return when.promise((resolve, reject) => {
        var col = mongoutils.getDb().collection("users");
        col.find({'_id':username}).toArray((err,res)=>{
            if(err) {
                return resolve({err:{msg:err}});
            }
            if(res.length === 0 || res[0].password !== password) {
                return resolve({err:{msg: "Invalid Credentials"}})
            }
            return resolve({data:res[0]});
        });
    })
}

module.exports = {
    checkLogin
}