class ChatRoomsController < ApplicationController

	def index
		rooms = current_user.chat_rooms.order(:name).joins(:chat_memberships).where('chat_memberships.hidden = false')
		rooms_completed = rooms.map{|room| complete_room_infos(room)}
		render json: rooms_completed
	end

	def create
		if params[:room_type] == 'password_protected' and params[:password].blank?
			head :bad_request and return
		end
		if params[:room_type] == "direct_message"
			user_to_dm = User.find_by("username = ? OR login = ?", params[:name], params[:name])
			if not user_to_dm
				render json: {error: "Invalid username"} and return
			end
			chatroom = ChatRoom.where(room_type: "direct_message")
								.where(id: ChatMembership.where(user_id: current_user.id).select(:chat_room_id)) #where(id: current_user.chat_memberships.select(:chat_room_id)) ?
								.where(id: ChatMembership.where(user_id: user_to_dm.id).select(:chat_room_id))
								.first
			if chatroom
				ChatMembership.where(chat_room_id: chatroom.id, user_id: current_user.id).update(hidden: false)
			else
				chatroom = ChatRoom.new(room_type: "direct_message", owner: current_user)
				chatroom.chat_memberships.build(user_id: current_user.id, admin: false)
				chatroom.chat_memberships.build(user_id: user_to_dm.id, admin: false)
				chatroom.save
			end
			render json: {room: complete_room_infos(chatroom)}
		else
			chatroom = ChatRoom.new(chat_room_params)
			chatroom.owner_id = current_user.id
			chatroom.chat_memberships.build(user_id: chatroom.owner.id, admin: true)
			if chatroom.save
				render json: {room: complete_room_infos(chatroom)}
			else
				render json: {error: "Room name already taken"}
			end
		end
	end

	def join
		chatroom = ChatRoom.where.not(room_type: "direct_message").find_by_name(params[:name])
		if not chatroom
			render json: {error: "Invalid room name"}
		elsif chatroom.users.include?(current_user)
			render json: {error: "Already in room"}
		elsif chatroom.room_type == 'password_protected' and chatroom.owner != current_user
			render json: {password_needed: true, room_id: chatroom.id}
		else
			chatroom.chat_memberships.build(user_id: current_user.id, admin: chatroom.owner == current_user)
			chatroom.save
			render json: {
				password_needed: false,
				room: complete_room_infos(chatroom)
			}
		end
	end

	def join_with_password
		chatroom = ChatRoom.where(room_type: "password_protected").find_by_id(params[:id])
		if not chatroom
			render json: {error: "Invalid room"}
		elsif chatroom.users.include?(current_user)
			render json: {error: "Already in room"}
		elsif not chatroom.authenticate(params[:password])
			render json: {error: "Invalid password"}
		else
			chatroom.chat_memberships.build(user_id: current_user.id, admin: chatroom.owner == current_user)
			chatroom.save
			render json: {room: complete_room_infos(chatroom)}
		end
	end

	def leave
		chatroom = current_user.chat_rooms.find_by_id(params[:id])
		chat_membership = chatroom.chat_memberships.find_by_user_id(current_user.id)
		if chatroom.room_type == 'direct_message'
			chat_membership.update(hidden: true)
		else
			chat_membership.destroy
			if chatroom.owner == current_user
				best_membership = chatroom.chat_memberships.order(admin: :desc, created_at: :asc).first
				if best_membership
					best_membership.update_attribute(:admin, true)
					chatroom.update_attribute(:owner, best_membership.user)
				end
			end
		end
	end

	def remove_password
		chatroom = current_user.chat_rooms.where(room_type: "password_protected").find_by_id(params[:id])
		if chatroom.owner == current_user
			chatroom.update_attribute(:room_type, 'public')
		end
	end

	def add_password
		chatroom = current_user.chat_rooms.find_by_id(params[:id])
		if chatroom.owner == current_user
			if chatroom.room_type == 'public' #add
				chatroom.room_type = 'password_protected'
				chatroom.password = params[:password]
			elsif chatroom.room_type == 'password_protected' #change
				chatroom.password = params[:password]
			end
			chatroom.save
		end
	end

	def change_admin_status
		chatroom = current_user.chat_rooms.find_by_id(params[:room_id])
		if chatroom.owner == current_user and params[:user_id] != current_user.id
			chatroom.chat_memberships.find_by_user_id(params[:user_id]).update_attribute(:admin, params[:admin])
		end
	end

	private
    def chat_room_params
		params.permit(:name, :room_type, :password)
	end

	def complete_room_infos(room)
		room.as_json(:only => [:id, :owner_id, :name, :room_type])
			.merge(users: room.users
				.order(:login)
				.select(:id, :login, :status, :admin))
			.merge(messages: room.messages.includes(:user)
					.order(:created_at)
					.map{|message| message.as_json().merge(login: message.user.login)})
	end
end
