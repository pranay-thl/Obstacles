const MongoClient = require("mongodb").MongoClient;
const when = require("when");

var client;
var db;

function connect() {
    return when.promise((resolve, reject) => {
        let uri = process.env.MONGOURI;
        MongoClient.connect(uri,{useUnifiedTopology:true, useNewUrlParser:true}, (err,_client) => {
            if(err) {
                console.log(err);
                return reject({err:{msg:err}});
            }
            client = _client;
            db = _client.db();
            console.log("MongoDB Connection Successful");
            return resolve({data:{}});
        })
    })
}

function getDb() {
    return db;
}

function disconnct() {
    if(client) {
        client.close();
        console.log("MongoDB connection closed!")
    }
}

module.exports = {
    connect: connect,
    getDb: getDb,
    disconnct: disconnct
}