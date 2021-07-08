import { Guild } from '../models/guild';

export const Guilds = Backbone.Collection.extend({
	model: Guild,
	url: "/guilds",
});
