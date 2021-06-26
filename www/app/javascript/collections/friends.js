import Friend from "../models/friend";

const Friends = Backbone.Collection.extend({
	model: Friend,
	url: "/friends"
});

export default Friends;