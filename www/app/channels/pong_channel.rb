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
			speed: 0.08,
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
			base_speed: 0.06,
			speed_multiplier: 1.2,
			max_speed: 0.15
		}
		
		@schedulers = {}
	end

	def subscribed
		@matchId = params["match_id"]
		updateMatchFromDB()
		stream_for @match

		if ["lobby", "ready"].include? @match[:status]
			if playerIsLeft()
				registerLeftPlayer()
				waitForOpponent()
			elsif playerIsRight()
				registerRightPlayer()
			end
		end
	end

	def unsubscribed
		puts @SIDE.to_s + ' unsubscribing'
		@schedulers.each do |key, scheduler|
			scheduler.unschedule
			scheduler.kill
		end
		stop_stream_for @match
	end

	def playerIsLeft
		@match[:left_player] == connection.session[:user_id]
	end

	def playerIsRight
		@match[:right_player] == connection.session[:user_id]
	end

	def registerLeftPlayer
		@SIDE = "left"
		@SIDE_PADDLE_Y = :left_paddle_y
		@SIDE_PADDLE_DIR = :left_paddle_dir
	end

	def registerRightPlayer
		@SIDE = "right"
		@SIDE_PADDLE_Y = :right_paddle_y
		@SIDE_PADDLE_DIR = :right_paddle_dir
		@match[:status] = "ready"
		saveMatchToDB()
	end

	def waitForOpponent
		players = {
			left: {
				login: User.find(@match[:left_player]).login
			},
			right: {
				login: User.find(@match[:right_player]).login
			}
		}
		@schedulers[:waitForOpponent] = Rufus::Scheduler.new.schedule_every('0.3s') do
			if @match[:status] == "ready"
				PongChannel.broadcast_to @match, content: {
					act: 'initialize',
					match: @match,
					players: players,
					paddles: @PADDLES,
					ball: @BALL,
					angles: @ANGLE
				}
				start()
				killScheduler(:waitForOpponent)
			end
			updateMatchFromDB()
		end
	end

	def killScheduler(key)
		@schedulers[key].unschedule
		@schedulers[key].kill
		@schedulers.delete(key)
	end

	def start
		updateMatchFromDB()
		if @match[:status] != "timer" then
			launchTimer()
			@schedulers[:timer] = Rufus::Scheduler.new.schedule_in '3s' do
				@schedulers.delete(:timer)
				resetGame()
				broadcastGameStart()
				gameLoop()
			end
		end
	end

	def launchTimer
		@match.update_attribute(:status, "timer")
		PongChannel.broadcast_to @match, content: {
			act: 'launchTimer'
		}
	end

	def broadcastGameStart
		PongChannel.broadcast_to @match, content: {
			act: 'gameStart',
			match: @match
		}
	end

	def resetMatch
		updateMatchFromDB()
		launchTimer()
		@schedulers[:timer] = Rufus::Scheduler.new.schedule_in '3s' do
			@schedulers.delete(:timer)
			resetGame()
			broadcastGameStart()
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
		saveMatchToDB()
	end

	def getNow
		Time.now.to_f * 1000.0
	end

	def updateMatchFromDB()
		ActiveRecord::Base.connection_pool.with_connection do
			@match = Match.find(@matchId)
		end
	end

	def saveMatchToDB()
		ActiveRecord::Base.connection_pool.with_connection do
			@match.save
		end
	end

	def gameLoop
		@schedulers[:gameLoop] = Rufus::Scheduler.new(frequency: "0.1s").schedule_every('0.3s') do
			if @match[:status] == "playing"
				updateMatchFromDB()
				updateMatch()
			end
		end
	end

	def updateMatch()
		now = getNow()
		totalTime = now - @match[:last_update]
		@match[:last_update] = now
		updatePaddlePos(:left_paddle_y, @match[:left_paddle_dir], totalTime * @PADDLES[:speed])
		updatePaddlePos(:right_paddle_y, @match[:right_paddle_dir], totalTime * @PADDLES[:speed])
		updateBall(now, totalTime)
		saveMatchToDB()
		if @match[:status] == "scoring" then score() end
	end

	def receive(data)
		updateMatchFromDB()
		if @match[:status] == "playing" and isValidAction(data["dir"])
			updateMatch()
			handleAndBroadcastPaddleMovement(data["dir"])
		end
	end

	def isValidAction(dir)
		return ["stop", "up", "down"].include? dir
	end

	def broadcastMatch
		PongChannel.broadcast_to @match, content: {
			act: 'updateMatch',
			match: @match
		}
	end

	def handleAndBroadcastPaddleMovement(dir)
		@match[@SIDE_PADDLE_DIR] = dir
		broadcastPaddleMovement(dir)
		saveMatchToDB()
	end

	def updatePaddlePos(side, dir, delta)
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

	def broadcastPaddleMovement(dir)
		PongChannel.broadcast_to(@match, content: {
			dir: dir,
			side: @SIDE,
			match: @match
		})
	end

	def updateBall(now, totalTime)
		ballData = {
			remainingTime: totalTime,
			elapsedTime: 0.0,
			hit: false,
			status: "running"
		}
		while ballData[:status] == "running"
			setBallBeforeBounce(ballData)
			ballData[:elapsedTime] = totalTime - ballData[:remainingTime]
		end
		if ballData[:hit] then broadcastMatch() end
		if ballData[:status] == "score" then @match[:status] = "scoring" end
	end

	def ballTouchBorder(ballRemainingTime, timeToBorder)
		timeToBorder <= ballRemainingTime
	end

	def ballTouchVertBeforeHori(timeToTopBottom, timeToLeftRight)
		timeToTopBottom < timeToLeftRight
	end

	def updateBallSpeed
		if @match[:ball_speed] < @BALL[:max_speed]
			@match[:ball_speed] *= @BALL[:speed_multiplier]
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
			ballData[:hit] = true
		else #touch hori
			updateBallPosition(timeToLeftRight * @match[:ball_speed])
			if ballHitPaddle(side)
				updateBallDirection(side)
				updateBallSpeed()
				ballData[:hit] = true
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
		if side == :left
			@match[:ball_y] + @BALL[:radius] >= @match[:left_paddle_y] - @PADDLES[:height] / 2 \
			and @match[:ball_y] - @BALL[:radius] <= @match[:left_paddle_y] + @PADDLES[:height] / 2
		else
			@match[:ball_y] + @BALL[:radius] >= @match[:right_paddle_y] - @PADDLES[:height] / 2 \
			and @match[:ball_y] - @BALL[:radius] <= @match[:right_paddle_y] + @PADDLES[:height] / 2
		end
	end

	def score()
		if @match[:ball_x] < 50.0 then @match[:right_score] += 1 else @match[:left_score] += 1 end
		saveMatchToDB()
		PongChannel.broadcast_to @match, content: {
			act: 'score',
			match: @match
		}
		if @match[:left_score] >= 3 or @match[:right_score] >= 3
			@match[:status] = "finished"
			saveMatchToDB()
			broadcastMatchEnd()
			killScheduler(:gameLoop)
		else
			resetMatch()
		end
	end

	def broadcastMatchEnd
		PongChannel.broadcast_to(@match, content: {
			act: "end",
			match: @match
		})
	end
end