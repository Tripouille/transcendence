import { User } from "../../models/user";

export const UserUpdateView = Backbone.View.extend({

	template: _.template($('#user-modify').html()),

	events: {
		'click #formSubmitUpdateUser input' : 'onFormSubmit'
	},

	model: new User({ id:initCurrentUserId }),

	initialize: function() {
		console.log('User Update View has been init')
		_.bindAll(this, "render");
		this.model.fetch();
		this.render;
	},

	render: function() {
		this.$el.empty();
		this.$el.append(this.template());
		return this;
	},

	onFormSubmit: function(e) {
		e.preventDefault();
		console.log(this.model.toJSON());
		this.model.set('username', $('#username').val());
		console.log(this.model.toJSON());
		_.bindAll(this, "render");
		this.model.save({
			success: this.render
		});
	}

});
