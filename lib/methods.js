Meteor.methods({
  'removePlayer': function (player) {
    Players.remove(player);
  }
});