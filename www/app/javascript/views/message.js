let MessageView = Backbone.View.extend({
	tagName: "p",
	template: _.template($('#messageTemplate').html()),

	initialize: function() {
		this.render();
		this.model.on('remove', this.remove, this);
	},
	render: function() {
		this.$el.html(this.template(this.model.attributes));
		if (this.model.get('user_id') == window.user_id)
			this.$el.addClass('mine');
		if (this.model.get('challenge')) {
			this.$time_left = this.$el.find('span.time_left');
			const deadline = new Date(this.model.get('challenge').created_at);
			deadline.setSeconds(deadline.getSeconds() + 60);
			this.time_left = Math.round((deadline.getTime() - Date.now()) / 1000);
			this.displayTimeLeft();
			this.timeLeftInterval = setInterval(this.displayTimeLeft.bind(this), 1000);
			this.$el.find('.challenge').data('timeLeftInterval', this.timeLeftInterval);
		}
		return this;
	},
	displayTimeLeft: function() {
		this.$time_left.text(this.time_left);
		if (this.time_left <= 0) {
			this.$time_left.text('expired');
			this.$el.find('.challenge_answers').remove();
			clearInterval(this.timeLeftInterval);
		}
		this.time_left--;
	}
});

export default MessageView;