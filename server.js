var http = require('http');
var express = require('express');
var socket_io = require('socket.io');

var app = express();
app.use(express.static('public'));

var server = http.Server(app);
var io = socket_io(server);

var usersArray = [];
var wordForDrawer = ''

io.on('connection', function (socket){
    console.log('client connected');
    
    socket.on('new-user', function(user) {
        socket.user = user;
        usersArray.push(user);
        console.log("USERS ARRAY IN SERVER: ", usersArray)
        socket.emit('all-users', usersArray);
        io.sockets.emit('word', usersArray)
    });
    
    socket.on('draw', function(positionObject){
        socket.broadcast.emit('draw', positionObject);
    });
    
    socket.on('guess', function(userGuess){
        console.log('userguess', userGuess)
        socket.broadcast.emit('guess', userGuess);
        io.sockets.emit('userWins', userGuess);
    });
    
    socket.on('word', function (userWhoDraws){
        // var userWhoWillDrawId = userWhoDraws.id;
        // // io.sockets.to(userWhoWillDrawId).emit('word', userWhoDraws);
        // io.sockets.emit('word', userWhoDraws);
       wordForDrawer = userWhoDraws.randomWord
       console.log("this is the word", wordForDrawer)
        // io.sockets.emit(userWhoDraws.randomWord)
    });
    
    socket.on('disconnect', function(user){
        socket.broadcast.emit('user-has-disconnected', socket.user.nickname);
    });
})

server.listen(process.env.PORT || 8080);