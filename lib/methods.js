Meteor.methods({
  'removePlayer': function (player) {
    Players.remove(player);
  },
  'createFood': function () {
    Food.insert( {
      x: Math.round(Math.random() * (MAX_WIDTH - CELL_WIDTH) / CELL_WIDTH),
      y: Math.round(Math.random() * (MAX_HEIGHT - CELL_WIDTH) / CELL_WIDTH)
    });
  }
});