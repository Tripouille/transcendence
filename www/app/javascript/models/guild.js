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
		console.log('Guild has been initialized');
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
	// getFigures: function () {
	// 	let self = this;
	// 	Backbone.sync("get", self, { url: 'guildsfigures/' + this.id, 
	// 		success: function (model, response) {
	// 			console.log("request GET Came back");
	// 			console.log(self);
	// 			console.log(this);
	// 			console.log(response);
	// 			console.log(model);
	// 		},
	// 		error: function (model, response) {

	// 		}
	// 	});
	// }
});
