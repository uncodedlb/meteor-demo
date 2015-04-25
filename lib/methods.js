Meteor.methods({
  'createFood': function () {
    Food.insert( {
      x: Math.round(Math.random() * (MAX_WIDTH - CELL_WIDTH) / CELL_WIDTH),
      y: Math.round(Math.random() * (MAX_HEIGHT - CELL_WIDTH) / CELL_WIDTH)
    });
  },
  'resurrectPlayer': function (id) {

    if (Meteor.isClient)
      Session.set('firstStart', false);

    Players.update(id, { $set: playerDefaults() });
  },
  'playerScored': function (playerId, food) {

    var player = Players.findOne({ userId: this.userId });
    var playerAteFoodTest = function (snakePart) {
      return _.isEqual(snakePart, { x:food.x, y: food.y });
    };

    if (!_(player.snakeParts).any(playerAteFoodTest)){
      return false;
    }

    Players.update(player._id, { $inc: { score: 1 } });
    Food.remove(food._id, function() {
      Meteor.call('createFood');
    });
  }
});