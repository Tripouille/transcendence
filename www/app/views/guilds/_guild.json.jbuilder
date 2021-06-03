json.extract! guild, :id, :name, :anagram, :score, :owner_id, :created_at, :updated_at
json.url guild_url(guild, format: :json)
