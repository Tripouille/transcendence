class AddStatusToUsers < ActiveRecord::Migration[6.1]
  def change
    add_column :users, :status, :string
    add_column :users, :last_activity, :datetime
  end
end
