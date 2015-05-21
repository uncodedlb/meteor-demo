// Check for Session uuid to identify each client

Template.menu.onCreated(function () {
  Session.set('menuSubmitErrors', {});

  var existingPlayer = Players.findOne({ userId: Meteor.userId() });
  if (existingPlayer)
    Session.set('currentPlayer', existingPlayer._id);
});

Template.menu.helpers({
  errorMessage: function (field) {
    return Session.get('menuSubmitErrors')[field];
  },
  errorClass: function (field) {
    return !!Session.get('menuSubmitErrors')[field] ? 'has-error' : '';
  },
  currentPlayer: function () {
    return Players.findOne(Session.get('currentPlayer'));
  }
});

Template.menu.events({
  'submit #signup': function (e) {

    e.preventDefault();

    var player = {
      userId: Meteor.userId(),
      playerName: $(e.target).find('[name=player_name]').val()
    };

    var errors = validatePlayer(player);
    if (_.any(errors))
      return Session.set('menuSubmitErrors', errors);


    if (Session.get('currentPlayer')) {
      Players.update(Session.get('currentPlayer'), { $set: { playerName: player.playerName } }, function (err) {
        if (err){
          console.error(err);
          return;
        }

        Router.go('game');
      });
    } else {
      Players.insert(player, function (err, _id) {
        if (err){
          console.error(err);
          return;
        }

        // a new player was made, set it on the session
        Session.set('currentPlayer', _id);
        Session.set('gameMessages', "Press space bar to play!");

        Router.go('game');
      });
    }

    Session.set('firstStart', true);

    return false;
  }
});
