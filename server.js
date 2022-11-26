//EXPRESS
var express = require('express');
var app = express();

// JSON WEB TOKEN
const jwt = require('jsonwebtoken');

// Environment Variables
require('dotenv/config');

// Mangoose configuration
var mongoose = require('mongoose');

// mangodb model
var usersModel = require('./model');

var bodyParser = require('body-parser');
const cors = require('cors');

// CSV uplaod configuration
var multer = require('multer');
var csv = require('csvtojson');
var upload = multer({ dest: 'upload/' });

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/users', verifyToken ,(req, res) => {
    console.log("here")
    // We find the requested model and return if it exists
    usersModel.find({}, (err, items) => {
        if (err) {
            console.log(err);
        }
        else {
            res.json({ items: items });
        }
    });
});

app.post('/users/upload', verifyToken , upload.single('file'), (req, res, next) => {
    csv()
    .fromFile(req.file.path)
    .then((jsonObj)=>{
        var users = [];
        for(var i = 0;i<jsonObj.length;i++){
            var obj={};
            obj.name=jsonObj[i]['Name'];
            obj.phone=jsonObj[i]['Phone'];
            obj.email=jsonObj[i]['Email'];
            obj.linkedIn=jsonObj[i]['LinkedIn'];
            users.push(obj);
        }
        usersModel.insertMany(users).then(function(){
            res.status(200).send({
                message: "Successfully Uploaded!"
            });
        }).catch(function(error){
            res.status(500).send({
                message: "Upload Failed!",
                error
            });
        });
    }).catch((error) => {
        res.status(500).send({
            message: "Internal Server Error",
            error
        });
    })
});

app.post('/login',(req, res) =>{
    
    const myuser = {
        username:"admin",
        password:process.env.MY_USER_PASSWORD
    }
    const username = req.body.username
    const password = req.body.password
    if(username === undefined || password === undefined) res.status(401).json({"message": "username and password is required"});
    const user = {username: username , password: password}
    // In real life scernario ideally we look for the user in the database 
    // but here for example we created a mock admin user
    if(user.username === myuser.username && user.password === myuser.password){
        const token = jwt.sign(user , process.env.SECRET_KEY)
        res.json({accessToken: token})  
    }
    else res.status(403).json({"message": "Invalid username or password"})
})

function verifyToken(req,res,next){
    const authHeader = req.headers['authorization']
    
    if(authHeader){
        // if authorization header exists then it is verified
        const token = authHeader.split(' ')[1]
        jwt.verify(token, process.env.SECRET_KEY , (err,user)=>{
            if(err) return res.status(403).json({"message":"Invalid Authorization"})
            req.user=user;
            next();
        })
    }
    // sending 401 if authorization token in not sent
    else res.status(401).json({"message": "Access token is required"})
}

mongoose.connect(process.env.MONGO_URL,
{ useNewUrlParser: true, useUnifiedTopology: true }, err => {
    console.log('Connected to database!')
});

app.listen('3000' || process.env.PORT, err => {
    if (err)
        throw err
    console.log('Server started!')
});