import { HomepageView } from 'views/homepage';
import { GuildsView } from 'views/guild/guilds';
import { GuildView } from 'views/guild/guild';
import { GuildNewView } from 'views/guild/guildNew';
import UsersView from 'views/users';
import GameView from 'views/game';
import * as GC from 'views/animations/garbage_collector';
import { User } from 'models/user';

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
		usersView: new UsersView({ el: $main }),

		routes: {
			"homepage": "homepage",
			"guilds": "guilds",
			"guild/:id": "displayguild",
			"newguild": "newguild",
			"game": "game",
			"users": "users"
		},

		execute: function (callback, args, name) {
			$main.empty();
			GC.clearTimeoutsIntervals();
			$(document).off("keydown");
			$(document).off("keyup");
			callback.apply(this, args);
		},

		root: function () {
			this.navigate('homepage', { trigger: true });
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

		game: function () {
			this.gameView.render();
		}
	});
	const router = new myRouter();
	Backbone.history.start();
});
