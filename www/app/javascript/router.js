import { HomepageView } from 'views/homepage';
import { GuildsView } from 'views/guild/guilds';
import { GuildView } from 'views/guild/guild';
import { GuildNewView } from 'views/guild/guildNew';
import UsersView from 'views/users';
import SelectModeView from 'views/selectMode';
import LobbyView from 'views/lobby';
import GameView from 'views/game';
import { User } from 'models/user';
import * as GC from 'views/garbage_collector';

window.intervals = new Array();
window.timeouts = new Array();

/* a voir pour supprimer plus tard */
window.currentUser = new User({ id: initCurrentUser.id });

$(function () {

	const $main = $('main');
	const myRouter = Backbone.Router.extend({
		homepageView: new HomepageView({ el: $main }),
		guildsView: new GuildsView({ el: $main }),
		guildView: new GuildView({ el: $main }),
		guildNewView: new GuildNewView({ el: $main }),
		gameView: new GameView({ el: $main }),
		usersView: new UsersView(),
		gameView: new GameView({el: $main}),
		lobbyView: new LobbyView({el: $main}),
		selectModeView: new SelectModeView({el: $main}),

		routes: {
			"": "selectMode",
			"game": "selectMode",
			"game/lobby": "lobby",
			"game/:id": "game",
			"homepage": "homepage",
			"guilds": "guilds",
			"guild/:id": "displayguild",
			"newguild": "newguild",
			"game": "game",
			"users": "users"
		},

		execute: function (callback, args, name) {
			$main.empty();
		},

		execute: function(callback, args, name) {
			GC.clearTimeoutsIntervals();
			$main.empty();
			$(document).off("keydown");
			$(document).off("keyup");
			callback.apply(this, args);
		},

		homepage: function () {
			console.log("> homepage");
			this.homepageView.render();
		},

		guilds: function () {
			console.log("> guilds - page");
			this.guildsView.render();
		},

		displayguild: function (id) {
			console.log("> guilds - No" + id);
			this.guildView.render(id);
		},

		newguild: function () {
			console.log("> guilds - page #new");
			this.guildNewView.render();
		},

		users: function () {
			this.usersView.render();
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
