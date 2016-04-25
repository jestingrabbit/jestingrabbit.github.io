var getRandomEntry = function (array) { // good to have it in one place.
  //apparently bad to have it on the Array.prototype
  return array[Math.floor(Math.random()*array.length)];
};

var stringOverwriteEntry = function(string, index, value) {
  return string.slice(0, index) +
         value +
         string.slice(index+1, string);
};

// game = {
//   state : {
//     board
//     isTurn
//      x : {
//        symbol
//        moves
//        twoSums
//        player
//      }
//      o : {
//        symbol
//        moves
//        twoSums
//        player
//      },
//      utilities
//   }
//   players : { red, green},
//   takeTurn
//   isVictory
// }
// game has all the logic of the game.

// Big refactor: Done
// - move to cool coords - cool = spicy + 4, removes need for vanilla,
//   and xy isn't needed anymore either.
// - give game a players object, should remove the need for colorFlag and
// - give some greater flexibility.
// - game.state.(x || o) now inherits color and agent from game.players.(red||green).
//   this design feels more correct.
var makeGame = function (state) {
  var cleanState = function (flag) {
    var intialiseSymbolState = function (symbol) {
      player = {
        name : symbol,
        moves : [],
        twoSums : [],
        update : function (c) {
          var simpleState;
          if (this.twoSums.indexOf(game.state.winningSum-c) !== -1){ //does this move win the game?
            simpleState = 'victory';
          } else if ((game.state.x.moves.length + game.state.o.moves.length) ===
                     (game.state.board.length - 1)) { //you're playing the last move
            simpleState = 'tied';                 //and you didn't win
          } else {
            for(var j=0; j< this.moves.length; j++){ // win iff three cool indices sum to 12 - track sums of two.
              var aSum = this.moves[j] + c;
              if ((game.state.winningSum - game.state.board.length < aSum) && (aSum <= game.state.winningSum)){
                this.twoSums.push(aSum);
              } // else the sum can be discarded as irrelevant.
            }
            simpleState = 'playOn';
          }
          this.moves.push(c);
//          game.state.printBoard(); // keep it for debug, but drop it for train.
          if (this.player.agent) {
            this.player.agent.update(c, simpleState, state);
          }
          return simpleState;
        }
      };
      return player;
    };
    state = {
      isTurn : 'x',
      winningSum : 12
    };
    state.board = [];
    for(var i=0; i<9; i++) state.board.push(' ');
// vanilla indices:
// 0 1 2
// 3 4 5
// 6 7 8
// spicy indices:
//  1 -4  3
//  2  0 -2
// -3  4 -1
// cool coords:  <-- use these ones. The others are irrelevant
//  5  0  7          every winning three sum to 12, and none of the others do.
//  6  4  2
//  1  8  3
    state.printBoard = function () {
      var magic = [[1,0], [0,2], [2,1], [2,2], [1,1], [0,0], [0,1], [2,0], [1,2]];
      var rows = [[' ', '|', ' ', '|', ' '],
                  ['-', '+', '-', '+', '-'],
                  [' ', '|', ' ', '|', ' '],
                  ['-', '+', '-', '+', '-'],
                  [' ', '|', ' ', '|', ' ']];
      var coords;
      for (var i = 0; i < state.board; i++) {
        coords = magic[i];
        rows[coords[1]*2][coords[0]*2] = state.board[i];
      }
      console.log(rows
        .map(function(row){return row.join('');})
        .join('\n'));
    };
    state.isOccupied = function (c) {
      return state.board[c] !== ' ';
    };
    state.changeTurn = function () {   // was changePlayer
      if (game.state.isTurn === 'x') { // change whose turn
        game.state.isTurn = 'o';
      } else if (game.state.isTurn === 'o') {
        game.state.isTurn = 'x';
      }
    };
    state.updateState = function (c) {
      var symbol = game.state.isTurn; //whose turn?
      var symbolState = game.state[symbol];
      game.state.board[c] = symbol; // update board
      var simpleState = symbolState.update(c);
      if (simpleState === 'playOn') {
        state.changeTurn();
      }
      return simpleState;
    };
    state.x = intialiseSymbolState('x');
    state.o = intialiseSymbolState('o');
    return state;
  };

  state = state || cleanState();
  game = {
    state : state,
    cleanState : cleanState,
    players : {
      red : {
        color : 'red',
        symbol : 'x',
        agent : null,
        agentIndex : 0
      },
      green : {
        color : 'green',
        symbol : 'o',
        agent : null,
        agentIndex : 0
      },
      names : ['red', 'green']
    }
  };
  game.takeTurn = function(c) {
    if (game.state.isOccupied(c)) { //can you play there?
      alert("you can't go there.");
      return 'playOn';
    }
    page.displayMove(c);
    var simpleState = game.state.updateState(c);
    console.log(simpleState);
    if (simpleState === 'victory') {
      game.victory(game.state.isTurn);
    } else if (simpleState === 'tied') {
      game.tied();
    } else {
      game.prepNextMove();
    }
  };
  game.prepNextMove = function () {
    var symbol = game.state.isTurn;
    var agent = game.state[symbol].player.agent;
    if (agent){ // if it exists, do the agent turn automatically.
      page.$cells.off(); // turn off the playing area.
      var move = agent.move(game.state);
      setTimeout( function () {
        page.$cells
          .on('click', page.cellMakeMove);
        game.takeTurn.apply(null, [move]);
      }, agent.delay);
    } else {
      page.tellTurn(symbol);
    }
  };
  game.victory = function (symbol) {
    messagePara = $('<p>')
      .append(page.symbolSpan(symbol))
      .append($('<span>')
        .html('&nbsp; wins'));
    page.endPlayEnableReset(messagePara);
  };
  game.tied = function () {
    message = $('<p>')
      .html('a strange game. <br> the only winning move is not to play.');
    page.endPlayEnableReset(message);
  };
  game.switchAndAttachPlayersToState = function () {
    var flag1 = (game.players.red.symbol === 'x');
    for (var i = 0; i < game.players.names.length; i++) {
      var color = game.players.names[i];
      var flag2 = (color === 'red');
      var player = game.players[color];
      if (flag1 === flag2) { // this has gotta be the dumbest way to do an xor ish thing in the history of doing xorish things.
        player.symbol = 'o';
      } else {
        player.symbol = 'x';
      }
      var symbol = player.symbol;
      game.state[symbol].player = player;
    }
  };

  return game;
};

