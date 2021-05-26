import { HomepageView } from 'views/homepageView';
import { GuildsView } from 'views/guildsView';
import { UsersView } from 'views/usersView';
import { GameView } from 'views/game';
import * as GC from 'views/animations/garbage_collector';

import { UserModel } from 'models/userModel';

import { GuildsCollection } from 'collections/guildsCollection';
import { UsersCollection } from 'collections/usersCollection';

window.intervals = new Array();
window.timeouts = new Array();

window.guildsCollection = window.guildsCollection || new GuildsCollection(initGuildsCollection);
window.usersCollection = window.usersCollection || new UsersCollection();
window.currentUser = window.currentUser || new UserModel(initCurrentUser);

$(function() {

	const $main = $('#main-bloc');
	const myRouter = Backbone.Router.extend({
		homepageView: new HomepageView({ el: $main }),
		guildsView: new GuildsView({ el: $main }),
		gameView: new GameView({ el: $main }),
		usersView: new UsersView({ el: $main }),

		routes: {
			"": "homepage",
			"homepage": "homepage",
			"guildspage": "guildspage",
			"newguild": "newguild",
			"gamepage": "gamepage",
			"users": "users"
		},

		onClick: function(links) {
			_.each(links, function(link){
				$(link).on("click", function() {
					router.navigate(link, true, true);
				});
			});
		},

		execute: function(callback, args, name) {
			// $main.empty();
			GC.clearTimeoutsIntervals();
			$(document).off("keydown");
			$(document).off("keyup");

			this.onClick(["#homepage", "#guildspage", "#gamepage"]);

			callback.apply(this, args);
		},

		homepage: function() {
			console.log("> homepage");
			this.homepageView.render();
		},

		guildspage: function() {
			console.log("> guilds - page");
			this.guildsView.render();

			$("#newguild").on("click", function() {
				router.navigate("#newguild", true, true);
			});
		},

		newguild: function() {
			console.log("> guilds - page #new");
			this.guildsView.renderForm('#newGuildForm');
		},

		users: function() {
			this.usersView.render();
		},

		gamepage: function() {
			this.gameView.render();
		}
	});
	const router = new myRouter();
	Backbone.history.start();
});
