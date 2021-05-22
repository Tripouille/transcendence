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
			speed: 0.09,
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
		@BASE_BALL_SPEED = 0.025
		@MAX_BALL_SPEED = 0.2
		@BALL_SPEED_MULTIPLIER = 1.2
		@ball = {
			speed: @BASE_BALL_SPEED,
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
		@starting = false
	end

	def subscribed
		@match = Match.find(params["match_id"])
		stream_for @match

		puts @match.inspect
		if @match[:left_player] == connection.session[:user_id]
			puts "in if"
			scheduler = Rufus::Scheduler.new
			rufus = scheduler.schedule_every '1s' do
				puts "rufuuuus"
				if @match[:status] == "timer"
					PongChannel.broadcast_to @match, content: {
						act: 'connection',
						match: @match,
						paddles: @paddles
					}
					start()
					rufus.unschedule
					rufus.kill
				end
				sleep(1)
				@match.update
			end
		elsif @match[:right_player] == connection.session[:user_id]
			puts "in elsif"
			@match[:status] = "timer"
			@match.save
		end
	end

	def unsubscribed
	end

	def start
		if @starting then return end
		@starting = true
		@paddles[:active] = false
		PongChannel.broadcast_to @match, content: {
			act: 'timerStart'
		}
		Rufus::Scheduler.new.in '3s' do
			resetPaddles()
			resetBall()
			PongChannel.broadcast_to @match, content: {
				act: 'gameStart',
				ball: @ball
			}
			@starting = false
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
		@ball[:speed] = @BASE_BALL_SPEED
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
		puts data.inspect
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
		PongChannel.broadcast_to(@match, content: {
			act: data["act"],
			dir: data["dir"],
			side: data["side"],
			y: @paddles[data["side"].to_sym][:y]
		})
	end

	def updateBall
		now = Time.now.to_f * 1000.0 #ms
		totalTime = now - @ball[:lastUpdate]
		ballData = {
			remainingTime: totalTime,
			elapsedTime: 0.0,
			status: "running"
		}
		while ballData[:status] == "running"
			setBallBeforeBounce(ballData)
			ballData[:elapsedTime] = totalTime - ballData[:remainingTime]
		end
		if ballData[:status] == "stop"
			@ball[:lastUpdate] = now
			broadcastBall()
		elsif ballData[:status] == "score"
			score(side)
		end
	end

	def ballTouchBorder(ballRemainingTime, timeToBorder)
		ballRemainingTime < timeToBorder
	end

	def ballTouchVertBeforeHori(timeToTopBottom, timeToLeftRight)
		timeToTopBottom < timeToLeftRight
	end

	def updateBallSpeed
		if @ball[:speed] < @MAX_BALL_SPEED
			@ball[:speed] *= @BALL_SPEED_MULTIPLIER
		end
	end

	def setBallBeforeBounce(ballData)
		timeToTopBottom, timeToLeftRight = getTraveledTime()
		side = @ball[:deltaX] < 0 ? :left : :right

		if not ballTouchBorder(ballData[:remainingTime], [timeToTopBottom, timeToLeftRight].min)
			updateBallPosition(ballData[:remainingTime] * @ball[:speed])
			ballData[:status] = "stop"
		elsif ballTouchVertBeforeHori(timeToTopBottom, timeToLeftRight)
			updateBallPosition(timeToTopBottom * @ball[:speed])
			@ball[:deltaY] *= -1.0
			ballData[:remainingTime] -= timeToTopBottom
		else #touch hori
			time = @ball[:lastUpdate] + ballData[:elapsedTime] + timeToLeftRight - @paddles[side][:lastUpdate]
			movePaddle(side, @paddles[side][:dir], time * @paddles[:speed])
			updateBallPosition(timeToLeftRight * @ball[:speed])
			if ballHitPaddle(side)
				updateBallDirection(side)
				updateBallSpeed()
			else
				ballData[:status] = "score"
			end
			ballData[:remainingTime] -= timeToLeftRight
		end
	end

	def updateBallPosition(traveledDistance)
		@ball[:posX] += traveledDistance * @ball[:deltaX]
		@ball[:posY] += traveledDistance * @ball[:deltaY]
	end

	def updateBallDirection(side)
		distBallPaddleCenter = getDistBallPaddleCenter(side)
		@ball[:deltaX] = (side == :left ? 1 : -1) * (@minAngle[:dx] - @angleIncrement[:dx] * distBallPaddleCenter)
		@ball[:deltaY] = (@ball[:deltaY] < 0 ? -1 : 1) * (@minAngle[:dy] + @angleIncrement[:dy] * distBallPaddleCenter)
	end

	def getDistBallPaddleCenter(side)
		100 * (@paddles[side][:y] - @ball[:posY]).abs / (@paddles[:height] / 2.0)
	end

	def getTraveledTime
		toTopBottom = @ball[:deltaY] > 0 ? \
		(@ball[:bottomLimit] - @ball[:posY]) / @ball[:deltaY] \
		: (@ball[:posY] - @ball[:topLimit]) / -@ball[:deltaY]
		toLeftRight = @ball[:deltaX] > 0 ? \
		(@ball[:rightLimit] - @ball[:posX]) / @ball[:deltaX] \
		: (@ball[:posX] - @ball[:leftLimit]) / -@ball[:deltaX]
		return toTopBottom / @ball[:speed], toLeftRight / @ball[:speed]
	end

	def broadcastBall
		PongChannel.broadcast_to @match, content: {
			act: 'ballUpdate',
			ball: @ball
		}
	end

	def ballHitPaddle(side)
		return true
		@ball[:posY] + @ball[:radius] >= @paddles[side][:y] - @paddles[:height] / 2 \
		and @ball[:posY] - @ball[:radius] <= @paddles[side][:y] + @paddles[:height] / 2
	end

	def score(side)
		puts 'score'
		#start()
	end

	def calculatePaddlePosition(paddle)
		if paddle[:lastUpdate] == 0
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

end
