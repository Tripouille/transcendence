class TwoFactorSettingsController < ApplicationController
	skip_before_action :require_login

	def new
		if current_user.otp_required_for_login
		  flash[:alert] = 'Two Factor Authentication is already enabled.'
		  return redirect_to root_path(:anchor => 'user')
		end

		current_user.generate_two_factor_secret_if_missing!
	end

	def create
		if current_user.validate_and_consume_otp!(params[:code])
			current_user.enable_two_factor!

			flash[:notice] = 'Successfully enabled two factor authentication, please make note of your backup codes.'
      		redirect_to root_path(:anchor => 'user')
		else
			flash.now[:alert] = 'Incorrect Code'
			head :not_acceptable
		end
	end

	def edit
		unless current_user.otp_required_for_login
		  flash[:alert] = 'Please enable two factor authentication first.'
		  return redirect_to new_two_factor_settings_path
		end

		if current_user.two_factor_backup_codes_generated?
		  flash[:alert] = 'You have already seen your backup codes.'
		  return redirect_to edit_user_registration_path
		end

		@backup_codes = current_user.generate_otp_backup_codes!
		current_user.save!
	end

	def destroy
		respond_to do |format|
			if current_user.disable_two_factor!
				flash[:notice] = 'Successfully disabled two factor authentication.'
      			redirect_to root_path
				#redirect_to edit_user_registration_path
			else
				flash[:alert] = 'Could not disable two factor authentication.'
      			redirect_back fallback_location: root_path
				#redirect_back fallback_location: root_path
			end
		end
	end

	def controll_otp
		render :layout => 'otp'
	end

	def check_otp
		print '-------------'
		print params.inspect
		print '-------------'
		print params[:otp_attempt]
		print '-------------'
		if current_user.validate_and_consume_otp!(enable_2fa_params[:otp_attempt])
			session[:otp] = 'true'
			if current_user.username === current_user.login
				@root = 'user/' + current_user.id.to_s + '/create'
				redirect_to root_path(:anchor => @root)
			else
				redirect_to(root_path)
			end
		else
			redirect_to(destroy_user_session_path)
		end
	end

	private

	def enable_2fa_params
		params.require(:two_fa).permit(:otp_attempt)
	end

end
