class OnlineChannel < ApplicationCable::Channel
	def subscribed
		@user = User.find_by_id(connection.session[:user_id])
		if @user
			@user.update(status: 'online')
			stream_for @user
		else
			reject
		end
	end

	def unsubscribed
		@user.update(status: 'offline') if @user
		stop_stream_for @user
	end

	def receive(data)
		puts 'data received in channel for ' + @user.id + ' : ' + data.inspect
	end
end