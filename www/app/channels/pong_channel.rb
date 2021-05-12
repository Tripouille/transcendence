class PongChannel < ApplicationCable::Channel
	def subscribed
		stream_from "pong_channel"

		@minAngle = {
			dx: 0.984,
			dy: 0.174
		}
		@maxAngle = {
			dx: 0.342,
			dy: 0.939
		}
		@angleIncrement = {
			dx: (@minAngle[:dx] - @maxAngle[:dx]) / 100.0,
			dy: (@maxAngle[:dy] - @minAngle[:dy]) / 100.0
		}
		@ball = {
			speed: 0.025,
			radius: 5,
			y: 50,
			x: 50,
			dx: 0.707,
			dy: 0.707,
			lastUpdate: 0
		}
		@paddles = {
			speed: 0.08,
			height: 25,
			width: 2,
			offset: 1,
			active: false,
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
		@topLimit = @ball[:radius]
		@bottomLimit = 100 - @ball[:radius]
		@rightLimit = 100 - @paddles[:width] - @paddles[:offset] - @ball[:radius]
		@leftLimit = @paddles[:offset] + @paddles[:width] + @ball[:radius]

		scheduler = Rufus::Scheduler.new

		sleep(0.5) # verifier que les 2 joueurs sont connectes au channel
		ActionCable.server.broadcast "pong_channel", content: {
			act: 'connection',
			paddleSpeed: @paddles[:speed],
			ball: @ball
		}
		ActionCable.server.broadcast "pong_channel", content: {
			act: 'start'
		}

		scheduler.in '3s' do
		  @paddles[:active] = true
		end
	end

	def unsubscribed
		# Any cleanup needed when channel is unsubscribed
	end

	def receive(data)
		if data["request"] == "ball"
			updateBall()
		elsif not data["dir"].blank? and not data["act"].blank? and not data["side"].blank? \
		and @paddles[:active] = true
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
		@ball[:lastUpdate] = newTime

		puts "before while, newTime = " + newTime.to_s
		traveled = timeDelta * @ball[:speed]
		puts "timeDelta = " + timeDelta.to_s
		puts "speed = " + @ball[:speed].to_s
		puts "traveled = " + traveled.to_s
		i = 0
		while traveled > 0 && i < 10
			traveled = setBallBeforeBounce(traveled)
			i += 1
		end
		if (i == 10)
			puts "PROBLEM : i == 10"
		end
		puts "end of while"
		broadcastBall()
	end

	def setBallBeforeBounce(remainingDistance)
		distanceToTopBottom, distanceToLeftRight = getTraveledDistance()
		puts distanceToTopBottom
		puts distanceToLeftRight
		puts remainingDistance
		minDistance = [distanceToTopBottom, distanceToLeftRight].min
		if remainingDistance < minDistance
			puts "if"
			@ball[:x] += remainingDistance * @ball[:dx]
			@ball[:y] += remainingDistance * @ball[:dy]
			remainingDistance = 0
		elsif distanceToTopBottom < distanceToLeftRight
			puts "elsif"
			@ball[:x] += distanceToTopBottom * @ball[:dx]
			@ball[:y] += distanceToTopBottom * @ball[:dy]
			@ball[:dy] *= -1.0
			remainingDistance -= distanceToTopBottom
		else #touch left or right limit
			puts "else"
			@ball[:x] += distanceToLeftRight * @ball[:dx]
			@ball[:y] += distanceToLeftRight * @ball[:dy]
			@ball[:dx] *= -1.0 #temp
			remainingDistance -= distanceToTopBottom
		end
		return remainingDistance
	end

	def getTraveledDistance
		toTopBottom = @ball[:dy] > 0 ? (@bottomLimit - @ball[:y]) / @ball[:dy] \
										: @ball[:y] - @topLimit / -@ball[:dy]
		toLeftRight = @ball[:dx] > 0 ? (@rightLimit - @ball[:x]) / @ball[:dx] \
										: @ball[:x] - @leftLimit / -@ball[:dx]
		return toTopBottom, toLeftRight
	end

	def broadcastBall
		ActionCable.server.broadcast "pong_channel", content: {
			ball: @ball
		}
	end

	def calculatePaddlePosition(paddle)
		newTime = Time.now.to_f * 1000 #ms
		if paddle[:lastUpdate] == 0
			paddle[:lastUpdate] = newTime
			return
		end
		timeDelta = newTime - paddle[:lastUpdate]

		if paddle[:dir] == "up"
			paddle[:top] -= timeDelta * @paddles[:speed]
		elsif paddle[:dir] == "down"
			paddle[:top] += timeDelta * @paddles[:speed]
		end
		handlePaddleOverflow()
	end

	def touchLeftLimit(ballPosition)
		ballPosition < @leftLimit
	end

	def ballMeetsPaddle(side)
		@ball[:top] + @ball[:radius] \
		>= @paddles[side][:top] - @paddles[:height] / 2 \
		and @ball[:top] - @ball[:radius] \
		>= @paddles[side][:top] + @paddles[:height] / 2
	end

	def updateBallDirection(side)
		oldDirectionWasNegative = @ball[:dy] < 0
		distBallPaddleCenter = getDistBallPaddleCenter(side)
		@ball[:dx] = @minAngle[:dx] - @angleIncrement[:dx] * distBallPaddleCenter
		@ball[:dy] = @minAngle[:dy] + @angleIncrement[:dy] * distBallPaddleCenter
		if oldDirectionWasNegative
			@ball[:dy] *= -1.0
		end
	end

	def getDistBallPaddleCenter(side)
		100 * abs(@paddles[side][:top] - @ball[:y]) / (@paddles[:height] / 2.0)
	end

	def score
		@ball[:x] = 50
		@ball[:y] = 50
		broadcastBall()
	end

end
