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
		guildNewView: new GuildNewView({ el: $main }),
		gameView: new GameView({ el: $main }),
		usersView: new UsersView({ el: $main }),

		routes: {
			"": "homepage",
			"homepage": "homepage",
			"guilds": "guilds",
			"newguild": "newguild",
			"game": "game",
			"users": "users"
		},

		initialize: function () {
			/* function to link the clickable items to backbone routes */
			_.each(["#homepage", "#guilds"], function (link) {
				$(link).on("click", function () {
					router.navigate(link, true, true);
				});
			});
		},

		execute: function (callback, args, name) {
			$main.empty();
			GC.clearTimeoutsIntervals();
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

			$("#newguild").on("click", function () {
				router.navigate("#newguild", true, true);
			});
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
