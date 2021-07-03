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
			if params[:name].present?
				user_to_dm = User.find_by("username = ? OR login = ?", params[:name], params[:name])
			elsif params[:user_id].present?
				user_to_dm = User.find_by_id(params[:user_id])
			end
			if not user_to_dm
				render json: {error: "Invalid username"} and return
			end
			chatroom = ChatRoom.where(room_type: "direct_message")
								.where(id: ChatMembership.where(user_id: current_user.id).select(:chat_room_id))
								.where(id: ChatMembership.where(user_id: user_to_dm.id).select(:chat_room_id))
								.first
			if chatroom
				ChatMembership.where(chat_room_id: chatroom.id, user_id: current_user.id).update(hidden: false)
			else
				chatroom = ChatRoom.new(room_type: "direct_message", owner: current_user)
				chatroom.chat_memberships.build(user_id: current_user.id, admin: false)
				chatroom.chat_memberships.build(user_id: user_to_dm.id, admin: false, hidden: true)
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
		elsif chatroom.chat_bans.exists?(user_id: current_user.id)
			render json: {error: "Banned"}
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
		elsif chatroom.chat_bans.exists?(user_id: current_user.id)
			render json: {error: "Banned"}
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
					ChatRoomChannel.broadcast_to chatroom, content: {
						changeOwner: best_membership.user_id
					}
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

	def change_blocked_status
		chatroom = current_user.chat_rooms.find_by_id(params[:room_id])
		user_to_block = User.find_by_id(params[:blocked_user_id])
		if user_to_block and user_to_block != current_user
			blocking = BlockedUser.where(user_id: current_user.id, blocked_user_id: user_to_block.id)
			if params[:blocked] == 'true' and blocking.empty?
				BlockedUser.create(user_id: current_user.id, blocked_user_id: user_to_block.id)
			elsif params[:blocked] == 'false' and not blocking.empty?
				blocking.first.destroy
			end
		end
	end

	def change_admin_status
		chatroom = current_user.chat_rooms.find_by_id(params[:room_id])
		if chatroom.owner == current_user and params[:user_id] != current_user.id
			chatroom.chat_memberships.find_by_user_id(params[:user_id]).update_attribute(:admin, params[:admin])
			ChatRoomChannel.broadcast_to chatroom, content: {
				changeAdminStatus: {id: params[:user_id], admin: params[:admin]}
			}
		end
	end

	def change_muted_status
		chatroom = current_user.chat_rooms.find_by_id(params[:room_id])
		iamadmin = current_user.chat_memberships.find_by_chat_room_id(params[:room_id]).admin
		if iamadmin and params[:user_id] != chatroom.owner_id
			chatroom.chat_memberships.find_by_user_id(params[:user_id]).update_attribute(:muted, params[:muted])
			ChatRoomChannel.broadcast_to chatroom, content: {
				changeMutedStatus: {id: params[:user_id], muted: params[:muted]}
			}
		end
	end

	private
    def chat_room_params
		params.permit(:name, :room_type, :password)
	end

	def complete_room_infos(room)
		last_message = room.messages.order(:created_at).last
		room.as_json(:only => [:id, :owner_id, :name, :room_type])
			.merge(users: room.users
				.order(:username)
				.select(:id, :username, :status, :admin, :muted)
				.map{|user| user.as_json().merge(blocked: BlockedUser.exists?(user_id: current_user.id, blocked_user_id: user.id))})
			.merge(messages: room.messages.includes(:user)
				.order(:created_at)
				.map{|message| message.as_json().merge(
					username: message.user.username
				)})
			.merge(newMessages: current_user.chat_memberships.find_by_chat_room_id(room.id).updated_at.to_f \
				< (last_message ? last_message.created_at.to_f : 0.0))
	end
end
