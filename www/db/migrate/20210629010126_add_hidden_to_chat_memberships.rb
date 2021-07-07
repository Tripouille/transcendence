class AddHiddenToChatMemberships < ActiveRecord::Migration[6.1]
  def change
    add_column :chat_memberships, :hidden, :boolean, :default => false
  end
end
