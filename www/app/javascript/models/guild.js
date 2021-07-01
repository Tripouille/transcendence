export const Guild = Backbone.Model.extend({
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
		// console.log('Guild has been initialized');
	},
	validate: function (attr) {
		if (attr.name == "" || attr.name.length < 2 || attr.name.length > 20) {
			return "Invalid name length."
		}
		if (attr.anagram == "" || attr.anagram.length > 5) {
			return "Invalid anagram length."
		}
	}
});
