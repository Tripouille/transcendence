class AddGuildToUsers < ActiveRecord::Migration[6.1]
  def change
    add_reference :users, :guild, null: false, foreign_key: true
  end
end
