Meteor.publish('hallOfFame', function () {
  return HallOfFame.find({}, { limit: 10 });
});

Meteor.publish('players', function () {
  return Players.find();
});

Meteor.publish('food', function () {
  return Food.find();
});