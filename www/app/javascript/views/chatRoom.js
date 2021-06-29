import consumer from "../channels/consumer";
import Messages from "../collections/messages";
import MessageView from "./message";

// TODO : plus de actualize, passer entierement par le channel ?
let ChatRoomView = Backbone.View.extend({
	tagName: 'div',
	template: _.template($('#chatRoomTemplate').html()),

	events: {
		"click > p": 'selectRoomAndRenderMessages',
		"contextmenu": function(e) {e.preventDefault()},
		"contextmenu > p": 'rightClickHandler',
		"click li.hide": 'hideRoom',
		"click li.leave": 'leaveRoom',
		"click li.remove_password": 'removePassword',
	},

	initialize: function() {
		this.$el.attr({id: this.model.id});
		this.messages = new Messages();
		this.messages.set(this.model.get('messages'));
		this.render();
		//this.model.on('change', this.render, this);
		this.model.on('remove', this.remove, this);
		this.on('sendMessage', this.sendMessage, this);

		const room = this.model;
		const messages = this.messages;
		this.subscription = consumer.subscriptions.create({
			channel: "ChatRoomChannel",
			room_id: room.id
		},
		{
			connected() { console.log('connected to chatroom', room.id);},
			disconnected() { console.log('disconnected from chatroom', room.id); },
			received(data) {
				//console.log('Received data from chat room', room.id, ' : ', data.content);
				if (data.content.message) {
					messages.add(data.content.message, {merge: true});
				}
			}
		});
	},
	render: function() {
		this.$el.html(this.template(this.model.toJSONDecorated()));
		return this;
	},
	selectRoomAndRenderMessages: function() {
		const $chatBody = $('#chat_body');
		$chatBody.empty();
		this.messages.each(function(message) {
			const messageView = new MessageView({model: message});
			$chatBody.append(messageView.$el);
		}, this);
		this.trigger('selectRoom', this.model.id);
		this.$el.addClass('active');
	},
	sendMessage: function(content) {
		this.subscription.send({content: content});
	},

	rightClickHandler: function(e) {
		$('#chat_rooms ul').hide();
		this.$el.find('ul').show();
	},
	hideRoom: function() {
		$.ajax({
			type: 'POST',
			url: '/chat_rooms/hide',
			headers: {'X-CSRF-Token': $('meta[name="csrf-token"]').attr('content')},
			data: {id: this.model.id}
		});
		window.chatRoomsView.chatRoomsCollection.remove(this.model.id);
	},
	leaveRoom: function() {
		$.ajax({
			type: 'POST',
			url: '/chat_rooms/leave',
			headers: {'X-CSRF-Token': $('meta[name="csrf-token"]').attr('content')},
			data: {id: this.model.id}
		});
		window.chatRoomsView.chatRoomsCollection.remove(this.model.id);
	},
	removePassword: function() {
		$.ajax({
			type: 'POST',
			url: '/chat_rooms/remove_password',
			headers: {'X-CSRF-Token': $('meta[name="csrf-token"]').attr('content')},
			data: {id: this.model.id}
		});
		this.model.set('room_type', 'public');
		this.render();
	}
});

export default ChatRoomView;