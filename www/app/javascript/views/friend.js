let FriendView = Backbone.View.extend({
	tagName: "div",
	className: "friend",
	template: _.template($('#friendTemplate').html()),

	initialize: function() {
		this.render();
		this.model.on('remove', this.remove, this);
		this.model.on('change', this.change, this);
	},
	render: function() {
		this.$el.attr({id: this.model.id});
		this.$el.html(this.template(this.model.attributes));
		return this;
	},
	change: function(model) {
		this.$el.html(this.template(this.model.attributes));
	}
});

export default FriendView;