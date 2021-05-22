class CreateMatches < ActiveRecord::Migration[6.1]
  def change
    create_table :matches do |t|
      t.bigint :left_player
      t.bigint :right_player
      t.integer :left_score, :default => 0
      t.integer :right_score, :default => 0
      t.string :status, :default => "lobby"
      t.decimal :left_paddle_y, :default => 50
      t.string :left_paddle_dir, :default => "stop"
      t.decimal :right_paddle_y, :default => 50
      t.string :right_paddle_dir, :default => "stop"
      t.decimal :ball_x, :default => 50
      t.decimal :ball_y, :default => 50
      t.decimal :ball_dx
      t.decimal :ball_dy
      t.decimal :ball_speed
      t.decimal :last_update

      t.timestamps
    end
  end
end
