class ApplicationController < ActionController::Base
	def index
		@session = session[:user_id]
	end
end
