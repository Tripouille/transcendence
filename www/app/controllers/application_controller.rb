class ApplicationController < ActionController::Base

	before_action :require_login
	before_action :set_online

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

	def set_online
		if current_user and current_user.status == 'offline'
			current_user.update(status: 'online')
		end
	end

end
