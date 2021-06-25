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
		this.model.fetch().done(function() {
			_thisView.$el.empty();
			_thisView.$el.html(_thisView.template(_thisView.model.attributes));
			$.ajax({
				type: "GET",
				url: "users/" + initCurrentUserId + "/avatar",
				xhrFields: {
					responseType: 'blob'
				},
				success (data) {
					const url = window.URL || window.webkitURL;
					const src = url.createObjectURL(data);
					$('#avatar_profile').attr('src', src);
				}
			});
			return _thisView;
		});
	},

	clickHandler : function(e ){
		e.preventDefault()
		Backbone.history.navigate("user/" + initCurrentUserId + "/edit", { trigger: true })
	}

});
