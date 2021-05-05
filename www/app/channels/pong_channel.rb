class PongChannel < ApplicationCable::Channel
  def subscribed
    stream_from "pong_channel"
	
  end

  def unsubscribed
    # Any cleanup needed when channel is unsubscribed
  end

  def receive(data)
	# puts "message received from client"
	# puts params
	# puts data["message"]
	ActionCable.server.broadcast "pong_channel", content: {
		dir: data["dir"],
		act: data["act"],
		side: data["side"]
	}
  end
end
