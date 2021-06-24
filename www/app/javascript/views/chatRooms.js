import ChatRooms from '../collections/chatRooms';
import ChatRoomView from './chatRoom';
import consumer from "../channels/consumer";

const ChatRoomsView = Backbone.View.extend({
	chatRoomsCollection: new ChatRooms(),

	events: {
		//"click #friends_menu #remove_friend": "removeFriend"
	},

	initialize: function() {
		this.setElement($('#chat #chans'));
		this.chatRoomsCollection.on('add', this.addRoom, this);
		this.chatRoomsCollection.on('change', this.test);
		//remove
		this.actualize();
	},

	actualize: function() {
		const collection = this.chatRoomsCollection;
		collection.fetch();
		setInterval(function() {
			collection.fetch();
		}, 5000);
	},

	//add et change bien utilisés (change pour un changement d'un model)
	addRoom: function(room) {
		const chatRoomView = new ChatRoomView({model: room});
		this.$el.append(chatRoomView.$el);
		consumer.subscriptions.create({
			channel: "ChatRoomChannel",
			room_id: room.id
		},
		{
			connected() { console.log('connected to chatroom', room.id); },
			disconnected() { console.log('disconnected from chatroom', room.id); },
			received(data) {
				console.log('Received data from chat room', room.id, ' : ', data.content);
			}
		});
	},
	test: function(data) {
		console.log('change');
		console.log(data);
	},
});

export default ChatRoomsView;