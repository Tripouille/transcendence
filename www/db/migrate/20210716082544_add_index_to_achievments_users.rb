class AddIndexToAchievmentsUsers < ActiveRecord::Migration[6.1]
  def change
	add_index :achievments_users, [ :user_id, :achievment_id ], :unique => true, :name => 'by_achievment_and_user'
  end
end
