class BlockedUser < ApplicationRecord
	belongs_to :user
	belongs_to :blocked_user, :class_name => 'User', :foreign_key => 'blocked_user_id'
	validates_uniqueness_of :user_id, :scope => [:blocked_user_id]
end
