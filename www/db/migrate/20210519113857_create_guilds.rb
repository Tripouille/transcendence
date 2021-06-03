class CreateGuilds < ActiveRecord::Migration[6.1]
  def change
    create_table :guilds do |t|
      t.string :name
      t.string :anagram, limit: 5
      t.integer :score, default: 0

      t.timestamps
    end
    add_index :guilds, :name, unique: true
    add_index :guilds, :anagram, unique: true
  end
end
