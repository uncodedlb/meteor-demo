Meteor.startup(function () {
  if (Food.find().count() < MIN_FOOD) {
    (_.range(MIN_FOOD - Food.find().count())).forEach(function () { Meteor.call('createFood'); });
  }
});

Meteor.publish('hallOfFame', function () {
  return HallOfFame.find({}, { limit: 10 });
});

Meteor.publish('players', function () {
  return Players.find();
});

Meteor.publish('food', function () {
  var foodCursor = Food.find();
  return foodCursor;
});