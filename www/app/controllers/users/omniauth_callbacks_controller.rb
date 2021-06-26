# frozen_string_literal: true

class Users::OmniauthCallbacksController < Devise::OmniauthCallbacksController

  skip_before_action :require_login

  def login

  end

  def marvin
    @user = User.from_omniauth(request.env["omniauth.auth"])
    if @user.persisted?
      sign_in_and_redirect @user, event: :authentication
      session[:user_id] = @user.id
	  session[:user] = @user
    else
      session["devise.marvin_data"] = request.env["omniauth.auth"]
      redirect_to(root_path(:anchor => 'login'))
    end
  end

  def after_sign_in_path_for(user)
    if user.username.blank?
      @root = 'user/' + @user.id.to_s + '/create'
      root_path(:anchor => @root)
    else
      root_path
    end
  end

  def after_omniauth_failure_path_for scope
    root_path
  end

end
