class ChatRoom < ApplicationRecord
	has_secure_password :validations => false

	belongs_to :owner, class_name: :User

	has_many :chat_memberships
	has_many :users, through: :chat_memberships

	has_many :messages

	has_many :chat_bans

	validates_uniqueness_of :name, :allow_blank => true
end
