class ApplicationController < ActionController::Base

	before_action :update_last_activity

	def index
		@session = session[:user_id]
	end

	def update_last_activity
		if session[:user_id]
			User.find(session[:user_id]).update(last_activity: DateTime.now)
		end
	end
end
