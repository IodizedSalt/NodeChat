var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var server = require('http').createServer(app);
var io = require('socket.io')(server);

//connect to MongoDB
mongoose.connect('mongodb://localhost/testForAuth');
var db = mongoose.connection;

//handle mongo error
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  // we're connected!
});

//use sessions for tracking logins
app.use(session({
  secret: 'work hard',
  resave: true,
  saveUninitialized: false,
  store: new MongoStore({
    mongooseConnection: db
  })
}));
// app.get('/user', function(req, res){

//   res.render('index', {username: req.username})
// });

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

io.on('connection', function(client) {
  console.log('Client connected...');
  

  client.on('join', function(data) {
    // client.emit('username', data)
      console.log(data);
  });

  client.on('messages', function(data){
      client.emit('thread', data);
      client.broadcast.emit('thread', data);
  });
});


// listen on port 3000
server.listen(3000, function () {
  console.log('Express server listening on port 3000');
});