class PongChannel < ApplicationCable::Channel
	def initialize(connection, id, params)
		super

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
		@paddles = {
			speed: 0.08,
			height: 25.0,
			width: 2.0,
			offset: 1.0,
			active: false,
			left: {
				y: 50.0,
				lastUpdate: 0,
				dir: "stop"
			},
			right: {
				y: 50.0,
				lastUpdate: 0,
				dir: "stop"
			}
		}
		@BALL_RADIUS = 3.0
		@AREA_RATIO = 2.0
		@ball = {
			speed: 0.025,
			radius: @BALL_RADIUS,
			topLimit: @BALL_RADIUS,
			bottomLimit: 100 - @BALL_RADIUS,
			leftLimit: @paddles[:offset] + @paddles[:width] + (@BALL_RADIUS / @AREA_RATIO),
			rightLimit: 100 - @paddles[:width] - @paddles[:offset] - (@BALL_RADIUS / @AREA_RATIO),
			pos: {
				y: 50.0,
				x: 50.0
			},
			delta: {
				x: 0.707,
				y: 0.707
			},
			lastUpdate: 0
		}
	end

	def subscribed
		stream_from "pong_channel"

		sleep(0.5) # verifier que les 2 joueurs sont connectes au channel
		
		scheduler = Rufus::Scheduler.new

		ActionCable.server.broadcast "pong_channel", content: {
			act: 'connection',
			paddles: @paddles,
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
			@paddles[data["side"].to_sym][:y] -= timeDelta * @paddles[:speed]
		elsif @paddles[data["side"].to_sym][:dir] == "down"
			@paddles[data["side"].to_sym][:y] += timeDelta * @paddles[:speed]
		end
		@paddles[data["side"].to_sym][:dir] = data["dir"]
		@paddles[data["side"].to_sym][:lastUpdate] = newTime
		handlePaddleOverflow(data)
		broadcastPaddleInfos(data)
	end

	def releaseKey(data, newTime, timeDelta)
		if data["dir"] == "up"
			@paddles[data["side"].to_sym][:y] -= timeDelta * @paddles[:speed]
		elsif data["dir"] == "down"
			@paddles[data["side"].to_sym][:y] += timeDelta * @paddles[:speed]
		end
		@paddles[data["side"].to_sym][:dir] = "stop"
		@paddles[data["side"].to_sym][:lastUpdate] = newTime
		handlePaddleOverflow(data)
		broadcastPaddleInfos(data)
	end

	def handlePaddleOverflow(data)
		if @paddles[data["side"].to_sym][:y] - @paddles[:height] / 2.0 < 0.0
			@paddles[data["side"].to_sym][:y] = @paddles[:height] / 2.0
		elsif @paddles[data["side"].to_sym][:y] + @paddles[:height] / 2.0 > 100.0
			@paddles[data["side"].to_sym][:y] = 100.0 - @paddles[:height] / 2.0
		end
	end

	def broadcastPaddleInfos(data)
		ActionCable.server.broadcast "pong_channel", content: {
			act: data["act"],
			dir: data["dir"],
			side: data["side"],
			top: @paddles[data["side"].to_sym][:y]
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

		traveled = timeDelta * @ball[:speed]
		puts "speed = " + @ball[:speed].to_s
		puts "pos = " + @ball[:pos].inspect
		puts "leftLimit = " + @ball[:leftLimit].to_s
		while traveled > 0
			traveled = setBallBeforeBounce(traveled)
		end
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
			@ball[:pos][:x] += remainingDistance * @ball[:delta][:x]
			@ball[:pos][:y] += remainingDistance * @ball[:delta][:y]
			remainingDistance = 0
		elsif distanceToTopBottom < distanceToLeftRight
			puts "elsif"
			@ball[:pos][:x] += distanceToTopBottom * @ball[:delta][:x]
			@ball[:pos][:y] += distanceToTopBottom * @ball[:delta][:y]
			@ball[:delta][:y] *= -1.0
			remainingDistance -= distanceToTopBottom
		else #above left or right limit
			puts "else"
			@ball[:pos][:x] += distanceToLeftRight * @ball[:delta][:x]
			@ball[:pos][:y] += distanceToLeftRight * @ball[:delta][:y]
			@ball[:delta][:x] *= -1.0 #temp
			remainingDistance -= distanceToTopBottom
		end
		return remainingDistance
	end

	def getTraveledDistance
		toTopBottom = @ball[:delta][:y] > 0 ? \
		(@ball[:bottomLimit] - @ball[:pos][:y]) / @ball[:delta][:y] \
		: (@ball[:pos][:y] - @ball[:topLimit]) / -@ball[:delta][:y]
		toLeftRight = @ball[:delta][:x] > 0 ? \
		(@ball[:rightLimit] - @ball[:pos][:x]) / @ball[:delta][:x] \
		: (@ball[:pos][:x] - @ball[:leftLimit]) / -@ball[:delta][:x]
		return toTopBottom, toLeftRight
	end

	def broadcastBall
		ActionCable.server.broadcast "pong_channel", content: {
			act: 'ballUpdate',
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
			paddle[:y] -= timeDelta * @paddles[:speed]
		elsif paddle[:dir] == "down"
			paddle[:y] += timeDelta * @paddles[:speed]
		end
		handlePaddleOverflow()
	end

	def touchLeftLimit(ballPosition)
		ballPosition < @leftLimit
	end

	def ballMeetsPaddle(side)
		@ball[:pos][:y] + @ball[:radius] \
		>= @paddles[side][:y] - @paddles[:height] / 2 \
		and @ball[:pos][:y] - @ball[:radius] \
		>= @paddles[side][:y] + @paddles[:height] / 2
	end

	def updateBallDirection(side)
		oldDirectionWasNegative = @ball[:delta][:y] < 0
		distBallPaddleCenter = getDistBallPaddleCenter(side)
		@ball[:delta][:x] = @minAngle[:dx] - @angleIncrement[:dx] * distBallPaddleCenter
		@ball[:delta][:y] = @minAngle[:dy] + @angleIncrement[:dy] * distBallPaddleCenter
		if oldDirectionWasNegative
			@ball[:delta][:y] *= -1.0
		end
	end

	def getDistBallPaddleCenter(side)
		100 * abs(@paddles[side][:y] - @ball[:pos][:y]) / (@paddles[:height] / 2.0)
	end

	def score
		@ball[:pos][:x] = 50
		@ball[:pos][:y] = 50
		broadcastBall()
	end

end
