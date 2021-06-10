import { InviteModel } from '../models/invite';

export const InvitesCollection = Backbone.Collection.extend({
	model: InviteModel,
	url: "/invites",
});