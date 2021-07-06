class Message < ApplicationRecord
	belongs_to :user
	belongs_to :chat_room

	def complete_infos
		return self.as_json().merge(
			username: self.user.username,
			challenge: DuelRequest.find_by_message_id(self.id)
		)
	end
end
