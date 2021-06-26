class FriendshipsController < ApplicationController

	def create
		friend = User.find_by_login(params[:friend_name])
		if friend
			User.find_by_id(session[:user_id]).friendships.create(:friend_id => friend.id)
			render json: {status: 'success'}
		else
			render json: {status: 'error'}
		end
	end

	def all
		friends_ids = User.find_by_id(session[:user_id]).friendships.pluck(:friend_id)
		friends = User.where(id: friends_ids)
		render json: friends.select(:id, :login, :status)
	end

	def remove
		Friendship.where(user_id: session[:user_id]).find_by_friend_id(params[:id]).destroy
	end
end
