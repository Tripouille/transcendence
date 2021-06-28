import { User } from "../../models/user";

export const UserView = Backbone.View.extend({

	events: {
		'click .edit-btn' : 'clickHandler'
	},

	tagName: "li",
	template: _.template($('#user-display').html()),
	model: new User({ id: initCurrentUserId }),

	initialize: function() {
		console.log('User view has been initialized');
	},

	render: function() {
		let _thisView = this;

		this.$el.append('<div class="loading">Loading...</div>');
		this.$el.append('<div class="lds-ripple"><p>Loading</p><div></div><div></div></div>');
		this.model.on('reset', this.render).fetch().done(function() {
			$.ajax({
				type: "GET",
				url: "users/" + initCurrentUserId + "/avatar",
				xhrFields: {
					responseType: 'blob'
				}
			}).done(function(data) {
				const url = window.URL || window.webkitURL;
				const src = url.createObjectURL(data);
				_thisView.chargePage(_thisView, src)
			});
		});
	},

	chargePage: function(_thisView, src) {
		_thisView.$el.html(_thisView.template(_thisView.model.attributes));
		$('#avatar_profile').attr('src', src);
		return _thisView;
	},

	clickHandler: function(e){
		e.preventDefault()
		Backbone.history.navigate("user/" + initCurrentUserId + "/edit", { trigger: true })
	},

});