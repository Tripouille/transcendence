class Match < ApplicationRecord
	belongs_to :left_guild, :class_name => 'Guild', :foreign_key => 'left_guild_id', optional: true
	belongs_to :right_guild, :class_name => 'Guild', :foreign_key => 'right_guild_id', optional: true

	after_save :checkAchievments, if: :saved_change_to_winner

	def check_top(rank)
		users = User.all.select(:id).with_otp
		if users.size > rank
			@result = users.map{|user| user.as_json.merge({
				score: Match.where(challenged: false, winner: user.id).size,
			})}
			@result.sort_by! { |res| -res[:score] }
			if @result.find_index{ |user| user["id"] == @winner.id} < rank
				return true
			end
		end
	end

	def check_streak(streak)
		if Match.where(left_player: @winner.id)
			.or(Match.where(right_player: @winner.id))
			.order(updated_at: :desc)
			.where(status: "finished", challenged: false)
			.limit(streak)
			.select{ |match| match.winner == @winner.id }
			.size >= streak
			return true
		end
	end

	def checkAchievments
		@winner = User.find_by_id(self.winner)
		checkAchievment(@winner, 'victories_3', Match.where(winner: self.winner, challenged: false).size > 2)
		checkAchievment(@winner, 'victories_20', Match.where(winner: self.winner, challenged: false).size > 19)
		checkAchievment(@winner, 'contribute_10', @winner.guild_id.present? && Match.where(left_player: @winner.id, left_guild_id: @winner.guild_id)
																					.or(Match.where(right_player: @winner.id, right_guild_id: @winner.guild_id))
																					.where("left_guild_id IS DISTINCT FROM right_guild_id")
																					.where(winner: @winner.id, challenged: false, status: "finished").size > 9)
		checkAchievment(@winner, 'challenge_1', Match.where(winner: self.winner, challenged: true).size > 0)
		checkAchievment(@winner, 'be_first', check_top(1))
		checkAchievment(@winner, 'be_top_3', check_top(3))
		checkAchievment(@winner, '3_winning_streak', check_streak(3))
		checkAchievment(@winner, '10_winning_streak', check_streak(10))
	end
end
