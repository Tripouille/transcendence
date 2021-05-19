import { HomepageView } from 'views/homepage';
import { UsersView } from 'views/users';

$(function() {
	const $main = $('main');
	const myRouter = Backbone.Router.extend({
		homepageView: new HomepageView({el: $main}),
		usersView: new UsersView(),
		// guildsView: new GuildsView(),

		routes: {
			"": "homepage",
			"homepage": "homepage",
			"users": "users",
			// "guilds": "guilds"
		},

		execute: function(callback, args, name) {
			$main.empty();
			callback.apply(this, args);
		},

		homepage: function() {this.homepageView.render();},
		users: function() {this.usersView.render($main);},
		// guilds: function() {this.guildsView.render($main);}
	});
	const router = new myRouter();
	Backbone.history.start();
});
