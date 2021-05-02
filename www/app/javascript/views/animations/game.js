import * as GC from './garbage_collector';

function pong() {
	const $gameArea = $('#game_area');
	const $ball = $('#ball_container');
	let $previousBall = null;
	let lastPreviousBallUpdate = null;
	const $leftPoints = $('#player_infos_left .score');
	const $rightPoints = $('#player_infos_right .score');
	const LEFT_UP_KEY = "w";
	const LEFT_DOWN_KEY = "s";
	const RIGHT_UP_KEY = "ArrowUp";
	const RIGHT_DOWN_KEY = "ArrowDown";
	const $timer = $('#timer');
	const timerColors = {
		3: 'green',
		2: 'orange',
		1: 'red'
	};
	let paddleIsActive = false;
	const baseBallSpeed = 0.0025;
	let ballSpeed = baseBallSpeed;
	const paddleSpeed = 0.006;
	const minAngle = {
		x: 0.984,
		y: 0.174
	};
	const maxAngle = {
		x: 0.342,
		y: 0.939
	};
	const angleIncrement = {
		x: (minAngle.x - maxAngle.x) / 100.0,
		y: (maxAngle.y - minAngle.y) / 100.0
	};
	const startAngle = {
		x: 0.707,
		y: 0.707
	};
	
	let leftPaddleHandler = {
		$paddle: $('#paddle_left_container'),
		up: {
			interval: null,
			handler: movePaddleUp
		},
		down: {
			interval: null,
			handler: movePaddleDown
		}
	};
	
	let rightPaddleHandler = {
		$paddle: $('#paddle_right_container'),
		up: {
			interval: null,
			handler: movePaddleUp
		},
		down: {
			interval: null,
			handler: movePaddleDown
		}
	};
	
	let ballHandler = {
		interval: null,
		direction: {x: -1, y: -1}
	};
	
	const paddleHeight = leftPaddleHandler.$paddle.height() / $gameArea.height();
	const paddleTopLimit = paddleHeight / 2.0;
	const paddleBottomLimit = 1.0 - paddleTopLimit;
	const leftPaddleLimit = leftPaddleHandler.$paddle.width() / $gameArea.width();
	const rightPaddleLimit = 1.0 - leftPaddleLimit;
	const ballRadius = ($ball.width() / $gameArea.width()) / 2.0;
	const ballTopLimit = ballRadius;
	const ballBottomLimit = 1.0 - ballRadius;
	const ballLeftLimit = ballRadius;
	const ballRightLimit = 1.0 - ballRadius;
	
	function resetAllKeys() {
		resetKey(leftPaddleHandler, 'up');
		resetKey(leftPaddleHandler, 'down');
		resetKey(rightPaddleHandler, 'up');
		resetKey(rightPaddleHandler, 'down');
	}
	
	function resetKey(paddleHandler, direction) {
		GC.cleanInterval(paddleHandler[direction].interval);
		paddleHandler[direction].interval = null;
	}
	
	function activateKey(paddleHandler, direction) {
		paddleHandler[direction].interval = GC.addInterval(function() {
			paddleHandler[direction].handler(paddleHandler.$paddle);
		}, 1);
	}
	
	function switchKey(e, paddleHandler, oldDir, newDir) {
		e.preventDefault();
		if (!paddleIsActive || paddleHandler[newDir].interval != null)
			return ;
		resetKey(paddleHandler, oldDir);
		activateKey(paddleHandler, newDir);
	}
	
	function keyDownHandler(e) {
		if (e.key == RIGHT_UP_KEY)
			switchKey(e, rightPaddleHandler, 'down', 'up');
		else if (e.key == RIGHT_DOWN_KEY)
			switchKey(e, rightPaddleHandler, 'up', 'down');
		else if (e.key == LEFT_UP_KEY)
			switchKey(e, leftPaddleHandler, 'down', 'up');
		else if (e.key == LEFT_DOWN_KEY)
			switchKey(e, leftPaddleHandler, 'up', 'down');
	}
	
	function keyUpHandler(e) {
		if (e.key == RIGHT_UP_KEY)
			resetKey(rightPaddleHandler, 'up');
		else if (e.key == RIGHT_DOWN_KEY)
			resetKey(rightPaddleHandler, 'down');
		else if (e.key == LEFT_UP_KEY)
			resetKey(leftPaddleHandler, 'up');
		else if (e.key == LEFT_DOWN_KEY)
			resetKey(leftPaddleHandler, 'down');
	}
	
	function movePaddleUp($paddle) {
		const position = Number($paddle.position().top / $gameArea.height());
		const topPosition = Math.max(position - paddleSpeed, paddleTopLimit);
		$paddle.css({top: (topPosition * 100) + '%'});
	}
	
	function movePaddleDown($paddle) {
		const position = Number($paddle.position().top / $gameArea.height());
		const topPosition = Math.min(position + paddleSpeed, paddleBottomLimit);
		$paddle.css({top: (topPosition * 100) + '%'});
	}
	
	function moveBall() {
		//console.log('moving ball');
		const oldPosition = {
			top: Number($ball.position().top / $gameArea.height()),
			left: Number($ball.position().left / $gameArea.width())
		};
		const newPosition = {
			top: oldPosition.top + ballHandler.direction.y * ballSpeed,
			left: oldPosition.left + ballHandler.direction.x * ballSpeed
		};
		if (newPosition.top <= ballTopLimit || newPosition.top >= ballBottomLimit)
			ballHandler.direction.y *= -1.0;
		else if (ballMeetsPaddle(newPosition))
			ballSpeed *= 1.15;
		else if (newPosition.left <= ballLeftLimit || newPosition.left >= ballRightLimit)
			scorePoint(newPosition.left <= ballLeftLimit);
		else
		{
			if ((new Date()).getTime() - lastPreviousBallUpdate >= 100)
			{
				const $previousBall = $ball.clone();
				$previousBall.css({opacity: 0.6});
				$gameArea.append($previousBall);
				const interval = GC.addInterval(function() {
					$previousBall.css({opacity: $previousBall.css('opacity') - 0.2});
				}, 100);
				GC.addTimeout(function() {
					GC.cleanInterval(interval);
					$previousBall.remove();
				}, 300);
				lastPreviousBallUpdate = (new Date()).getTime();
			}
			$ball.css({
				top: (newPosition.top * 100) + '%',
				left: (newPosition.left * 100) + '%'
			});
		}
	}
	
	function timer() {
		$timer.show();
		$timer.text('3');
		$timer.css({color: 'green'});
		return GC.addInterval(function() {
			$timer.text(Number($timer.text()) - 1);
			$timer.css({color: timerColors[$timer.text()]});
		}, 1000);
	}
	
	function reset() {
		lastPreviousBallUpdate = (new Date()).getTime();
		const interval = timer();
		GC.addTimeout(function() {
			GC.cleanInterval(interval);
			$timer.hide();
			paddleIsActive = true;
			leftPaddleHandler.$paddle.css({top: '50%'});
			rightPaddleHandler.$paddle.css({top: '50%'});
			$ball.show();
			const randIncrement = Math.random() * 100;
			ballHandler.direction = {
				x: (Math.floor(Math.random() * 100) % 2 ? 1 : -1)
					* (minAngle.x - angleIncrement.x * randIncrement),
				y: (Math.floor(Math.random() * 100) % 2 ? 1 : -1)
					* (minAngle.y + angleIncrement.y * randIncrement)
			};
			$ball.css({
				top: '50%',
				left: '50%'
			});
			ballHandler.interval = GC.addInterval(moveBall, 1);
			ballSpeed = baseBallSpeed;
		}, 3000);
	}
	
	function scorePoint(leftSide) {
		paddleIsActive = false;
		resetAllKeys();
		GC.cleanInterval(ballHandler.interval);
		reset();
		if (leftSide)
			$rightPoints.text(Number($rightPoints.text()) + 1);
		else
			$leftPoints.text(Number($leftPoints.text()) + 1);
	}
	
	function changeBallDirection(distBallPaddleCenter, xSign)
	{
		const oldDirectionWasNegative = ballHandler.direction.y < 0;
		ballHandler.direction = {
			x: xSign * (minAngle.x - angleIncrement.x * distBallPaddleCenter),
			y: minAngle.y + angleIncrement.y * distBallPaddleCenter
		};
		if (oldDirectionWasNegative)
			ballHandler.direction.y *= -1.0;
		return (true);
	}
	
	function ballMeetsPaddle(ballPosition) {
		const bottomOfBallPosition = ballPosition.top + ballRadius;
		const topOfBallPosition = ballPosition.top - ballRadius;
		const leftPaddlePosition = leftPaddleHandler.$paddle.position().top / $gameArea.height();
		const rightPaddlePosition = rightPaddleHandler.$paddle.position().top / $gameArea.height();
		if (ballHandler.direction.x < 0.0
		&& ballPosition.left - ballRadius <= leftPaddleLimit
		&& bottomOfBallPosition >= leftPaddlePosition - paddleHeight / 2.0
		&& topOfBallPosition <= leftPaddlePosition + paddleHeight / 2.0)
			return (changeBallDirection(100 * Math.abs(leftPaddlePosition - ballPosition.top) / (paddleHeight / 2.0),
					1));
		else if (ballHandler.direction.x > 0.0
		&& ballPosition.left + ballRadius >= rightPaddleLimit
		&& bottomOfBallPosition >= rightPaddlePosition - paddleHeight / 2.0
		&& topOfBallPosition <= rightPaddlePosition + paddleHeight / 2.0)
			return (changeBallDirection(100 * Math.abs(rightPaddlePosition - ballPosition.top) / (paddleHeight / 2.0),
					-1));
		return (false);
	}
	
	$(document).keydown(keyDownHandler);
	$(document).keyup(keyUpHandler);
	reset();
}

export default pong;