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
		users: function() {this.usersView.render($main);},
		/*handleRouteAll: function(viewid, msg) {
			if (viewid == 1)
				this.handleRoute1();
			else if (viewid == 2)
				this.handleRoute2();
			else if (viewid == 3)
				this.handleRoute3();
		}*/
	});
	const router = new myRouter();
	Backbone.history.start();
});
