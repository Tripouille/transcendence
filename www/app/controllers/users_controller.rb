class UsersController < ApplicationController
  before_action :set_user, only: %i[ show edit update destroy kick leave matcheshistory avatar_update ]

  # GET /users or /users.json
  def index
    users = User.all.select(:id, :username, :guild_id).with_otp
    @result = users.map{|user| user.as_json.merge({
        guild_name: user.guild ? user.guild.name : "Not in a guild",
        score: Match.where(challenged: false, winner: user.id).size,
        my_user: (user == current_user),
        route: '#users/' + user.id.to_s
    })}
    @result.sort_by! { |res| -res[:score] }
    @result = @result.map { |i| i.merge({ rank: @result.find_index{ |user| user["id"] == i["id"] }.to_i + 1 }) }
    render json: @result.as_json, status: :ok
  end

  # GET /users/1 or /users/1.json
  def show
	user_completed = @user.as_json(:only => [:id, :username, :login, :email, :guild_id, :otp_secret, :otp_required_for_login])
						.merge(guild: @user.guild, achievments: @user.achievments)
	if self.user_owner?
    	render json: user_completed, status: :ok
	else
    	render json: user_completed.except(:email, :otp_required_for_login), status: :ok
	end
  end

  def matcheshistory
    @matches = Match.where(left_player: @user[:id]).or(Match.where(right_player: @user[:id])).where(challenged: false, status: "finished").select(:id, :left_player, :right_player, :winner, :updated_at).order(updated_at: :desc).map { |match| match.as_json.merge({
      username_left: User.find_by_id(match.left_player) ? User.find(match.left_player)["username"] : "Deleted acount",
      username_right: User.find_by_id(match.right_player) ? User.find(match.right_player)["username"] : "Deleted acount",
      result: (@user[:id] == match.winner) ? "Win" : "Loss",
      })
    }
    render json: {
      id: @user[:id],
      "matches" => @matches
    }, status: :ok
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
      if self.user_owner? && @user.update(user_params)
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
      if self.user_owner?
        format.html { redirect_to users_url, notice: "User was successfully destroyed." }
        format.json { head :no_content }
      else
        format.html { render :edit, status: :unprocessable_entity }
        format.json { render json: @user.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH /users/1/kick or /users/1.json/kick : to kick players from guilds
  def kick
    respond_to do |format|
      if self.user_exists? && self.user_is_guild_owner? && self.check_kicked_user_from_guild && @user.update(guild_id: :nullify)
        format.html { redirect_to users_url, notice: "User was successfully updated." }
        format.json { head :no_content }
      else
        format.html { head :no_content, status: :unprocessable_entity }
        format.json { head :no_content }
      end
    end
  end

  # PATCH /users/1/leave or /users/1.json/leave : for players to leave their own guild
  def leave
    respond_to do |format|
      if self.user_exists? && !self.user_is_guild_owner? && @user.update(guild_id: :nullify)
        format.html { redirect_to users_url, notice: "User was successfully updated." }
        format.json { head :no_content }
      else
        format.html { head :no_content, status: :unprocessable_entity }
        format.json { head :no_content }
      end
    end
  end

  # GET /users/1/avatar
  def avatar
    user = User.find_by(id: params[:id])

    if user&.avatar&.attached?
      redirect_to rails_blob_url(user.avatar)
    else
      head :not_found
    end
  end

  def avatar_update
    user = User.find_by(id: params[:id])

    @type = params[:file].content_type.at(0..5)
    if self.user_owner? && @type == 'image/'
      user&.avatar&.purge
      user&.avatar&.attach(params[:file])
    else
      head :not_acceptable
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_user
      @user = User.find(params[:id])
    end

    # Only allow a list of trusted parameters through.
    def user_params
      params.require(:user).permit(:username, :pictures, :email, :login, :avatar, :guild_id, :id, :created_at, :updated_at)
      # params.require(:user).permit(:username, :pictures, :email, :login, :provider, :uid, :guild_id)
    end

    # A function to check if user is authenticated and if the user doesn't have a guild yet
    def user_exists?
      return (session[:user_id] && User.find(session[:user_id])) ? true : false
    end

    def user_owner?
      return (@user[:id] == session[:user_id]) ? true : false
    end

    # A function to check if user is authenticated as the guild owner
    def user_is_guild_owner?
      @guild = Guild.find(User.find(session[:user_id])[:guild_id])
      return (@guild[:owner_id] == session[:user_id]) ? true : false
    end

    # A function to check if user is authenticated as the guild owner
    def check_kicked_user_from_guild
      return (@guild[:id] == @user[:guild_id] && @user[:id] != @guild[:owner_id]) ? 1 : nil
    end

end
