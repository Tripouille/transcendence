class CreateMessages < ActiveRecord::Migration[6.1]
  def change
    create_table :messages do |t|
	  t.belongs_to :author, foreign_key: {to_table: :users}
	  t.belongs_to :chat_room, foreign_key: {to_table: :chat_rooms}
      t.text :content

      t.timestamps
    end
  end
end
