class GuildsController < ApplicationController
  before_action :set_guild, only: %i[ show edit update destroy ]

  # GET /guilds or /guilds.json
  def index
    @guilds = Guild.all
  end

  # GET /guilds/1 or /guilds/1.json
  def show
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
    @guild = Guild.new(params.require(:guild).permit(:name, :anagram)) # Filter name and anagram parameters on creation

    respond_to do |format|
      if self.check_user && self.set_owner_id && @guild.save && self.set_guild_id        
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
      if self.check_owner_user && @guild.update(params.require(:guild).permit(:name, :anagram))
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
    if self.check_owner_user && @guild.destroy
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
      params.require(:guild).permit(:name, :anagram, :score)
    end

    # A function to check if user is authenticated and if the user doesn't have a guild yet
    def check_user
      return (session[:user_id] && User.find(session[:user_id]) && !User.find(session[:user_id])[:guild_id]) ? 1 : nil
    end

    # A function to check if user is authenticated as the guild owner
    def check_owner_user
      return (session[:user_id] && User.find(session[:user_id]) && @guild[:owner_id] == session[:user_id]) ? 1 : nil
    end

    # A function to set the owner_id corresponding to the current session user id
    def set_owner_id
      @guild[:owner_id] = session[:user_id]
      return 1
    end

    # A function to set the owner_id corresponding to the current session user id
    def set_guild_id
      @user = User.find(session[:user_id])
      @user[:guild_id] = @guild[:id]
      if @user.save
        return 1
      else
        @guild.destroy
      end
    end

end
