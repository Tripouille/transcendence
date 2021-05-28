import { GuildModel } from '../models/guild';

export const GuildsCollection = Backbone.Collection.extend({
	model: GuildModel,
	url: "/guilds",

	initialize: function() {
		this.comparator = function(model) {
			return -model.get("score");
		}
	},
});