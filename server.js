// Load Dependencies
var express = require('express');
var session = require('express-session');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var path = require('path');
var bcrypt = require('bcrypt-as-promised');

// Set app
var app = express();

// Setting directories and view engine
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, './static')));
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');
app.set('trust proxy', 1);
app.use(session({
  secret: 'Starkey',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 60000 }
}));

// Connect Mongoose to MongoDB
mongoose.connect('mongodb://localhost/login_reg');

// Sample Schema
var UserSchema = new mongoose.Schema({
    first_name: {type: String, required: true, minlength: 2},
    last_name: {type: String, required: true, minlength: 2},
    email: {type: String, required: true},
    password: {type: String, required: true, minlength: 8},
    birthdate: {type: Date, required: true, default: Date.now}

});
mongoose.model('User', UserSchema);
var User = mongoose.model('User');

// Use native promises
mongoose.Promise = global.Promise;

// Routes
// Root Request
app.get('/', function(req, res) {
   res.render('index');    
});

// Register User Route 
app.post('/register', function(req, res) {
    console.log("POST DATA", req.body);
    var user = new User({first_name: req.body.first_name, last_name: req.body.last_name, email: req.body.email, password: req.body.password, birthdate: req.body.birthdate});
    if(req.body.birthdate > Date.now) {
        console.log("Birthdate can't be in the future");
        res.redirect('/');
    } else {
        if(req.body.conf_password !== req.body.password){
            console.log("passwords don't match");
            res.redirect('/');
        } else {
            bcrypt.hash(req.body.password, 10, function(err){
                if(err){
                    console.log("Bcrypt barfed");
                }
            });

            user.save(function(err){
                if(err){
                    console.log("something went wrong");
                } else{
                    console.log("Successfully added a user");
                    console.log(user);
                    res.render('success');
                }
            });
        }
    } 

   
});

// Login User Route
app.post('/login', function(req, res){
    User.findOne({email: req.body.login_email, password: req.body.login_password}, function(err, user){
        console.log(user);
        if(err){
            console.log("Login error, please try again.");
        } else {
            console.log("logged in");
            req.session.first_name = user.first_name;
            req.session.last_name = user.last_name;
            res.render('success', {first_name: req.session.first_name, last_name: req.session.last_name});
        }
    });
    //res.redirect('/');
})

// Success Route

// Setting our Server to Listen on Port: 8000
app.listen(8000, function() {
    console.log("listening on port 8000");
})