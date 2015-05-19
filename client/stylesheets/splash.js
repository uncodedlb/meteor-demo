Template.splash.onRendered( function(){
  var setCLassHeight = function (){
    var windowHeight = $(window).height();

    if( windowHeight >= 800){
      $("#landing-content").removeClass("min-height");
      $("#landing-content").addClass("optional-height");
    }
    console.log(windowHeight);
  };

  // $(window).on("resize", function() {
    setCLassHeight();
  // });

});