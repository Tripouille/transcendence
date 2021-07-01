class CreateUsers < ActiveRecord::Migration[6.1]
  def change
    create_table :users do |t|
      t.string :username,                       null: false, default: ""
      t.string :pictures,                       default: "https://images.all-free-download.com/images/graphiclarge/default_profile_picture_117087.jpg"
      t.string :encrypted_password,             null: false, default: "123456789"

      t.timestamps                              null:false
    end
    add_index :users, :username,                unique: true
  end
end
