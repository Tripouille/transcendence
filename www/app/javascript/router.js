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
			"": "root",
			"game": "selectMode",
			"game/lobby": "lobby",
			"game/:id": "game",
			"users": "users"
		},

		execute: function(callback, args, name) {
			$main.empty();
			GC.clearTimeoutsIntervals();
			$(document).off("keydown");
			$(document).off("keyup");
			callback.apply(this, args);
		},

		root: function() {
			this.navigate('game', {trigger: true});
		},
		users: function() {
			this.usersView.render($main);
		},
		selectMode: function() {
			console.log("dans le select mode");
			new SelectModeView({el: $('main')}).render();
			console.log($('main'));

			//this.selectModeView.render();
		},
		lobby: function() {
			console.log("dans le lobby");
			this.lobbyView.render(this);
		},
		game: function(id) {
			if (id == null) {
				this.navigate('game/lobby', {trigger: true});
				return ;
			}
			this.gameView.render(id);
		},
	});
	const router = new myRouter();
	Backbone.history.start();

	$(document).on('turbolinks:click', function (event) {
		const link = event.target.getAttribute('href');
		if (link.charAt(0) === '#') {
			event.preventDefault();
			router.navigate(link.substring(1), {trigger: true});
		}
	});

});
