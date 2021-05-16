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
			posX: 50.0,
			posY: 50.0,
			deltaX: 0.707,
			deltaY: 0.707,
			lastUpdate: 0
		}
		@playersConnected = 0
	end

	def subscribed
		stream_from "pong_channel"

		@playersConnected += 1
		if @playersConnected == 1
			sleep(0.5) # verifier que les 2 joueurs sont connectes au channel

			ActionCable.server.broadcast "pong_channel", content: {
				act: 'connection',
				paddles: @paddles
			}
			start()
		end
	end

	def unsubscribed
		# Any cleanup needed when channel is unsubscribed
	end

	def start
		@paddles[:active] = false
		ActionCable.server.broadcast "pong_channel", content: {
			act: 'timerStart'
		}
		Rufus::Scheduler.new.in '3s' do
			resetPaddles()
			resetBall()
			ActionCable.server.broadcast "pong_channel", content: {
				act: 'gameStart',
				ball: @ball
			}
		end
	end

	def initializeRandomBallDirection
		srand()
		randIncrement = rand(100)
		@ball[:deltaX] = [-1, 1].sample * (@minAngle[:dx] - @angleIncrement[:dx] * randIncrement)
		@ball[:deltaY] = [-1, 1].sample * (@minAngle[:dy] + @angleIncrement[:dy] * randIncrement)
	end

	def resetPaddles
		@paddles[:active] = true
		@paddles[:left] = {
			y: 50.0,
			lastUpdate: 0,
			dir: "stop"
		}
		@paddles[:right] = {
			y: 50.0,
			lastUpdate: 0,
			dir: "stop"
		}
	end

	def resetBall
		@ball[:lastUpdate] = Time.now.to_f * 1000.0
		@ball[:posX] = 50
		@ball[:posY] = 50
		initializeRandomBallDirection()
	end

	def receive(data)
		if data["request"] == "ball" and @paddles[:active]
			updateBall()
		elsif not data["dir"].blank? and not data["act"].blank? and not data["side"].blank? \
		and @paddles[:active] = true
			updatePaddles(data)
		end
	end
  
	def updatePaddles(data)
		newTime = Time.now.to_f * 1000.0 #ms
		if @paddles[data["side"].to_sym][:lastUpdate] == 0
			@paddles[data["side"].to_sym][:lastUpdate] = newTime
			@paddles[data["side"].to_sym][:dir] = data["dir"]
			broadcastPaddleInfos(data)
			return
		end
		timeDelta = newTime - @paddles[data["side"].to_sym][:lastUpdate]

		if data["act"] == "press"
			pressKey(data, newTime, timeDelta)
		elsif data["act"] == "release" and @paddles[data["side"].to_sym][:dir] == data["dir"]
			releaseKey(data, newTime, timeDelta)
		end
	end

	def movePaddle(side, dir, delta)
		if dir == "up"
			@paddles[side][:y] -= delta
		elsif dir == "down"
			@paddles[side][:y] += delta
		end
		handlePaddleOverflow(side)
	end

	def pressKey(data, newTime, timeDelta)
		side = data["side"].to_sym
		movePaddle(side, @paddles[side][:dir], timeDelta * @paddles[:speed])
		@paddles[side][:dir] = data["dir"]
		@paddles[side][:lastUpdate] = newTime
		broadcastPaddleInfos(data)
	end

	def releaseKey(data, newTime, timeDelta)
		side = data["side"].to_sym
		movePaddle(side, data["dir"], timeDelta * @paddles[:speed])
		@paddles[side][:dir] = "stop"
		@paddles[side][:lastUpdate] = newTime
		broadcastPaddleInfos(data)
	end

	def handlePaddleOverflow(side)
		if @paddles[side][:y] - @paddles[:height] / 2.0 < 0.0
			@paddles[side][:y] = @paddles[:height] / 2.0
		elsif @paddles[side][:y] + @paddles[:height] / 2.0 > 100.0
			@paddles[side][:y] = 100.0 - @paddles[:height] / 2.0
		end
	end

	def broadcastPaddleInfos(data)
		ActionCable.server.broadcast("pong_channel", content: {
			act: data["act"],
			dir: data["dir"],
			side: data["side"],
			y: @paddles[data["side"].to_sym][:y]
		})
	end

	def updateBall
		newTime = Time.now.to_f * 1000.0 #ms
		timeDelta = newTime - @ball[:lastUpdate] #ms
		@ball[:lastUpdate] = newTime

		traveled = timeDelta * @ball[:speed]
		while traveled > 0.0
			traveled = setBallBeforeBounce(traveled)
		end
		broadcastBall()
	end

	def setBallBeforeBounce(remainingDistance)
		distanceToTopBottom, distanceToLeftRight = getTraveledDistance()
		minDistance = [distanceToTopBottom, distanceToLeftRight].min
		if remainingDistance < minDistance
			@ball[:posX] += remainingDistance * @ball[:deltaX]
			@ball[:posY] += remainingDistance * @ball[:deltaY]
			remainingDistance = 0
		elsif distanceToTopBottom < distanceToLeftRight
			@ball[:posX] += distanceToTopBottom * @ball[:deltaX]
			@ball[:posY] += distanceToTopBottom * @ball[:deltaY]
			@ball[:deltaY] *= -1.0
			remainingDistance -= distanceToTopBottom
		else #above left or right limit
			@ball[:posX] += distanceToLeftRight * @ball[:deltaX]
			@ball[:posY] += distanceToLeftRight * @ball[:deltaY]
			if ballHitPaddle()
				@ball[:deltaX] *= -1.0 #temp
			else
				score(@ball[:deltaX] < 0 ? :left : :right)
			end
			remainingDistance -= distanceToTopBottom
		end
		return remainingDistance
	end

	def getTraveledDistance
		toTopBottom = @ball[:deltaY] > 0 ? \
		(@ball[:bottomLimit] - @ball[:posY]) / @ball[:deltaY] \
		: (@ball[:posY] - @ball[:topLimit]) / -@ball[:deltaY]
		toLeftRight = @ball[:deltaX] > 0 ? \
		(@ball[:rightLimit] - @ball[:posX]) / @ball[:deltaX] \
		: (@ball[:posX] - @ball[:leftLimit]) / -@ball[:deltaX]
		return toTopBottom, toLeftRight
	end

	def broadcastBall
		ActionCable.server.broadcast "pong_channel", content: {
			act: 'ballUpdate',
			ball: @ball
		}
	end

	def ballHitPaddle
		false
	end

	def score(side)
		start()
	end

	# def calculatePaddlePosition(paddle)
	# 	newTime = Time.now.to_f * 1000 #ms
	# 	if paddle[:lastUpdate] == 0
	# 		paddle[:lastUpdate] = newTime
	# 		return
	# 	end
	# 	timeDelta = newTime - paddle[:lastUpdate]

	# 	if paddle[:dir] == "up"
	# 		paddle[:y] -= timeDelta * @paddles[:speed]
	# 	elsif paddle[:dir] == "down"
	# 		paddle[:y] += timeDelta * @paddles[:speed]
	# 	end
	# 	handlePaddleOverflow()
	# end

	# def touchLeftLimit(ballPosition)
	# 	ballPosition < @leftLimit
	# end

	# def ballMeetsPaddle(side)
	# 	@ball[:posY] + @ball[:radius] \
	# 	>= @paddles[side][:y] - @paddles[:height] / 2 \
	# 	and @ball[:posY] - @ball[:radius] \
	# 	>= @paddles[side][:y] + @paddles[:height] / 2
	# end

	# def updateBallDirection(side)
	# 	oldDirectionWasNegative = @ball[:deltaY] < 0
	# 	distBallPaddleCenter = getDistBallPaddleCenter(side)
	# 	@ball[:deltaX] = @minAngle[:dx] - @angleIncrement[:dx] * distBallPaddleCenter
	# 	@ball[:deltaY] = @minAngle[:dy] + @angleIncrement[:dy] * distBallPaddleCenter
	# 	if oldDirectionWasNegative
	# 		@ball[:deltaY] *= -1.0
	# 	end
	# end

	# def getDistBallPaddleCenter(side)
	# 	100 * abs(@paddles[side][:y] - @ball[:posY]) / (@paddles[:height] / 2.0)
	# end

end
