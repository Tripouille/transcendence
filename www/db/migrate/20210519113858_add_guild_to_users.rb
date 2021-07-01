class AddGuildToUsers < ActiveRecord::Migration[6.1]
  def change
    add_reference :users, :guild, foreign_key: {on_delete: :nullify}
  end
end
