json.extract! guild, :id, :name, :anagram, :owner, :score, :created_at, :updated_at
json.url guild_url(guild, format: :json)
