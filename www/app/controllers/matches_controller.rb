class MatchesController < ApplicationController

	def matchmaking
		matches = Match.order(:created_at).where('left_player is null or right_player is null').limit(1)
		puts matches.inspect
		if matches.blank?
			match = Match.new(left_player: 1)
		else
			match = matches.first
			if match["left_player"].nil?
				match["left_player"] = 1
			else
				match["right_player"] = 2
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