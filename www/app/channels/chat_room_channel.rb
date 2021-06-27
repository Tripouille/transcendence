class ChatRoomChannel < ApplicationCable::Channel
	def subscribed
		@roomId = params["room_id"]
		@chatRoom = ChatRoom.find_by_id(@roomId)
		if @chatRoom and connection.session[:user_id]
			@user = User.find_by_id(connection.session[:user_id])
			stream_for @chatRoom
		else
			reject
		end
	end

	def unsubscribed
		stop_stream_for @chatRoom
	end

	def receive(data)
		puts 'received ' + data.inspect
		message = ActionController::Base.helpers.strip_tags(data['message'])
		message_record = Message.new(user_id: @user.id, content: message)
		@chatRoom.messages << message_record
		@chatRoom.save
		ChatRoomChannel.broadcast_to @chatRoom, content: {
			message: message_record.as_json().merge(login: message_record.user.login)
		}
	end
end