import consumer from "../channels/consumer";
import Messages from "../collections/messages";
import MessageView from "./message";

// TODO : plus de actualize, passer entierement par le channel ?
let ChatRoomView = Backbone.View.extend({
	tagName: 'div',
	template: _.template($('#chatRoomTemplate').html()),
	messagesIntroTemplate: _.template($('#messagesIntroTemplate').html()),

	events: {
		"click > p": 'selectRoomAndRenderMessages',
		"contextmenu": function(e) {e.preventDefault()},
		"contextmenu > p": 'roomMenu',
		"click li.leave": 'leaveRoom',
		"click li.remove_password": 'removePassword',
		"click li.add_password": 'addPasswordForm',
		"click div.room_member": "displayUserMenu",
		"mousedown div.room_member": function(e) {e.preventDefault();},
		"click li.block, li.unblock": "changeBlockedStatus",
		"click li.promote_admin, li.demote_admin": "changeAdminStatus",
		"click li.mute, li.unmute": "changeMutedStatus",
		"click li.ban": "ban"
	},

	initialize: function() {
		this.$el.attr({id: this.model.id});
		this.messages = new Messages();
		this.messages.set(this.model.get('messages'));
		this.render();
		this.model.on('change', this.render, this);
		this.model.on('remove', this.remove, this);
		this.on('sendMessage', this.sendMessage, this);

		const _this = this;
		const messages = this.messages;
		this.subscription = consumer.subscriptions.create({
			channel: "ChatRoomChannel",
			room_id: _this.model.id
		},
		{
			connected() { /*console.log('connected to chatroom', _this.model.get('name'));*/ },
			disconnected() { /*console.log('disconnected from chatroom', _this.model.id);*/ },
			received(data) {
				//console.log('Received data from chat room', _this.model.get('name'), ' : ', data.content);
				if (data.content.message) {
					messages.add(data.content.message, {merge: true});
					return ;
				}
				if (data.content.newMember) {
					const newMember = _this.getUser(data.content.newMember.id);
					if (!newMember)
						_this.model.get('users').push(data.content.newMember);
					else if (newMember.status == 'offline')
						newMember.status = data.content.newMember.status;
				}
				else if (data.content.memberLeaving) {
					const memberLeaving = _this.getUser(data.content.memberLeaving);
					if (memberLeaving && memberLeaving.status != 'offline') {
						const index = _this.model.get('users').indexOf(memberLeaving);
						_this.model.get('users').splice(index, 1);
					}
				}
				else if (data.content.changeAdminStatus) {
					const user = _this.getUser(data.content.changeAdminStatus.id);
					if (user)
						user.admin = (data.content.changeAdminStatus.admin == 'true');
				}
				else if (data.content.changeMutedStatus) {
					const user = _this.getUser(data.content.changeMutedStatus.id);
					if (user)
						user.muted = (data.content.changeMutedStatus.muted == 'true');
				}
				else if (data.content.changeOwner)
					_this.model.set('owner_id', data.content.changeOwner);
				_this.render();
			}
		});
	},
	render: function() {
		//console.log('rendering chatRoom view', this.model.get('name'), ', model = ', this.model.attributes);
		this.$el.html(this.template(this.model.toJSONDecorated()));
		return this;
	},
	getUser(user_id) {
		return (this.model.get('users').find(user => user.id == user_id));
	},
	isUserBlocked(user_id) {
		const user = this.getUser(user_id);
		return (user ? user.blocked : false);
	},
	selectRoomAndRenderMessages: function() {
		const $chatBody = $('#chat_body');
		$chatBody.empty();
		$chatBody.append(this.messagesIntroTemplate(this.model.toJSONDecorated()));
		this.messages.each(function(message) {
			if (!this.isUserBlocked(message.get('user_id'))) {
				const messageView = new MessageView({model: message});
				$chatBody.append(messageView.$el);
			}
		}, this);
		this.trigger('selectRoom', this.model.id);
		this.$el.addClass('active');
		$('#chat_body_container input').focus();
		this.markAsRead();
	},
	markAsRead: function() {
		this.$el.find('span.new_message').removeClass('visible');
		if (!$('#chat_rooms span.new_message:visible').length)
			$('#chat_banner span.new_message').removeClass('visible');
		this.subscription.send({mark_as_read: true});
	},
	sendMessage: function(content) {
		this.subscription.send({content: content});
	},

	roomMenu: function() {
		$('#chat ul.user_menu').hide();
		$('#chat_rooms ul.room_menu').hide();
		this.$el.find('ul.room_menu').show();
	},
	leaveRoom: function() {
		$.ajax({
			type: 'POST',
			url: '/chat_rooms/leave',
			headers: {'X-CSRF-Token': $('meta[name="csrf-token"]').attr('content')},
			data: {id: this.model.id}
		});
		this.removeRoom();
	},
	removeRoom: function() {
		this.subscription.unsubscribe();
		window.chatRoomsView.chatRoomsCollection.remove(this.model.id);
		if (window.chatRoomsView.activeRoomId == this.model.id)
			window.chatRoomsView.selectFirstRoom();
		if (!$('#chat_rooms span.new_message:visible').length)
			$('#chat_banner span.new_message').removeClass('visible');
	},
	removePassword: function() {
		$.ajax({
			type: 'POST',
			url: '/chat_rooms/remove_password',
			headers: {'X-CSRF-Token': $('meta[name="csrf-token"]').attr('content')},
			data: {id: this.model.id}
		});
		this.model.set('room_type', 'public');
	},
	addPasswordForm: function() {
		window.chatRoomsView.displayForm($('#add_room_password_form'));
		$('#add_room_password_form').data('room-id', this.model.id);
	},

	displayUserMenu: function(e) {
		if ($(e.target).siblings('ul.user_menu').is(':hidden')) {
			this.$el.find('ul.user_menu').hide();
			$(e.target).siblings('ul.user_menu').show();
		}
		else
			this.$el.find('ul.user_menu').hide();
	},
	changeBlockedStatus: function(e) {
		const user_id = $(e.target).parent().parent().data('id');
		const blocked = e.target.classList[0] == 'block';
		$.ajax({
			type: 'POST',
			url: '/chat_rooms/change_blocked_status',
			headers: {'X-CSRF-Token': $('meta[name="csrf-token"]').attr('content')},
			data: {
				blocked_user_id: user_id,
				blocked: blocked
			}
		});
		window.chatRoomsView.changeBlockedStatus(user_id, blocked);
	},
	changeAdminStatus: function(e) {
		const user_id = $(e.target).parent().parent().data('id');
		const admin = e.target.classList[0] == 'promote_admin';
		$.ajax({
			type: 'POST',
			url: '/chat_rooms/change_admin_status',
			headers: {'X-CSRF-Token': $('meta[name="csrf-token"]').attr('content')},
			data: {
				room_id: this.model.id,
				user_id: user_id,
				admin: admin
			}
		});
	},
	changeMutedStatus: function(e) {
		const user_id = $(e.target).parent().parent().data('id');
		const muted = e.target.classList[0] == 'mute';
		$.ajax({
			type: 'POST',
			url: '/chat_rooms/change_muted_status',
			headers: {'X-CSRF-Token': $('meta[name="csrf-token"]').attr('content')},
			data: {
				room_id: this.model.id,
				user_id: user_id,
				muted: muted
			}
		});
	},
	ban: function(e) {
		const user_id = $(e.target).parent().parent().data('id');
		$.ajax({
			type: 'POST',
			url: '/chat_bans',
			headers: {'X-CSRF-Token': $('meta[name="csrf-token"]').attr('content')},
			data: {
				chat_room_id: this.model.id,
				user_id: user_id
			}
		});
	}
});

export default ChatRoomView;