class ChatRoom < ApplicationRecord
	has_secure_password :validations => false

	belongs_to :owner, class_name: :User

	has_many :chat_memberships
	has_many :users, through: :chat_memberships

	has_many :messages

	has_many :chat_bans

	validates_uniqueness_of :name, :allow_blank => true

	def complete_infos(current_user)
		last_message = self.messages.order(:created_at).last
		return self.as_json(:only => [:id, :owner_id, :name, :room_type])
				.merge(users: self.users
						.order(:username)
						.select(:id, :username, :status, :admin, :muted).with_otp
						.map{|user| user.as_json().merge(
							blocked: BlockedUser.exists?(user_id: current_user.id, blocked_user_id: user.id)
						)})
				.merge(messages: self.messages.includes(:user)
						.order(:created_at)
						.map{|message| message.complete_infos})
				.merge(newMessages: current_user.chat_memberships.find_by_chat_room_id(self.id).updated_at.to_f \
							< (last_message ? last_message.created_at.to_f : 0.0))
	end
end
