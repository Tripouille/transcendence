export const Invite = Backbone.Model.extend({
	urlRoot: '/invites',
	idAttribute: "id",

	accept: function (evt) {
		Backbone.sync("delete", evt.data.model, {
			url: 'invites/' + evt.data.model.id + '/accept',
			success: function () {
				evt.data.guildView.render(evt.data.guildView.guild.id);
			},
			error: function () {
				evt.data.guildView.render(evt.data.guildView.guild.id);
			}
		});
	},
	refuse: function (evt) {
		Backbone.sync("delete", evt.data.model, {
			url: 'invites/' + evt.data.model.id + '/refuse',
			success: function () {
				evt.data.guildView.render(evt.data.guildView.guild.id);
			},
			error: function () {
				evt.data.guildView.render(evt.data.guildView.guild.id);
			}
		});
	}
});
