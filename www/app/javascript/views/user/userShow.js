import { User } from "../../models/user";

export const UserShowView = Backbone.View.extend({

	tagName: "li",
	template: _.template($('#user-show-display').html()),
	model: new User(),

	initialize: function () {
		console.log('User view has been initialized');
	},

	render: function (id) {
		let _thisView = this;
		this.model = new User({ id: id });

		this.$el.attr({ id: 'userShow' });
		$('main#userShow').append('<div class="loading">Loading...</div>');
		$('main#userShow').append('<div class="lds-ripple"><p>Loading</p><div></div><div></div></div>');
		this.model.fetch().done(function () {
			$.ajax({
				type: "GET",
				url: "users/" + id + "/avatar",
				xhrFields: {
					responseType: 'blob'
				}
			}).done(function (data) {
				const url = window.URL || window.webkitURL;
				const src = url.createObjectURL(data);
				_thisView.chargePage(_thisView, src)
			});
		});
	},

	chargePage: function (_thisView, src) {
		$('main#userShow').html(_thisView.template(_thisView.model.attributes));
		$('#boutton_show').one("click", function () {
			Backbone.history.navigate('#user/' + _thisView.model.id + '/matchhistory', { trigger: true })
		});
		$('#avatar_profile').attr('src', src);

		return _thisView;
	}
});
