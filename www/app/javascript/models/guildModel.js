export const GuildModel = Backbone.Model.extend({
	urlRoot: '/guilds',
	defaults: {
		id: null,
		name: "",
		anagram: "",
		owner: "",
		score: 0
	},
	idAttribute: "id",
	initialize: function () {
		console.log('GuildModel has been initialized');
	},
	validate: function (attr) {
		if (attr.name == "name") {
			if (attr.value.length < 5 || attr.name.length > 20) {
				return "Invalid name length."
			}
		}
		if (attr.name == "anagram") {
			if (attr.value.length > 5) {
				return "Invalid anagram length."
			}
		}
		return true;
	},
	// save: function (attributes, options) {
	// 	console.log(attributes);
	// 	var model = this;
	// 	var garbage = ["url", "created_at", "updated_at", "token"];
	// 	_.each(garbage, function (attr) {
	// 		model.unset(attr);
	// 	});
	// 	Backbone.Model.prototype.save.call(this, attributes, options);
	// }
});