var game = makeGame(); // contains the logic.

/////////////////////////////////////////////////////////////////////////////
var blahStates = [];

agent = { // a place for bots who take in state, and spit out move
          // a computer opponent implements move, an ai implements move and update.
  utilities : {
    availableSpaces : function (state) { // available spicy indices
      var avail = [];
      for (var c = 0; c < 9; c++) {
        if (!state.isOccupied(c)) {
          avail.push(c);
        }
      }
      return avail;
    },
    winningMove : function (state, symbol) { //returns spicy or null
      var twoSums = state[symbol].twoSums;
      for (var i = 0; i < twoSums.length; i++) {
        var possibleWin = game.state.winningSum - twoSums[i];
        if (!state.isOccupied(possibleWin)) {
          return possibleWin;
        }
      }
      return null;
    },
    forkMove : function (state, symbol) { // try to fork the opponent.
      var moves = state[symbol].moves;    //nb: Existing sums are irrelevant, they don't help, they aren't threats.
      var avail = agent.utilities.availableSpaces(state);
      var forkMoves = [];
      var threatMoves = [];
      for (var i = 0; i < avail.length; i++) {
        var howManyThreats = 0;
        for (var j = 0; j < moves.length; j++) {
          var rowCompleter = game.state.winningSum - moves[j] - avail[i];
          if ((0<=rowCompleter) && (rowCompleter<game.state.board.length) &&
            !state.isOccupied(rowCompleter) &&
            (avail[i] !== rowCompleter)){
            howManyThreats++;
            threatMoves.push( [avail[i], rowCompleter] );
          }
        }
        if (howManyThreats >=2) { //this move makes two (or more?) threats, which is what we call a fork.
          forkMoves.push(avail[i]);
        }
      }
      return [forkMoves, threatMoves];
    },
  },
  // AFTER THE REFACTOR: which is now as it happens.
  train : {
    oneMatch : function () {
      game.state = game.cleanState();
      game.switchAndAttachPlayersToState();
      if (!(game.state.o.player.agent &&
            game.state.x.player.agent)){
        console.log("you can't train humans.");
        return null;
      }
      var agent;
      var simpleState = 'playOn';
      var move;
      while (simpleState === 'playOn'){
        agent = game.state[game.state.isTurn].player.agent;
        move = agent.move(game.state);
        simpleState = game.state.updateState(move);
      }
      if (simpleState === 'tied') {
        return 'tied';
      } else {
        string = game.state[game.state.isTurn].player.color;
        if (string === 'green') {
          blahStates.push(game.state);
        }
        return game.state[game.state.isTurn].player.color;
      }
    },
    matches : function (n) {
      results = {
        tied : 0
      };
      for (var i = 0; i < game.players.names.length; i++) {
        results[game.players.names[i]] = 0;
      }
      for (i = 0; i <n; i++) {
        results[this.oneMatch()]++;
      }
      return results;
    }
  },

  names : ['human', 'random', 'good', 'perfect'],

  random : {
    move : function (state) {
      var avail = agent.utilities.availableSpaces(state);
      return getRandomEntry(avail);
    },
    update: function () {},
    delay : 500
  },
  okay : {
    move : function (state) {
      var symbol = game.state.isTurn;
      var c = agent.utilities.winningMove(state, symbol);
      if (c !== null) { // 0 might be a winning move.
        return c;
      } else {
        return agent.random.move(state);
      }
    },
    update : function () {},
    delay : 400
  },
  good : {
    move : function (state) {
      var symbol = game.state.isTurn;
      var c = agent.utilities.winningMove(state, symbol);
      if (c !== null) { // 0 might be a winning move.
        return c;
      }
      var otherSymbol = (symbol === 'x')? 'o': 'x';
      c = agent.utilities.winningMove(state, otherSymbol);
      if (c !== null) { // 0 might be a winning move.
        return c;
      }
      return agent.random.move(state);
    },
    update : function () {},
    delay : 300
  },
// you know what? screw this incremental crap. But this is a long function
// https://en.wikipedia.org/wiki/Tic-tac-toe#Strategy
  perfect : {
    move : function (state) {
      var symbol = game.state.isTurn; //am i noughts or crosses again? I forget.
      var moves = game.state[symbol].moves;
      var otherSymbol = (symbol === 'x')? 'o': 'x';
      var otherMoves = game.state[otherSymbol].moves;
      var corners = [1,3,5,7];
      var center = 4;
      var i;
      if (moves.length === 0) {
        if ((symbol === 'x') || (state.x.moves[0] === center)) {
          return getRandomEntry(corners);
        } else {
          return center;
        }
      } // that first move is optimal apparently.
      var c;
      if (moves.length >=2) { //win if you can
        c = agent.utilities.winningMove(state, symbol);
        if (c !== null) {
          return c;
        }
      }
      if (otherMoves.length >=2) { // block if you must
        c = agent.utilities.winningMove(state, otherSymbol);
        if (c !== null) {
          return c;
        }
      }
      var blah = agent.utilities.forkMove(state, symbol);
      var forks = blah[0];
      var threats = blah[1];
      if (forks.length > 0) {
        return getRandomEntry(forks); // fork the opponent
      }
      var otherForks = agent.utilities.forkMove(state, otherSymbol)[0];
      if (otherForks.length > 0) { //crikey, they can fork me.
        var goodThreats = [];
        for (i = 0; i < threats.length; i++) {
          var threat = threats[i][0];
          var threatens = threats[i][1];
          if (otherForks.indexOf(threatens) === -1){
            goodThreats.push(threat);
          }
        }
        if (goodThreats.length > 0){
          return getRandomEntry(goodThreats); // make a threat
        } else {
          return getRandomEntry(otherForks); // directly block a fork
        }
      }
      if (!state.isOccupied(center)) {
        return center; // take the center.
      }
      var avail = agent.utilities.availableSpaces(state);
      var oposingCorners = [];
      for (i = 0; i < corners.length; i++) {
        if ((otherMoves.indexOf(corners[i]) !== -1) && (avail.indexOf(8-corners[i]) !== -1)) {
          oposingCorners.push(game.state.winningSum - center - corners[i]); //oposing corner.
        }
      }
      if (oposingCorners.length > 0) {
        return getRandomEntry(oposingCorners);
      }
      var availCorners = [];
      for (i = 0; i < corners.length; i++) {
        if (avail.indexOf(corners[i]) !== -1) {
          availCorners.push(corners[i]); //corner.
        }
      }
      if (availCorners.length > 0) {
        return getRandomEntry(availCorners);
      }
      return agent.random.move(state);
    },
    update : function () {},
    delay : 100
  },
  ai : {
    children : function (state) {
      xs = 0;
      os = 0;
      vacant = [];
      for (var i = 0; i < state.board.length; i++) {
        if (state.board[i] === ' '){
          vacant.push(i);
        }
      }
      var symbol = state.isTurn;
      var children = [];
      for (i = 0; i < vacant.length; i++) {
        children.push(stringOverwriteEntry(state.board, vacant[i], symbol));
      }
      return children;
    },
    ancestors : function (board){

    }
  }
};

