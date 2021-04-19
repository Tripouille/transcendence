export const User = Backbone.Model.extend({
	urlRoot: '/users',
	defaults: {
		id: null,
		name: ""
	},
	idAttribute: "id",
	initialize: function() {
		console.log('User has been initialized');
	},
	validate: function (attr) {
		if (attr.name.length < 2 || attr.name.length > 20) {
			return "Invalid name length."
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