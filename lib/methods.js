Meteor.methods({
  'createPlayer': function (player) {
    Players.insert(player);
  }
});