class ApplicationController < ActionController::Base

	before_action :require_login

	def index # A voir pour supprimer
		@session = session[:user_id]
	end

	private

	def require_login
		@session = session[:user_id]
		unless @session
			redirect_to login_path
		end
	end

end
