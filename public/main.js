var socket = io();

///// Pictionary game function //////

var pictionary = function() {
    
    ///// variables used to modify and select elements from the DOM  /////
    
    var context;
    var drawing;
    var guessBox = $('#guess input');
    var guess = $('#guess');
    var canvas = $('canvas');
    var otherUsersGuess = $('#otherUsersGuess');
    var userWrapDiv = $('#nicknameWrap');
    var nicknameForm = $('#nicknameForm');
    var mainGame = $('#main');
    var usernameInput = $('#usernameInput')
    var whoIsTheDrawerDiv = $('#whoIsTheDrawer')
    var topMessage = $('#top-message')
    
    // state object to save user's details
    
    var state = {
        user: {},
        userWhoDraws: []
    }
    
    ///// functions to modify the DOM /////
    
    var draw = function(position) {
        context.beginPath(); // tells the context that we're about to start drawing a new object
        context.arc(position.x, position.y, 
                         6, 0, 2 * Math.PI); // arc is used to draw arcs.
        context.fill();
    };

    context = canvas[0].getContext('2d'); // getContext('2d') function creates a drawing context for the canvas
    canvas[0].width = canvas[0].offsetWidth;
    canvas[0].height = canvas[0].offsetHeight;
    
    var displayOtherUsersGuess = function(usersGuess){
        otherUsersGuess.text('This is' + ' ' + usersGuess.user + "'s" + ' ' + 'guess:' + ' ' + usersGuess.guess)
    }
    
    var displayWhoIsDrawer = function(usersArray){
        state.userWhoDraws = usersArray.splice(0,1);
        whoIsTheDrawerDiv.text('It is' + ' ' + state.userWhoDraws[0].nickname + "'s" + ' ' + 'turn to draw')
    }
    
    
    ///// DOM event listeners /////
    
    // when user enters their username
    nicknameForm.submit(function(event){
       event.preventDefault();
       userWrapDiv.hide();
       state.user['nickname'] = usernameInput.val();
       socket.emit('users', state.user);
       guess.show()
    });
    
    // when user moves mouse
    canvas.on('mousemove', function(event, userWhoDraws) {
        if(drawing && state.user.nickname === state.userWhoDraws[0].nickname){
            var offset = canvas.offset();
            var position = {x: event.pageX - offset.left,
                            y: event.pageY - offset.top};
            draw(position);
            socket.emit('draw', position);
        }
    });
    
    // when user puts mouse down and up
    canvas.mousedown (function(){
        drawing = true;
    });
    
    canvas.mouseup (function(){
        drawing = false;
    });
    
    // check if user pressed enter
    var onKeyDown = function(event) {
        if (event.keyCode != 13) { // Enter
            return;
        }
        if(state.user.nickname !== state.userWhoDraws[0].nickname){
            var userGuessInput = guessBox.val();
            var userWhoGuessed = state.user.nickname
            var userGuess = {user:userWhoGuessed, guess:userGuessInput}
            socket.emit('guess', userGuess)
            guessBox.val('');
        }
    };
    
    
    ///// Listeners for server events //////
    
    socket.on('drawer', displayWhoIsDrawer)
    
    socket.on('draw', draw)
    
    guessBox.on('keydown', onKeyDown);
    
    socket.on('guess', displayOtherUsersGuess)
};

$(document).ready(function() { // selects the canvas element
    pictionary();
});