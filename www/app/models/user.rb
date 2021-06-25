require 'open-uri'

class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :omniauthable, omniauth_providers: [:marvin]
  has_one_attached :avatar
  after_commit :add_default_avatar, on: %i[create]


  def self.from_omniauth(auth)
    where(provider: auth.provider, uid: auth.uid).first_or_create do |user|
      user.email = auth.info.email
      user.login = auth.info.login
      user.pictures = auth.info.image
    end
  end

  private

  def add_default_avatar()
    unless avatar.attached?
      @name = self.login + '.jpg'
      downloaded_image = open(self.pictures)
      avatar.attach(io: downloaded_image, filename: @name)
    end
  end

end
