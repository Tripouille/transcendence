class PongChannel < ApplicationCable::Channel
	def initialize(connection, id, params)
		super

		@AREA_RATIO = 2.0
		@ANGLE = {
			min_dx: 0.984,
			min_dy: 0.174,
			max_dx: 0.342,
			max_dy: 0.939,
			inc_x: (0.984 - 0.342) / 100.0,
			inc_y: (0.939 - 0.174) / 100.0
		}
		@PADDLES = {
			speed: 0.09,
			height: 25.0,
			width: 2.0,
			offset: 1.0
		}
		@BALL_RADIUS = 3.0
		@BALL = {
			radius: @BALL_RADIUS,
			topLimit: @BALL_RADIUS,
			bottomLimit: 100.0 - @BALL_RADIUS,
			leftLimit: @PADDLES[:offset] + @PADDLES[:width] + (@BALL_RADIUS / @AREA_RATIO),
			rightLimit: 100.0 - @PADDLES[:width] - @PADDLES[:offset] - (@BALL_RADIUS / @AREA_RATIO),
			base_speed: 0.025,
			speed_multipler: 1.2,
			max_speed: 0.2
		}
	end

	def subscribed
		@matchId = params["match_id"]
		@match = Match.find(@matchId)
		stream_for @match

		if not ["lobby", "ready"].include? @match[:status]
			return
		end
		if @match[:left_player] == connection.session[:user_id]
			@PADDLE_SIDE = "left"
			@PADDLE_Y_LABEL = :left_paddle_y
			@PADDLE_DIR_LABEL = :left_paddle_dir
			scheduler = Rufus::Scheduler.new
			@rufus = scheduler.schedule_every('1s') do
				puts @match[:status]
				if @match[:status] == "ready"
					@match[:last_update] = getNow()
					PongChannel.broadcast_to @match, content: {
						act: 'initialize',
						match: @match,
						paddles: @PADDLES,
						ball: @BALL
					}
					start()
					@rufus.unschedule
					@rufus.kill
				end
				@match = Match.find(@matchId)
			end
		elsif @match[:right_player] == connection.session[:user_id]
			@PADDLE_SIDE = "right"
			@PADDLE_Y_LABEL = :right_paddle_y
			@PADDLE_DIR_LABEL = :right_paddle_dir
			@match[:status] = "ready"
			@match.save
		end
	end

	def unsubscribed
		if not @rufus.nil?
			@rufus.unschedule
			@rufus.kill
		end
	end

	def start
		@match = Match.find(@matchId)
		if @match[:status] == "timer" then return end
		@match.update_attribute(:status, "timer")
		PongChannel.broadcast_to @match, content: {
			act: 'launchTimer'
		}
		Rufus::Scheduler.new.in '3s' do
			resetGame()
			PongChannel.broadcast_to @match, content: {
				act: 'gameStart',
				match: @match
			}
		end
	end

	def initializeRandomBallDirection
		srand()
		randIncrement = rand(100)
		@match[:ball_dx] = [-1, 1].sample * (@ANGLE[:min_dx] - @ANGLE[:inc_x] * randIncrement)
		@match[:ball_dy] = [-1, 1].sample * (@ANGLE[:min_dy] + @ANGLE[:inc_y] * randIncrement)
	end

	def resetGame
		@match[:left_paddle_y] = 50.0
		@match[:left_paddle_dir] = "stop"
		@match[:right_paddle_y] = 50.0
		@match[:right_paddle_dir] = "stop"
		@match[:ball_x] = 50.0
		@match[:ball_y] = 50.0
		@match[:ball_speed] = @BALL[:base_speed]
		initializeRandomBallDirection()
		@match[:last_update] = getNow()
		@match[:status] = "playing"
		@match.save
	end

	def getNow
		Time.now.to_f * 1000.0
	end

	def receive(data)
		@match = Match.find(@matchId)
		if @match[:status] == "playing" and isValidAction(data["act"])
			updateMatch(data)
		end
	end

	def isValidAction(action)
		["updateMatch", "press", "release"].include? action
	end

	def updateMatch(data)
		puts 'updateMatch'
		now = getNow()
		totalTime = now - @match[:last_update]
		@match[:last_update] = now

		updatePaddles(data, now, totalTime)
		updateBall(now, totalTime)
		@match.save
		if @match[:status] == "scoring" then score() else broadcastMatch() end
	end

	def broadcastMatch
		@match.save
		PongChannel.broadcast_to @match, content: {
			act: 'updateMatch',
			match: @match
		}
	end
  
	def updatePaddles(data, now, totalTime)
		if data["act"] == "press"
			@match[@PADDLE_DIR_LABEL] = data["dir"]
			broadcastPaddleMovement(data)
		elsif data["act"] == "release" and @match[@PADDLE_DIR_LABEL] == data["dir"]
			@match[@PADDLE_DIR_LABEL] = "stop"
			broadcastPaddleMovement(data)
		end
		movePaddle(:left_paddle_y, @match[:left_paddle_dir], totalTime * @PADDLES[:speed])
		movePaddle(:right_paddle_y, @match[:right_paddle_dir], totalTime * @PADDLES[:speed])
	end

	def movePaddle(side, dir, delta)
		if dir == "up"
			@match[side] -= delta
		elsif dir == "down"
			@match[side] += delta
		end
		handlePaddleOverflow(side)
	end

	def handlePaddleOverflow(side)
		if @match[side] - @PADDLES[:height] / 2.0 < 0.0
			@match[side] = @PADDLES[:height] / 2.0
		elsif @match[side] + @PADDLES[:height] / 2.0 > 100.0
			@match[side] = 100.0 - @PADDLES[:height] / 2.0
		end
	end

	def broadcastPaddleMovement(data)
		PongChannel.broadcast_to(@match, content: {
			act: data["act"],
			dir: data["dir"],
			side: @PADDLE_SIDE
		})
	end

	def updateBall(now, totalTime)
		ballData = {
			remainingTime: totalTime,
			elapsedTime: 0.0,
			status: "running"
		}
		while ballData[:status] == "running"
			setBallBeforeBounce(ballData)
			ballData[:elapsedTime] = totalTime - ballData[:remainingTime]
		end
		if ballData[:status] == "score"
			@match[:status] = "scoring"
		end
	end

	def ballTouchBorder(ballRemainingTime, timeToBorder)
		timeToBorder <= ballRemainingTime
	end

	def ballTouchVertBeforeHori(timeToTopBottom, timeToLeftRight)
		timeToTopBottom < timeToLeftRight
	end

	def updateBallSpeed
		if @match[:ball_speed] < @BALL[:max_speed]
			@match[:ball_speed] *= @BALL[:speed_multipler]
		end
	end

	def setBallBeforeBounce(ballData)
		timeToTopBottom, timeToLeftRight = getTraveledTime()
		side = @match[:ball_dx] < 0 ? :left : :right

		if not ballTouchBorder(ballData[:remainingTime], [timeToTopBottom, timeToLeftRight].min)
			updateBallPosition(ballData[:remainingTime] * @match[:ball_speed])
			ballData[:status] = "stop"
		elsif ballTouchVertBeforeHori(timeToTopBottom, timeToLeftRight)
			updateBallPosition(timeToTopBottom * @match[:ball_speed])
			@match[:ball_dy] *= -1.0
			ballData[:remainingTime] -= timeToTopBottom
		else #touch hori
			updateBallPosition(timeToLeftRight * @match[:ball_speed])
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
		@match[:ball_x] += traveledDistance * @match[:ball_dx]
		@match[:ball_y] += traveledDistance * @match[:ball_dy]
	end

	def updateBallDirection(side)
		distBallPaddleCenter = [getDistBallPaddleCenter(side), 100.0].min
		@match[:ball_dx] = (side == :left ? 1 : -1) * (@ANGLE[:min_dx] - @ANGLE[:inc_x] * distBallPaddleCenter)
		@match[:ball_dy] = (@match[:ball_dy] < 0 ? -1 : 1) * (@ANGLE[:min_dy] + @ANGLE[:inc_y] * distBallPaddleCenter)
	end

	def getDistBallPaddleCenter(side)
		if side == :left
			100 * (@match[:left_paddle_y] - @match[:ball_y]).abs / (@PADDLES[:height] / 2.0)
		else
			100 * (@match[:right_paddle_y] - @match[:ball_y]).abs / (@PADDLES[:height] / 2.0)
		end
	end

	def getTraveledTime
		toTopBottom = @match[:ball_dy] > 0 ? \
		(@BALL[:bottomLimit] - @match[:ball_y]) / @match[:ball_dy] \
		: (@match[:ball_y] - @BALL[:topLimit]) / -@match[:ball_dy]
		toLeftRight = @match[:ball_dx] > 0 ? \
		(@BALL[:rightLimit] - @match[:ball_x]) / @match[:ball_dx] \
		: (@match[:ball_x] - @BALL[:leftLimit]) / -@match[:ball_dx]
		return toTopBottom / @match[:ball_speed], toLeftRight / @match[:ball_speed]
	end

	def ballHitPaddle(side)
		#return true
		if side == :left
			@match[:ball_y] + @BALL[:radius] >= @match[:left_paddle_y] - @PADDLES[:height] / 2 \
			and @match[:ball_y] - @BALL[:radius] <= @match[:left_paddle_y] + @PADDLES[:height] / 2
		else
			@match[:ball_y] + @BALL[:radius] >= @match[:right_paddle_y] - @PADDLES[:height] / 2 \
			and @match[:ball_y] - @BALL[:radius] <= @match[:right_paddle_y] + @PADDLES[:height] / 2
		end
	end

	def score()
		puts 'score'
		start()
	end
end