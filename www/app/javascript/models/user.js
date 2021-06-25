export const User = Backbone.Model.extend({
	urlRoot: '/users',
	defaults: {
		id: null,
		username: "",
		pictures: "",
		email: "",
		login: "",
		avatar: "",
		guild_id: null,
	},

	idAttribute: "id",

	initialize: function() {
		console.log('User has been initialized');
	},

	constructor: function() {
		console.log("Constructor User has been called")
		Backbone.Model.apply(this, arguments);
	},

	validate: function (attr) {
		if (attr.username.length < 2 || attr.username.length > 20) {
			console.log('Invalid name length.');
			return "Invalid name length.";
		}
	}
});
