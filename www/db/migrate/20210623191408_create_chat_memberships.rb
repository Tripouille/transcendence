class CreateChatMemberships < ActiveRecord::Migration[6.1]
	def change
	  create_table :chat_memberships do |t|
		t.belongs_to :chat_room, foreign_key: true
		t.belongs_to :user, foreign_key: true
		t.boolean :admin
  
		t.timestamps
	  end
	end
  end
  