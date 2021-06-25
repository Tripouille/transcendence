export const Invite = Backbone.Model.extend({
	urlRoot: '/invites',
	defaults: {
		// id: null,
		// user_id: null,
		// guild_id: null
	},
	idAttribute: "id",
	initialize: function () {
		self = this;
		console.log('Invite has been initialized');
	},
	validate: function (attr) {
		// if (attr.name == "" || attr.name.length < 5 || attr.name.length > 30) {
		// 	return "Invalid name length."
		// }
		// if (attr.anagram == "" || attr.anagram.length > 5) {
		// 	return "Invalid anagram length."
		// }
		// if (attr.owner_id == "") {
		// 	return "Guild has no owner."
		// }
	},
	// save: function (attributes, options) {
	// 	console.log(attributes);
	// 	var model = this;
	// 	var garbage = ["created_at", "updated_at"];
	// 	_.each(garbage, function (attr) {
	// 		model.unset(attr);
	// 	});
	// 	Backbone.Model.prototype.save.call(this, attributes, options);
	// }

	accept: function (evt) {
		Backbone.sync("delete", evt.data.model, { url: 'invites/' + evt.data.model.id + '/accept' }).done(function () {
			evt.data.guildView.render(evt.data.guildView.guild.id);
		});
	},

	refuse: function (evt) {
		Backbone.sync("delete", evt.data.model, { url: 'invites/' + evt.data.model.id + '/refuse' }).done(function () {
			evt.data.guildView.render(evt.data.guildView.guild.id);
		});
	}
});
