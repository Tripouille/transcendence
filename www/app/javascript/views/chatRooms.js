import ChatRooms from '../collections/chatRooms';
import ChatRoomView from './chatRoom';
import MessageView from "./message";

const ChatRoomsView = Backbone.View.extend({
	chatRoomsCollection: new ChatRooms(),
	chatRoomViews: {},
	activeRoomId: null,

	events: {
		"click #create_room": function() {this.displayForm($('#room_creation_form'))},
		"click #join_room": function() {this.displayForm($('#room_joining_form'))}
	},

	initialize: function() {
		this.setElement($('#chat #chat_rooms'));
		this.chatRoomsCollection.fetch({context: this, success: function() {
			this.render();
			this.chatRoomsCollection.on('add', this.addNewRoom, this);
			this.selectFirstRoom();
		}});
		$('#chat #chat_body_container input').on('keypress', this, this.submitMessage);
		this.prepareForms();
	},

	render: function() {
		this.chatRoomsCollection.each(function(room) {
			this.addRoom(room);
		}, this);
	},
	selectFirstRoom() {
		if (this.chatRoomsCollection.length) {
			this.activeRoomId = this.chatRoomsCollection.at(0).id;
			this.chatRoomViews[this.activeRoomId].selectRoomAndRenderMessages();
		}
		else
			$('#chat_body').empty();
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
		return (chatRoomView);
	},
	addNewRoom: function(newRoom) {
		const chatRoomView = this.addRoom(newRoom);
		if (!newRoom.get('silent')) {
			this.activeRoomId = newRoom.id;
			this.chatRoomViews[this.activeRoomId].selectRoomAndRenderMessages();
		}
		else {
			chatRoomView.model.set('newMessages', true);
			chatRoomView.$el.find('span.new_message').addClass('visible');
			$('#chat_banner span.new_message').addClass('visible');
		}
	},

	selectRoom: function(chatRoomId) {
		this.activeRoomId = chatRoomId;
		this.$el.children('div').removeClass('active');
		this.scrollBottom();
	},

	submitMessage: function(e) {
		if (e.keyCode == 13 && this.value) {
			const chatRoomView = e.data.chatRoomViews[e.data.activeRoomId];
			const me = chatRoomView.getUser(window.user_id);
			if (!me.muted) {
				chatRoomView.trigger('sendMessage', this.value);
				this.value = '';
			}
			else
				e.data.animateInvalidInput($(this));
		}
	},
	addMessage: function(message) {
		const chatRoomView = this.chatRoomViews[message.get('chat_room_id')];
		if (message.get('chat_room_id') == this.activeRoomId) {
			if (!chatRoomView.isUserBlocked(message.get('user_id'))) {
				const messageView = new MessageView({model: message});
				$('#chat_body').append(messageView.$el);
				this.scrollBottom();
				chatRoomView.markAsRead();
			}
		}
		else {
			chatRoomView.model.set('newMessages', true);
			chatRoomView.$el.find('span.new_message').addClass('visible');
			if (message.get('chat_room_id') != this.activeRoomId || !window.chat_out)
				$('#chat_banner span.new_message').addClass('visible');
		}
	},
	scrollBottom: function() {
		$('#chat_body_container').scrollTop($('#chat_body_container').prop('scrollHeight'));
	},

	prepareForms: function() {
		const $roomCreationForm = $('#room_creation_form');
		$roomCreationForm.on('submit', this.submitCreationForm);
		$('#room_joining_form').on('submit', this.submitJoiningForm);
		$('#room_password_form').on('submit', this.submitPasswordForm);
		$('#add_room_password_form').on('submit', this.submitAddPasswordForm);
		$('#chat form').on('click', 'button.cancel', function(e) {
			window.chatRoomsView.cancelForm($(e.delegateTarget));
		});
		$roomCreationForm.find('input.room_password').on('click', function() {
			$roomCreationForm.find('#password_protected_choice').prop('checked', true);
			$roomCreationForm.find('label[for="room_name"] span').text('Room name');
		});
		$roomCreationForm.find('label[for="public_choice"]').on('click', function() {
			$roomCreationForm.find('input.room_name').focus();
			$roomCreationForm.find('label[for="room_name"] span').text('Room name');
		});
		$roomCreationForm.find('label[for="password_protected_choice"]').on('click', function() {
			$roomCreationForm.find('input.room_password').focus();
			$roomCreationForm.find('label[for="room_name"] span').text('Room name');
		});
		$roomCreationForm.find('label[for="direct_message_choice"]').on('click', function() {
			$roomCreationForm.find('label[for="room_name"] span').text('Username');
			$roomCreationForm.find('input.room_name').focus();
		});
	},
	cancelForm: function($form) {
		$form.trigger('reset');
		$form.removeClass('visible');
		$form.find('label[for="room_name"] span').text('Room name');
	},
	displayForm: function($form) {
		$form.addClass('visible');
		if ($form.attr('id') == 'room_creation_form')
			$form.find('input.room_name').focus();
		else
			$form.find('input').first().focus();
	},
	submitCreationForm: function(e) {
		e.preventDefault();
		let valid_form = true;
		const $form = $(e.target);
		const $room_password_input = $form.find('input.room_password');
		const $room_type_inputs = $form.find('input[name=room_type]:checked');
		if ($room_type_inputs.val() == 'password_protected'
		&& !$room_password_input.val()) {
			window.chatRoomsView.animateInvalidInput($room_password_input);
			valid_form = false;
		}
		const $room_name_input = $form.find('input.room_name');
		if (!$room_name_input.val().trim()) {
			window.chatRoomsView.animateInvalidInput($room_name_input);
			valid_form = false;
		}

		if (valid_form) {
			$.ajax({
				type: 'POST',
				url: '/chat_rooms',
				headers: {'X-CSRF-Token': $('meta[name="csrf-token"]').attr('content')},
				data: {
					name: $room_name_input.val().trim(),
					room_type: $room_type_inputs.val(),
					password: $room_password_input.val()
				},
				success: function(response) {
					if (response.error) {
						window.chatRoomsView.animateInvalidInput($room_name_input);
						console.log('Error when trying to create chat room : ' + response.error);
					}
					else {
						window.chatRoomsView.chatRoomsCollection.add(response.room);
						window.chatRoomsView.cancelForm($form);
						window.chatRoomsView.activeRoomId = response.room.id;
						window.chatRoomsView.chatRoomViews[response.room.id].selectRoomAndRenderMessages();
					}
				}
			});
		}
	},
	submitJoiningForm: function(e) {
		e.preventDefault();
		const chatRoomsView = window.chatRoomsView;
		const $form = $(e.target);
		const $room_name_input = $form.find('input.room_name');
		if (!$room_name_input.val().trim()) {
			window.chatRoomsView.animateInvalidInput($room_name_input);
			return ;
		}
		$.ajax({
			type: 'POST',
			url: '/chat_rooms/join',
			headers: {'X-CSRF-Token': $('meta[name="csrf-token"]').attr('content')},
			data: {name: $room_name_input.val().trim()},
			success: function(response) {
				if (response.error) {
					chatRoomsView.animateInvalidInput($room_name_input);
					console.log('Error when trying to join chat room : ' + response.error);
				}
				else if (response.password_needed) {
					chatRoomsView.cancelForm($form);
					chatRoomsView.displayForm($('#room_password_form'));
					$('#room_password_form').data('room-id', response.room_id);
				}
				else {
					chatRoomsView.chatRoomsCollection.add(response.room);
					chatRoomsView.cancelForm($form);
				}
			}
		});
	},
	submitPasswordForm: function(e) {
		e.preventDefault();
		const chatRoomsView = window.chatRoomsView;
		const $form = $(e.target);
		const $room_password_input = $form.find('input.room_password');
		if (!$room_password_input.val()) {
			window.chatRoomsView.animateInvalidInput($room_password_input);
			return ;
		}
		$.ajax({
			type: 'POST',
			url: '/chat_rooms/join_with_password',
			headers: {'X-CSRF-Token': $('meta[name="csrf-token"]').attr('content')},
			data: {id: $form.data('room-id'), password: $room_password_input.val()},
			success: function(response) {
				if (response.error) {
					chatRoomsView.animateInvalidInput($room_password_input);
					console.log('Error when trying to join chat room : ' + response.error);
				}
				else {
					chatRoomsView.chatRoomsCollection.add(response.room);
					chatRoomsView.cancelForm($form);
				}
			}
		});
	},
	submitAddPasswordForm: function(e) {
		e.preventDefault();
		const chatRoomsView = window.chatRoomsView;
		const $form = $(e.target);
		const $room_password_input = $form.find('input.room_password');
		if (!$room_password_input.val()) {
			window.chatRoomsView.animateInvalidInput($room_password_input);
			return ;
		}
		$.ajax({
			type: 'POST',
			url: '/chat_rooms/add_password',
			headers: {'X-CSRF-Token': $('meta[name="csrf-token"]').attr('content')},
			data: {id: $form.data('room-id'), password: $room_password_input.val()},
			success: function() {
				chatRoomsView.chatRoomsCollection.get($form.data('room-id')).set('room_type', 'password_protected');
				chatRoomsView.cancelForm($form);
			}
		});
	},
	sendDm: function(user_id) {
		$.ajax({
			type: 'POST',
			url: '/chat_rooms',
			headers: {'X-CSRF-Token': $('meta[name="csrf-token"]').attr('content')},
			data: {
				user_id: user_id,
				room_type: 'direct_message'
			},
			success: function(response) {
				if (!response.error) {
					window.chatRoomsView.chatRoomsCollection.add(response.room);
					window.chatRoomsView.activeRoomId = response.room.id;
					window.chatRoomsView.chatRoomViews[response.room.id].selectRoomAndRenderMessages();
				}
			}
		});
	},
	animateInvalidInput: function($input) {
		$input.css('border-color', 'red');
		setTimeout(function() {$input.css('border-color', '');}, 1000);
		$input.focus();
	},

	unfoldTchat: function() {
		const activeChatRoomView = this.chatRoomViews[this.activeRoomId];
		activeChatRoomView.$el.find('span.new_message').removeClass('visible');
		activeChatRoomView.model.set('newMessages', false);
		if (!this.$el.find('span.new_message:visible').length)
			$('#chat_banner span.new_message').removeClass('visible');
	},

	changeBlockedStatus: function(blocked_user_id, blocked) {
		Object.values(this.chatRoomViews).forEach(function(chatRoomView) {
			const user = chatRoomView.getUser(blocked_user_id);
			if (user) {
				user.blocked = blocked;
				chatRoomView.render();
			}
		});
	}
});

export default ChatRoomsView;