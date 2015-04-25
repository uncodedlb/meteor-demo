var gameLoop;

Template.game.helpers({
  displayScoreboard: function () {
    var currentPlayer = Players.findOne(Session.get('currentPlayer'));

    if (!currentPlayer) {
      return;
    }

    // display the scoreboard on mobile screens only when the player is dead
    return currentPlayer.dead || (!currentPlayer.dead && !Meteor.Device.isPhone());
  }
});

Template.scoreboard.helpers({
  currentPlayer: function () {
    return Players.findOne(Session.get('currentPlayer'));
  },
  leaders: function () {
    return Players.find({
      dead: false
    }, {
      sort: {
        score: -1
      },
      fields: {
        playerName: 1,
        score: 1
      }
    });
  },
  players: function () {
    return Players.find({
      dead: false
    }, {
      sort: {
        score: -1
      }
    });
  },
  gameMessage: function () {
    return Session.get('gameMessages');
  },
  hallOfFame: function () {
    return HallOfFame.find({}, {
      sort: {
        score: -1
      }
    }).map(function (player, index) {
      player.rank = index + 1;
      return player;
    });
  }
});

Template.game.events({
  'click #play_again': function () {
    var deadPlayer = Players.findOne({
      _id: Session.get('currentPlayer'),
      dead: true
    });
    if (deadPlayer) {
      Meteor.call('resurrectPlayer', deadPlayer._id);
    }
    else {
      Router.go('menu');
    }
  },
  'touchstart #up': function () {
    var currentPlayer = Players.findOne(Session.get('currentPlayer'));
    var d = currentPlayer.direction;

    if (d != "down") {
      Players.update(currentPlayer._id, {
        $set: {
          direction: "up"
        }
      });
    }
  },
  'touchstart #right': function () {
    var currentPlayer = Players.findOne(Session.get('currentPlayer'));
    var d = currentPlayer.direction;

    if (d != "left") {
      Players.update(currentPlayer._id, {
        $set: {
          direction: "right"
        }
      });
    }
  },
  'touchstart #left': function () {
    var currentPlayer = Players.findOne(Session.get('currentPlayer'));
    var d = currentPlayer.direction;

    if (d != "right") {
      Players.update(currentPlayer._id, {
        $set: {
          direction: "left"
        }
      });
    }
  },
  'touchstart #down': function () {
    var currentPlayer = Players.findOne(Session.get('currentPlayer'));
    var d = currentPlayer.direction;

    if (d != "up") {
      Players.update(currentPlayer._id, {
        $set: {
          direction: "down"
        }
      });
    }
  }
});

Template.game.onCreated(function () {

  // make sure we always have a player to start with
  if (!Players.findOne(Session.get('currentPlayer'))) {
    Router.go('menu');
    return;
  }

  // reset the game messages
  Session.set('gameMessages', '');

  // add the keyboard controls
  $(document).on('keydown.game', function (e) {

    var key = e.which;
    var currentPlayer = Players.findOne(Session.get('currentPlayer'));

    // allow scrolling when player is dead
    if (currentPlayer && currentPlayer.dead) {
      // allow space to resurrect player
      if (key == "32") {
        Meteor.call('resurrectPlayer', Session.get('currentPlayer'));
        return false;
      }

      return true;
    }

    var d = currentPlayer.direction;

    // add clause to prevent reverse gear
    if (key == "37" && d != "right") {
      Players.update(currentPlayer._id, {
        $set: {
          direction: "left"
        }
      }); // left arrow
      return false;
    }
    else if (key == "65" && d != "right") {
      Players.update(currentPlayer._id, {
        $set: {
          direction: "left"
        }
      }); // a
      return false;
    }
    else if (key == "38" && d != "down") {
      Players.update(currentPlayer._id, {
        $set: {
          direction: "up"
        }
      }); // up arrow
      return false;
    }
    else if (key == "87" && d != "down") {
      Players.update(currentPlayer._id, {
        $set: {
          direction: "up"
        }
      }); // w
      return false;
    }
    else if (key == "39" && d != "left") {
      Players.update(currentPlayer._id, {
        $set: {
          direction: "right"
        }
      }); // right arrow
      return false;
    }
    else if (key == "68" && d != "left") {
      Players.update(currentPlayer._id, {
        $set: {
          direction: "right"
        }
      }); // d
      return false;
    }
    else if (key == "40" && d != "up") {
      Players.update(currentPlayer._id, {
        $set: {
          direction: "down"
        }
      }); // down arrow
      return false;
    }
    else if (key == "83" && d != "up") {
      Players.update(currentPlayer._id, {
        $set: {
          direction: "down"
        }
      }); // s
      return false;
    }

    // if player is not dead, just return false on any keys not caught
    if (!currentPlayer.dead) {
      return false;
    }
  });
});

Template.game.onDestroyed(function () {
  $(document).off('.game');
  clearInterval(gameLoop);
});

