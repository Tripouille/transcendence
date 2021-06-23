class OnlineChannel < ApplicationCable::Channel
	def subscribed
		if connection.session[:user_id]
			@user = User.find_by_id(connection.session[:user_id])
			@user.update(status: 'online')
		else
			reject
		end
	end

	def unsubscribed
		@user.update(status: 'offline') if @user
	end
end