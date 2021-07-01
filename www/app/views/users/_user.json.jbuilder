json.extract! user, :id, :username, :pictures, :email, :login, :guild_id, :created_at, :updated_at
json.url user_url(user, format: :json)
