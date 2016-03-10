// TODO - setSymbolDisplay XX
//        -do the css XX
//        -integrate into flow XX
//     - put delay on ai turn XX
//       -store variable XX
//       -integrate into flow XX
//     - changePlayer in display.
//     - training
//       -display option to train
//       -display result
//       -write it in agent
//        -set delay 0 when doing this.
//     - write decent ai

// game = {
//   state : {
//     board
//     isTurn
//      x : {
//        symbol
//        moves
//        twoSums
//      }
//      o : {
//        symbol
//        moves
//        twoSums
//      },
//      utilities
//   }
//   takeTurn
//   isVictory
// }
// game has all the logic of the game.
var makeGame = function (state) {
  var cleanState = function (colorFlag) {
    var intialisePlayer = function (symbol) {
      player = {
        name : symbol,
        moves : [],
        twoSums : [],
        update : function (i,v) {
            if (this.twoSums.indexOf(-i) !== -1){ //does this move win the game?
              var simpleState = 'victory';
            } else if ((game.state.x.moves.length + game.state.o.moves.length)
                   === (game.state.board.length - 1)) {
              var simpleState = 'tied';
            } else {
              for(var j=0; j< this.moves.length; j++){ // win iff three spicy indices sum to 0 - track sums of two.
                var aSum = this.moves[j] + i;
                if (-4<= aSum && aSum <= 4){
                  this.twoSums.push(aSum);
                } // else the sum can be discarded as irrelevant.
              }
              var simpleState = 'playon';
            }
          this.moves.push(i);
          game.state.printBoard(); // keep it for debug
          if (this.agent) {
            this.agent.update(i, v, simpleState);
          }
          return simpleState;
        }
      }
      return player;
    };
    state = {
      board : new Array(9),
      isTurn : 'x',
      colorFlag: colorFlag
    }

    state.xyToVanilla = function (x, y) {
      return x+3*y;
    };
    state.vanillaToXy = function (v) {
      return [ v%3, Math.floor(v/3)]
    }
// vanilla indices:
// 0 1 2
// 3 4 5
// 6 7 8
    state.vanillaToSpicy = [1, 2, -3, -4, 0, 4, 3, -2, -1]; //You own three indexes that sum to 0 iff you've won.
// spicy indices:
//  1 -4  3
//  2  0 -2
// -3  4 -1
    state.spicyToVanilla = function(i){
      return state.vanillaToSpicy.indexOf(i)
    }
    state.xyToSpicy = function (x, y) {
      return state.vanillaToSpicy[this.xyToVanilla(x, y)];
    };
    state.spicyToXy = function (i) {
      var n = state.vanillaToSpicy.indexOf(i);
      return [ n%3, Math.floor(n/3)];
    };
    state.getIV = function( inputFlavour, num1, num2) {
      if (inputFlavour === 'xy') {
        var i = game.state.xyToSpicy(num1, num2);
        var v = game.state.xyToVanilla(num1, num2);
      } else if (inputFlavour === 'vanilla') {
        var i = game.state.vanillaToSpicy[num1];
        var v = num1;
      } else if (inputFlavour === 'spicy') {
        var i = num1;
        var v = game.state.spicyToVanilla(i);
      }
      return [i,v];
    };
    state.printBoard = function () {
      var rows = [[' ', '|', ' ', '|', ' '],
                  ['-', '+', '-', '+', '-'],
                  [' ', '|', ' ', '|', ' '],
                  ['-', '+', '-', '+', '-'],
                  [' ', '|', ' ', '|', ' ']];
      for (var i = 0; i < state.x.moves.length; i++) {
        var move = state.x.moves[i];
        var coords = state.spicyToXy(move);
        rows[coords[1]*2][coords[0]*2] = 'x';
      }
      for (var i = 0; i < state.o.moves.length; i++) {
        var move = state.o.moves[i];
        var coords = state.spicyToXy(move);
        rows[coords[1]*2][coords[0]*2] = 'o';
      }
      console.log(rows
        .map(function(row){return row.join('')})
        .join('\n'));

    };
    state.isOccupied = function (v) { //input Vanilla.
      return state.board[v];
    };
    state.changePlayer = function () {
      if (game.state.isTurn === 'x') { // change whose turn
        game.state.isTurn = 'o';
      } else if (game.state.isTurn === 'o') {
        game.state.isTurn = 'x';
      }
    }
    state.updateState = function (i, v) {
      var symbol = game.state.isTurn; //whose turn?
      var player = game.state[symbol];
      game.state.board[v] = symbol; // update board
      return player.update(i, v);
    }
    state.setColors = function () {
      if (state.colorFlag) {
        state.x.color = 'red';
        state.o.color = 'green'
      } else {
        state.o.color = 'red';
        state.x.color = 'green'
      }
    }
    state.x = intialisePlayer('x');
    state.o = intialisePlayer('o');
    return state;
  };

  state = state || cleanState(true);
  game = {
    state : state,
    cleanState : cleanState
  };
  game.takeTurn = function( inputFlavour, num1, num2 ) {
    var niceCoords = state.getIV(inputFlavour, num1, num2)
    var i = niceCoords[0]; // i is spicy. Good for working out who wins.
    var v = niceCoords[1]; // v is vanilla. Good for working with the board.
    if (game.state.isOccupied(v)) { //can you play there?
      alert("you can't go there.");
      return 'playOn';
    }
    page.displayMove('spicy', i);
    simpleState = game.state.updateState(i,v);
    if (simpleState === 'victory') {
      game.victory(game.state.isTurn);
    } else if (simpleState === 'tied') {
      game.tied();
    } else {
      game.prepNextMove();
    }
  };
  game.prepNextMove = function () {
    game.state.changePlayer();
    var symbol = game.state.isTurn;
    if (game.state[symbol].agent){ // if it exists, do the agent turn automatically.
      move = game.state[symbol].agent.move(game.state);
      setTimeout( function () {
        game.takeTurn.apply(null, move)
      }, game.state[symbol].agent.delay);
    } else {
      page.tellTurn(symbol);
    }
  };
  game.victory = function (symbol) { // TODO enhance
    messagePara = $('<p>')
      .append(page.symbolSpan(symbol))
      .append($('<span>')
        .html('&nbsp; wins'));
    page.endPlayEnableReset(messagePara);
  };
  game.tied = function () { // TODO enchance
    message = $('<p>')
      .html('a strange game. <br> the only winning move is not to play.');
    page.endPlayEnableReset(message);
  };

  return game;
};

