class AddChallengedToMatches < ActiveRecord::Migration[6.1]
  def change
    add_column :matches, :challenged, :boolean, :default => false
  end
end
