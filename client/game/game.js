


var d;
var food;
var score;
var gameLoop;
var snakes;

Template.game.helpers({
  myScore: function () {
    return Players.findOne(Session.get('currentPlayer')).score;
  },
  players: function () {
    return Players.find();
  }
});

Template.game.onCreated(function () {

  // make sure we always have a player
  if (! Session.get('currentPlayer')) {
    Router.go('menu');
    return;
  }

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
    snakeParts = Players.findOne(Session.get('currentPlayer')).snakeParts;
    // createFood();

    Session.set('score', 0);

    if (!_.isUndefined(gameLoop)) clearInterval(gameLoop);
    gameLoop = setInterval(paint, 60);

  }

  function createSnake () {
    var length = 5; // length of snake
    snakeParts = []; // empty array to start with
    for (var i = length - 1; i >= 0; i--) {
      // create a horizontal snake starting from the top left
      snakeParts.push({ x: i, y: 0 });
    }
  }

  // TODO Move this to the server
  function createFood() {
    // creates a cell with x,y between 0-44
    // there are 45(450/10) positions accross the rows and columns
    food = {
      x: Math.round(Math.random() * (MAX_WIDTH - CELL_WIDTH) / CELL_WIDTH),
      y: Math.round(Math.random() * (MAX_HEIGHT - CELL_WIDTH) / CELL_WIDTH)
    };
  }

  function paint() {

    // avoid the snake trail we need to paint the BG on every frame
    // lets paint the cnavs now
    board.fillStyle = "white";
    board.fillRect(0, 0, MAX_WIDTH, MAX_HEIGHT);
    board.strokeStyle = "black";
    board.strokeRect(0, 0, MAX_WIDTH, MAX_HEIGHT);

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

    // add the game over clauses
    // this will restart the game if the snake hits something
    // add the code for body collision
    // if the head of the snake bumps into its body, game restarts
    if (nx == -1 || nx == MAX_WIDTH / CELL_WIDTH || ny == -1 || ny == MAX_HEIGHT / CELL_WIDTH ||
      checkCollision(nx, ny, snakeParts)) {
      // restart game
      init();

      // organize the code a bit now
      return;
    }

    // add the eat the food logic now
    // check if new head position matches with that of the food
    // create a new head instead of moving the tail
    var tail = snakeParts.pop(); // pops out the last cell
      tail.x = nx;
      tail.y = ny;

    // snake can eat the food
    snakeParts.unshift(tail); // puts the tail as the first cell

    // update this player's current position on the server
    Players.update(Session.get('currentPlayer'), { $set: { snakeParts: snakeParts } });

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
  }

  function paintCell(x, y) {
    board.fillStyle = "blue";
    board.fillRect(x * CELL_WIDTH, y * CELL_WIDTH, CELL_WIDTH, CELL_WIDTH);
    board.strokeText = "white";
    board.strokeRect(x * CELL_WIDTH, y * CELL_WIDTH, CELL_WIDTH, CELL_WIDTH);
  }

  function checkCollision(x, y, array) {
    return _.any(array, function (elem) {
      return elem.x == x && elem.y == y;
    });
  }
});
