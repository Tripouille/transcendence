class ChatRoomChannel < ApplicationCable::Channel
	def subscribed
		@roomId = params["room_id"]
		@chatRoom = ChatRoom.find_by_id(@roomId)
		if @chatRoom and connection.session[:user_id]
			@user = User.find_by_id(connection.session[:user_id])
			stream_for @chatRoom

			puts 'broadcasting to room ' + @chatRoom.name + ' the connection of ' + @user.login
			ChatRoomChannel.broadcast_to @chatRoom, content: {
				newMember: {
					id: @user.id,
					login: @user.login,
					status: @user.status == 'offline' ? 'online' : @user.status,
					admin: @chatRoom.chat_memberships.find_by_user_id(@user.id).admin
				}
			}
		else
			reject
		end
	end

	def unsubscribed
		ChatRoomChannel.broadcast_to @chatRoom, content: {
			memberLeaving: @user.id
		}
	end

	def receive(data)
		message = ActionController::Base.helpers.strip_tags(data['content'])
		message_record = Message.new(user_id: @user.id, content: message)
		@chatRoom.messages << message_record
		@chatRoom.save
		ChatRoomChannel.broadcast_to @chatRoom, content: {
			message: message_record.as_json().merge(login: message_record.user.login)
		}
		if @chatRoom.room_type == 'direct_message'
			membership = @chatRoom.chat_memberships.where.not(user_id: @user.id).first
			if membership.hidden
				membership.update_attribute(:hidden, false)
				UserChannel.broadcast_to membership.user, content: {
					room: complete_room_infos(@chatRoom)
				}
			end
		end
	end

	private
	def complete_room_infos(room)
		room.as_json(:only => [:id, :owner_id, :name, :room_type])
			.merge(users: room.users
				.order(:login)
				.select(:id, :login, :status, :admin))
			.merge(messages: room.messages.includes(:user)
					.order(:created_at)
					.map{|message| message.as_json().merge(login: message.user.login)})
	end
end