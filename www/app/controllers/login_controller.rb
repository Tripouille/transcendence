class LoginController < ApplicationController

	skip_before_action :require_login
	before_action :forbiden_login

	def index
		render :layout => 'login'
	end

	private

	def forbiden_login
		@session = session[:user_id]
		if @session
			redirect_to root_path
		end
	end

end
