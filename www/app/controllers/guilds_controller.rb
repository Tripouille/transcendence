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
    @guild = Guild.new(guild_params)

    respond_to do |format|
      if @guild.save
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
      if @guild.update(guild_params)
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
    @guild.destroy
    respond_to do |format|
      format.html { redirect_to guilds_url, notice: "Guild was successfully destroyed." }
      format.json { head :no_content }
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
end
