import Friends from '../collections/friends';
import FriendView from './friend';

const FriendsListView = Backbone.View.extend({
	friendsCollection: new Friends(),

	events: {
		"click #friends_menu #remove_friend": "removeFriend"
	},

	initialize: function() {
		this.setElement($('#friends'));
		this.friendsCollection.on('add', this.addFriend, this);
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
	}
});

export default FriendsListView;