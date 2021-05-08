class PongChannel < ApplicationCable::Channel
  def subscribed
    stream_from "pong_channel"

	sleep(1) # verifier que les 2 joueurs sont connectes au channel
	ActionCable.server.broadcast "pong_channel", content: {
		act: 'start'
	}

	@ball = {
		top: 50,
		left: 50,
		dx: 0.707,
		dy: 0.707,
		lastUpdate: Time.now.to_f
	}
  end

  def unsubscribed
    # Any cleanup needed when channel is unsubscribed
  end

  def receive(data)
	puts @ball.inspect
	if data["request"] == "ballPosition"
		updateBall()
		ActionCable.server.broadcast "pong_channel", content: {
			ball: @ball
		}
	elsif not data["dir"].blank? and not data["act"].blank? and not data["side"].blank?
		ActionCable.server.broadcast "pong_channel", content: {
			dir: data["dir"],
			act: data["act"],
			side: data["side"]
		}
	end
  end

  def updateBall
	@ball[:left] += 0.01
  end
end
