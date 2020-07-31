const express = require('express');
const path = require('path');
const bodyParser = require("body-parser");
const favicon = require('serve-favicon');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const discordio = io.of('/discord');
var port = process.env.PORT || 80;

//add multi server support
var discordSocket = null;
var total_clients = 0;

app.use(bodyParser.urlencoded({ extended: false }));
app.use("/public", express.static(path.join(__dirname, 'public')));
///app.use(favicon(__dirname +"/public/img/favicon.ico")); 

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/html/discord.html");
});
app.use((req, res)=>{
    return res.status(400).sendFile(__dirname + "/public/html/discord.html");
});

discordio.on('connection', socket => {
    console.log('discord connected');
    discordSocket = socket;
    //@TODO add middlewares and multi connection handling
    discordSocket.on("message",(msgObj) =>{
        io.emit("message",{message: msgObj});
    });
});

io.on('connection', (socket) => {
    total_clients++;
    socket.username = "User "+total_clients;
    console.log('a user connected');
    socket.on("message",(msgObj)=>{
        msgObj.username = socket.username;
        socket.broadcast.emit("message",msgObj);
        if(discordSocket && discordSocket.connected) {
            discordSocket.emit("message",msgObj);
        }
    });
});

http.listen(port,()=>{
    console.log("listening on port: "+port);
});

process.on("uncaughtException",(err)=>{
    console.log(err);
})