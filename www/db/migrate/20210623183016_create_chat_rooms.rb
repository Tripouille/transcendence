class CreateChatRooms < ActiveRecord::Migration[6.1]
  def change
    create_table :chat_rooms do |t|
	  t.belongs_to :owner, foreign_key: {to_table: :users}
	  t.string :name
      t.string :room_type
      t.string :password_digest

      t.timestamps
    end
  end
end
