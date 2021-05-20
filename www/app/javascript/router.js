import { HomepageView } from 'views/homepageView';

$(function() {
	const $body = $('body');
	const myRouter = Backbone.Router.extend({
		homepageView: new HomepageView({el: $body}),


		routes: {
			"": "homepage",
			// "homepage": "homepage",
		},

		execute: function(callback, args, name) {
			// $main.empty();
			callback.apply(this, args);
		},

		homepage: function() {
			this.homepageView.render();
		},
	});
	const router = new myRouter();
	Backbone.history.start();
});
