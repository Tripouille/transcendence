class UserChannel < ApplicationCable::Channel
	def subscribed
		if current_user
			current_user.update(status: 'online')
			stream_for current_user
		else
			reject
		end
	end

	def unsubscribed
		current_user.update(status: 'offline') if current_user
		stop_stream_for current_user
	end

	def receive(data)
		puts 'data received in channel from ' + current_user.id + ' : ' + data.inspect
	end
end