agent.ai.makeAJellybean = function (){


};

/////////////////////////////////////////////////////////////////////////////

var page = {}; // no jquery in game or agent, lots in page (which doesn't seem taken in document ...)

// there are three phases to the basic game.
// 1. The game is played - the playing area, esp $cells, is live.
//    -message on
// 2. The game ends. The playing area is turned off, the controls are turned on
//    -the game result and the board are visible.
//    -message on
//    -reset is offered.
// 3. The board and result is cleared and start is offered.
//    - message off
//    - upon start, the controls are turned off, the playing area is on.

page.symbolPara = function (symbol) { // to put in the playingarea
  if (symbol === 'x') {
    return $('<p>')
      .addClass(game.state.x.player.color)
      .html('&times;');
  } else if (symbol === 'o') {
    return $('<p>')
      .addClass(game.state.o.player.color)
      .text('o');
  } else {
    console.log('(╯°□°）╯︵ ┻━┻');
  }
};
page.symbolSpan = function (symbol) { // to put in messages
  if (symbol === 'x') {
    return $('<span>')
      .addClass('symtext')
      .addClass(game.state.x.player.color)
      .addClass('x')
      .html('&times;');
  } else if (symbol === 'o') {
    return $('<span>')
      .addClass('symtext')
      .addClass(game.state.o.player.color)
      .addClass('o')
      .text('o');
  } else {
    console.log('(゜-゜)');
  }
};
page.tellTurn = function () { // in 1. after every turn, more or less.
  var messagePara = $('<p>')
    .append(page.symbolSpan(game.state.isTurn))
    .append( $('<span>').text("'s turn") );
  $('.message')
    .html('')
    .append(messagePara);
};
page.displayMove = function (c) {
  symbol = game.state.isTurn;
  page.$cells //lets not overwrite $cells here.
    .filter( function (node) {
      return $(this).data('cool') === c;
    })
    .attr('class', 'cell '+symbol+' '+game.state[symbol].player.color)
    .append(page.symbolPara(symbol));
};

