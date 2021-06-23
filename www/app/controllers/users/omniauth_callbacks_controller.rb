# frozen_string_literal: true

class Users::OmniauthCallbacksController < Devise::OmniauthCallbacksController

  def marvin
    @user = User.from_omniauth(request.env["omniauth.auth"])
	puts 'marvin'
    if @user.persisted?
	  puts 'if'
      sign_in_and_redirect @user, event: :authentication
      set_flash_message(:notice, :success, kind: "42") if is_navigational_format?
      session[:user_id] = @user.id
	  session[:user] = @user
    else
	  puts 'else'
      session["devise.marvin_data"] = request.env["omniauth.auth"]
      redirect_to new_user_registration_url
    end
  end

  def after_omniauth_failure_path_for scope
    root_path
  end

end
