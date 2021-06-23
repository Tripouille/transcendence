class ChatMembership < ApplicationRecord
  belongs_to :room, class_name: :ChatRoom
  belongs_to :user
end
