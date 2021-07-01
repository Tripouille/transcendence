class AddGuildToInvites < ActiveRecord::Migration[6.1]
  def change
    add_reference :invites, :guild, null: false, foreign_key: {on_delete: :cascade}
    add_index :invites, [:user_id, :guild_id] , unique: true
  end
end
