export const User = Backbone.Model.extend({
	urlRoot: '/users',
	defaults: {
		id: null,
		username: "",
		pictures: "",
		email: "",
		login: "",
		guild_id: null,
		otp_required_for_login: false,
		otp_secret: ""
	},

	idAttribute: "id",

	/* A function to call to kick members from their guild: modification of their own guild_id value */
	kick: function (evt) {
		if (confirm("You are about to kick " + evt.data.model.get('username') + ". Are you sure ?")) {
			Backbone.sync("patch", evt.data.model, { url: 'users/' + evt.data.model.id + '/kick' }).done(function () {
				evt.data.guildView.render(evt.data.guildView.guild.id);
			});
		}
		else
			$('#kick' + evt.data.model.id).one("click", evt.data, evt.data.model.kick);
	},
	/* A function to call for members to leave their own guild: nullifying their own guild_id value */
	leave: function (model, thisView) {
		Backbone.sync("patch", model, {
			url: 'users/' + this.id + '/leave',
			success: function () {
				thisView.render(thisView.guild.id);
			},
			error: function () {
				thisView.render(thisView.guild.id);
			}
		})
	},
	/* A function to call for members to leave their own guild: nullifying their own guild_id value */
	matcheshistory: function (model, thisView) {
		Backbone.sync("get", model, {
			url: 'users/' + this.id + '/matcheshistory',
			success: function () {
			},
			error: function () {
			}
		})
	},

	toJSONDecorated: function() {
		const result = this.toJSON();
		result.isMyFriend = window.friendsListView.friendsCollection.get(result.id) ? true : false;
		return result;
	}
});
