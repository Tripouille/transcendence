import { User } from "../../models/user";
import { unfoldFriends } from "../animations/layout";

export const UserShowView = Backbone.View.extend({
	events: {
		'click .edit-btn': 'clickHandler',
		'click .tfa-btn': 'changeTfa',
		'click .friend-btn' : 'changeFriend',
		'click .challenge-btn' : 'challenge'
	},

	tagName: "li",
	template: _.template($('#user-show-display').html()),

	render: function (id) {
		let _thisView = this;
		this.model = new User({ id: id });

		this.$el.attr({ id: 'user' });
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
		$('#user').html(this.template(this.model.toJSONDecorated()));
		$('#user').find('.mhistory-btn').on("click", function () {
			Backbone.history.navigate('#user/' + _thisView.model.id + '/matcheshistory', { trigger: true })
		});
		$('#avatar_profile').attr('src', src);
	},

	clickHandler: function (e) {
		e.preventDefault()
		Backbone.history.navigate("user/" + initCurrentUserId + "/edit", { trigger: true })
	},
	changeTfa: function (e) {
		e.preventDefault()
		Backbone.history.navigate("user/" + initCurrentUserId + "/tfa", { trigger: true })
	},
	changeFriend: function(e) {
		e.preventDefault()
		const friendsCollection = window.friendsListView.friendsCollection;
		if (friendsCollection.get(this.model.id)) {
			friendsCollection.get(this.model.id).destroy();
			if (!friendsCollection.length)
				window.friendsListView.$el.hide();
			$(e.target).text('Add friend');
		}
		else {
			$.ajax({
				type: 'POST',
				url: '/friendships',
				headers: {
					'X-CSRF-Token': $('meta[name="csrf-token"]').attr('content')
				},
				data: {id: this.model.id},
				success: function(response) {
					if (response.status == "success") {
						friendsCollection.fetch();
						unfoldFriends();
						$(e.target).text('Remove friend');
					}
				}.bind(this)
			});
		}
	},
	challenge: function(e) {
		e.preventDefault()
		window.userSubscription.send({challenge: this.model.id});
	}
});
