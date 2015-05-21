Router.configure({
  layoutTemplate: 'layout',
  loadingTemplate: 'loading',
  waitOn: function() {
      return [Meteor.subscribe('players'), Meteor.subscribe('food'), Meteor.subscribe('hallOfFame')];
    }
});

var GAME_VIEWPORT_SETTINGS = "width=610, initial-scale=1, maximum-scale=1, user-scalable=no";
var DEFAULT_VIEWPORT_SETTINGS = "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no";

Router.map(function() {

  this.route('splash', {
    path: '/',
    onBeforeAction: function () {
      $('[name="viewport"]').attr('content', DEFAULT_VIEWPORT_SETTINGS);
      this.next();
    }
  });

  this.route('menu', {
    path: '/sign-up',
    waitOn: function() {
      return [Meteor.subscribe('players')];
    },
    onBeforeAction: function () {
      $('[name="viewport"]').attr('content', DEFAULT_VIEWPORT_SETTINGS);
      this.next();
    }
  });

  this.route('game', {
    path: '/play',
    onBeforeAction: function () {
      $('[name="viewport"]').attr('content', GAME_VIEWPORT_SETTINGS);
      this.next();
    }
  });
});
