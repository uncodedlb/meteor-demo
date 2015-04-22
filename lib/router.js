Router.configure({
  loadingTemplate: 'loading'
});

Router.map(function() {
  this.route('splash', {
    path: '/'
  });

  this.route('menu', {
    path: '/sign-up',
    waitOn: function() {
      return Meteor.subscribe('players');
    }
  });

  this.route('board', {
    path: '/play',
    waitOn: function() {
      return Meteor.subscribe('players');
    }
  });
});