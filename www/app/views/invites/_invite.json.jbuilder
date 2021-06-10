json.extract! invite, :id, :user_id, :guild_id, :created_at, :updated_at
json.url invite_url(invite, format: :json)
