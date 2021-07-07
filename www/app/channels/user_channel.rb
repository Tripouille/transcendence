class UserChannel < ApplicationCable::Channel
	def subscribed
		@schedulers = {}
		if current_user
			stream_for current_user
			current_user.update(status: 'online')
			Friendship.where(friend: current_user).each do |friendship|
				UserChannel.broadcast_to friendship.user, content: {
					friend_id: current_user.id,
					friend_status: 'online'
				}
			end
		else
			reject
		end
	end

	def unsubscribed
		current_user.update(status: 'offline')
		DuelRequest.where(user: current_user).each do |duel_request|
			UserChannel.broadcast_to duel_request.opponent, content: {
				remove_challenge: true,
				reason: 'canceled',
				chatroom_id: duel_request.message.chat_room.id,
				message_id: duel_request.message.id
			}
			duel_request.destroy
		end
		Friendship.where(friend: current_user).each do |friendship|
			UserChannel.broadcast_to friendship.user, content: {
				friend_id: current_user.id,
				friend_status: 'offline'
			}
		end
		stop_stream_for current_user
	end

	def receive(data)
		#puts 'data received in channel from ' + current_user.id.to_s + ' : ' + data.inspect
		if data['challenge'].present? and data['challenge'] != current_user.id.to_s
			challenge(data['challenge'])
		end
	end

	def challenge(user_id)
		duelrequest = DuelRequest.find_by(user_id: current_user.id, opponent_id: user_id)
		duelrequest2 = DuelRequest.find_by(user_id: user_id, opponent_id: current_user.id)
		if duelrequest or duelrequest2 then return end

		message = saveChallengeMessage(user_id)
		@duelrequest = DuelRequest.create(user_id: current_user.id, opponent_id: user_id, message_id: message.id)
		ChatRoomChannel.broadcast_to message.chat_room, content: {
			message: message.complete_infos
		}
		UserChannel.broadcast_to current_user, content: {
			chatroom: message.chat_room.complete_infos(current_user)
		}
		UserChannel.broadcast_to User.find_by_id(user_id), content: {
			chatroom: message.chat_room.complete_infos(current_user)
		}

		@schedulers[:challenge] = Rufus::Scheduler.new.schedule_in '60s' do
			@duelrequest.destroy
		end
	end

	def generateChallengeMessage
		message_content = \
		'<div class="challenge">
			<div class="challenge_intro">Duel request (Expired)</div>
		</div>'
		message_record = Message.new(user_id: current_user.id, content: message_content)
		return message_record
	end

	def saveChallengeMessage(user_id)
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
		else
			chatroom = ChatRoom.new(room_type: "direct_message", owner: current_user)
			chatroom.chat_memberships.build(user_id: current_user.id, admin: false)
			chatroom.chat_memberships.build(user_id: user_id, admin: false, hidden: false)
			chatroom.messages << message
			chatroom.save
		end
		return message
	end
end