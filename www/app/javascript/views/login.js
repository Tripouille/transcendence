export const LoginView = Backbone.View.extend({

	template: _.template( $('#login-blocTemplate').html()),

	initialize: function() {
		console.log("Remove nav bar on login Page");
		$("#mainNav").remove();
		$("#contacts").remove();
		$("#chat").remove();
		$("#main-bloc").empty();

	},

	render: function(){
        $("#main-bloc").html(this.template);
        return this;
	},

});
