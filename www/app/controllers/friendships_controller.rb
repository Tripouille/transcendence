class FriendshipsController < ApplicationController

	def create
		session[:user].friendships.build(:friend_id => params[:friend_id]).save
		User.find_by_id(params[:friend_id]).friendships.build(:friend_id => session[:user_id]).save
	end

	def all
		render json: User.find_by_id(session[:user_id]).friendships
	end
end
