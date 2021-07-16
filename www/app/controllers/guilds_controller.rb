class GuildsController < ApplicationController
  before_action :set_guild, only: %i[ show edit update destroy ]

  # GET /guilds or /guilds.json
  def index
    @result = Guild.all.map { |guild| guild.as_json.merge({
      owner_name: User.find(guild.owner_id)[:username],
      score: Match.where(:status => "finished", :challenged => false).where("winner = left_player and left_guild_id = ?", guild.id).or(Match.where("winner = right_player and right_guild_id = ?", guild.id)).select(:left_guild_id, :right_guild_id).distinct.size,
      route: '#guilds/' + guild.id.to_s,
      my_guild: (current_user && current_user.guild_id == guild.id) ? true : false
      })
    }
    @result.sort_by! { |res| -res[:score] }
    @result = @result.map { |i| i.merge({ rank: @result.find_index{ |guild| guild["id"] == i["id"] }.to_i + 1 }) }
    render json: @result.as_json, status: :ok
  end

  # GET /guilds/1 or /guilds/1.json
  def show
    if (user_exists?)
      @guilds = Guild.all.select(:id).map { |guild| guild.as_json.merge({
        score: Match.where(:status => "finished", :challenged => false).where("winner = left_player and left_guild_id = ?", guild.id).or(Match.where("winner = right_player and right_guild_id = ?", guild.id)).select(:left_guild_id, :right_guild_id).distinct.size,
        })
      }
      @guilds.sort_by! { |res| -res[:score] }

      render json: @guild.as_json.merge({
        "rank" => @guilds.find_index{ |guild| guild["id"] == @guild[:id]}.to_i + 1,
        "active_members" => User.where(:guild_id => @guild[:id]).with_otp.size,
        "owner_name" => User.find(@guild.owner_id)[:username],
        "invite_sent" => Invite.find_by(user_id: session[:user_id], guild_id: @guild[:id]).as_json,
        "invites" => ((user_is_guild_owner?) ? Invite.where(:guild_id => @guild[:id]) : {}).map { |invite| invite.as_json.merge({
          username: User.find(invite.user_id)[:username],
          score: Match.where(challenged: false, winner: invite.user_id).size,
          }) }.as_json,
        "users" => User.where(:guild_id => @guild[:id]).select(:id, :username, :guild_id).with_otp.map { |user| user.as_json.merge({
          rank: ( user.id == @guild[:owner_id] ? "Owner" : "Officer"),
          score: Match.where(challenged: false, winner: user.id).size,
          contribution: Match.where(challenged: false, status: "finished").where(left_guild_id: @guild[:id], left_player: user.id).or(Match.where(right_guild_id: @guild[:id], right_player: user.id)).where(winner: user.id).select(:left_guild_id, :right_guild_id).distinct.size
          }) }.as_json
      }), status: :ok
    end
  end

  # POST /guilds or /guilds.json
  def create
    if self.admin?
      @guild = Guild.new(params.require(:guild).permit(:name, :anagram, [:id, :owner_id]))
    else
      @guild = Guild.new(params.require(:guild).permit(:name, :anagram)) # Filter name and anagram parameters on creation
    end

    @user = User.find(session[:user_id])
    Invite.where(:user_id => @user[:id]).destroy_all

    if (self.admin? || (self.user_exists? && self.user_has_no_guild?)) && self.set_owner_id && @guild.save && self.set_guild_id
      render json: { id: @guild.id }, status: :created
    else
      render json: @guild.errors, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /guilds/1 or /guilds/1.json
  def update
    if ((self.admin? || (self.user_exists? && self.user_is_guild_owner? && self.in_current_guild?)) \
      && @guild.update(params.require(:guild).permit(:name, :anagram, [:id, :owner_id])))
      render json: @guild.as_json, status: :ok
    else
      render json: @guild.errors, status: :unprocessable_entity
    end
  end

  # DELETE /guilds/1 or /guilds/1.json
  def destroy
    if (self.admin? || (self.user_exists? && self.user_is_guild_owner? && self.user_is_alone?)) && @guild.destroy
      head :no_content
    else
      render json: @guild.errors, status: :unprocessable_entity
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_guild
      @guild = Guild.find(params[:id])
    end

    # Only allow a list of trusted parameters through.
    def guild_params
      params.require(:guild).permit(:name, :anagram, [:id, :owner_id])
    end


    # A function to check if user is authenticated and exists in the database
    def user_exists?
      return (session[:user_id] && User.find(session[:user_id])) ? true : false
    end

    # A function to check if user is alone in the guild
    def user_is_alone?
      return (User.where(:guild_id => @guild[:id]).with_otp.length == 1) ? true : false
    end

    # A function to check if user doesn't have a guild
    def user_has_no_guild?
      return (!User.find(session[:user_id])[:guild_id]) ? true : false
    end

    # A function to check if user is authenticated as the guild owner
    def user_is_guild_owner?
      return (@guild[:owner_id] == session[:user_id]) ? true : false
    end

    # A function to give all the right for certain users for debug purposes
    def admin?
      return false
      # return (session[:user_id] && User.find(session[:user_id])[:login] == "") ? true : false
    end

    # A function to set the owner_id corresponding to the current session user id
    def set_owner_id
      if self.admin? == false || (self.admin? && @guild[:owner_id] == nil)
        @guild[:owner_id] = session[:user_id]
      end
      return 1
    end

    # A function to set the owner_id corresponding to the current session user id
    def set_guild_id
      @user = User.find(@guild[:owner_id]) # select user from the guild owner user and not from the session for admin purpose
      @user[:guild_id] = @guild[:id]
      if @user.save
        return 1
      else
        @guild.destroy
      end
    end

    def in_current_guild?
      return (User.find(params[:owner_id]) && User.find(params[:owner_id])[:guild_id] == @guild[:id]) ? true : false
    end

end
