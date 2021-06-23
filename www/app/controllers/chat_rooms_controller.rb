class ChatRoomsController < ApplicationController

	before_action :set_user

	def index
		rooms = @user.chat_rooms
		rooms_with_users = rooms.map{|room| [room, room.users]}
		render json: rooms_with_users
	end

	private
	def set_user
		@user = User.find_by_id(session[:user_id])
	end
end
