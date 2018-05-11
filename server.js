var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

app.get('/', function(req, res, next) {
    // res.sendFile(__dirname + './templates/chat.html'); //????
    // res.render("chat.html");
    res.sendFile("/chat.html");
});

// app.use(express.static(__dirname + '/templates'));
app.use(express.static('/templates'));


io.on('connection', function(client) {
    console.log('Client connected...');

    client.on('join', function(data) {
        console.log(data);
    });

    client.on('messages', function(data, userData){
        client.emit('thread', data, userData);
        client.broadcast.emit('thread', data);
    });
});

server.listen(3000);