var game = makeGame(); // contains the logic.

/////////////////////////////////////////////////////////////////////////////
agent = { // a place for bots who take in state, and spit out move
          // a computer opponent implements move, an ai implements move and update.
  utilities : {
    availableSpaces : function (state) { // available spicy indices
      var avail = []
      for (var v = 0; v < 9; v++) {
        if (!state.isOccupied(v)) {
          var i = state.vanillaToSpicy[v];
          avail.push(i);
        }
      }
      return avail;
    },
    winningMove : function (state, symbol) { //returns spicy or null
      var twoSums = state[symbol].twoSums;
      var avail = agent.utilities.availableSpaces(state);
      for (var i = 0; i < twoSums.length; i++) {
        if (avail.indexOf(-twoSums[i]) !== -1) {
          return -twoSums[i];
        }
      }
      return null;
    },
    forkMove : function (state, symbol) { // try to fork the opponent.
      var moves = state[symbol].moves;
//      var twoSums = state[symbol].moves;
      var avail = agent.utilities.availableSpaces(state);
      //if we're calling this, i in twoSums ==> -i not in avail.
      //how to use right?
      //Existing sums are irrelevant, they don't help, they aren't threats.
      var forkMoves = [];
      var threatMoves = [];
      for (var i = 0; i < avail.length; i++) {
        var goodSums = [];
        for (var j = 0; j < moves.length; j++) {
          var possGoodSum = moves[j] + avail[i];
          if (avail.indexOf(-possGoodSum) !== -1){
            goodSums.push(avail[i]); // playing avail i makes one threat.
            threatMoves.push( [avail[i],-possGoodSum] );
          }
        }
        if (goodSums.length >=2) { //this move makes two (or more?) threats, which is what we call a fork.
          forkMoves.push(avail[i]);
        }
      }
    return [forkMoves, threatMoves];
    }

// sometimes you want to play a fork, sometimes you want to block forks.
//    threatMoves : function (state, symbol, badThreats)
      // a threat says "you have to play here next, or win, or I win"
      // they are good for blocking forks.
      // unless where you force the person to play is where they fork you.
      // that's a bad threat.
      // but really, we'll test that if we need to. It doesn't need its own function.
      // perfect play is going to be a huge mess either way.
  },
  random : {
    move : function (state) {
      var avail = agent.utilities.availableSpaces(state);
      var i = avail[Math.floor(Math.random()*avail.length)];
      return ['spicy', i];
    },
    update: function () {},
    delay : 500
  },
  okay : {
    move : function (state) {
      var symbol = game.state.isTurn;
      var i = agent.utilities.winningMove(state, symbol);
      if (i !== null) { // 0 might be a winning move.
        return ['spicy', i];
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
      var i = agent.utilities.winningMove(state, symbol);
      if (i !== null) { // 0 might be a winning move.
        return ['spicy', i];
      }
      var otherSymbol = (symbol === 'x')? 'o': 'x';
      var i = agent.utilities.winningMove(state, otherSymbol);
      if (i !== null) { // 0 might be a winning move.
        return ['spicy', i];
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
      var corners = [-3, -1, 1, 3];
      var center = 0;
      if (moves.length === 0) {
        if ((symbol === 'x') || (state.x.moves[0] === 0)) {
          return ['spicy', corners[Math.floor(Math.random()*4)]];
        } else {
          return ['spicy', 0];
        }
      } // that first move is optimal apparently.
      if (moves.length >=2) { //win if you can
        var wm = agent.utilities.winningMove(state, symbol);
        if (wm !== null) {
          return ['spicy', wm];
        }
      }
      if (otherMoves.length >=2) { // block if you must
        var wm = agent.utilities.winningMove(state, otherSymbol);
        if (wm !== null) {
          return ['spicy', wm];
        }
      }
      var blah = agent.utilities.forkMove(state, symbol);
      var forks = blah[0];
      var threats = blah[1];
      if (forks.length > 0) {
        return ['spicy', forks[0]]; // fork the opponent
      }
      var otherForks = agent.utilities.forkMove(state, otherSymbol)[0];
      if (otherForks.length > 0) { //crikey, they can fork me.
        for (var i = 0; i < threats.length; i++) {
          var threat = threats[i][0];
          var threatens = threats[i][1];
          if (otherForks.indexOf(threatens) === -1){
            return ['spicy', threat]; // make a threat
          }
        }
        return ['spicy', otherForks[0]]; // avoid a fork
      }

      if (!state.isOccupied(4)) { // takes vanilla input
        return ['spicy', 0]; // take the center.
      }
      var avail = agent.utilities.availableSpaces(state);
      for (var i = 0; i < corners.length; i++) {
        if ((otherMoves.indexOf(corners[i]) !== -1)
        && (avail.indexOf(-corners[i]) !== -1)) {
          return ['spicy', -corners[i]]; //oposing corner.
        }
      }
      for (var i = 0; i < corners.length; i++) {
        if (avail.indexOf(corners[i]) !== -1) {
          return ['spicy', corners[i]]; //corner.
        }
      }
      return agent.random.move(state);
    },
    update : function () {},
    delay : 100
  }
}

/////////////////////////////////////////////////////////////////////////////

var page = {} // no jquery in game or agent, lots in page (which doesn't seem taken in document ...)

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
      .addClass(game.state.x.color)
      .html('&times;');
  } else if (symbol === 'o') {
    return $('<p>')
      .addClass(game.state.o.color)
      .text('o');
  } else {
    console.log('(╯°□°）╯︵ ┻━┻');
  }
}
page.symbolSpan = function (symbol) { // to put in messages
  if (symbol === 'x') {
    return $('<span>')
      .addClass('symtext')
      .addClass(game.state.x.color)
      .addClass('x')
      .html('&times;');
  } else if (symbol === 'o') {
    return $('<span>')
      .addClass('symtext')
      .addClass(game.state.o.color)
      .addClass('o')
      .text('o');
  } else {
    console.log('(゜-゜)');
  }
}

