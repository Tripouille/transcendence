class FriendshipsController < ApplicationController

	def create
		friend = User.find_by_login(params[:friend_name])
		if friend
			@user.friendships.create(:friend_id => friend.id)
			render json: {status: 'success'}
		else
			render json: {status: 'error'}
		end
	end

	def all
		render json: @user.friends.order(Arel.sql("status = 'offline', login")).select(:id, :login, :status)
	end

	def remove
		Friendship.where(user_id: session[:user_id]).find_by_friend_id(params[:id]).destroy
	end
end
