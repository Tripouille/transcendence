const $gameArea = $('#game_area');
const $ball = $('#ball_container');
let $previousBall = null;
let $lastPreviousBallUpdate = null;
const $leftPoints = $('#player_infos_left .score');
const $rightPoints = $('#player_infos_right .score');
const $timer = $('#timer');
const timerColors = {
	3: 'green',
	2: 'orange',
	1: 'red'
};
let paddleIsActive = false;
const baseBallSpeed = 0.0025;
let ballSpeed = baseBallSpeed;
const paddleSpeed = 0.005;
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

$(function() {
	$(document).keydown(keyDownHandler);
	$(document).keyup(keyUpHandler);
	reset();
});

function resetAllKeys() {
	resetKey(leftPaddleHandler, 'up');
	resetKey(leftPaddleHandler, 'down');
	resetKey(rightPaddleHandler, 'up');
	resetKey(rightPaddleHandler, 'down');
}

function resetKey(paddleHandler, direction) {
	clearInterval(paddleHandler[direction].interval);
	paddleHandler[direction].interval = null;
}

function activateKey(paddleHandler, direction) {
	paddleHandler[direction].interval = setInterval(function() {
		paddleHandler[direction].handler(paddleHandler.$paddle);
	}, 1);
}

function switchKey(paddleHandler, oldDir, newDir) {
	if (paddleHandler[newDir].interval != null)
		return ;
	resetKey(paddleHandler, oldDir);
	activateKey(paddleHandler, newDir);
}

function keyDownHandler(e) {
	if (!paddleIsActive) {
		e.preventDefault();
		return ;
	}
	if (e.key == "ArrowUp")
		switchKey(rightPaddleHandler, 'down', 'up');
	else if (e.key == "ArrowDown")
		switchKey(rightPaddleHandler, 'up', 'down');
	else if (e.key == "z")
		switchKey(leftPaddleHandler, 'down', 'up');
	else if (e.key == "s")
		switchKey(leftPaddleHandler, 'up', 'down');
	else
		return ;
	e.preventDefault();
}

function keyUpHandler(e) {
	if (e.key == "ArrowUp")
		resetKey(rightPaddleHandler, 'up');
	else if (e.key == "ArrowDown")
		resetKey(rightPaddleHandler, 'down');
	else if (e.key == "z")
		resetKey(leftPaddleHandler, 'up');
	else if (e.key == "s")
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
	{
		console.log('ball meets paddle');
		ballSpeed *= 1.15;
	}
	else if (newPosition.left <= ballLeftLimit || newPosition.left >= ballRightLimit)
		scorePoint(newPosition.left <= ballLeftLimit);
	else
	{
		if ((new Date()).getTime() - $lastPreviousBallUpdate >= 100)
		{
			const $previousBall = $ball.clone();
			$previousBall.css({opacity: 0.6});
			$gameArea.append($previousBall);
			const interval = setInterval(function() {
				$previousBall.css({opacity: $previousBall.css('opacity') - 0.2});
			}, 100);
			setTimeout(function() {
				clearInterval(interval);
				$previousBall.remove();
			}, 300);
			$lastPreviousBallUpdate = (new Date()).getTime();
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
	return setInterval(function() {
		$timer.text(Number($timer.text()) - 1);
		$timer.css({color: timerColors[$timer.text()]});
	}, 1000);
}

function reset() {
	lastPreviousBallUpdate = (new Date()).getTime();
	const interval = timer();
	setTimeout(function() {
		clearInterval(interval);
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
		ballHandler.interval = setInterval(moveBall, 1);
		ballSpeed = baseBallSpeed;
	}, 3000);
}

function scorePoint(leftSide) {
	paddleIsActive = false;
	resetAllKeys();
	clearInterval(ballHandler.interval);
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