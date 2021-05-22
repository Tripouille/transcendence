class CreateUsers < ActiveRecord::Migration[6.1]
  def change
    create_table :users do |t|
      t.string :username,                       null: false, default: ""
      t.string :pictures,                       default: ""

      t.timestamps                              null:false
    end
    add_index :users, :username,                unique: true
  end
end
