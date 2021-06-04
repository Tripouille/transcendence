import { User } from "../../models/user";

export const UserCreateView = Backbone.View.extend({

	template: _.template($('#user-create').html()),

	events: {
		'click #formSubmitCreateUser input' : 'onFormSubmit'
	},

	model: new User({ id:initCurrentUserId }),

	initialize: function() {
		console.log('User Create View has been init');
	},

	render: function() {
		let _thisView = this;
		this.model.fetch().done(function() {
			if (_thisView.model.get('username').length > 0) {
				Backbone.history.navigate("user", { trigger: true });
			}
			_thisView.$el.empty();
			_thisView.$el.append(_thisView.template());
			return _thisView;
		});

	},

	onFormSubmit: function(e) {
		e.preventDefault();
		this.model.set('username', $('#username').val());
		_.bindAll(this, "render");
		this.model.save({
			success: Backbone.history.navigate("user", { trigger: true })
		});
	}

});
