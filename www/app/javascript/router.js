import { HomepageView } from './views/homepageView';
import { GuildsView } from './views/guildsView';
import { GuildsCollection } from 'collections/guildsCollection'
import { UsersCollection } from 'collections/usersCollection'
import { UserModel } from 'models/userModel'

import UsersView from 'views/users';
import GameView from 'views/game';
import * as GC from 'views/animations/garbage_collector';

window.intervals = new Array();
window.timeouts = new Array();

window.guildsCollection = window.guildsCollection || new GuildsCollection(initGuildsCollection);
window.usersCollection = window.usersCollection || new UsersCollection();
window.currentUser = window.currentUser || new UserModel(initCurrentUser);

$(function() {

	const myRouter = Backbone.Router.extend({
		usersView: new UsersView(),
		gameView: new GameView({el: $main}),

		routes: {
			"": "homepage",
			"homepage": "homepage",
			"guildspage": "guildspage",
			"game": "game",
			"users": "users"
		},

		onClick: function(links) {
			_.each(links, function(link){
				$(link).click(function() {
					router.navigate(link, true, true);
				});
			});
		},

		execute: function(callback, args, name) {
			$main.empty();
			GC.clearTimeoutsIntervals();
			$(document).off("keydown");
			$(document).off("keyup");

			this.onClick(["#homepage", "#guildspage"]);

			callback.apply(this, args);
		},

		homepage: function() {
			console.log("> homepage");
			var homepageView = new HomepageView(); 
			homepageView.render();
		},

		guildspage: function() {
			console.log("> guilds - page");
			let template = _.template($('#guildStaticContent').html())
			$('#main-bloc').html(template);

			// console.log(window.guildsCollection);
			var guildsView = new GuildsView({ el: $('#guildTableBody') });
			guildsView.render();
		},

		users: function() {
			this.usersView.render($main);
		},

		game: function() {
			this.gameView.render();
		}
	});
	const router = new myRouter();
	Backbone.history.start();
});
