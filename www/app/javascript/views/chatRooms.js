import ChatRooms from '../collections/chatRooms';

const ChatRoomsView = Backbone.View.extend({
	chatRoomsCollection: new ChatRooms(),

	events: {
		//"click #friends_menu #remove_friend": "removeFriend"
	},

	initialize: function() {
		console.log('initialize chatRooms view');
		this.chatRoomsCollection.on('change', this.test);
		this.chatRoomsCollection.on('add', this.test2);
		this.actualize();
	},

	actualize: function() {
		const collection = this.chatRoomsCollection;
		collection.fetch();
		setInterval(function() {
			collection.fetch();
		}, 5000);
	},

	test: function(data) {
		console.log('change');
		console.log(data);
	},
	test2: function(data) {
		console.log('add');
		console.log(data);
	}
});

export default ChatRoomsView;