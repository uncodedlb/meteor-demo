Router.configure({
  layoutTemplate: 'layout',
  loadingTemplate: 'loading',
  waitOn: function() {
      return [Meteor.subscribe('players'), Meteor.subscribe('food'), Meteor.subscribe('hallOfFame')];
    }
});

Router.map(function() {

  this.route('splash', {
    path: '/'
  });

  this.route('menu', {
    path: '/sign-up',
    waitOn: function() {
      return [Meteor.subscribe('players')];
    }
  });

  this.route('game', {
    path: '/play'
  });
});
