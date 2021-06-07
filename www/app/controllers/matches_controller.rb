class MatchesController < ApplicationController

	def matchmaking
		if session[:user_id].blank? then return render json: nil, status: :unauthorized end
		matches = Match.order(:created_at).where('left_player is null or right_player is null')
		if matches.blank?
			match = Match.new(left_player: session[:user_id])
		else
			match = matches.first
			if match["left_player"].nil? and match["right_player"] != session[:user_id]
				match["left_player"] = session[:user_id]
			elsif match["right_player"].nil? and match["left_player"] != session[:user_id]
				match["right_player"] = session[:user_id]
			end
		end
		match.save
		render json: match
	end

	def show
		match = Match.find(params[:id])
		render json: match
	end

	def side
		match = Match.find(params[:id])
		answer = {status: match[:status]}
		if match[:left_player] == session[:user_id]
			answer[:side] = "left"
		elsif match[:right_player] == session[:user_id]
			answer[:side] = "right"
		else
			answer[:side] = "unknown"
		end
		render json: answer
	end

	# def alreadyingame
	# 	if session[:user_id].blank? then return render json: nil, status: :unauthorized end
	# 	matches = Match.order(:created_at)
	# 			.where('(left_player = ' + session[:user_id].to_s + ' and right_player is not null)'\
	# 			' or (right_player = ' + session[:user_id].to_s + ' and left_player is not null)')
	# 			.where.not(status: "finished")
	# 	if matches.blank?
	# 		puts "render nil"
	# 		render json: nil
	# 	else
	# 		puts matches.first.inspect
	# 		render json: matches.first
	# 	end
	# end
end