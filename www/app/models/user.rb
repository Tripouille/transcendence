require "down"

class User < ApplicationRecord

  has_many :friendships
  has_many :friends, :through => :friendships
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :omniauthable, omniauth_providers: [:marvin]
  belongs_to :guild, optional: true
  has_one_attached :avatar
  after_commit :add_default_avatar, on: %i[create update]
  after_validation :sanitize_fields

  validates :username,
    presence: true,
    length: { in: 2..20 }

  def self.from_omniauth(auth)
    where(provider: auth.provider, uid: auth.uid).first_or_create do |user|
      user.email = auth.info.email
      user.login = auth.info.login
      user.username = auth.info.login
      user.pictures = auth.info.image
    end
  end

  private

  def add_default_avatar()
    unless avatar.attached?
      @name = self.login + '.jpg'
      image = Down.download(self.pictures)
      avatar.attach(io: image, filename: @name)
    end
  end

  def sanitize_fields
    self.username = self.username.strip unless self.username.nil?
    self.username = ActionController::Base.helpers.sanitize(self.username, tags: [], attributes: [])
  end

end
