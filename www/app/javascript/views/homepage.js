export const HomepageView = Backbone.View.extend({

	template: _.template( $('#homepage-blocTemplate').html()),

	initialize: function() {
		console.log("Homepage page initialize")
		this.render();
	},

	render: function() {
		this.$el.html(this.template());
	}

});
