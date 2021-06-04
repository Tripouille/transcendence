import UsersView from 'views/users';
import SelectModeView from 'views/selectMode';
import LobbyView from 'views/lobby';
import GameView from 'views/game';
import * as GC from 'views/garbage_collector';

window.intervals = new Array();
window.timeouts = new Array();

$(function() {
	const $main = $('main');
	const myRouter = Backbone.Router.extend({
		usersView: new UsersView(),
		gameView: new GameView({el: $main}),
		lobbyView: new LobbyView({el: $main}),
		selectModeView: new SelectModeView({el: $main}),

		routes: {
			"": "selectMode",
			"game": "selectMode",
			"game/lobby": "lobby",
			"game/:id": "game",
			"users": "users"
		},

		execute: function(callback, args, name) {
			GC.clearTimeoutsIntervals();
			$main.empty();
			$(document).off("keydown");
			$(document).off("keyup");
			callback.apply(this, args);
		},

		users: function() {
			this.usersView.render($main);
		},
		selectMode: function() {
			this.selectModeView.render();
		},
		lobby: function() {
			this.lobbyView.render();
		},
		game: function(id) {
			if (id == null) {
				this.navigate('game/lobby', {trigger: true});
				return ;
			}
			this.gameView.render(id);
		},
	});
	window.router = new myRouter();
	Backbone.history.start();
});
