class DuelRequest < ApplicationRecord
	belongs_to :user
	belongs_to :opponent, :class_name => 'User', :foreign_key => 'opponent_id'
	belongs_to :message
	validates_uniqueness_of :user_id, :scope => [:opponent_id]
end
