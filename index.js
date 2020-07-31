require('dotenv').config();
const express = require('express');
const path = require('path');
const bodyParser = require("body-parser");
const favicon = require('serve-favicon');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const discordio = io.of('/discord');
const passport = require('passport');
var port = process.env.PORT || 80;

var storage = require("./storage");
//add multi server support
var discordSocket = null;
var total_clients = 0;

app.use(bodyParser.json({limit: "250mb"}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(require("express-session")({secret: "keyboard cat", resave: false, saveUninitialized: false}));
app.use(passport.initialize());
app.use(passport.session());

var userData={};
var LocalStrategy = require("passport-local").Strategy;
var localStrategyDiscord = new LocalStrategy({
   passReqToCallback : true 
},async (req, username, password, cb)=>{
    if(!(username && password && cb)){
        console.log(req.originalUrl);
        if(cb){
            return cb(null, false);
        }
        return;
    }
    let userCheck = await storage.checkLogin(username,password);
    if(userCheck.data) {
        var user_dict = {"username": username};
        userData[username] = user_dict;
        return cb(null, user_dict);
    }
    else{
        console.log(userCheck);
        return cb(null, false);
    }
});

passport.use("discord", localStrategyDiscord);
passport.serializeUser((user, cb)=>{
    cb(null, user.username);
});
passport.deserializeUser((username, cb)=>{
    if(userData.hasOwnProperty(username)){
        return cb(null, userData[username]);
    }
    return cb(null, {});
});

app.use((req, res, next)=>{
    if(req.user){
        if(["/logout"].indexOf(req.url)!==-1 || req.url.startsWith("/public") || req.url.startsWith("/user_data")){
            next();
        }
        else{
            return res.sendFile(__dirname + "/public/html/discord.html");
        }
    }
    else{
        if(req.url === "/login_submit"){
            next();
        }
        else if(req.url.startsWith("/public")){
            next();
        }
        else{
            return res.sendFile(__dirname + "/public/html/login.html");
        }
    }
});

app.use("/public", express.static(path.join(__dirname, 'public')));

app.post("/logout", (req, res)=>{
    req.logout();
    return res.sendFile(__dirname + "/public/html/login.html");
});

app.get("/logout", (req, res)=>{
    req.logout();
    return res.sendFile(__dirname + "/public/html/login.html");
});

app.get("/user_data", (req,res)=>{
    return res.json(req.user);
})

app.post("/login_submit", (req, res, next) =>{
    var data=req.body;
    var user={};
    user.username = data.username;
    user.password = data.password;
    passport.authenticate('discord', (err, user, info)=>{
        if(err || !user){
           return res.status(400).json({error: err || "Invalid Login"});
        }
        req.logIn(user, (err)=>{
            if(err){
                return next(err);
            }
            return res.sendFile(__dirname + "/public/html/discord.html");
        });
    })(req, res, next);
});

app.use((req, res)=>{
    return res.status(400).sendFile(__dirname + "/public/html/login.html");
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
    // let msgObj = {
    //     username: "Chat",
    //     message: socket.username + " connected"
    // }
    // socket.broadcast.emit("message",msgObj);
    socket.on("message",(msgObj)=>{
        socket.broadcast.emit("message",msgObj);
        if(discordSocket && discordSocket.connected) {
            discordSocket.emit("message",msgObj);
        }
    });
    socket.on("disconnect",()=>{
        total_clients--;
        if(total_clients<0) {
            total_clients = 0;
        }
        // let msgObj = {
        //     username: "Chat",
        //     message: socket.username + " disconnected"
        // }
        // socket.broadcast.emit("message",msgObj);
    })
});
process.on("uncaughtException",(err)=>{
    console.log(err);
});

storage.connect().then(()=>{
    http.listen(port,()=>{
        console.log("listening on port: "+port);
    });    
});