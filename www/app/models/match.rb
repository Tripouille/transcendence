class Match < ApplicationRecord
	belongs_to :left_guild, :class_name => 'Guild', :foreign_key => 'left_guild_id', optional: true
	belongs_to :right_guild, :class_name => 'Guild', :foreign_key => 'right_guild_id', optional: true

	after_save :checkAchievments, if: :saved_change_to_winner

	def checkAchievments
		winner = User.find_by_id(self.winner)
		winner.achievments << Achievment.second
		UserChannel.broadcast_to winner, content: {
			achievment: Achievment.second.description
		}
	end
end
