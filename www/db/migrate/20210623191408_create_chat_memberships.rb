class CreateChatMemberships < ActiveRecord::Migration[6.1]
  def change
    create_table :chat_memberships do |t|
	  t.belongs_to :room, foreign_key: {to_table: :chat_rooms}
	  t.belongs_to :user, foreign_key: true
	  t.boolean :admin

      t.timestamps
    end
  end
end
