Players = new Mongo.Collection('players');
Food = new Mongo.Collection('food');
HallOfFame = new Mongo.Collection('halloffame');

// board is 500px wide
// board is 50 x 50 cells
MAX_WIDTH = 500;
MAX_HEIGHT = 500;
CELL_WIDTH = 10; // each cell is 10px wide

validatePlayer = function (player) {

  var errors = {};

  if (_.isEmpty(player.playerName))
    errors.playerName = 'Please enter a name';

  if (Players.findOne(player)) {
    errors.playerName = 'Player already exists with that name';
  }

  return errors;
};

//on player creation initialize with basic variables i.e. snakeParts array, score
Players.allow({
  insert: function(userId, doc) {

    // creates a cell with x,y between 10-39
    // always place player somewhere in the middle of the game
    var cellRange = _.range(10, MAX_WIDTH / CELL_WIDTH - 10);
    var startX = _.sample(cellRange);
    var startY = _.sample(cellRange);

    doc.dead = false;
    doc.snakeParts = _.range(5).reverse().map(function (i) {
      return {
        x: startX + i,
        y: startY
      };
    });

    doc.score = 0;

    return true;
  },
  update: function(userId, doc, fields, modifier) {

    if (_(fields).contains('dead') && modifier.$set.dead) {
      var hallOfFame = HallOfFame.findOne({ deadPlayerId: doc._id });

      // return if hall of fame score is higher than dead player score
      if (hallOfFame && hallOfFame.score > doc.score) {
        return true;
      }

      hallOfFame = {
        deadPlayerId: doc._id,
        playerName: doc.playerName,
        score: doc.score,
        createdAt: new Date()
      };
      HallOfFame.upsert({ deadPlayerId: doc._id }, hallOfFame);
    }

    return true;
  },
  remove: function(userId, doc) {
    return true;
  }
});