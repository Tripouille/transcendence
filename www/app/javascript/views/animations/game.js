import consumer from "../../channels/consumer"
import * as GC from './garbage_collector';

const LEFT_UP_KEY = "w";
const LEFT_DOWN_KEY = "s";
const RIGHT_UP_KEY = "ArrowUp";
const RIGHT_DOWN_KEY = "ArrowDown";
const timerColors = {
	3: 'green',
	2: 'orange',
	1: 'red'
};
let paddleSpeed = 0.0;

let lastPreviousBallUpdate = null;
let paddleIsActive = false;

let ball;
let leftPaddle = {
	up: {
		interval: null,
		handler: movePaddleUp
	},
	down: {
		interval: null,
		handler: movePaddleDown
	},
	lastUpdate: 0.0,
	activeKey: null,
	y: 50
};
let rightPaddle = {
	up: {
		interval: null,
		handler: movePaddleUp
	},
	down: {
		interval: null,
		handler: movePaddleDown
	},
	lastUpdate: 0.0,
	activeKey: null,
	y: 50
};

let $gameArea, $ball, $leftPoints, $rightPoints, $timer;
let paddleHeight, paddleTopLimit, paddleBottomLimit;//, leftPaddleLimit, rightPaddleLimit;
// let ballTopLimit, ballBottomLimit, ballLeftLimit, ballRightLimit;
let ballInterval;
let pongSubscription;

export function connect() {
	defineJqueryObjects();
	$(window).resize(resizeGameArea);
	pongSubscription = consumer.subscriptions.create("PongChannel", {
		connected() {},
		disconnected() {},
		received(data) {
			//console.log('Received data from pong channel : ', data.content);
			if (data.content['act'] == "connection")
				initializeFromServer(data.content);
			else if (data.content['act'] == "start")
				timerAndStart();
			else if (data.content['act'] == 'press' || data.content['act'] == 'release')
				paddleMove(data.content);
			else if (data.content['act'] == 'ballUpdate')
				updateBallFromServer(data.content.ball);
			else
				console.log('Error: unrecognized data');
		}
	});
}

function resizeGameArea() {
	const ratio = 2.0;
	if ($(window).width() < $(window).height() * 0.75 * ratio) {
		$gameArea.css('width', '100%');
		$gameArea.css('height', $gameArea.width() / ratio);
	}
	else {
		$gameArea.css('height', '75%');
		$gameArea.css('width', $gameArea.height() * ratio);
	}
}

function defineJqueryObjects() {
	$gameArea = $('#game_area');
	$ball = $('#ball_container');
	$ball.css('width', $ball.height());
	resizeGameArea();
	$leftPoints = $('#player_infos_left .score');
	$rightPoints = $('#player_infos_right .score');
	$timer = $('#timer');
	leftPaddle.$paddle = $('#paddle_left_container');
	rightPaddle.$paddle = $('#paddle_right_container');
}

function initializeFromServer(data) {
	ball = data.ball;
	$ball.css({
		top: ball.pos.y + '%',
		left: ball.pos.x + '%'
	});
	paddleSpeed = data.paddles.speed;
	paddleHeight = data.paddles.height;
	paddleTopLimit = paddleHeight / 2.0;
	paddleBottomLimit = 100.0 - paddleHeight / 2.0;
	$(document).keydown(keyDownHandler);
	$(document).keyup(keyUpHandler);
}

function timerAndStart() {
	$timer.show();
	$timer.text('3');
	$timer.css({color: 'green'});
	const interval = GC.addInterval(function() {
		$timer.text(Math.max(Number($timer.text()) - 1, 1));
		$timer.css({color: timerColors[$timer.text()]});
	}, 1000);
	GC.addTimeout(function() {
		GC.cleanInterval(interval);
		$timer.hide();
		start();
	}, 3000);
}

