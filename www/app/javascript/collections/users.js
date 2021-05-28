import { User } from "../models/user";

export const Users = Backbone.Collection.extend({
	model: User,
	url: "/users"
});