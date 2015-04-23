Meteor.methods({
  'createFood': function () {
    Food.insert( {
      x: Math.round(Math.random() * (MAX_WIDTH - CELL_WIDTH) / CELL_WIDTH),
      y: Math.round(Math.random() * (MAX_HEIGHT - CELL_WIDTH) / CELL_WIDTH)
    });
  },
  'resurrectPlayer': function (id) {
    var player = Players.findOne(id);
    var cellRange = _.range(10, MAX_WIDTH / CELL_WIDTH - 10);
    var startX = _.sample(cellRange);
    var startY = _.sample(cellRange);
    var snakeParts = _.range(5).reverse().map(function (i) {
      return {
        x: startX + i,
        y: startY
      };
    });
    Players.update(id, { $set: { dead: false, snakeParts: snakeParts, score: 0 } });
  }
});