Template.game.onRendered(function () {

  var self = this;
  var board;

  init();

  function init() {

    board = self.find('canvas').getContext('2d');
    if (!_.isUndefined(gameLoop)) clearInterval(gameLoop);
    gameLoop = setInterval(paint, 60);

  }

  function paint() {

    // look up our current player
    var currentPlayer = Players.findOne(Session.get('currentPlayer'));

    // avoid the snake trail we need to paint the BG on every frame
    // lets paint the canvas now
    board.fillStyle = "white";
    board.fillRect(0, 0, MAX_WIDTH, MAX_HEIGHT);
    board.strokeStyle = "black";
    board.strokeRect(0, 0, MAX_WIDTH, MAX_HEIGHT);

    // render the players
    _.each(Players.find({
      dead: false
    }).fetch(), function (player) {

      _.each(player.snakeParts, function (snakePart) {

        if (player._id === Session.get('currentPlayer'))
          // paint current players snake blue
          paintCell(snakePart.x, snakePart.y);
        else
          // paint other players red
          paintOtherPlayerCell(snakePart.x, snakePart.y);

      });
    });

    // paint the food
    _.each(Food.find().fetch(), function (food) {
      paintFoodCell(food.x, food.y);
    });

    // no current player, just return
    if (!currentPlayer) {
      return;
    }

    if (currentPlayer.dead && !Session.get('firstStart')) {
      Session.set('gameMessages', "You died :(");
      return;
    }

    // movement code for the snake to come here
    // logic is simple
    // pop out the tail cell and place it in front of the head cell
    var snakeParts = currentPlayer.snakeParts;
    var d = currentPlayer.direction;
    var nx = snakeParts[0].x;
    var ny = snakeParts[0].y;

    // these were the position of the head cell
    // increment it to get the new head position
    // add proper direction based movement now
    if (d == "right") nx++;
    else if (d == "left") nx--;
    else if (d == "up") ny--;
    else if (d == "down") ny++;

    // loop around if we hit a wall
    if (nx >= MAX_WIDTH / CELL_WIDTH)
      nx = 0;
    else if (nx < -1)
      nx = (MAX_WIDTH / CELL_WIDTH) - 1;

    if (ny >= MAX_HEIGHT / CELL_WIDTH)
      ny = 0;
    else if (ny < -1)
      ny = (MAX_HEIGHT / CELL_WIDTH) - 1;

    // find all the other alive players
    var otherPlayers = Players.find({
      _id: {
        $ne: currentPlayer._id
      },
      dead: false
    }, {
      fields: {
        snakeParts: 1,
        _id: 1
      }
    }).fetch();

    // check for any collisions with the other players
    var executioner = _(otherPlayers).find(function (player) {
      return checkCollision(nx, ny, player.snakeParts);
    });

    if (executioner) {
      // mark player as dead
      Players.update(currentPlayer._id, {
        $set: {
          dead: true
        }
      });

      Meteor.call('giveKillCredit', executioner._id);

      return;
    }

    // check whether the current player collided with it's own snake
    if (checkCollision(nx, ny, snakeParts)) {
      Players.update(currentPlayer._id, {
        $set: {
          dead: true
        }
      });
      return;
    }

    // add the eat the food logic now
    // check if new head position matches with that of the food
    // create a new head instead of moving the tail
    var tail;

    // Check if this player found food
    var food = _(Food.find().fetch()).find(function (food) {
      // only have to check the head of the snake
      return (nx == food.x && ny == food.y);
    });

    if (food) {
      tail = {
        x: nx,
        y: ny
      };
    }
    else {
      tail = snakeParts.pop(); // pops out the last cell
      tail.x = nx;
      tail.y = ny;
    }

    // snake can eat the food
    snakeParts.unshift(tail); // puts the tail as the first cell

    // update this player's current position on the server
    Players.update(currentPlayer._id, {
      $set: {
        snakeParts: snakeParts
      }
    }, function () {
      // update this players score
      if (food)
        Meteor.call('playerScored', currentPlayer._id, food);
    });
  }

  function paintFoodCell(x, y) {
    board.fillStyle = "green";
    board.fillRect(x * CELL_WIDTH, y * CELL_WIDTH, CELL_WIDTH, CELL_WIDTH);
    board.strokeText = "white";
    board.strokeRect(x * CELL_WIDTH, y * CELL_WIDTH, CELL_WIDTH,
      CELL_WIDTH);
  }

  function paintOtherPlayerCell(x, y) {
    board.fillStyle = "red";
    board.fillRect(x * CELL_WIDTH, y * CELL_WIDTH, CELL_WIDTH, CELL_WIDTH);
    board.strokeText = "white";
    board.strokeRect(x * CELL_WIDTH, y * CELL_WIDTH, CELL_WIDTH,
      CELL_WIDTH);
  }

  function paintCell(x, y) {
    board.fillStyle = "blue";
    board.fillRect(x * CELL_WIDTH, y * CELL_WIDTH, CELL_WIDTH, CELL_WIDTH);
    board.strokeText = "white";
    board.strokeRect(x * CELL_WIDTH, y * CELL_WIDTH, CELL_WIDTH,
      CELL_WIDTH);
  }
});
