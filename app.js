var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true}))
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
var mongoose = require('mongoose');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var MongoClient = require('mongodb').MongoClient;
var Post = require("./post");
var url = 'mongodb://localhost:27017/mydb';
mongoose.connect('mongodb://localhost/testForAuth');
var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
});

//use sessions for tracking logins
app.use(session({
  cookieName: 'session',
  secret: 'work hard',
  resave: true,
  saveUninitialized: false,
  store: new MongoStore({
    mongooseConnection: db
  })
}));

// parse incoming requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get("/blog", (req, res) => {
  Post.find({}, (err, posts) => {
     res.render('blog.html', { posts: posts})
  });
});
app.post('/addpost', (req, res) => {
   var postData = new Post(req.body);
   postData.save().then( result => {
       res.redirect('/blog');
       console.log("BlogPost saved to db");
   }).catch(err => {
       console.log("Error saving to db");
       res.status(400).send("Unable to save data");
   });
  
});

// serve static files from templates
// app.use(express.static(__dirname + '/templates'));
app.use(express.static(__dirname));

// include routes
var routes = require('./router/router');
app.use('/', routes);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('File Not Found');
  err.status = 404;
  next(err);
});

// error handler
// define as the last app.use callback
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.send(err.message);
});

MongoClient.connect(url, function (err, db) {
  if (err) throw err;
  var dbo = db.db("mydb");
  var currentCollection = dbo.collection("messages");
  var timestampCollection = dbo.collection("timestamps")
  io.on("connection", function (socket) {
    console.log('a user connected');
  
    currentCollection.find().toArray().then(function(docs){
      socket.emit("chatHistory", docs);
    })
  
    var people = {};

    socket.on("message", function (message) {
      console.log("message: " + message);
      console.log("message saved to db");
      currentCollection.insertOne({
        text: message
      }, function (err, res) {
        if (err) throw err;
        console.log("1 document inserted");
      });
      var timestamp = new Date();
      timestampCollection.insertOne({
        text: timestamp
      }, function (err, res) {
        if (err) throw err;
      });
      console.log("Inserted a timestamp into the database");
      socket.broadcast.emit("message", message);
    })
  });
  
  
  });

// listen on port 3000
server.listen(3000, function () {
  console.log('Express server listening on port 3000');
});