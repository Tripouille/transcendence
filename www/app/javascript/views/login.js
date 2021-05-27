export const LoginView = Backbone.View.extend({

	el: 'body',

	events: {
		'mouseover .retro-btn': 'mouseHandler',
		'click .retro-btn' : 'clickHandler'
	  },

	template: _.template( $('#login-blocTemplate').html()),

	initialize: function() {
		console.log("Remove nav bar on login Page");
		$("#mainNav").remove();
		$("#contacts").remove();
		$("#chat").remove();
	},

	render: function(){
		$("#main-bloc").empty();
        $("#main-bloc").html(this.template);
        return this;
	},

	clickHandler : function(){
		console.log('I was clicked!');
	},

	mouseHandler : function(){
		console.log('Hello');
	}

});
