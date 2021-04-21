import { UserView } from '../views/user';

export const UsersView = Backbone.View.extend({
	initialize: function() {
		console.log('Users view has been initialized');
		this.render();
	},

	render: function() {
		for (let i = 0; i < this.model.length; ++i) {
			let userView = new UserView({model: this.model.at(i)});
			this.$el.append(userView.$el);
		}
		return this;
	}
});