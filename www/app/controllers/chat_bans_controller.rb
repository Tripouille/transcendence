class ChatBansController < ApplicationController
	def create
		if params[:room_type] == "direct_message" then return end

		chatroom = current_user.chat_rooms.find_by_id(params[:chat_room_id])
		iamadmin = current_user.chat_memberships.find_by_chat_room_id(params[:chat_room_id]).admin
		if iamadmin and params[:user_id] != chatroom.owner_id
			chat_ban = ChatBan.new(chat_ban_params)
			chat_ban.save
			chatroom.chat_memberships.find_by_user_id(params[:user_id]).destroy
			#broadcast : un memberleaving, et un pour informer qu'on a été ban
			# (à défaut de pouvoir couper la connexion proprement)
		end
	end

	private
    def chat_ban_params
		params.permit(:chat_room_id, :user_id)
	end
end