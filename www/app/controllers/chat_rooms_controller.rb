class ChatRoomsController < ApplicationController

	def index
		rooms = @user.chat_rooms.order(:name)
		rooms_completed = rooms.map{|room|
			room.as_json(:only => [:id, :owner_id, :name, :room_type])
				.merge(users: room.users.where(status: 'online').where.not(id: session[:user_id]).order(:login).select(:id, :login))
				.merge(messages:
					room.messages.includes(:user).order(:created_at).map{|message|
						message.as_json()
							.merge(login: message.user.login)
							.merge(mine: message.user_id == @user.id)
					}
				)
		}
		render json: rooms_completed
	end
end
