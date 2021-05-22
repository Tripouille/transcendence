import UsersView from 'views/users';
import GameView from 'views/game';
import LobbyView from 'views/lobby';
import * as GC from 'views/animations/garbage_collector';

window.intervals = new Array();
window.timeouts = new Array();

$(function() {
	const $main = $('main');
	const myRouter = Backbone.Router.extend({
		usersView: new UsersView(),
		gameView: new GameView({el: $main}),
		lobbyView: new LobbyView({el: $main}),

		routes: {
			"": "game",
			"game": "game",
			"lobby": "lobby",
			"users": "users"
		},

		execute: function(callback, args, name) {
			$main.empty();
			GC.clearTimeoutsIntervals();
			$(document).off("keydown");
			$(document).off("keyup");
			callback.apply(this, args);
		},

		users: function() {
			this.usersView.render($main);
		},
		game: function() {
			this.gameView.render();
		},
		lobby: function() {
			this.lobbyView.render();
		}
	});
	const router = new myRouter();
	Backbone.history.start();
});
