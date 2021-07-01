class Guild < ApplicationRecord
	has_one :user
	validates :name, presence: true, length: { in: 2..20 }
	validates :anagram, presence: true, length: { in: 1..5 }
	validates :owner_id, presence: true
end
