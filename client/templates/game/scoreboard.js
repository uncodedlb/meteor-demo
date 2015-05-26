Template.scoreboard.events({
  "click #expand-leaderboard": function () {
    $(".leaderboard__wrap").toggle(700);
    Session.set('isLeaderboardOpen', !Session.get('isLeaderboardOpen'));
  }
});

Template.scoreboard.helpers({
  currentPlayer: function () {
    return Players.findOne(Session.get('currentPlayer'));
  },
  leaders: function () {
    return Players.find({
      dead: false
    }, {
      sort: {
        score: -1
      },
      fields: {
        playerName: 1,
        kills: 1,
        score: 1
      }
    });
  },
  players: function () {
    return Players.find({
      dead: false
    }, {
      sort: {
        score: -1
      }
    });
  },
  gameMessage: function () {
    return Session.get('gameMessages');
  },
  hallOfFame: function () {
    return HallOfFame.find({}, {
      sort: {
        score: -1
      }
    }).map(function (player, index) {
      player.rank = index + 1;
      return player;
    });
  },
  isLeaderboardOpen: function () {
    return Session.get('isLeaderboardOpen');
  }
});
