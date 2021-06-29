# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 2021_06_29_010126) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "chat_memberships", force: :cascade do |t|
    t.bigint "chat_room_id"
    t.bigint "user_id"
    t.boolean "admin"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.boolean "hidden", default: false
    t.index ["chat_room_id"], name: "index_chat_memberships_on_chat_room_id"
    t.index ["user_id"], name: "index_chat_memberships_on_user_id"
  end

  create_table "chat_rooms", force: :cascade do |t|
    t.bigint "owner_id"
    t.string "name"
    t.string "room_type"
    t.string "password_digest"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["owner_id"], name: "index_chat_rooms_on_owner_id"
  end

  create_table "friendships", force: :cascade do |t|
    t.integer "user_id"
    t.integer "friend_id"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
  end

  create_table "matches", force: :cascade do |t|
    t.bigint "left_player"
    t.bigint "right_player"
    t.integer "left_score", default: 0
    t.integer "right_score", default: 0
    t.bigint "winner"
    t.string "status", default: "lobby"
    t.decimal "left_paddle_y", precision: 20, scale: 5, default: "50.0"
    t.string "left_paddle_dir", default: "stop"
    t.decimal "right_paddle_y", precision: 20, scale: 5, default: "50.0"
    t.string "right_paddle_dir", default: "stop"
    t.decimal "ball_x", precision: 20, scale: 5, default: "50.0"
    t.decimal "ball_y", precision: 20, scale: 5, default: "50.0"
    t.decimal "ball_dx", precision: 20, scale: 5
    t.decimal "ball_dy", precision: 20, scale: 5
    t.decimal "ball_speed", precision: 20, scale: 5
    t.decimal "last_update", precision: 20, scale: 5
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
  end

  create_table "messages", force: :cascade do |t|
    t.bigint "user_id"
    t.bigint "chat_room_id"
    t.text "content"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["chat_room_id"], name: "index_messages_on_chat_room_id"
    t.index ["user_id"], name: "index_messages_on_user_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "username"
    t.string "pictures", default: ""
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.string "email", default: "", null: false
    t.string "login"
    t.string "provider"
    t.string "uid"
    t.string "status"
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["provider"], name: "index_users_on_provider"
    t.index ["uid"], name: "index_users_on_uid"
  end

  add_foreign_key "chat_memberships", "chat_rooms"
  add_foreign_key "chat_memberships", "users"
  add_foreign_key "chat_rooms", "users", column: "owner_id"
  add_foreign_key "messages", "chat_rooms"
  add_foreign_key "messages", "users"
end
