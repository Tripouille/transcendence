import { GuildModel } from "../models/guildModel";

export const GuildsCollection = Backbone.Collection.extend({
	model: GuildModel,
	url: "/guilds",

	initialize: function() {
        this.fetch({
			success: function(collection, response, options) {
				console.log("fetch with sucess");
                console.log(collection);
                console.log(response);
                return this;

			},
			error: function(){
				console.log("fetch with failure");
			}
		});
	},
});