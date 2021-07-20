# frozen_string_literal: true

class Users::OmniauthCallbacksController < Devise::OmniauthCallbacksController

  skip_before_action :require_login

  def login
  end

  def marvin
    @user = User.from_omniauth(request.env["omniauth.auth"])
    if @user.persisted?
		session[:user_id] = @user.id
		sign_in_and_redirect @user, event: :authentication
    else
      session["devise.marvin_data"] = request.env["omniauth.auth"]
      redirect_to(root_path(:anchor => 'login'))
    end
  end

  def after_sign_in_path_for(user)
    if user.otp_required_for_login?
      controll_otp_two_factor_settings_path
    else
      session[:otp] = 'true'
      if user.username === user.login
        @root = 'user/' + @user.id.to_s + '/create'
        root_path(:anchor => @root)
      else
        root_path
      end
    end
  end

  def after_omniauth_failure_path_for scope
    root_path
  end

end
