import UsersView from 'views/users';
import GameView from 'views/game';

$(function() {
	const $main = $('main');
	const myRouter = Backbone.Router.extend({
		usersView: new UsersView(),
		gameView: new GameView({el: $main}),

		routes: {
			"": "game",
			"game": "game",
			"users": "users"
		},

		execute: function(callback, args, name) {
			$main.empty();
			callback.apply(this, args);
		},

		users: function() {
			this.usersView.render($main);
		},
		game: function() {
			this.gameView.render();
		}
		/*handleRouteAll: function(viewid, msg) {
			if (viewid == 1)
				this.handleRoute1();
			else if (viewid == 2)
				this.handleRoute2();
			else if (viewid == 3)
				this.handleRoute3();
		}*/
	});
	const router = new myRouter();
	Backbone.history.start();
});
