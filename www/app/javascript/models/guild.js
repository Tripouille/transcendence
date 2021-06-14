export const GuildModel = Backbone.Model.extend({
	urlRoot: '/guilds',
	defaults: {
		id: null,
		name: "",
		anagram: "",
		owner_id: "",
		score: 0
	},
	idAttribute: "id",
	initialize: function () {
		console.log('GuildModel has been initialized');
	},
	validate: function (attr) {
		if (attr.name == "" || attr.name.length < 2 || attr.name.length > 30) {
			return "Invalid name length."
		}
		if (attr.anagram == "" || attr.anagram.length > 5) {
			return "Invalid anagram length."
		}
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

});
