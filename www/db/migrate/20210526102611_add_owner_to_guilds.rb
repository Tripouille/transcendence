class AddOwnerToGuilds < ActiveRecord::Migration[6.1]
  def change
    add_column :guilds, :owner, :string
  end
end
