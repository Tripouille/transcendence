import Friends from '../collections/friends';
import FriendView from './friend';
import consumer from "../channels/consumer";

const FriendsListView = Backbone.View.extend({
	friendsCollection: new Friends(),

	events: {
		"click #friends_menu #remove_friend": "removeFriend"
	},

	initialize: function() {
		this.setElement($('#friends'));
		this.friendsCollection.on('add', this.addFriend, this);
		this.actualize();
		this.connectChannel();
	},

	addFriend: function(friend) {
		this.$el.show();
		const friendView = new FriendView({model: friend});
		this.$el.append(friendView.$el);
	},
	removeFriend: function(e) {
		this.friendsCollection.get(window.active_friend).destroy();
		if (!this.friendsCollection.length)
			this.$el.hide();
	},
	actualize: function() {
		const collection = this.friendsCollection;
		collection.fetch();
		setInterval(function() {
			collection.fetch();
		}, 5000);
	},

	connectChannel: function() {
		window.onlineSubscription = consumer.subscriptions.create({channel: "OnlineChannel"}, {
			connected() { /*console.log('connected to OnlineChannel');*/ },
			disconnected() { /*console.log('disconnected from OnlineChannel');*/ }
		});
	}
});

export default FriendsListView;