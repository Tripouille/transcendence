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

	validate: function (attr) {
		if (attr.name == "" || attr.name.length < 2 || attr.name.length > 20)
			return "Guild name must be 2 to 20 characters long.";
		if (attr.name.trim() == "" || attr.name != attr.name.trim())
			return "Guild name must not begin or end with spaces";
		if (attr.anagram == "" || attr.anagram.length > 5)
			return "Anagram must be 1 to 5 characters long.";
		if (attr.anagram.trim() == "" || attr.anagram != attr.anagram.trim())
			return "Anagram name must not begin or end with spaces";
	}
});