page.endPlayEnableReset = function (messageSpan) { // start of 2.
  page.$cells
    .removeClass('unoccupied') // kills hover css
    .off(); // makes board inactive.
  $('.message')
    .html('')
    .append(messageSpan); // the result is shown.
  $('.next')
    .append('<p>')
    .text(' Reset?')
    .on('click', function() { // end of 2., start of 3.
      $('.next').off().html('');
      page.clearPage();
  });
};

page.displaySymbols = function () {
  for (var i = 0; i < game.players.names.length; i++) {
    var color = game.players.names[i];
    var symbol = game.players[color].symbol;
    $('.'+color+'>.symbol').html(page.symbolSpan(symbol));
  }
};
page.clearPage = function () { // begin 3.
  page.$cells
    .attr('class', 'cell')
    .html('');
  game.state = game.cleanState();
  game.switchAndAttachPlayersToState();
  page.displaySymbols();
  $('.message')
    .html('')
    .toggle();
  page.activateAgentChoice();
  $('.next')
    .html('')
      .append('<p>')
      .text('Start?')
    .on('click', page.restartGame);
};

page.activateAgentChoice = function() {
  $('.playerrow').hover(
    function () {
      $(this).find('.symtext').addClass('white');
    },
    function () {
      $(this).find('.symtext').removeClass('white');
    });
  $('.playerrow')
    .addClass('active')
    .on('click', function () {
      var color;
      for (var i = 0; i < game.players.names.length; i++) {
        color = game.players.names[i];
        if ($(this).hasClass(color)){
          break;
        }
      }
      var player = game.players[color];
      player.agentIndex++;
      if ( player.agentIndex === agent.names.length ){
        player.agentIndex = 0;
      }
      var agentName = agent.names[player.agentIndex];
      $(this).find('.player').text(agentName);
      player.agent = agent[agentName];
    });
};

page.restartGame = function () {  // Start 1.
  $('.playerrow')
    .removeClass('active')
    .off(); // no changing player settings during game.
  $('.next') // the next phase is a product of the game, not a button.
    .off()
    .html('');
  page.resetPlayingArea();
  $('.message')
    .toggle();
  game.state.isTurn = 'x'; // prepNextMove no longer switches this.
  game.prepNextMove();
};
page.resetPlayingArea = function () { // end of 3, start of 1
  page.$cells
    .attr('class', 'cell unoccupied')
    .on('click', page.cellMakeMove);
};

page.cellMakeMove = function () { // in 1.
    if ($(this).hasClass('x') || $(this).hasClass('o')) {
      alert("you can't play there");
      return;
    }
    c = $(this).data('cool');
    game.takeTurn(c);
    return;
};

$(document).ready( function () {
  page.$cells = $('.cell'); // hold the cells so you can turn them off.
  page.clearPage();
});
