class ChatRoomChannel < ApplicationCable::Channel
	def subscribed
		@roomId = params["room_id"]
		@chatRoom = ChatRoom.find_by_id(@roomId)
		if @chatRoom and current_user
			stream_for @chatRoom

			ChatRoomChannel.broadcast_to @chatRoom, content: {
				newMember: {
					id: current_user.id,
					username: current_user.username,
					status: current_user.status == 'offline' ? 'online' : current_user.status,
					admin: @chatRoom.chat_memberships.find_by_user_id(current_user.id).admin
				}
			}
		else
			reject
		end
	end

	def unsubscribed
		ChatRoomChannel.broadcast_to @chatRoom, content: {
			memberLeaving: current_user.id
		}
		stop_stream_for @chatRoom
	end

	def receive(data)
		if data['content'].present?
			membership = current_user.chat_memberships.find_by_chat_room_id(@roomId)
			if not membership or membership.muted then return end

			message = ActionController::Base.helpers.strip_tags(data['content'])
			message_record = Message.new(user_id: current_user.id, content: message)
			@chatRoom.messages << message_record
			@chatRoom.save
			ChatRoomChannel.broadcast_to @chatRoom, content: {
				message: message_record.as_json().merge(username: message_record.user.username)
			}
			if @chatRoom.room_type == 'direct_message'
				membership = @chatRoom.chat_memberships.where.not(user_id: current_user.id).first
				if membership.hidden
					membership.update_attribute(:hidden, false)
					UserChannel.broadcast_to membership.user, content: {
						room: complete_room_infos(@chatRoom)
					}
				end
			end
		end

		current_user.chat_memberships.find_by_chat_room_id(@roomId).touch
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