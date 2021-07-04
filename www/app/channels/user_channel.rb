class UserChannel < ApplicationCable::Channel
	def subscribed
		@schedulers = {}
		if current_user
			current_user.update(status: 'online')
			stream_for current_user
		else
			reject
		end
	end

	def unsubscribed
		current_user.update(status: 'offline') if current_user
		current_user.duel_requests.destroy_all
		stop_stream_for current_user
	end

	def receive(data)
		#puts 'data received in channel from ' + current_user.id.to_s + ' : ' + data.inspect
		if data['challenge'].present?
			challenge(data['challenge'])
		end
	end

	def challenge(user_id)
		duelrequest = DuelRequest.find_by(user_id: current_user.id, opponent_id: user_id)
		if duelrequest then return end

		message_id = sendChallengeMessage(user_id)
		duelrequest = DuelRequest.create(user_id: current_user.id, opponent_id: user_id, message_id: message_id)

		@schedulers[:challenge] = Rufus::Scheduler.new.schedule_in '5s' do
			duelrequest.destroy
		end
	end

	def generateChallengeMessage
		message_content = '
		<div class="challenge">
			<div class="challenge_intro">Duel request (<span class="time_left"></span>)</div>
			<div class="challenge_answers">
				<div class="challenge_answer accept">Accept</div>
				<div class="challenge_answer decline">Decline</div>
			</div>
		</div>'
		message_record = Message.new(user_id: current_user.id, content: message_content)
		return message_record
	end

	def sendChallengeMessage(user_id)
		message = generateChallengeMessage()
		chatroom = ChatRoom.where(room_type: "direct_message")
							.where(id: ChatMembership.where(user_id: current_user.id).select(:chat_room_id))
							.where(id: ChatMembership.where(user_id: user_id).select(:chat_room_id))
							.first
		if chatroom
			ChatMembership.where(chat_room_id: chatroom.id, user_id: current_user.id).update(hidden: false)
			ChatMembership.where(chat_room_id: chatroom.id, user_id: user_id).update(hidden: false)
			chatroom.messages << message
			chatroom.save
			ChatRoomChannel.broadcast_to chatroom, content: {
				message: message.as_json().merge(username: message.user.username)
			}
		else
			chatroom = ChatRoom.new(room_type: "direct_message", owner: current_user)
			chatroom.chat_memberships.build(user_id: current_user.id, admin: false)
			chatroom.chat_memberships.build(user_id: user_id, admin: false, hidden: false)
			chatroom.messages << message
			chatroom.save
		end
		UserChannel.broadcast_to current_user, content: {
			chatroom: complete_room_infos(chatroom)
		}
		UserChannel.broadcast_to User.find_by_id(user_id), content: {
			chatroom: complete_room_infos(chatroom)
		}
		return message.id
	end

	private
	def complete_room_infos(room)
		last_message = room.messages.order(:created_at).last
		room.as_json(:only => [:id, :owner_id, :name, :room_type])
			.merge(users: room.users
				.order(:username)
				.select(:id, :username, :status, :admin, :muted)
				.map{|user| user.as_json().merge(blocked: BlockedUser.exists?(user_id: current_user.id, blocked_user_id: user.id))})
			.merge(messages: room.messages.includes(:user)
				.order(:created_at)
				.map{|message| message.as_json().merge(username: message.user.username)})
			.merge(newMessages: current_user.chat_memberships.find_by_chat_room_id(room.id).updated_at.to_f \
				< (last_message ? last_message.created_at.to_f : 0.0))
	end
end