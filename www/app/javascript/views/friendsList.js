import Friends from '../collections/friends';
import FriendView from './friend';

const FriendsListView = Backbone.View.extend({
	friendsCollection: new Friends(),

	initialize: function() {
		this.$el = $('#friends');
		this.friendsCollection.on('add', this.addFriend, this);
	},

	addFriend: function(friend) {
		const friendView = new FriendView({model: friend});
		this.$el.append(friendView.$el);
	}
});

export default FriendsListView;