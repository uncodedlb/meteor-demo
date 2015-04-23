Meteor.startup(function () {
  var food = Food.find().fetch();

  if (! food.length) {
    Meteor.call('createFood');
  }
});