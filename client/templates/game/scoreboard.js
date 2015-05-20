Template.scoreboard.onRendered(function(){
  $("#expand-leaderboard").on("click", function(){
      $(".leaderboard__wrap").toggle(700);
      console.log("Click");
    });
});