class CreateMatches < ActiveRecord::Migration[6.1]
  def change
    create_table :matches do |t|
      t.bigint :left_player
      t.bigint :right_player
      t.integer :left_score, :default => 0
      t.integer :right_score, :default => 0
      t.string :status, :default => "lobby"
      t.decimal :left_paddle_y, :default => 50, :precision => 20, :scale => 5
      t.string :left_paddle_dir, :default => "stop"
      t.decimal :right_paddle_y, :default => 50, :precision => 20, :scale => 5
      t.string :right_paddle_dir, :default => "stop"
      t.decimal :ball_x, :default => 50, :precision => 20, :scale => 5
      t.decimal :ball_y, :default => 50, :precision => 20, :scale => 5
      t.decimal :ball_dx, :precision => 20, :scale => 5
      t.decimal :ball_dy, :precision => 20, :scale => 5
      t.decimal :ball_speed, :precision => 20, :scale => 5
      t.decimal :last_update, :precision => 20, :scale => 5

      t.timestamps
    end
  end
end
