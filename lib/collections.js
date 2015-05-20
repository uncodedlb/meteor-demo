Players = new Mongo.Collection('players');
Food = new Mongo.Collection('food');
HallOfFame = new Mongo.Collection('halloffame');

// board is 500px wide
// board is 50 x 50 cells
MAX_WIDTH = 500;
MAX_HEIGHT = 500;
CELL_WIDTH = 10; // each cell is 10px wide
MIN_FOOD = 25;

validatePlayer = function (player) {

  var errors = {};
  var existingPlayer = Players.findOne({ playerName: player.playerName });

  if (_.isEmpty(player.playerName))
    errors.playerName = 'Please enter a name';

  // only let users that own the player choose this one
  if (existingPlayer && existingPlayer.userId !== player.userId) {
    errors.playerName = 'Player already exists with that name';
  }

  return errors;
};

playerDefaults = function (firstStart) {
  var player = {};
  // creates a cell with x,y between 10-19
  // always place player somewhere in the middle of the game
  var cellRange = _.range(10, (MAX_WIDTH / 2) / CELL_WIDTH - 10);
  var startX = _.sample(cellRange);
  var startY = _.sample(cellRange);

  player.direction = "right";
  player.dead = firstStart || false;
  player.snakeParts = _.range(5).reverse().map(function (i) {
    return {
      x: startX + i,
      y: startY
    };
  });

  player.kills = 0;
  player.score = 0;

  return player;
};

//on player creation initialize with basic variables i.e. snakeParts array, score
Players.allow({
  insert: function(userId, doc) {

    doc = _.defaults(doc, playerDefaults(true));
    doc.userId = userId;
    return _.isEmpty(validatePlayer(doc));
  },
  update: function(userId, doc, fields, modifier) {

    if (_(fields).contains('score')) {
      return false;
    }

    if (_(fields).contains('dead') && modifier.$set.dead) {
      var hallOfFame = HallOfFame.findOne({ deadPlayerId: doc._id });

      // return if hall of fame score is higher than dead player score
      if (hallOfFame && hallOfFame.score > doc.score) {
        return userId === doc.userId;
      }

      hallOfFame = {
        deadPlayerId: doc._id,
        playerName: doc.playerName,
        score: doc.score,
        kills: doc.kills,
        createdAt: new Date()
      };
      HallOfFame.upsert({ deadPlayerId: doc._id }, hallOfFame);
    }

    return userId === doc.userId;
  },
  remove: function(userId, doc) {
    return userId === doc.userId;
  }
});

Meteor.users.allow({
  insert: function (userId, doc) {
    return userId == doc.userId;
  },
  update: function (userId, doc, fields, modifier) {
    return userId === doc.userId;
  },
  remove: function (userId, doc) {
    return userId == doc.userId;
  }
});