Meteor.publish('players', function () {
  var playerCursor = Players.find();

  playerCursor.observeChanges({
    changed: function (id, fields) {

      if (!Match.test(fields,  Match.ObjectIncluding({ snakeParts: Array })))
        return;

      // Check if this player ate the food
      _.find(Food.find().fetch(), function (food) {

        // only have to check the head of the snake
        if (fields.snakeParts[0].x == food.x && fields.snakeParts[0].y == food.y) {

          // update this players score
          Players.update(id, { $inc: { score: 1} });

          // Remove the this food
          Food.remove(food._id, function (err) {
            if (err)
              console.error(err);

            // replace this food
            Meteor.call('createFood');

          });
        }
      });

    },
  });

  return playerCursor;
});

Meteor.publish('food', function () {
  return Food.find();
});