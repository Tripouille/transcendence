class CreateDuelRequests < ActiveRecord::Migration[6.1]
  def change
    create_table :duel_requests do |t|
		t.belongs_to :user, foreign_key: true
		t.references :opponent, foreign_key: {to_table: :users}
		t.belongs_to :message, foreign_key: true

      t.timestamps
    end
  end
end
