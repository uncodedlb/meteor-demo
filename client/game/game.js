
var cw = 10;
var d;
var food;
var score;
var gameLoop;
var snakes;

Template.game.helpers({
  score: function () {
    return Session.get('score') || 0;
  }
});

Template.game.onCreated(function () {

  // make sure we always have a player
  if (!_.isObject(Session.get('player'))) {
    Router.go('menu');
    return;
  }

  this.subscribe('players');

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
  Meteor.call('removePlayer', Session.get('player'));
});

Template.game.onRendered(function () {

  var self = this;
  var board;
  var ctx;
  var w;
  var h;
  var snakeArray;

  this.autorun(function () {
    if (self.subscriptionsReady()) {
      _.defer(init);
    }
  });

  function init() {

    board = self.find('canvas');
    ctx = board.getContext('2d');
    w = board.width;
    h = board.height;
    d = "right";
    createSnake();
    createFood();

    Session.set('score', 0);

    if (!_.isUndefined(gameLoop)) clearInterval(gameLoop);
    gameLoop = setInterval(paint, 60);

  }

  function createSnake () {
    var length = 5; // length of snake
    snakeArray = []; // empty array to start with
    for (var i = length - 1; i >= 0; i--) {
      // create a horizontal snake starting from the top left
      snakeArray.push({ x: i, y: 0 });
    }
  }

  function createFood() {
    // creates a cell with x,y between 0-44
    // there are 45(450/10) positions accross the rows and columns
    food = {
      x: Math.round(Math.random() * (w - cw) / cw),
      y: Math.round(Math.random() * (h - cw) / cw)
    };
  }

  function paint() {
    // avoid the snake trail we need to paint the BG on every frame
    // lets paint the cnavs now
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "black";
    ctx.strokeRect(0, 0, w, h);

    // movement code for the snake to come here
    // logic is simple
    // pop out the tail cell and place it in front of the head cell
    var nx = snakeArray[0].x;
    var ny = snakeArray[0].y;

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
    if (nx == -1 || nx == w / cw || ny == -1 || ny == h / cw ||
      checkCollision(nx, ny, snakeArray)) {
      // restart game
      init();

      // organize the code a bit now
      return;
    }

    // add the eat the food logic now
    // check if new head position matches with that of the food
    // create a new head instead of moving the tail
    var tail;
    if (nx == food.x && ny == food.y) {
      tail = {
        x: nx,
        y: ny
      };
      Session.set('score', Session.get('score') + 1);

      // create more food!
      createFood();
    }
    else {
      tail = snakeArray.pop(); // pops out the last cell
      tail.x = nx;
      tail.y = ny;
    }

    // snake can eat the food
    snakeArray.unshift(tail); // puts the tail as the first cell

    _.each(snakeArray, function (snakePart) {
      // paint 10px wide cells
      paintCell(snakePart.x, snakePart.y);
    });

    // render the other players
    _.each(Players.find({ _id: { $not: { _id: Session.get('player')._id } } }).fetch(), function (player) {
      // the score represents how long of a snake a user can have
      _.each(player.snakeParts, function (snakePart) {
        paintCell(snakePart.x, snakePart.y);
      });
    });

    // paint the food
    paintCell(food.x, food.y);
  }

  function paintCell(x, y) {
    ctx.fillStyle = "blue";
    ctx.fillRect(x * cw, y * cw, cw, cw);
    ctx.strokeText = "white";
    ctx.strokeRect(x * cw, y * cw, cw, cw);
  }

  function checkCollision(x, y, array) {
    return _.any(array, function (elem) {
      return elem.x == x && elem.y == y;
    });
  }
});
