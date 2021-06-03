import { User } from "../../models/user";

export const UserView = Backbone.View.extend({


	tagName: "li",
	template: _.template($('#user-display').html()),
	model: new User({ id: initCurrentUserId }),

	initialize: function() {
		console.log('User view has been initialized');
		this.$el.empty();
		let _thisView = this;
		this.model.fetch().done(function() {
			_thisView.render();
		});
	},

	render: function() {
		this.$el.empty();
		this.$el.append(this.template(this.model.toJSON()));
		return this;
	},

});
