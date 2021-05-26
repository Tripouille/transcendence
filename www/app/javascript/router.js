import { HomepageView } from './views/homepageView';
import { GuildsView } from './views/guildsView';
import { GuildsCollection } from 'collections/guildsCollection'
import { UsersCollection } from 'collections/usersCollection'
import { UserModel } from 'models/userModel'

window.guildsCollection = window.guildsCollection || new GuildsCollection(initGuildsCollection);
window.usersCollection = window.usersCollection || new UsersCollection();
window.currentUser = window.currentUser || new UserModel(initCurrentUser);

$(function() {

	const myRouter = Backbone.Router.extend({

		routes: {
			"": "homepage",
			"homepage": "homepage",
			"guildspage": "guildspage",
		},

		onClick: function(links) {
			_.each(links, function(link){
				$(link).click(function() {
					router.navigate(link, true, true);
				});
			});
		},

		execute: function(callback, args, name) {
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
	});
	const router = new myRouter();
	Backbone.history.start();
});
