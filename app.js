var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://localhost:27017/mydb';
//connect to MongoDB
mongoose.connect('mongodb://localhost/testForAuth');
var db = mongoose.connection;

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
      console.log("Inserted a message in a collection");
      currentCollection.insertOne({
        text: message
        //username: "here will be username"
      }, function (err, res) {
        if (err) throw err;
        console.log("1 document inserted");
      });
      var timestamp = new Date();
      timestampCollection.insertOne({
        text: timestamp
      }, function (err, res) {
        if (err) throw err;
        console.log("1 document inserted");
      });
      console.log("Inserted a timestamp in a timestampCollection");
  
      socket.broadcast.emit("message", message);
    })
  });
  
  
  });

// listen on port 3000
server.listen(3000, function () {
  console.log('Express server listening on port 3000');
});