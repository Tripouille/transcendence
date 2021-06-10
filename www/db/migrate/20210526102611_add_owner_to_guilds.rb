class AddOwnerToGuilds < ActiveRecord::Migration[6.1]
  def change
    add_reference :guilds, :owner, references: :users, foreign_key: {to_table: :users, on_delete: :cascade}
  end
end
