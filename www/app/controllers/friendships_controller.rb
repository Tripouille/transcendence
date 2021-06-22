class FriendshipsController < ApplicationController

	def create
		friend = User.find_by_login(params[:friend_name])
		if friend
			User.find_by_id(session[:user_id]).friendships.build(:friend_id => friend.id).save
			render json: {status: 'success'}
		else
			render json: {status: 'error'}
		end
	end

	def all
		friends = User.find_by_id(session[:user_id]).friendships.pluck(:friend_id)
		render json: User.where(id: friends).select(:id, :login)
	end
end
