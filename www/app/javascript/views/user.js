export const UserView = Backbone.View.extend({
	tagname: "li",

	initialize: function() {
		console.log('User view has been initialized');
		this.render();
	},
	render: function() {
		this.$el.html(`<li>${this.model.get('name')}</li>`);
		return this;
	}
});