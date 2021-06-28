class ChatRoomsController < ApplicationController

	def index
		rooms = current_user.chat_rooms.order(:name)
		rooms_completed = rooms.map{|room|
			room.as_json(:only => [:id, :owner_id, :name, :room_type])
				.merge(users: room.users.where(status: 'online').where.not(id: session[:user_id]).order(:login).select(:id, :login))
				.merge(messages:
					room.messages.includes(:user).order(:created_at).map{|message|
						message.as_json().merge(login: message.user.login)
					}
				)
		}
		render json: rooms_completed
	end

	def create
		if params[:room_type] == 'password_protected' and params[:password].blank?
			render status: bad_request
			return
		end
		chatroom = ChatRoom.new(chat_room_params)
		chatroom.owner_id = current_user.id
		chatroom.chat_memberships.build(user_id: chatroom.owner.id, admin: true)
		chatroom.save
		room_completed = chatroom.as_json(:only => [:id, :owner_id, :name, :room_type])
							.merge(users: chatroom.users.where(status: 'online').where.not(id: session[:user_id]).order(:login).select(:id, :login))
							.merge(messages: [])
		render json: room_completed
	end

	private
    def chat_room_params
		params.permit(:name, :room_type, :password)
	end
end