page.setSymbolDisplay = function () {
  if (game.state.colorFlag) {
    $('.red>.symbol').html(page.symbolSpan('x'));
    $('.green>.symbol').html(page.symbolSpan('o'));
  } else {
    $('.red>.symbol').html(page.symbolSpan('o'));
    $('.green>.symbol').html(page.symbolSpan('x'));

  }

}

page.tellTurn = function () { // in 1. after every turn, more or less.
  messagePara = $('<p>')
    .append(page.symbolSpan(game.state.isTurn))
    .append( $('<span>').text("'s turn") );
  $('.message')
    .html('')
    .append(messagePara)
}

page.displayMove = function (inputFlavour, data) { //called by game.takeTurn
  if (inputFlavour === 'spicy') {
    var i = data;
  } else if (inputFlavour === 'vanilla') {
    var i = game.state.vanillaToSpicy[data];
  } else if (inputFlavour === 'xy') {
    var i = game.state.xyToSpicy(data[0], data[1]);
  }
  symbol = game.state.isTurn;
  var cell = page.$cells //lets not overwrite $cells here.
    .filter( function (node) {
      return $(this).data('spicy') === i;
    });
  cell
    .attr('class', 'cell '+symbol+' '+game.state[symbol].color)
    .append(page.symbolPara(symbol));
};

