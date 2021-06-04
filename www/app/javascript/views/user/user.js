import { User } from "../../models/user";

export const UserView = Backbone.View.extend({


	tagName: "li",
	template: _.template($('#user-display').html()),
	model: new User({ id: initCurrentUserId }),

	initialize: function() {
		console.log('User view has been initialized');
	},

	render: function() {
		let _thisView = this;
		this.model.fetch().done(function() {
			_thisView.$el.empty();
			_thisView.$el.html(_thisView.template(_thisView.model.toJSON()));
			return _thisView;
		});
	},

});
