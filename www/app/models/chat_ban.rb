class ChatBan < ApplicationRecord
	belongs_to :chat_room
	belongs_to :user

	validates_uniqueness_of :user_id, :scope => [:chat_room_id]
end
