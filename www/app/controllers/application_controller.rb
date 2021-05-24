class ApplicationController < ActionController::Base

	def index
		@session = session[:user_id]
		@guilds = Guild.all
	end

end
