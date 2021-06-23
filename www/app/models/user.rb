class User < ApplicationRecord
  has_many :friendships
  has_many :friends, :through => :friendships
  has_many :chat_memberships
  has_many :chat_rooms, :through => :chat_memberships, :source => :room


  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :omniauthable, omniauth_providers: [:marvin]

  def self.from_omniauth(auth)
    where(provider: auth.provider, uid: auth.uid).first_or_create do |user|
      user.email = auth.info.email
      user.login = auth.info.login
    end
  end

end
