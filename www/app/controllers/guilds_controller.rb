class GuildsController < ApplicationController
  before_action :set_guild, only: %i[ show edit update destroy ]

  # GET /guilds or /guilds.json
  def index
    @guilds = Guild.all.sort_by{ |guild| -guild.score }
    @users = User.all.where.not(:guild_id => nil)

    @result = @guilds.map { |i| i.attributes.merge({
      owner_name: @users.find{ |user| user.id == i.owner_id}[:username],
      rank: @guilds.find_index{ |guild| guild.id == i.id } + 1,
      route: '#guilds/' + i.id.to_s,
      my_guild: (@users.find{ |user| user.id == session[:user_id]} != nil && @users.find{ |user| user.id == session[:user_id]}[:guild_id] == i.id) ? true : false
      })
    }
    render json: @result.as_json

  end

  # GET /guilds/1 or /guilds/1.json
  def show
    if (user_exists?)
      @invites = (user_is_guild_owner?) ? Invite.all.where(:guild_id => @guild[:id]) : {}
      @users = User.all.where(:guild_id => @guild[:id])
      @guilds = Guild.all.sort_by{ |guild| -guild.score }
      @matches = Match.all # to remove after
      # @matches = Match.all.where(:left_guild => @guild[:id]).or(Match.all.where(:right_guild => @guild[:id]))

      render json: @guild.as_json.merge({
        "rank" => @guilds.find_index{ |guild| guild.id == @guild[:id]} + 1,
        "active_members" => @users.length,
        "owner_name" => @users.find{ |user| user.id == @guild[:owner_id]}[:username],
        "invite_sent" => Invite.find_by(user_id: session[:user_id], guild_id: @guild[:id]).as_json,
        "invites" => @invites.map { |i| i.attributes.merge({
          username: User.find(i.user_id)[:username]
          }) }.as_json,
        "users" => @users.map { |i| i.attributes.merge({
          rank: ( i.id == @guild[:owner_id] ? "Owner" : "Officer"),
          contribution: @matches.find_all{ |match| match.winner == i.id }.length()
          # contribution: @matches.find_all{ |match| (match.winner == i.id && match.left_guild != match.right_guild) }.length()
          }) }.as_json
      })
    end
  end

  # GET /guilds/new
  def new
    @guild = Guild.new
  end

  # GET /guilds/1/edit
  def edit
  end

  # POST /guilds or /guilds.json
  def create
    if self.admin?
      @guild = Guild.new(params.require(:guild).permit(:name, :anagram, :score, [:id, :owner_id]))
    else
      @guild = Guild.new(params.require(:guild).permit(:name, :anagram)) # Filter name and anagram parameters on creation      
    end

    @user = User.find(session[:user_id])
    Invite.all.where(:user_id => @user[:id]).destroy_all

    respond_to do |format|
      if (self.admin? || (self.user_exists? && self.user_has_no_guild?)) && self.set_owner_id && @guild.save && self.set_guild_id
        format.html { redirect_to @guild, notice: "Guild was successfully created." }
        format.json { render :show, status: :created, location: @guild }
      else
        format.html { render :new, status: :unprocessable_entity }
        format.json { render json: @guild.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /guilds/1 or /guilds/1.json
  def update
    respond_to do |format|
      if (self.admin? || (self.user_exists? && self.user_is_guild_owner? && self.in_current_guild?))

        if self.admin?
          @guild.update(params.require(:guild).permit(:name, :anagram, :score, [:id, :owner_id]))
        else
          @guild.update(params.require(:guild).permit(:name, :anagram, [:id, :owner_id]))
        end
        format.html { redirect_to @guild, notice: "Guild was successfully updated." }
        format.json { render :show, status: :ok, location: @guild }
      else
        format.html { render :edit, status: :unprocessable_entity }
        format.json { render json: @guild.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /guilds/1 or /guilds/1.json
  def destroy
    if (self.admin? || (self.user_exists? && self.user_is_guild_owner? && self.user_is_alone?)) && @guild.destroy
      respond_to do |format|
        format.html { redirect_to guilds_url, notice: "Guild was successfully destroyed." }
        format.json { head :no_content }
      end
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_guild
      @guild = Guild.find(params[:id])
    end

    # Only allow a list of trusted parameters through.
    def guild_params
      params.require(:guild).permit(:name, :anagram, :score, [:id, :owner_id])
    end


    # A function to check if user is authenticated and exists in the database
    def user_exists?
      return (session[:user_id] && User.find(session[:user_id])) ? true : false
    end

    # A function to check if user is alone in the guild
    def user_is_alone?
      return (User.all.where(:guild_id => @guild[:id]).length == 1) ? true : false
    end

    # A function to check if user doesn't have a guild
    def user_has_no_guild?
      return (!User.find(session[:user_id])[:guild_id]) ? true : false
    end

    # A function to check if user is authenticated as the guild owner
    def user_is_guild_owner?
      return (@guild[:owner_id] == session[:user_id]) ? true : false
    end

    def admin?
      return (session[:user_id] && User.find(session[:user_id])[:login] == "olidon") ? true : false
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
