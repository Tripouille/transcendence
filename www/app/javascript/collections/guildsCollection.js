import { GuildModel } from "../models/guildModel";

export const GuildsCollection = Backbone.Collection.extend({
	model: GuildModel,
	url: "/guilds"
});