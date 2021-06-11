class UsersController < ApplicationController
  before_action :set_user, only: %i[ show edit update destroy kick ]

  # GET /users or /users.json
  def index
    @users = User.all
  end

  # GET /users/1 or /users/1.json
  def show
  end

  # GET /users/new
  def new
    @user = User.new
  end

  # GET /users/1/edit
  def edit
  end

  # POST /users or /users.json
  def create
    @user = User.new(user_params)

    respond_to do |format|
      if @user.save
        format.html { redirect_to @user, notice: "User was successfully created." }
        format.json { render :show, status: :created, location: @user }
      else
        format.html { render :new, status: :unprocessable_entity }
        format.json { render json: @user.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /users/1 or /users/1.json
  def update
    respond_to do |format|
      if @user.update(user_params)
        format.html { redirect_to @user, notice: "User was successfully updated." }
        format.json { render :show, status: :ok, location: @user }
      else
        format.html { render :edit, status: :unprocessable_entity }
        format.json { render json: @user.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /users/1 or /users/1.json
  def destroy
    @user.destroy
    respond_to do |format|
      format.html { redirect_to users_url, notice: "User was successfully destroyed." }
      format.json { head :no_content }
    end
  end

  # PATCH /users/1/kick or /users/1.json/kick : to kick players from guilds
  def kick
    respond_to do |format|
      if self.check_user && self.check_is_guild_owner && self.check_kicked_user_from_guild && @user.update(guild_id: :nullify)
        format.html { redirect_to users_url, notice: "User was successfully updated." }
        format.json { head :no_content }
      else
        format.html { head :no_content, status: :unprocessable_entity }
        format.json { head :no_content }
      end
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_user
      @user = User.find(params[:id])
    end

    # Only allow a list of trusted parameters through.
    def user_params
      params.require(:user).permit(:username, :pictures, :email, :login, :provider, :uid, :guild_id)
    end

    # A function to check if user is authenticated and if the user doesn't have a guild yet
    def check_user
      return (session[:user_id] && User.find(session[:user_id])) ? 1 : nil
    end

    # A function to check if user is authenticated as the guild owner
    def check_is_guild_owner
      @guild = Guild.find(User.find(session[:user_id])[:guild_id])
      return (@guild[:owner_id] == session[:user_id]) ? 1 : nil
    end

    # A function to check if user is authenticated as the guild owner
    def check_kicked_user_from_guild
      return (@guild[:id] == @user[:guild_id] && @user[:id] != @guild[:owner_id]) ? 1 : nil
    end

end
