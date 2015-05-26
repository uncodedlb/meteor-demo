// no disconnects
UserStatus.events.on("connectionLogout", function(fields) {
  Players.update({ userId: fields.userId }, { $set: { dead: true } });
});

// no idlers
UserStatus.events.on("connectionIdle", function(fields) {
  Players.update({ userId: fields.userId }, { $set: { dead: true } });
});

// kill all players on startup, sorry :()
Meteor.startup(function () {
  Players.find({ dead: false }).forEach(function (player) {

    // TODO Add them to hall of fame or check to see if they are still logged in
    // before killing them

    Players.update(player._id, { $set: { dead: true } });
  });
});
