class PongChannel < ApplicationCable::Channel
  def subscribed
    stream_from "pong_channel"
	
  end

  def unsubscribed
    # Any cleanup needed when channel is unsubscribed
  end
end
