// Check for Session uuid to identify each client

Template.menu.onCreated(function () {
  Session.set('menuSubmitErrors', {});
});

Template.menu.helpers({
  errorMessage: function (field) {
    return Session.get('menuSubmitErrors')[field];
  },
  errorClass: function (field) {
    return !!Session.get('menuSubmitErrors')[field] ? 'has-error' : '';
  }
});

Template.menu.events({
  'submit #signup': function (e) {

    e.preventDefault();

    var player = {
      playerName: $(e.target).find('[name=player_name]').val()
    };

    var errors = validatePlayer(player);
    if (_.any(errors))
      return Session.set('menuSubmitErrors', errors);

    // create new player and take them to the game!
    Players.insert(player, function (err, _id) {
      Session.set('currentPlayer', _id);
      Router.go('game');
    });

    return false;
  }
});