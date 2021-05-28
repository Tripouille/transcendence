export const UserView = Backbone.View.extend({
	tagName: "li",
	template: _.template($('#user-blocTemplate').html()),

	initialize: function() {
		console.log('User view has been initialized');
		$("main").empty();
        $("main").html(this.template);
		this.render();
	},
	render: function() {
		this.$el.html(this.template());
		return this;
	}
});
