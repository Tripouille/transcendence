export const GuildModel = Backbone.Model.extend({
	urlRoot: '/guilds',
	defaults: {
		id: null,
		name: "",
		anagram: "",
		score: 0
	},
	idAttribute: "id",
	initialize: function() {
		console.log('Guild has been initialized');
	},
	validate: function (attr) {
		if (attr.name.length < 5 || attr.name.length > 20) {
			return "Invalid name length."
		}
		if (attr.anagram.length < 5 || attr.anagram.length > 20) {
			return "Invalid anagram length."
		}
	},
	save: function(attributes, options) {
		var model = this;
		var garbage = ["url", "created_at", "updated_at", "token"];
		_.each(garbage, function(attr) { 
		  model.unset(attr);
		});
		Backbone.Model.prototype.save.call(this, attributes, options);
	}
});