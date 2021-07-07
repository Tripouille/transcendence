class CreateBlockedUsers < ActiveRecord::Migration[6.1]
  def change
    create_table :blocked_users do |t|
      t.belongs_to :user, foreign_key: true
      t.references :blocked_user, foreign_key: {to_table: :users}

      t.timestamps
    end
  end
end
