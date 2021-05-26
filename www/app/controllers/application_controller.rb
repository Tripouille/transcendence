class ApplicationController < ActionController::Base

	def index
		@session = session[:user_id]
		
		@users = User.all
		@guilds = Guild.all
	end

end
