class ChatRoomsController < ApplicationController

	def index
		rooms = @user.chat_rooms.order(:name)
		rooms_completed = rooms.map{|room|
			room.as_json(:only => [:id, :owner_id, :name, :room_type])
				.merge(users: room.users.where(status: 'online').where.not(id: session[:user_id]).order(:login).select(:id, :login))
				.merge(messages: room.messages.order(:created_at))
		}
		render json: rooms_completed
	end
end
