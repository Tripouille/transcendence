import { Invite } from '../models/invite';

export const Invites = Backbone.Collection.extend({
	model: Invite,
	url: "/invites",
});