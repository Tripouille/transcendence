class ApplicationController < ActionController::Base

	before_action :require_login, only: %i[ show edit update destroy ]

	def index
		@session = session[:user_id]
	end

	private

	def require_login
		unless user_signed_in?
		  flash[:error] = "You must be logged in to access this section"
		  redirect_to root_path(:anchor => 'login')
		end
	end
end
