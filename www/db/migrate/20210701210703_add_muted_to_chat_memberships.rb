class AddMutedToChatMemberships < ActiveRecord::Migration[6.1]
  def change
    add_column :chat_memberships, :muted, :boolean, :default => false
  end
end
