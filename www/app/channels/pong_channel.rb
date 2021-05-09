class PongChannel < ApplicationCable::Channel
	def subscribed
		stream_from "pong_channel"

		@ball = {
			speed: 0.5,
			top: 50,
			left: 50,
			dx: 0.0,
			dy: -0.707,
			lastUpdate: 0
		}
		@paddles = {
			speed: 0.08,
			height: 25,
			left: {
				top: 50,
				lastUpdate: 0,
				dir: "stop"
			},
			right: {
				top: 50,
				lastUpdate: 0,
				dir: "stop"
			}
		}

		sleep(0.5) # verifier que les 2 joueurs sont connectes au channel
		ActionCable.server.broadcast "pong_channel", content: {
			act: 'connection',
			paddleSpeed: @paddles[:speed]
		}
		ActionCable.server.broadcast "pong_channel", content: {
			act: 'start'
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
			updatePaddles(data)
		end
	end
  
	def updatePaddles(data)
		newTime = Time.now.to_f * 1000 #ms
		if @paddles[data["side"].to_sym][:lastUpdate] == 0
			@paddles[data["side"].to_sym][:lastUpdate] = newTime
			@paddles[data["side"].to_sym][:dir] = data["dir"]
			broadcastPaddleInfos(data)
			return
		end
		timeDelta = newTime - @paddles[data["side"].to_sym][:lastUpdate]

		if data["act"] == "press"
			pressKey(data, newTime, timeDelta)
		end

		if data["act"] == "release" and @paddles[data["side"].to_sym][:dir] == data["dir"]
			releaseKey(data, newTime, timeDelta)
			puts "in if release"
		end
	end

	def pressKey(data, newTime, timeDelta)
		if @paddles[data["side"].to_sym][:dir] == "up"
			@paddles[data["side"].to_sym][:top] -= timeDelta * @paddles[:speed]
		elsif @paddles[data["side"].to_sym][:dir] == "down"
			@paddles[data["side"].to_sym][:top] += timeDelta * @paddles[:speed]
		end
		@paddles[data["side"].to_sym][:dir] = data["dir"]
		@paddles[data["side"].to_sym][:lastUpdate] = newTime
		handlePaddleOverflow(data)
		broadcastPaddleInfos(data)
	end

	def releaseKey(data, newTime, timeDelta)
		if data["dir"] == "up"
			@paddles[data["side"].to_sym][:top] -= timeDelta * @paddles[:speed]
		elsif data["dir"] == "down"
			@paddles[data["side"].to_sym][:top] += timeDelta * @paddles[:speed]
		end
		@paddles[data["side"].to_sym][:dir] = "stop"
		@paddles[data["side"].to_sym][:lastUpdate] = newTime
		handlePaddleOverflow(data)
		broadcastPaddleInfos(data)
	end

	def handlePaddleOverflow(data)
		if @paddles[data["side"].to_sym][:top] - @paddles[:height] / 2.0 < 0.0
			@paddles[data["side"].to_sym][:top] = @paddles[:height] / 2.0
		elsif @paddles[data["side"].to_sym][:top] + @paddles[:height] / 2.0 > 100.0
			@paddles[data["side"].to_sym][:top] = 100.0 - @paddles[:height] / 2.0
		end
	end

	def broadcastPaddleInfos(data)
		ActionCable.server.broadcast "pong_channel", content: {
			act: data["act"],
			dir: data["dir"],
			side: data["side"],
			top: @paddles[data["side"].to_sym][:top]
		}
	end

	def updateBall
		newTime = Time.now.to_f
		if @ball[:lastUpdate] == 0
			@ball[:lastUpdate] = newTime
			return
		end
		timeDelta = (newTime - @ball[:lastUpdate]) * 1000; #ms
		@ball[:left] += @ball[:dx] * timeDelta * @ball[:speed]
		@ball[:top] += @ball[:dy] * timeDelta * @ball[:speed]

		if @ball[:top] < 0.0
			@ball[:top] = -@ball[:top]
			@ball[:dy] *= -1.0
		elsif @ball[:top] > 100.0
			@ball[:top] = 100 - (@ball[:top] - 100)
			@ball[:dy] *= -1.0
		end

		@ball[:lastUpdate] = newTime
	end
end
