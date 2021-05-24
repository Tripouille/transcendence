import { HomepageView } from 'views/homepageView';
import { GuildsView } from 'views/guildsView';
import { GuildsCollection } from "collections/guildsCollection"

$(function() {
	const myRouter = Backbone.Router.extend({
		guildsCollection: new GuildsCollection(initGuildCollection.models),

		routes: {
			"": "homepage",
			"homepage": "homepage",
			"guildspage": "guildspage",
			// "newguild": "newguild",
		},

		onClick: function(links) {
			_.each(links, function(link){
				$(link).on("click", function() {
					router.navigate(link, true, true);
				});
			});
		},

		execute: function(callback, args, name) {
			this.onClick(["#homepage", "#guildspage", "#newguild"]);
			callback.apply(this, args);
		},

		homepage: function() {
			console.log("> homepage");
			var homepageView = new HomepageView(); 
			homepageView.render();
		},

		guildspage: function() {
			console.log("> guilds - page");

			let template = _.template($('#newGuildButton').html())
			$('#main-bloc').html(template);

			var guildsView = new GuildsView({ collection: this.guildsCollection});
			$('#main-bloc').append(guildsView.render().el);
		},

		// newguild: function() {
		// 	console.log("> guilds - new");

		// 	let template = _.template($('#newGuildButton').html())
		// 	$('#main-bloc').html(template);

		// 	var guildsView = new GuildsView({ collection: this.guildsCollection});
		// 	$('#main-bloc').append(guildsView.render().el);
		// },
	});
	const router = new myRouter();
	Backbone.history.start();
});
