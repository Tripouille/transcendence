json.extract! user, :id, :username, :pictures, :email, :login, :created_at, :updated_at, :avatar
json.url user_url(user, format: :json)
