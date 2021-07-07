class CreateChatBans < ActiveRecord::Migration[6.1]
  def change
    create_table :chat_bans do |t|
      t.belongs_to :chat_room, foreign_key: true
      t.belongs_to :user, foreign_key: true

      t.timestamps
    end
  end
end
