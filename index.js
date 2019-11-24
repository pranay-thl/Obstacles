const express = require('express');
const path = require('path');
const bodyParser = require("body-parser");
const favicon = require('serve-favicon');
const app = express();
var port = process.env.PORT || 80;
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/public", express.static(path.join(__dirname, 'public')));
///app.use(favicon(__dirname +"/public/img/favicon.ico")); 
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/html/index.html");
});
app.listen(port);