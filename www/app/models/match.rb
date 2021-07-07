class Match < ApplicationRecord
	belongs_to :left_guild, :class_name => 'Guild', :foreign_key => 'left_guild_id', optional: true
	belongs_to :right_guild, :class_name => 'Guild', :foreign_key => 'right_guild_id', optional: true
end
