class PongController < ApplicationController

	def paddlemove
		session[:pong] ||= {}
		session[:pong] = params
		session[:pong][:lastupdate] = Time.now.to_f
		puts session[:pong].inspect
		ActionCable.server.broadcast "pong_channel", content: {
			dir: params[:dir],
			act: params[:act],
			side: params[:side]
		}
	end
end