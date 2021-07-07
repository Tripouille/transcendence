class Guild < ApplicationRecord
	after_validation :sanitize_fields

	has_one :user

	validates :name,
		presence: true,
		length: { in: 2..20 }
		# format: { with: /\A[\w ]+\z/, message: "only allows letters, numbers space and underscore" }
	validates :anagram,
		presence: true,
		length: { in: 1..5 }
	validates :owner_id,
		presence: true

	def sanitize_fields
		self.name = self.name.strip unless self.name.nil?
		self.name = ActionController::Base.helpers.sanitize(self.name, tags: [], attributes: [])
		self.anagram = self.anagram.strip unless self.anagram.nil?
		self.anagram = ActionController::Base.helpers.sanitize(self.anagram, tags: [], attributes: [])
	end
end
