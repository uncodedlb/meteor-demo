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

    Meteor.call('createPlayer', player, function () {
      // TODO set the user session and start playing!
    });

    return false;
  }
});