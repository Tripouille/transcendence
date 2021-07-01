import { Guild } from '../models/guild';

export const Guilds = Backbone.Collection.extend({
	model: Guild,
	url: "/guilds",

	initialize: function() {
		this.comparator = function(model) {
			return -model.get("score");
		}
	},

	calculateRank: function () {
		this.each(function (guild, i) {
			guild.set({ "rank": i + 1 });
		});
	},
});