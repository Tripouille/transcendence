import { UserView } from '../views/user';

export const UsersView = Backbone.View.extend({
	initialize: function() {
		console.log('Users view has been initialized');
		this.listenTo(this.model, "add", this.render);
		this.listenTo(this.model, "remove", this.render);
		this.listenTo(this.model, "change", this.render);
		this.render();
	},

	render: function() {
		this.$el.empty();
		for (let i = 0; i < this.model.length; ++i) {
			let userView = new UserView({model: this.model.at(i)});
			this.$el.append(userView.$el);
		}
		return this;
	}
});