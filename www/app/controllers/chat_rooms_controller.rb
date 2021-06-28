class ChatRoomsController < ApplicationController

	def index
		rooms = current_user.chat_rooms.order(:name)
		rooms_completed = rooms.map{|room| complete_room_infos(room)}
		render json: rooms_completed
	end

	def create
		if params[:room_type] == 'password_protected' and params[:password].blank?
			head :bad_request and return
		end
		chatroom = ChatRoom.new(chat_room_params)
		chatroom.owner_id = current_user.id
		chatroom.chat_memberships.build(user_id: chatroom.owner.id, admin: true)
		chatroom.save
		render json: complete_room_infos(chatroom)
	end

	def join
		chatroom = ChatRoom.find_by_name(params[:name])
		if not chatroom
			render json: {error: "Invalid room name"}
		elsif chatroom.users.include?(current_user)
			render json: {error: "Already in room"}
		elsif chatroom.password_digest
			render json: {password_needed: true, room_id: chatroom.id}
		else
			chatroom.chat_memberships.build(user_id: current_user.id, admin: false)
			chatroom.save
			render json: {
				password_needed: false,
				room: complete_room_infos(chatroom)
			}
		end
	end

	def join_with_password
		chatroom = ChatRoom.find_by_id(params[:id])
		if not chatroom
			render json: {error: "Invalid room"}
		elsif chatroom.users.include?(current_user)
			render json: {error: "Already in room"}
		elsif not chatroom.authenticate(params[:password])
			render json: {error: "Invalid password"}
		else
			chatroom.chat_memberships.build(user_id: current_user.id, admin: false)
			chatroom.save
			render json: {room: complete_room_infos(chatroom)}
		end
	end

	private
    def chat_room_params
		params.permit(:name, :room_type, :password)
	end

	def complete_room_infos(room)
		room.as_json(:only => [:id, :owner_id, :name, :room_type])
			.merge(users: room.users.where(status: 'online').where.not(id: session[:user_id]).order(:login).select(:id, :login))
			.merge(messages:
				room.messages.includes(:user).order(:created_at).map{|message|
					message.as_json().merge(login: message.user.login)
				}
			)
	end
end
