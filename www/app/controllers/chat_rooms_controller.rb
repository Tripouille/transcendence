class ChatRoomsController < ApplicationController

	before_action :set_user

	def index
		rooms = @user.chat_rooms
		puts rooms.inspect
		render json: rooms
		# friends_ids = User.find_by_id(session[:user_id]).friendships.pluck(:friend_id)
		# friends = User.where(id: friends_ids)
		# render json: friends.select(:id, :login, :status)
	end

	private
	def set_user
		@user = User.find_by_id(session[:user_id])
	end
end
