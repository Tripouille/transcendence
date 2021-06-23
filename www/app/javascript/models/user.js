export const User = Backbone.Model.extend({
	urlRoot: '/users',
	defaults: {
		id: null,
		username: "",
		pictures: "",
		email: "",
		login: "",
		provider: "",
		uid: "",
		guild_id: null,
	},
	idAttribute: "id",
	initialize: function () {
		console.log('User has been initialized');
	},
	validate: function (attr) {
		/* verifier si le user a deja une guilde dans le guild_id */
		/* autre verifications de format */
		if (attr.username.length < 2 || attr.username.length > 20) {
			console.log("problem name lenght")
			return "Invalid name length."
		}
	},
	// save: function(attributes, options) {
	// 	var model = this;
	// 	var garbage = ["url", "created_at", "updated_at", "token"];
	// 	_.each(garbage, function(attr) {
	// 	  model.unset(attr);
	// 	});
	// 	Backbone.Model.prototype.save.call(this, attributes, options);
	// }

	/* A function to call to kick members from their guild: modification of their own guild_id value */
	kick: function (evt) {
		Backbone.sync("patch", evt.data.model, { url: 'users/' + evt.data.model.id + '/kick' }).done(function () {
			evt.data.guildView.render(evt.data.guildView.guildId);
		});
	},
});