page.endPlayEnableReset = function (messageSpan) { // start of 2.
  page.$cells.removeClass('unoccupied').off();
  $('.message')
    .html('')
    .append(messageSpan)
  $('.next')
    .append('<p>')
    .text(' Reset?')
    .on('click', function() { // end of 2.
      $('.next').off().html('');
      oAgent = game.state.o.agent;
      xAgent = game.state.x.agent;
      page.clearPage();
      game.state.o.agent = xAgent; // swap agents... bad decisions are emphasised by time.
      game.state.x.agent = oAgent;
  });
};

page.clearPage = function () { // begin 3.
  page.$cells
    .off() // god damn all those freaking handlers I've been leaving around...
    //ah the early days of the project, how naive we were.
    .html('')
    .attr('class', 'cell');

  game.state = game.cleanState(!game.state.colorFlag);
  game.state.setColors();
  page.setSymbolDisplay();

  // $('.green .symbol').on('hover', function () { don't do this now.
  //   $(this).css({'color': 'white',
  //     'background-color': 'darkolivegreen'});
  // });
  // $('.red .symbol').on('hover', function () {
  //   $(this).css({'color': 'white',
  //     'background-color': 'red'});
  // })

  $('.message')
    .html('')
    .toggle(500);
  $('.next')
    .html('')
    .append('<p>')
    .text('Start?')
    .on('click', function () {
      $('.player').off();
      $('.next')
        .off()
        .html('');
      game.state.setColors();
      page.resetPlayingArea();
      $('.message')
        .toggle(500);
      game.state.isTurn = 'o';
      game.prepNextMove();
    });
  if (game.state.o.color === 'green') {
    greenPlays = 'o';
    redPlays = 'x';
  } else {
    greenPlays = 'x';
    redPlays = 'o';
  }
  var giveAgentChoice = function(color, colorPlays) {
  $('.playerrow.'+color+' .player').on('click', function () {
      if ($(this).text().trim() === "human") {
        $(this).text('random');
        game.state[colorPlays].agent = agent.random;
      } else if ($(this).text().trim() === "random") {
        $(this).text('perfect');
        game.state[colorPlays].agent = agent.perfect;
      } else {
        $(this).text('human');
        game.state[colorPlays].agent = null;
      }
    });
  };
  giveAgentChoice('green', greenPlays);
  giveAgentChoice('red', redPlays);
}
page.cellMakeMove = function () { // in 1.
    if ($(this).hasClass('x') || $(this).hasClass('o')) {
      alert("you can't play there");
      return;
    }
    i = $(this).data('spicy');
    game.takeTurn('spicy', i);
    return;
}

page.resetPlayingArea = function () { // end of 3, start of 1
  page.$cells
    .addClass('unoccupied')
    .on('click', page.cellMakeMove);
};

$(document).ready( function () {
  page.$cells = $('.cell'); // hold the cells so you can turn them off.
  page.clearPage();
});
