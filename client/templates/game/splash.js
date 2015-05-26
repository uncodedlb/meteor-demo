Template.splash.onRendered(function () {
  var setCLassHeight = function () {
    var windowHeight = $(window).height();

    if (windowHeight >= 800) {
      $("#landing-content").addClass("optional-height");
    } else {
      $("#landing-content").addClass("min-height");
    }
  };

  setCLassHeight();
});

Template.splash.helpers({
  currentHighScore: function () {
    var player = HallOfFame.findOne({}, {
      sort: {
        score: -1
      }
    });
    return player ? player.score : 0;
  },
  totalPlayerCount: function () {
    return Players.find({
      dead: false
    }).count();
  }
});

