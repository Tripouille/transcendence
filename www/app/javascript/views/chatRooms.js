import ChatRooms from '../collections/chatRooms';
import ChatRoomView from './chatRoom';
import MessageView from "./message";

const ChatRoomsView = Backbone.View.extend({
	chatRoomsCollection: new ChatRooms(),
	chatRoomViews: {},
	activeRoomId: null,

	events: {
		"click #create_room": "displayRoomCreationForm",
		"click #join_room": "displayRoomJoiningForm"
	},

	initialize: function() {
		this.setElement($('#chat #chat_rooms'));
		this.chatRoomsCollection.fetch({context: this, success: function() {
			this.render();
			this.chatRoomsCollection.on('add', this.addNewRoom, this);
			//this.chatRoomsCollection.on('change', this.reload, this); //change:name ?
			if (this.chatRoomsCollection.length) {
				this.activeRoomId = this.chatRoomsCollection.at(0).id;
				this.chatRoomViews[this.activeRoomId].selectRoomAndRenderMessages();
			}
		}});
		$('#chat #chat_body_container input').on('keypress', this, this.submitMessage);
		this.prepareForms();
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
	addNewRoom: function(newRoom) {
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

	prepareForms: function() {
		this.$roomCreationForm = $('#room_creation_form');
		this.$roomCreationForm.on('submit', this.submitCreationForm);
		this.$roomCreationForm.on('click', 'button.cancel', this.cancelForm);
		this.$roomJoiningForm = $('#room_joining_form');
		this.$roomJoiningForm.on('submit', this.submitJoiningForm);
		this.$roomJoiningForm.on('click', 'button.cancel', this.cancelForm);
	},
	cancelForm: function(e) {
		const $form = $(e.delegateTarget);
		$form.trigger('reset');
		$form.removeClass('visible');
	},
	displayRoomCreationForm: function() {
		this.$roomCreationForm.addClass('visible');
		this.$roomCreationForm.find('input.room_name').focus();
	},
	submitCreationForm: function(e) {
		e.preventDefault();
		let valid_form = true;
		const $form = $(e.target);
		const $room_password_input = $form.find('input.room_password');
		const $room_type_inputs = $form.find('input[name=room_type]:checked');
		if ($room_type_inputs.val() == 'password_protected'
		&& !$room_password_input.val().trim()) {
			this.animateInvalidInput($room_password_input);
			valid_form = false;
		}
		const $room_name_input = $form.find('input.room_name');
		if (!$room_name_input.val().trim()) {
			this.animateInvalidInput($room_name_input);
			valid_form = false;
		}

		if (valid_form) {
			window.chatRoomsView.chatRoomsCollection.create({
				name: $room_name_input.val().trim(),
				room_type: $room_type_inputs.val(),
				password: $room_password_input.val()
			}, {wait: true});
			$form.trigger('reset');
			$form.removeClass('visible');
		}
	},
	displayRoomJoiningForm: function() {
		this.$roomJoiningForm.addClass('visible');
		this.$roomJoiningForm.find('input.room_name').focus();
	},
	submitJoiningForm: function(e) {
		e.preventDefault();
		const $form = $(e.target);
		const $room_name_input = $form.find('input.room_name');
		if (!$room_name_input.val().trim()) {
			this.animateInvalidInput($room_name_input);
			return ;
		}
		$.ajax({
			type: 'POST',
			url: '/chat_rooms/join',
			headers: {
				'X-CSRF-Token': $('meta[name="csrf-token"]').attr('content')
			},
			data: {name: $room_name_input.val().trim()},
			success: function(response) {
				if (response.error) {
					window.chatRoomsView.animateInvalidInput($room_name_input);
					console.log('Error when trying to join room : ' + response.error);
				}
				else if (response.password_needed) {
					console.log('password needed');
				}
				else {
					window.chatRoomsView.chatRoomsCollection.add(response.room);
					$form.trigger('reset');
					$form.removeClass('visible');
				}
			}
		});
	},
	animateInvalidInput: function($input) {
		$input.css('border-color', 'red');
		setTimeout(function() {$input.css('border-color', '');}, 1000);
		$input.focus();
	}
});

export default ChatRoomsView;