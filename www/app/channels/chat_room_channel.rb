class ChatRoomChannel < ApplicationCable::Channel
	def subscribed
		@roomId = params["room_id"]
		@chatRoom = ChatRoom.find_by_id(@roomId)
		if @chatRoom
			stream_for @chatRoom
		else
			reject
		end
	end

	def unsubscribed
		stop_stream_for @chatRoom
	end
end