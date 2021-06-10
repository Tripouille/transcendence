class AddUserToInvites < ActiveRecord::Migration[6.1]
  def change
    add_reference :invites, :user, null: false, foreign_key: {on_delete: :cascade}
  end
end
