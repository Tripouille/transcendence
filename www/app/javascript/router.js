import { HomepageView } from 'views/homepage';
import { GuildsView } from 'views/guilds';
import { GuildNewView } from 'views/guildNew';
import UsersView from 'views/users';
import GameView from 'views/game';
import * as GC from 'views/animations/garbage_collector';

window.intervals = new Array();
window.timeouts = new Array();

/* a voir pour supprimer plus tard */
window.currentUser = new Backbone.Model(initCurrentUser);

$(function () {

	const $main = $('main');
	const myRouter = Backbone.Router.extend({
		homepageView: new HomepageView({ el: $main }),
		guildsView: new GuildsView({ el: $main }),
		gameView: new GameView({ el: $main }),
		usersView: new UsersView({ el: $main }),
		guildNewView: new GuildNewView({ el: $main }),

		routes: {
			"": "root",
			"homepage": "homepage",
			"guilds": "guilds",
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
	$(document).on('turbolinks:click', function (event) {
		const link = event.target.getAttribute('href');
		if (link.charAt(0) === '#') {
			event.preventDefault();
			router.navigate(link.substring(1), { trigger: true });
		}
	});
});
