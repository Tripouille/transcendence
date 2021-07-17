class Guild < ApplicationRecord
	after_validation :sanitize_fields

	has_one :user
	has_many :matches_as_left, class_name: "Match", foreign_key: "left_guild_id", dependent: :nullify
	has_many :matches_as_right, class_name: "Match", foreign_key: "right_guild_id", dependent: :nullify

	validates :name,
		presence: true,
		length: { in: 2..20 }
		# format: { with: /\A[\w ]+\z/, message: "only allows letters, numbers space and underscore" }
	validates :anagram,
		presence: true,
		length: { in: 1..5 }
	validates :owner_id,
		presence: true

	after_save :checkAchievments, if: :saved_change_to_owner_id

	def sanitize_fields
		self.name = self.name.strip unless self.name.nil?
		self.name = ActionController::Base.helpers.sanitize(self.name, tags: [], attributes: [])
		self.anagram = self.anagram.strip unless self.anagram.nil?
		self.anagram = ActionController::Base.helpers.sanitize(self.anagram, tags: [], attributes: [])
	end

	def checkAchievments
		@winner = User.find_by_id(self.owner_id)
		checkAchievment(@winner, 'own_guild', true)
	end

end
