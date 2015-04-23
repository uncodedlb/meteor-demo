
var d;
var gameLoop;

Template.game.helpers({
  myScore: function () {
    if (Players.findOne(Session.get('currentPlayer')))
      return Players.findOne(Session.get('currentPlayer')).score;
    else
      return 0;
  },
  players: function () {
    return Players.find();
  },
  gameMessage: function () {
    return Session.get('gameMessages');
  }
});

Template.game.onCreated(function () {

  // make sure we always have a player to start with
  if (! Session.get('currentPlayer')) {
    Router.go('menu');
    return;
  }

  // reset the game messages
  Session.set('gameMessages', '');

  // add the keyboard controls
  $(document).on('keydown.game', function (e) {
    var key = e.which;

    // add clause to prevent reverse gear
    if (key == "37" && d != "right") d = "left";
    else if (key == "38" && d != "down") d = "up";
    else if (key == "39" && d != "left") d = "right";
    else if (key == "40" && d != "up") d = "down";

  });
});

Template.game.onDestroyed(function () {
  $(document).off('.game');
  Meteor.call('removePlayer', Session.get('currentPlayer'));
  clearInterval(gameLoop);
});

Template.game.onRendered(function () {

  var self = this;
  var board;

  init();

  function init() {

    board = self.find('canvas').getContext('2d');
    d = "right";

    if (!_.isUndefined(gameLoop)) clearInterval(gameLoop);
    gameLoop = setInterval(paint, 60);

  }

  function paint() {

    // avoid the snake trail we need to paint the BG on every frame
    // lets paint the cnavs now
    board.fillStyle = "white";
    board.fillRect(0, 0, MAX_WIDTH, MAX_HEIGHT);
    board.strokeStyle = "black";
    board.strokeRect(0, 0, MAX_WIDTH, MAX_HEIGHT);

        // render the players
    _.each(Players.find().fetch(), function (player) {
      // the score represents how long of a snake a user can have
      _.each(player.snakeParts, function (snakePart) {
        paintCell(snakePart.x, snakePart.y);
      });
    });

    // paint the food
    _.each(Food.find().fetch(), function (food) {
      paintCell(food.x, food.y);
    });

    if (_.isUndefined(Players.findOne(Session.get('currentPlayer')))) {
      Session.set('gameMessages', "You died :(");
      return;
    }

    // movement code for the snake to come here
    // logic is simple
    // pop out the tail cell and place it in front of the head cell
    var snakeParts = Players.findOne(Session.get('currentPlayer')).snakeParts;
    var nx = snakeParts[0].x;
    var ny = snakeParts[0].y;

    // these were the position of the head cell
    // increment it to get the new head position
    // add proper direction based movement now
    if (d == "right") nx++;
    else if (d == "left") nx--;
    else if (d == "up") ny--;
    else if (d == "down") ny++;

    // add the eat the food logic now
    // check if new head position matches with that of the food
    // create a new head instead of moving the tail
    var tail;

    // Check if this player found food
    var food = _.find(Food.find().fetch(), function (food) {
      // only have to check the head of the snake
      return (nx == food.x && ny == food.y);
    });

    if (food) {
      tail = {
        x: nx,
        y: ny
      };
    } else {
      tail = snakeParts.pop(); // pops out the last cell
      tail.x = nx;
      tail.y = ny;
    }

    // snake can eat the food
    snakeParts.unshift(tail); // puts the tail as the first cell

    // update this player's current position on the server
    Players.update(Session.get('currentPlayer'), { $set: { snakeParts: snakeParts } });
  }

  function paintCell(x, y) {
    board.fillStyle = "blue";
    board.fillRect(x * CELL_WIDTH, y * CELL_WIDTH, CELL_WIDTH, CELL_WIDTH);
    board.strokeText = "white";
    board.strokeRect(x * CELL_WIDTH, y * CELL_WIDTH, CELL_WIDTH, CELL_WIDTH);
  }
});
