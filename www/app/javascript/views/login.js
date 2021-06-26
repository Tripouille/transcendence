export const LoginView = Backbone.View.extend({

	events: {
		'click .retro-btn' : 'clickHandler'
	},

	template: _.template( $('#login-blocTemplate').html()),

	initialize: function() {
		console.log("Login Page initialize");
	},

	render: function(){
		$("nav")[0].style.display = "none";
		$("#friends_banner")[0].style.display = "none";
		$("#chat")[0].style.display = "none";
		$("main")[0].style.height = 'auto';
		$("main")[0].style.width = 'auto';
		$("main")[0].style.position = 'relative';
		$("main")[0].style.top = '5%';
		$("main")[0].setAttribute('id', "login");
        $("main").html(this.template);
		this.$el.html(this.template());
        return this;
	},

	clickHandler : function(e ){
		e.preventDefault()
		document.location.replace('/users/auth/marvin')
	}

});
