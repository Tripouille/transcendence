export const UserView = Backbone.View.extend({
	tagName: "li",
	template: _.template($('#userTemplate').html()),

	initialize: function() {
		console.log('User view has been initialized');
		this.render();
	},
	render: function() {
		this.$el.text(this.template(this.model.attributes));
		return this;
	}
});