var http = require('http');
var express = require('express');
var socket_io = require('socket.io');

var app = express();
app.use(express.static('public'));

var server = http.Server(app);
var io = socket_io(server);

var usersArray = [];

io.on('connection', function (socket){
    console.log('client connected');
    
    socket.on('users', function(user) {
        socket.user = user;
        usersArray.push(user);
        socket.emit('drawer', usersArray);
    });
    
    socket.on('draw', function(positionObject){
        socket.broadcast.emit('draw', positionObject);
    });
    
    socket.on('guess', function(userGuess){
        socket.broadcast.emit('guess', userGuess);
        io.sockets.emit('userWins', userGuess);
    });
    
    socket.on('word', function (userWhoDraws){
        var userWhoWillDrawId = userWhoDraws.id;
        io.sockets.to(userWhoWillDrawId).emit('word', userWhoDraws);
    });
    
    socket.on('disconnect', function(user){
        socket.broadcast.emit('user-has-disconnected', socket.user.nickname);
    });
})

server.listen(process.env.PORT || 8080);