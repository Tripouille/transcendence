import Friends from '../collections/friends';
import FriendView from './friend';
import consumer from "../channels/consumer";

const FriendsListView = Backbone.View.extend({
	friendsCollection: new Friends(),

	events: {
		"click #friends_menu #remove_friend": "removeFriend"
	},

	initialize: function() {
		this.connectChannel();
		this.setElement($('#friends'));
		this.friendsCollection.fetch({context: this, success: function() {
			if (this.friendsCollection.length)
				this.$el.show();
			this.render();
			this.friendsCollection.on('add', this.addFriend, this);
			this.friendsCollection.on('change', this.reload, this);
		}});
		//this.actualize();
	},

	render: function() {
		this.friendsCollection.each(function(friend) {
			const friendView = new FriendView({model: friend});
			this.$el.append(friendView.$el);
		}, this);
	},
	reload: function() {
		this.friendsCollection.sort();
		this.$el.find('div').remove();
		this.render();
	},
	addFriend: function() {
		this.$el.show();
		this.reload();
	},
	removeFriend: function() {
		this.friendsCollection.get(window.active_friend).destroy();
		if (!this.friendsCollection.length)
			this.$el.hide();
	},
	actualize: function() {
		setInterval(() => {this.friendsCollection.fetch();}, 5000);
	},

	connectChannel: function() {
		consumer.subscriptions.create({channel: "OnlineChannel"});
	}
});

export default FriendsListView;