function start() {
	leftPaddle.$paddle.css({top: '50%'});
	rightPaddle.$paddle.css({top: '50%'});
	leftPaddle.y = 50;
	rightPaddle.y = 50;
	leftPaddle.activeKey = null;
	rightPaddle.activeKey = null;
	paddleIsActive = true;
	$ball.show();
	//const randIncrement = Math.random() * 100;
	// ball.delta = {
	// 	x: (Math.floor(Math.random() * 100) % 2 ? 1 : -1)
	// 		* (minAngle.x - angleIncrement.x * randIncrement),
	// 	y: (Math.floor(Math.random() * 100) % 2 ? 1 : -1)
	// 		* (minAngle.y + angleIncrement.y * randIncrement)
	// };
	$ball.css({
		top: '50%',
		left: '50%'
	});
	ball.pos.x = 50;
	ball.pos.y = 50;
	ball.lastUpdate = (new Date()).getTime();
	//lastPreviousBallUpdate = (new Date()).getTime();
	//ballInterval= GC.addInterval(moveBall, 100);
	GC.addInterval(getBallFromServer, 10);
}

function switchKey(e, paddle, oldDir, newDir) {
	e.preventDefault();
	if (e.key == paddle.activeKey)
		return ;
	paddle.activeKey = e.key;
	pongSubscription.send({
		'act': 'press',
		'dir': newDir,
		'side': paddle == leftPaddle ? 'left' : 'right'
	});
}

function resetKey(key, paddle, direction) {
	if (key == paddle.activeKey)
		paddle.activeKey = null;
	pongSubscription.send({
		'act': 'release',
		'dir': direction,
		'side': paddle == leftPaddle ? 'left' : 'right'
	});
}

function resetAllKeys() {
	resetKey(null, leftPaddle, 'up');
	resetKey(null, leftPaddle, 'down');
	resetKey(null, rightPaddle, 'up');
	resetKey(null, rightPaddle, 'down');
}

function activatePaddle(paddle, direction) {
	paddle.lastUpdate = new Date().getTime(); //ms
	paddle[direction].interval = GC.addInterval(function() {
		paddle[direction].handler(paddle);
	}, 1);
}

function resetPaddle(paddle, direction) {
	GC.cleanInterval(paddle[direction].interval);
	paddle[direction].interval = null;
}

function keyDownHandler(e) {
	console.log('key down');
	if (!paddleIsActive)
		return ;
	if (e.key == RIGHT_UP_KEY)
		switchKey(e, rightPaddle, 'down', 'up');
	else if (e.key == RIGHT_DOWN_KEY)
		switchKey(e, rightPaddle, 'up', 'down');
	else if (e.key == LEFT_UP_KEY)
		switchKey(e, leftPaddle, 'down', 'up');
	else if (e.key == LEFT_DOWN_KEY)
		switchKey(e, leftPaddle, 'up', 'down');
}

function keyUpHandler(e) {
	if (!paddleIsActive)
		return ;
	if (e.key == RIGHT_UP_KEY)
		resetKey(e.key, rightPaddle, 'up');
	else if (e.key == RIGHT_DOWN_KEY)
		resetKey(e.key, rightPaddle, 'down');
	else if (e.key == LEFT_UP_KEY)
		resetKey(e.key, leftPaddle, 'up');
	else if (e.key == LEFT_DOWN_KEY)
		resetKey(e.key, leftPaddle, 'down');
}

function paddleMove(data) {
	const paddle = data.side == 'left' ? leftPaddle : rightPaddle;
	paddle.$paddle.css({top: data.y + '%'});

	if (data.act == 'press') {
		resetPaddle(paddle, data.dir == 'up' ? 'down' : 'up');
		activatePaddle(paddle, data.dir);
	}
	else if (data.act == 'release')
		resetPaddle(paddle, data.dir);
}

function getTimeDeltaAndUpdate(handler) {
	const newTime = new Date().getTime();
	const timeDelta = newTime - handler.lastUpdate;
	handler.lastUpdate = newTime;
	return (timeDelta);
}

function movePaddleUp(paddle) {
	const timeDelta = getTimeDeltaAndUpdate(paddle);
	paddle.y -= Math.min(timeDelta * paddleSpeed, paddle.y - paddleTopLimit);
	paddle.$paddle.css({top : paddle.y + '%'});
}

function movePaddleDown(paddle) {
	const timeDelta = getTimeDeltaAndUpdate(paddle);
	paddle.y += Math.min(timeDelta * paddleSpeed, paddleBottomLimit - paddle.y);
	paddle.$paddle.css({top: paddle.y + '%'});
}

