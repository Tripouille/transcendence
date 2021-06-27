import consumer from "../channels/consumer";
import Messages from "../collections/messages";
import MessageView from "./message";


// TODO : plus de actualize, passer entierement par le channel ?
let ChatRoomView = Backbone.View.extend({
	tagName: 'div',
	template: _.template($('#chatRoomTemplate').html()),

	events: {
		"click > p": 'selectRoomAndRenderMessages'
	},

	initialize: function() {
		this.$el.attr({id: this.model.id});
		this.messages = new Messages();
		this.messages.set(this.model.get('messages'));
		this.render();
		//this.model.on('change', this.render, this);
		this.model.on('remove', this.remove, this);
		this.on('sendMessage', this.sendMessage, this);
		this.messages.on('add', this.addMessage, this);

		const room = this.model;
		const messages = this.messages;
		this.subscription = consumer.subscriptions.create({
			channel: "ChatRoomChannel",
			room_id: room.id
		},
		{
			connected() { console.log('connected to chatroom', room.id); },
			disconnected() { console.log('disconnected from chatroom', room.id); },
			received(data) {
				console.log('Received data from chat room', room.id, ' : ', data.content);
				if (data.content.message) {
					messages.add(data.content.message, {merge: true});
				}
			}
		});
	},
	render: function() {
		console.log('rendering chatRoomView');
		this.$el.html(this.template(this.model.attributes));
		return this;
	},
	selectRoomAndRenderMessages: function() {
		this.trigger('selectRoom', this.model.id);
		this.$el.addClass('active');
		const $chatBody = $('#chat_body');
		$chatBody.empty();
		this.messages.each(function(message) {
			const messageView = new MessageView({model: message});
			$chatBody.append(messageView.$el);
		}, this);
		this.scrollBottom();
	},
	sendMessage: function(p) {
		this.subscription.send({message: p});
	},
	addMessage: function(message) {
		const messageView = new MessageView({model: message});
		$('#chat_body').append(messageView.$el);
		this.scrollBottom();
	},
	scrollBottom: function() {
		$('#chat_body_container').scrollTop($('#chat_body_container').prop('scrollHeight'));
	}
});

export default ChatRoomView;