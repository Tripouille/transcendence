import ChatRooms from '../collections/chatRooms';
import ChatRoomView from './chatRoom';
import MessageView from "./message";

const ChatRoomsView = Backbone.View.extend({
	chatRoomsCollection: new ChatRooms(),
	chatRoomViews: {},
	activeRoomId: null,

	events: {
		"click #create_room": "displayRoomCreationFrom"
	},

	initialize: function() {
		this.setElement($('#chat #chat_rooms'));
		this.chatRoomsCollection.fetch({context: this, success: function() {
			this.render();
			this.chatRoomsCollection.on('add', this.addCreatedRoom, this);
			//this.chatRoomsCollection.on('change', this.reload, this); //change:name ?
			if (this.chatRoomsCollection.length) {
				this.activeRoomId = this.chatRoomsCollection.at(0).id;
				this.chatRoomViews[this.activeRoomId].selectRoomAndRenderMessages();
			}
		}});
		$('#chat #chat_body_container input').on('keypress', this, this.submitMessage);
	},

	render: function() {
		this.chatRoomsCollection.each(function(room) {
			this.addRoom(room);
		}, this);
	},
	addRoom: function(room) {
		let chatRoomView = new ChatRoomView({model: room});
		this.chatRoomViews[room.id] = chatRoomView;
		chatRoomView.on('selectRoom', this.selectRoom, this);
		chatRoomView.messages.on('add', this.addMessage, this);
		const index = this.chatRoomsCollection.indexOf(room);
		if (index > 0)
			chatRoomView.$el.insertAfter(
				this.chatRoomViews[this.chatRoomsCollection.at(index - 1).id].$el
			);
		else
			this.$el.prepend(chatRoomView.$el);
	},
	addCreatedRoom: function(newRoom) {
		this.addRoom(newRoom);
		this.activeRoomId = newRoom.id;
		this.chatRoomViews[this.activeRoomId].selectRoomAndRenderMessages();
	},

	selectRoom: function(chatRoomId) {
		this.activeRoomId = chatRoomId;
		this.$el.children('div').removeClass('active');
		this.scrollBottom();
	},

	submitMessage: function(e) {
		if (e.keyCode == 13 && this.value) {
			e.data.chatRoomViews[e.data.activeRoomId].trigger('sendMessage', this.value);
			this.value = '';
		}
	},
	addMessage: function(message) {
		if (message.get('chat_room_id') == this.activeRoomId) {
			const messageView = new MessageView({model: message});
			$('#chat_body').append(messageView.$el);
			this.scrollBottom();
		}
	},
	scrollBottom: function() {
		$('#chat_body_container').scrollTop($('#chat_body_container').prop('scrollHeight'));
	},

	displayRoomCreationFrom: function() {
		$('#room_form').addClass('visible');
		$('#room_form input#room_name').focus();
	}
});

export default ChatRoomsView;