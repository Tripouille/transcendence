json.extract! user, :id, :username, :pictures, :email, :login, :guild_id, :created_at, :updated_at, :otp_required_for_login, :otp_secret
json.url user_url(user, format: :json)
