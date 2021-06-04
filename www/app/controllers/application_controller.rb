class ApplicationController < ActionController::Base

	before_action :require_login

	def index
		@session = session[:user_id]
	end

	private

	def require_login
		@session = session[:user_id]
		unless @session
			unless flash[:redirect] == "Redirect login"
				flash[:redirect] = "Redirect login"
				flash[:error] = "You must be logged in to access this section"
				redirect_to root_path(:anchor => 'login')
			end
		end
	end
end
