class ApplicationController < ActionController::Base

	before_action :require_login

	def index
		@session = session[:user_id]
	end

	private

	def require_login
		@session = session[:user_id]
		@otp = session[:otp]
		unless @session && @otp
			redirect_to login_path(:anchor => "")
		end
	end

end