function moveBall() {
	const timeDelta = getTimeDeltaAndUpdate(ball);
	// const oldPosition = {
	// 	top: Number($ball.position().top / $gameArea.height()),
	// 	left: Number($ball.position().left / $gameArea.width())
	// };
	// const newPosition = {
	// 	top: oldPosition.top + ball.delta.y * ball.speed,
	// 	left: oldPosition.left + ball.delta.x * ball.speed
	// };
	ball.pos.x += ball.delta.y * ball.speed * timeDelta;
	ball.pos.y += ball.delta.x * ball.speed * timeDelta;
	if (ball.pos.y <= ball.topLimit || ball.pos.y >= ball.bottomLimit)
		ball.delta.y *= -1.0;
	/*else if (ballMeetsPaddle(newPosition))
		ballSpeed *= 1.15;
	else if (newPosition.left <= ballLeftLimit || newPosition.left >= ballRightLimit)
		scorePoint(newPosition.left <= ballLeftLimit);*/
	// else if ((newPosition.left - ballRadius <= leftPaddleLimit && ball.delta.x < 0)
	// || (newPosition.left + ballRadius >= rightPaddleLimit && ball.delta.x > 0))
	// 	getBallFromServer();
	else
	{
		// if ((new Date()).getTime() - lastPreviousBallUpdate >= 100)
		// {
		// 	const $previousBall = $ball.clone();
		// 	$previousBall.css({opacity: 0.6});
		// 	$gameArea.append($previousBall);
		// 	const interval = GC.addInterval(function() {
		// 		$previousBall.css({opacity: $previousBall.css('opacity') - 0.2});
		// 	}, 100);
		// 	GC.addTimeout(function() {
		// 		GC.cleanInterval(interval);
		// 		$previousBall.remove();
		// 	}, 300);
		// 	lastPreviousBallUpdate = (new Date()).getTime();
		// }
		$ball.css({
			top: ball.pos.y + '%',
			left: ball.pos.x + '%'
		});
	}
}

function getBallFromServer() {
	pongSubscription.send({
		"request": "ball"
	});
}

// function scorePoint(leftSide) {
// 	paddleIsActive = false;
// 	resetAllKeys();
// 	GC.cleanInterval(ball.interval);
// 	reset();
// 	if (leftSide)
// 		$rightPoints.text(Number($rightPoints.text()) + 1);
// 	else
// 		$leftPoints.text(Number($leftPoints.text()) + 1);
// }

// function changeBallDirection(distBallPaddleCenter, xSign)
// {
// 	const oldDirectionWasNegative = ball.delta.y < 0;
// 	ball.delta = {
// 		x: xSign * (minAngle.x - angleIncrement.x * distBallPaddleCenter),
// 		y: minAngle.y + angleIncrement.y * distBallPaddleCenter
// 	};
// 	if (oldDirectionWasNegative)
// 		ball.delta.y *= -1.0;
// 	return (true);
// }

// function ballMeetsPaddle(ballPosition) {
// 	const bottomOfBallPosition = ballPosition.top + ballRadius;
// 	const topOfBallPosition = ballPosition.top - ballRadius;
// 	const leftPaddlePosition = leftPaddle.$paddle.position().top / $gameArea.height();
// 	const rightPaddlePosition = rightPaddle.$paddle.position().top / $gameArea.height();
// 	if (ball.delta.x < 0.0
// 	&& ballPosition.left - ballRadius <= leftPaddleLimit
// 	&& bottomOfBallPosition >= leftPaddlePosition - paddleHeight / 2.0
// 	&& topOfBallPosition <= leftPaddlePosition + paddleHeight / 2.0)
// 		return (changeBallDirection(100 * Math.abs(leftPaddlePosition - ballPosition.top) / (paddleHeight / 2.0),
// 				1));
// 	else if (ball.delta.x > 0.0
// 	&& ballPosition.left + ballRadius >= rightPaddleLimit
// 	&& bottomOfBallPosition >= rightPaddlePosition - paddleHeight / 2.0
// 	&& topOfBallPosition <= rightPaddlePosition + paddleHeight / 2.0)
// 		return (changeBallDirection(100 * Math.abs(rightPaddlePosition - ballPosition.top) / (paddleHeight / 2.0),
// 				-1));
// 	return (false);
// }

function updateBallFromServer(serverBall) {
	ball = serverBall;
	$ball.css({
		top: ball.pos.y + '%',
		left: ball.pos.x + '%'
	});
}