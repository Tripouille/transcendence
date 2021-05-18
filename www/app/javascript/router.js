import { HomepageView } from 'views/homepage';
import { UsersView } from 'views/users';

$(function() {
	const $main = $('main');
	const myRouter = Backbone.Router.extend({
		homepageView: new HomepageView({el: $main}),
		usersView: new UsersView(),

		routes: {
			"": "homepage",
			"homepage": "homepage",
			"users": "users"
		},

		execute: function(callback, args, name) {
			$main.empty();
			callback.apply(this, args);
		},

		homepage: function() {this.homepageView.render();},
		users: function() {this.usersView.render($main);}
	});
	const router = new myRouter();
	Backbone.history.start();
});
