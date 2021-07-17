class ApplicationController < ActionController::Base

	before_action :require_login
	before_action :set_online

	def index
		@session = session[:user_id]
	end

	private

	def require_login
		@session = session[:user_id]
		@otp = session[:otp]
		unless @session && @otp
			redirect_to login_path(:anchor => "")
		else
			@current_user = User.find(session[:user_id])
		end
	end

	def set_online
		if current_user and current_user.status == 'offline'
			current_user.update(status: 'online')
		end
	end

end
