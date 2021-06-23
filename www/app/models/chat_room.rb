class ChatRoom < ApplicationRecord
	belongs_to :owner, class_name: :User
	has_many :chat_memberships
	has_many :users, through: :chat_memberships
end
