class ChatRoom < ApplicationRecord
	belongs_to :owner, class_name: :User
	has_many :chat_memberships
	has_many :members, class_name: :User, through: :chat_memberships
end
