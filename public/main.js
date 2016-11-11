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
    var playButton = $('#playButton')
    var wordToDrawDiv = $('#wordToDraw')
    var words = [
        "word", "letter", "number", "person", "pen", "class", "people",
        "sound", "water", "side", "place", "man", "men", "woman", "women", "boy",
        "girl", "year", "day", "week", "month", "name", "sentence", "line", "air",
        "land", "home", "hand", "house", "picture", "animal", "mother", "father",
        "brother", "sister", "world", "head", "page", "country", "question",
        "answer", "school", "plant", "food", "sun", "state", "eye", "city", "tree",
        "farm", "story", "sea", "night", "day", "life", "north", "south", "east",
        "west", "child", "children", "example", "paper", "music", "river", "car",
        "foot", "feet", "book", "science", "room", "friend", "idea", "fish",
        "mountain", "horse", "watch", "color", "face", "wood", "list", "bird",
        "body", "dog", "family", "song", "door", "product", "wind", "ship", "area",
        "rock", "order", "fire", "problem", "piece", "top", "bottom", "king",
        "space"
    ];
    
    // state object to save user's details
    
    var state = {
        user: {},
        userWhoDraws: {}
    };
    
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
        otherUsersGuess.text('This is' + ' ' + usersGuess.user + "'s" + ' ' + 'guess:' + ' ' + usersGuess.guess);
    };
    
    var displayWhoIsDrawer = function(usersArray){
        var userWhoWillDraw = usersArray.splice(0,1);
        state.userWhoDraws['nickname'] = userWhoWillDraw[0].nickname;
        state.userWhoDraws['id'] = userWhoWillDraw[0].id;
        whoIsTheDrawerDiv.text('It is' + ' ' + state.userWhoDraws.nickname + "'s" + ' ' + 'turn to draw');
        var randomWordForDrawer = words[Math.floor(Math.random() * words.length)];
        state.userWhoDraws['randomWord'] = randomWordForDrawer;
    };
    
    var displayRandomWordForDrawer = function(userWhoDraws){
        wordToDrawDiv.text('The word you have to draw is:' + ' ' + userWhoDraws.randomWord);
    };
    
    var userChoseCorrectWord = function(userGuess){
        console.log(userGuess.guess);
        if(userGuess.guess === state.userWhoDraws.randomWord){
            alert(userGuess.user + ' ' + 'wins');
            // whoIsTheDrawerDiv.html(userGuess.user + ' ' + 'wins!!! Press button to play again');
        }
    };
    
    var userDisconnected = function(user){
        alert(user + ' ' + "went offline");
    };
    
    ///// DOM event listeners /////
    
    // when user enters their username
    nicknameForm.submit(function(event){
       event.preventDefault();
       userWrapDiv.hide();
       state.user['nickname'] = usernameInput.val();
       state.user['id'] = socket.io.engine.id;
       socket.emit('users', state.user);
       playButton.show();
    });
    
    // when user presses play button
    playButton.on('click', function(event){
        event.preventDefault();
        if(state.user.nickname === state.userWhoDraws.nickname){
            socket.emit('word', state.userWhoDraws);
        }
        if(state.user.nickname !== state.userWhoDraws.nickname){
            guess.show();
        }
    });
    
    // when user moves mouse
    canvas.on('mousemove', function(event, userWhoDraws) {
        if(drawing && state.user.nickname === state.userWhoDraws.nickname){
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
        var userGuessInput = guessBox.val();
        var userWhoGuessed = state.user.nickname;
        var userGuess = {user:userWhoGuessed, guess:userGuessInput};
        socket.emit('guess', userGuess);
        guessBox.val('');
    };
    
    ///// Listeners for server events //////
    
    socket.on('drawer', displayWhoIsDrawer);
    
    socket.on('draw', draw);
    
    guessBox.on('keydown', onKeyDown);
    
    socket.on('guess', displayOtherUsersGuess);
    
    socket.on('word', displayRandomWordForDrawer);
    
    socket.on('userWins', userChoseCorrectWord);
    
    socket.on('user-has-disconnected', userDisconnected);
};

$(document).ready(function() { // selects the canvas element
    pictionary();
});