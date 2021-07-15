class CreateAchievments < ActiveRecord::Migration[6.1]
  def change
    create_table :achievments do |t|
      t.string :tag
      t.text :description
      t.timestamps
    end

	create_table :achievments_users do |t|
		t.belongs_to :user
		t.belongs_to :achievment
		t.timestamps
	end
  end
end
