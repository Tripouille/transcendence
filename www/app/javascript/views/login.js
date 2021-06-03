export const LoginView = Backbone.View.extend({

	events: {
		'click .retro-btn' : 'clickHandler'
	},

	template: _.template( $('#login-blocTemplate').html()),

	initialize: function() {
		console.log("Login Page initialize");
		console.log("Clear nav bar on login Page");
		$("#mainNav").empty();
		$("#contacts").empty();
		$("#chat").empty();
		$("main").empty();
        $("main").html(this.template);
		this.render();
	},

	render: function(){
		this.$el.html(this.template());
        return this;
	},

	clickHandler : function(e ){
		e.preventDefault()
		document.location.replace('/users/auth/marvin')
	}

});
