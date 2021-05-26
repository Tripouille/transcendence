
//import { HomepageView } from 'views/homepageView';
import { LoginView } from 'views/login';
//import { GuildsCollection } from "collections/guildsCollection"

$(function() {
	const myRouter = Backbone.Router.extend({

		routes: {
			"": "homepage",
			"homepage": "homepage",
			"user": "user",
			"login": "login",
		},

		login: function() {
			console.log("> Login - Page");
			let login = new LoginView();
			login.render();
		}

		// onClick: function(links) {
		// 	_.each(links, function(link){
		// 		$(link).on("click", function() {
		// 			router.navigate(link, true, true);
		// 		});
		// 	});
		// },

		// execute: function(callback, args, name) {
		// 	this.onClick(["#homepage", "#user", "#login"]);
		// 	callback.apply(this, args);
		// },

		// homepage: function() {
		// 	console.log("> homepage");
		// 	var homepageView = new HomepageView();
		// 	homepageView.render();
		// },

		// guildspage: function() {
		// 	console.log("> guilds - page");

		// 	let template = _.template($('#newGuildButton').html())
		// 	$('#main-bloc').html(template);

		// 	var guildsView = new GuildsView({ collection: this.guildsCollection});
		// 	$('#main-bloc').append(guildsView.render().el);
		// },
	});
	const router = new myRouter();
	Backbone.history.start();
});
