Meteor.publish('players', function () {
  var playerCursor = Players.find();

  playerCursor.observeChanges({
    changed: function (id, fields) {

      if (!Match.test(fields,  Match.ObjectIncluding({ snakeParts: Array })))
        return;

      var x = fields.snakeParts[0].x;
      var y = fields.snakeParts[0].y;

      // check for any collisions with other players
      var otherPlayers = Players.find({ _id: { $ne: id } }, { fields: { snakeParts: 1 } }).fetch();
      if (_(otherPlayers).any(function (player) { return checkCollision(x, y, player.snakeParts);})) {
        // TODO mark player as dead instead of just removing
        Players.remove(id);
      }

      // check for collision with self
      var restOfBody = fields.snakeParts.splice(1);
      if (checkCollision(x, y, restOfBody)) {
        // TODO mark player as dead instead of just removing
        Players.remove(id);
      }

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

          return true;
        }

        return false;
      });

    },
  });

  return playerCursor;
});

Meteor.publish('food', function () {
  return Food.find();
});