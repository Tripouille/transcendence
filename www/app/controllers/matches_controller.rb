class MatchesController < ApplicationController

	def matchmaking
		cancel_all_challenges()
		matches = Match.order(:created_at).where('left_player is null or right_player is null')
		if matches.blank?
			match = Match.new(left_player: current_user.id, left_guild: current_user.guild)
		else
			match = matches.first
			if match["left_player"].nil? and match["right_player"] != current_user.id
				match["left_player"] = current_user.id
				match["left_guild_id"] = current_user.guild_id
			elsif match["right_player"].nil? and match["left_player"] != current_user.id
				match["right_player"] = current_user.id
				match["right_guild_id"] = current_user.guild_id
			end
		end
		match.save
		render json: {
			match_id: match.id,
			left_player: User.select(:id, :username).with_otp.find_by_id(match.left_player),
			right_player: User.select(:id, :username).with_otp.find_by_id(match.right_player)
		}
	end

	def cancel_matchmaking
		Match.where(status: 'lobby')
			.where('left_player = ? or right_player = ?', current_user.id, current_user.id)
			.delete_all
		head :ok
	end

	def show
		match = Match.find(params[:id])
		render json: {
			match_id: match.id,
			left_player: User.select(:id, :username).with_otp.find_by_id(match.left_player),
			right_player: User.select(:id, :username).with_otp.find_by_id(match.right_player)
		}
	end

	def side
		match = Match.find(params[:id])
		answer = {status: match[:status]}
		if match[:left_player] == current_user.id
			answer[:side] = "left"
		elsif match[:right_player] == current_user.id
			answer[:side] = "right"
		else
			answer[:side] = "unknown"
		end
		render json: answer
	end

	def cancel_all_challenges
		DuelRequest.where(user: current_user).each do |duel_request|
			puts duel_request.inspect
			UserChannel.broadcast_to current_user, content: {
				remove_challenge: true,
				reason: 'canceled',
				chatroom_id: duel_request.message.chat_room.id,
				message_id: duel_request.message.id
			}
			UserChannel.broadcast_to duel_request.opponent, content: {
				remove_challenge: true,
				reason: 'canceled',
				chatroom_id: duel_request.message.chat_room.id,
				message_id: duel_request.message.id
			}
			duel_request.destroy
		end
	end
	
	def answer_challenge
		duel_request = DuelRequest.find_by_message_id(params['message_id'])
		if duel_request
			case params[:answer]
			when 'accepted'
				accept_challenge()
			when 'declined'
				decline_challenge()
			when 'canceled'
				cancel_challenge()
			end
		end
	end

	def accept_challenge
		duel_request = DuelRequest.find_by_message_id(params['message_id'])
		if duel_request.opponent == current_user
			duel_request.destroy
			cancel_all_challenges
			match = Match.create(
				left_player: duel_request.user_id,
				left_guild: duel_request.user.guild,
				right_player: duel_request.opponent_id,
				right_guild: duel_request.opponent.guild,
				challenged: true
			)
			UserChannel.broadcast_to duel_request.user, content: {
				remove_challenge: true,
				match_id: match.id,
				reason: 'accepted',
				chatroom_id: duel_request.message.chat_room.id,
				message_id: duel_request.message.id
			}
			render json: {
				match_id: match.id,
				chatroom_id: duel_request.message.chat_room.id,
				message_id: duel_request.message.id
			}
		else
			render json: {error: "Bad request"}
		end
	end

	def decline_challenge
		duel_request = DuelRequest.find_by_message_id(params['message_id'])
		if duel_request.opponent == current_user
			duel_request.destroy
			UserChannel.broadcast_to duel_request.user, content: {
				remove_challenge: true,
				reason: 'declined',
				chatroom_id: duel_request.message.chat_room.id,
				message_id: duel_request.message.id
			}
			render json: {
				chatroom_id: duel_request.message.chat_room.id,
				message_id: duel_request.message.id
			}
		else
			render json: {error: "Bad request"}
		end
	end

	def cancel_challenge
		duel_request = DuelRequest.find_by_message_id(params['message_id'])
		if duel_request.user == current_user
			duel_request.destroy
			UserChannel.broadcast_to duel_request.opponent, content: {
				remove_challenge: true,
				reason: 'canceled',
				chatroom_id: duel_request.message.chat_room.id,
				message_id: duel_request.message.id
			}
			render json: {
				chatroom_id: duel_request.message.chat_room.id,
				message_id: duel_request.message.id
			}
		else
			render json: {error: "Bad request"}
		end
	end
end