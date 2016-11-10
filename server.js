var http = require('http');
var express = require('express');
var socket_io = require('socket.io');

var app = express();
app.use(express.static('public'));

var server = http.Server(app);
var io = socket_io(server);

var usersArray = [];

console.log('outside usersarray', usersArray)

io.on('connection', function (socket){
    console.log('client connected')
    
    socket.on('users', function(user) {
        socket.user = user
        usersArray.push(user);
        socket.emit('drawer', usersArray)
    })
    
    socket.on('draw', function(positionObject){
        socket.broadcast.emit('draw', positionObject)
    })
    
    socket.on('guess', function(userGuess){
        socket.broadcast.emit('guess', userGuess)
        
    })
})

server.listen(process.env.PORT || 8080);