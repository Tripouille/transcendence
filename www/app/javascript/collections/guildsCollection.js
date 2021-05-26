import { GuildModel } from '../models/guildModel';

export const GuildsCollection = Backbone.Collection.extend({
	model: GuildModel,
	url: "/guilds",

	initialize: function() {
		this.comparator = function(model) {
			return -model.get("score");
		}

		this.fetch({
			success: function(collection, response, options) {
				console.log("fetched guild-collection with sucess");
                return this;

			},
			error: function(){
				console.log("fetched guild-collection with failure");
			}
		});
	},
});