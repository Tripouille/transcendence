class MatchesController < ApplicationController

	def matchmaking
		matches = Match.order(:created_at).where('left_player is null or right_player is null').limit(1)
		if matches.blank?
			match = Match.new(left_player: session[:user_id])
		else
			match = matches.first
			if match["left_player"].nil?
				match["left_player"] = session[:user_id]
			else
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
end