class FriendshipsController < ApplicationController

	def create
		friend = User.find_by("username = ? OR login = ?", params[:friend_name], params[:friend_name])
		if friend and friend != current_user
			current_user.friendships.create(:friend_id => friend.id)
			render json: {status: 'success'}
		else
			render json: {status: 'error'}
		end
	end

	def all
		render json: current_user.friends.order(Arel.sql("status = 'offline', username"))
								.select(:id, :username, :status)
								.with_otp
								.map{|friend| friend.as_json().merge(
									match_id: Match.order(created_at: :desc)
													.where('left_player = ? OR right_player = ?', friend.id, friend.id)
													.where.not(status: 'finished')
													.pick(:id)
								)}
	end

	def remove
		Friendship.where(user_id: session[:user_id]).find_by_friend_id(params[:id]).destroy
	end
end
