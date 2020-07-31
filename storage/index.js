const when = require("when");

var mongoutils = require("./mongoutils");
var user = require("./user");

module.exports  = {
    connect: mongoutils.connect,
    getDb: mongoutils.getDb,
    disconnect: mongoutils.disconnct,
    checkLogin: user.checkLogin
}