class UserChannel < ApplicationCable::Channel
	def subscribed
		if current_user
			current_user.update(status: 'online')
			stream_for current_user
		else
			reject
		end
	end

	def unsubscribed
		current_user.update(status: 'offline') if current_user
		stop_stream_for current_user
	end

	def receive(data)
		puts 'data received in channel from ' + current_user.id.to_s + ' : ' + data.inspect
		if data['challenge'].present?
			createDmRoom(data['challenge'])
		end
	end

	def createDmRoom(user_id)
		user_to_dm = User.find_by_id(user_id)
		chatroom = ChatRoom.where(room_type: "direct_message")
							.where(id: ChatMembership.where(user_id: current_user.id).select(:chat_room_id))
							.where(id: ChatMembership.where(user_id: user_id).select(:chat_room_id))
							.first
		if chatroom
			ChatMembership.where(chat_room_id: chatroom.id, user_id: current_user.id).update(hidden: false)
		else
			chatroom = ChatRoom.new(room_type: "direct_message", owner: current_user)
			chatroom.chat_memberships.build(user_id: current_user.id, admin: false)
			chatroom.chat_memberships.build(user_id: user_id, admin: false, hidden: true)
			chatroom.save
		end
		#mettre message dedans avant ? OUI
		UserChannel.broadcast_to current_user, content: {
			room: complete_room_infos(chatroom)
		}
		# pas de raison de faire le truc ci-dessous si la room est hidden
		UserChannel.broadcast_to user_to_dm, content: {
			room: complete_room_infos(chatroom)
		}
	end

	private
	def complete_room_infos(room)
		last_message = room.messages.order(:created_at).last
		room.as_json(:only => [:id, :owner_id, :name, :room_type])
			.merge(users: room.users
				.order(:username)
				.select(:id, :username, :status, :admin, :muted)
				.map{|user| user.as_json().merge(blocked: BlockedUser.exists?(user_id: current_user.id, blocked_user_id: user.id))})
			.merge(messages: room.messages.includes(:user)
				.order(:created_at)
				.map{|message| message.as_json().merge(username: message.user.username)})
			.merge(newMessages: current_user.chat_memberships.find_by_chat_room_id(room.id).updated_at.to_f \
				< (last_message ? last_message.created_at.to_f : 0.0))
	end
end