import Friend from "../models/friend";

const Friends = Backbone.Collection.extend({
	model: Friend,
	url: "/friends",

	initialize: function() {
		this.fetch();
		const collection = this;
		setInterval(function() {
			collection.fetch();
		}, 5000);
	}
});

export default Friends;