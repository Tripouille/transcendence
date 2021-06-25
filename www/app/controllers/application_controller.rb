class ApplicationController < ActionController::Base

	before_action :set_user

	def index
		@session = session[:user_id]
	end

	private
	def set_user
		@user = User.find_by_id(session[:user_id])
	end
end
