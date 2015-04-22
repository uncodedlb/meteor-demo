Players = new Mongo.Collection('players');

validatePlayer = function (player) {

  var errors = {};

  if (_.isEmpty(player.playerName))
    errors.playerName = 'Please enter a name';

  if (Players.findOne(player)) {
    errors.playerName = 'Player already exists with that name';
  }

  return errors;
};

// TODO on player creation initialize with basic variables i.e. snakeParts array