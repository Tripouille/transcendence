let ChatRoomView = Backbone.View.extend({
	tagName: "p",

	initialize: function() {
		this.render();
		//this.model.on('remove', this.remove, this);
		//this.model.on('change', this.change, this);
	},
	render: function() {
		this.$el.attr({id: this.model.id});
		this.$el.text(this.model.get('name'));
		return this;
	},
	// change: function(model) {
	// 	this.$el.html(this.template(this.model.attributes));
	// }
});

export default ChatRoomView;