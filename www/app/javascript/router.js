
//import { HomepageView } from 'views/homepageView';
import { LoginView } from 'views/login';
import { UserView } from './views/user/user';
import { UserUpdateView } from './views/user/userUpdate';
//import { GuildsCollection } from "collections/guildsCollection"

console.log(initCurrentUserId);

$(function() {
	const $main = $('main');
	const myRouter = Backbone.Router.extend({

		loginView:	new LoginView({ el: $main }),
		userView: new UserView({ el: $main }),
		userUpdateView: new UserUpdateView({ el: $main }),

		routes: {
			"": "homepage",
			"homepage": "homepage",
			"user": "user",
			"user/:id/edit": "updateUser",
			"login": "login",
		},

		login: function() {
			console.log("> Login - Page");
			this.loginView.render();
		},

		user: function() {
			console.log("> User - Page")
			this.userView.render();
		},

		updateUser: function(id) {
			console.log("> Update User - Page - " + id)
			this.userUpdateView.render(id);
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
