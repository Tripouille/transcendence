let FriendView = Backbone.View.extend({
	tagName: "div",
	className: "friend",
	template: _.template($('#friendTemplate').html()),

	initialize: function() {
		this.$el.attr({id: this.model.id});
		this.render();
		this.model.on('remove', this.remove, this);
	},
	render: function() {
		this.$el.html(this.template(this.model.attributes));
		return this;
	}
});

export default FriendView;