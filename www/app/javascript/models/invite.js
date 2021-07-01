export const Invite = Backbone.Model.extend({
	urlRoot: '/invites',
	idAttribute: "id",
	initialize: function () {
		// console.log('Invite has been initialized');
	},
	accept: function (evt) {
		Backbone.sync("delete", evt.data.model, { url: 'invites/' + evt.data.model.id + '/accept' }).done(function () {
			evt.data.guildView.render(evt.data.guildView.guild.id);
		});
	},
	refuse: function (evt) {
		Backbone.sync("delete", evt.data.model, { url: 'invites/' + evt.data.model.id + '/refuse' }).done(function () {
			evt.data.guildView.render(evt.data.guildView.guild.id);
		});
	}
});
