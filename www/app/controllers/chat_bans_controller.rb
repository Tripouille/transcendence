class ChatBansController < ApplicationController
	def create
		if params[:room_type] == "direct_message" then return end

		chatroom = current_user.chat_rooms.find_by_id(params[:chat_room_id])
		iamadmin = current_user.chat_memberships.find_by_chat_room_id(params[:chat_room_id]).admin
		user_to_ban = User.find_by_id(params[:user_id])
		if iamadmin and user_to_ban and user_to_ban != chatroom.owner
			chat_ban = ChatBan.new(chat_ban_params)
			chat_ban.save
			chatroom.chat_memberships.find_by_user_id(user_to_ban.id).destroy
			UserChannel.broadcast_to user_to_ban, content: {
				chat_ban: chatroom.id
			}
		end
	end

	private
    def chat_ban_params
		params.permit(:chat_room_id, :user_id)
	end
end