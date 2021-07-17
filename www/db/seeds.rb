# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: 'Star Wars' }, { name: 'Lord of the Rings' }])
#   Character.create(name: 'Luke', movie: movies.first)

Achievment.create(:tag => 'victories_3', :description => 'Win 3 matches')
Achievment.create(:tag => 'victories_20', :description => 'Win 20 matches')
Achievment.create(:tag => 'contribute_10', :description => 'Give 10 points to your guild')
Achievment.create(:tag => 'challenge_1', :description => 'Challenge someone and win')
Achievment.create(:tag => 'be_top_3', :description => 'Rank up in the top 3')
Achievment.create(:tag => 'be_first', :description => 'Rank up to be the best player !')

Achievment.create(:tag => '3_winning_streak', :description => 'Be on a 3 game winning streak')
Achievment.create(:tag => '10_winning_streak', :description => 'Be on a 10 game winning streak')
Achievment.create(:tag => 'join_guild', :description => 'Join a guild')
Achievment.create(:tag => 'own_guild', :description => 'Be owner of a guild')
