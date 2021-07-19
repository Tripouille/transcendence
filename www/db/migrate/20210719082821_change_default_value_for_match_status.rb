class ChangeDefaultValueForMatchStatus < ActiveRecord::Migration[6.1]
  def change
	change_column_default :matches, :status, 'waitOpponent'
  end
end
