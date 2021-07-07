import Friends from '../collections/friends';
import FriendView from './friend';

const FriendsListView = Backbone.View.extend({
	friendsCollection: new Friends(),

	events: {
		"click #friends_menu li.send_dm": "sendDm",
		"click #friends_menu li.see_profile": "seeProfile",
		"click #friends_menu #remove_friend": "removeFriend",
		"click #friends_menu .challenge": "challenge"
	},

	initialize: function() {
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
	seeProfile: function() {
		Backbone.history.navigate('#user/' + window.active_friend + '/show', {trigger: true});
	},
	sendDm: function() {
		window.chatRoomsView.sendDm(window.active_friend);
	},
	challenge: function() {
		window.userSubscription.send({challenge: window.active_friend});
	},
	actualize: function() {
		setInterval(() => {this.friendsCollection.fetch();}, 5000);
	}
});

export default FriendsListView;