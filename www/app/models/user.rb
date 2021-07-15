require "down"

class User < ApplicationRecord

  devise :two_factor_authenticatable, :two_factor_backupable,
         otp_backup_code_length: 10, otp_number_of_backup_codes: 10,
         :otp_secret_encryption_key => ENV['OTP_SECRET_KEY']

  # Ensure that backup codes can be serialized
  serialize :otp_backup_codes, JSON
  attr_accessor :otp_plain_backup_codes

  has_many :friendships
  has_many :friends, :through => :friendships

  has_many :chat_memberships
  has_many :chat_rooms, :through => :chat_memberships
  has_many :messages
  has_many :chat_bans

  has_and_belongs_to_many :achievments


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

  scope :with_otp, -> { select(:encrypted_otp_secret, :encrypted_otp_secret_iv, :encrypted_otp_secret_salt) }

  def self.from_omniauth(auth)
    where(provider: auth.provider, uid: auth.uid).first_or_create do |user|
      user.email = auth.info.email
      user.login = auth.info.login
      user.username = auth.info.login
      user.pictures = auth.info.image
    end
  end

  # Generate an OTP secret it it does not already exist
  def generate_two_factor_secret_if_missing!
    return unless otp_secret.nil?
    update!(otp_secret: User.generate_otp_secret)
  end

  # Ensure that the user is prompted for their OTP when they login
  def enable_two_factor!
    update!(otp_required_for_login: true)
  end

  # Disable the use of OTP-based two-factor.
  def disable_two_factor!
    update!(
        otp_required_for_login: false,
        otp_secret: nil,
        otp_backup_codes: nil)
  end

  # URI for OTP two-factor QR code
  def two_factor_qr_code_uri
    issuer = ENV['OTP_2FA_ISSUER_NAME']
    label = [issuer, email].join(':')

    otp_provisioning_uri(label, issuer: issuer)
  end

  # Determine if backup codes have been generated
  def two_factor_backup_codes_generated?
    otp_backup_codes.present?
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
