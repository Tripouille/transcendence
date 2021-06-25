let MessageView = Backbone.View.extend({
	tagName: "p",
	template: _.template($('#messageTemplate').html()),

	initialize: function() {
		this.render();
		this.model.on('remove', this.remove, this);
	},
	render: function() {
		this.$el.html(this.template(this.model.attributes));
		return this;
	}
});

export default MessageView;