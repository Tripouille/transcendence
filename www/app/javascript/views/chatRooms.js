import ChatRooms from '../collections/chatRooms';
import ChatRoomView from './chatRoom';

const ChatRoomsView = Backbone.View.extend({
	chatRoomsCollection: new ChatRooms(),
	chatRoomViews: [],

	initialize: function() {
		this.setElement($('#chat #chat_rooms'));
		this.chatRoomsCollection.fetch({context: this, success: function() {
			this.render();
			this.chatRoomsCollection.on('add', this.reload, this);
			this.chatRoomsCollection.on('change', this.reload, this);
			if (this.chatRoomsCollection.length)
				this.chatRoomViews[0].selectRoomAndRenderMessages();
		}});
		this.actualize();
	},

	render: function() {
		this.chatRoomsCollection.each(function(room) {
			let chatRoomView = new ChatRoomView({model: room});
			this.$el.append(chatRoomView.$el);
			this.chatRoomViews.push(chatRoomView);
			chatRoomView.on('selectRoom', this.selectRoom, this);
		}, this);
	},
	reload: function() {
		console.log('reload of ChatRoomsView');
		this.chatRoomsCollection.sort();
		this.$el.empty();
		this.render();
	},
	actualize: function() {
		setInterval(() => {this.chatRoomsCollection.fetch();}, 5000);
	},

	selectRoom: function() {
		this.$el.children('div').removeClass('active');
	}
});

export default ChatRoomsView;