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

let BH = {ball: null};
let leftPaddle = {
	up: {
		interval: null,
		handler: movePaddleUp
	},
	down: {
		interval: null,
		handler: movePaddleDown
	},
	lastUpdate: 0,
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
	lastUpdate: 0,
	activeKey: null,
	y: 50
};

let $gameContainer, $gameArea, $ball, $playerInfos, $leftPoints, $rightPoints, $timer;
let paddleHeight, paddleTopLimit, paddleBottomLimit;
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
	const maxWidth = $(window).height() * 0.75 * ratio;
	if ($(window).width() < maxWidth) {
		$gameContainer.css('width', '100%');
		$gameArea.css('height', $gameArea.width() / ratio);
	}
	else {
		$gameArea.css('height', '75%');
		$gameContainer.css('width', $gameArea.height() * ratio);
	}
	$ball.css('width', $ball.height());
}

function defineJqueryObjects() {
	$gameContainer = $('#game_container');
	$gameArea = $('#game_area');
	$ball = $('#ball_container');
	$playerInfos = $('#player_infos_container');
	$leftPoints = $('#player_infos_left .score');
	$rightPoints = $('#player_infos_right .score');
	$timer = $('#timer');
	leftPaddle.$paddle = $('#paddle_left_container');
	rightPaddle.$paddle = $('#paddle_right_container');
	resizeGameArea();
}

function initializeFromServer(data) {
	BH.ball = data.ball;
	$ball.css({
		top: BH.ball.posY + '%',
		left: BH.ball.posX + '%'
	});
	paddleSpeed = data.paddles.speed;
	console.log(paddleSpeed);
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
	// BH.ball.delta = {
	// 	x: (Math.floor(Math.random() * 100) % 2 ? 1 : -1)
	// 		* (minAngle.x - angleIncrement.x * randIncrement),
	// 	y: (Math.floor(Math.random() * 100) % 2 ? 1 : -1)
	// 		* (minAngle.y + angleIncrement.y * randIncrement)
	// };
	$ball.css({
		top: '50%',
		left: '50%'
	});
	getBallFromServer();
	//lastPreviousBallUpdate = (new Date()).getTime();
	ballInterval = GC.addInterval(moveBall, 10);
	//GC.addInterval(getBallFromServer, 10);
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
	paddle.lastUpdate = new Date().getTime() / 1000.0; //s
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
	
	if (data.act == 'press') {
		resetPaddle(paddle, data.dir == 'up' ? 'down' : 'up');
		activatePaddle(paddle, data.dir);
	}
	else if (data.act == 'release')
		resetPaddle(paddle, data.dir);
	paddle.$paddle.css({top: data.y + '%'});
}

function getTimeDeltaAndUpdate(handler) {
	const newTime = new Date().getTime() / 1000.0;
	if (handler.lastUpdate == 0) {
		handler.lastUpdate = newTime;
		return (0);
	}
	let timeDelta = (newTime - handler.lastUpdate) * 1000;
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
	if (BH.ball == null)
		return ;
	let timeDelta = getTimeDeltaAndUpdate(BH.ball);
	BH.ball.posX += BH.ball.deltaX * BH.ball.speed * timeDelta;
	BH.ball.posY += BH.ball.deltaY * BH.ball.speed * timeDelta;
	if (BH.ball.posY <= BH.ball.topLimit || BH.ball.posY >= BH.ball.bottomLimit) {
		BH.ball.deltaY *= -1.0;
		getBallFromServer();
	}
	else if ((BH.ball.posX <= BH.ball.leftLimit && BH.ball.deltaX < 0)
	|| (BH.ball.posX >= BH.ball.rightLimit && BH.ball.deltaX > 0))
		getBallFromServer();
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
			top: BH.ball.posY + '%',
			left: BH.ball.posX + '%'
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
// 	GC.cleanInterval(BH.ball.interval);
// 	reset();
// 	if (leftSide)
// 		$rightPoints.text(Number($rightPoints.text()) + 1);
// 	else
// 		$leftPoints.text(Number($leftPoints.text()) + 1);
// }

// function changeBallDirection(distBallPaddleCenter, xSign)
// {
// 	const oldDirectionWasNegative = BH.ball.deltaY < 0;
// 	BH.ball.delta = {
// 		x: xSign * (minAngle.x - angleIncrement.x * distBallPaddleCenter),
// 		y: minAngle.y + angleIncrement.y * distBallPaddleCenter
// 	};
// 	if (oldDirectionWasNegative)
// 		BH.ball.deltaY *= -1.0;
// 	return (true);
// }

// function ballMeetsPaddle(ballPosition) {
// 	const bottomOfBallPosition = ballPosition.top + ballRadius;
// 	const topOfBallPosition = ballPosition.top - ballRadius;
// 	const leftPaddlePosition = leftPaddle.$paddle.position().top / $gameArea.height();
// 	const rightPaddlePosition = rightPaddle.$paddle.position().top / $gameArea.height();
// 	if (BH.ball.deltaX < 0.0
// 	&& ballPosition.left - ballRadius <= leftPaddleLimit
// 	&& bottomOfBallPosition >= leftPaddlePosition - paddleHeight / 2.0
// 	&& topOfBallPosition <= leftPaddlePosition + paddleHeight / 2.0)
// 		return (changeBallDirection(100 * Math.abs(leftPaddlePosition - ballPosition.top) / (paddleHeight / 2.0),
// 				1));
// 	else if (BH.ball.deltaX > 0.0
// 	&& ballPosition.left + ballRadius >= rightPaddleLimit
// 	&& bottomOfBallPosition >= rightPaddlePosition - paddleHeight / 2.0
// 	&& topOfBallPosition <= rightPaddlePosition + paddleHeight / 2.0)
// 		return (changeBallDirection(100 * Math.abs(rightPaddlePosition - ballPosition.top) / (paddleHeight / 2.0),
// 				-1));
// 	return (false);
// }

function updateBallFromServer(serverBall) {
	BH.ball = serverBall;
	// console.log('BH.ball from updateBall: ' + BH.ball);
	// console.log('BH.ball.posX from updateBall: ', BH.ball.posX);
	// console.log('BH.ball.deltaX from updateBall: ', BH.ball.deltaX);
	$ball.css({
		top: BH.ball.posY + '%',
		left: BH.ball.posX + '%'
	});
}

//todo
//passer en ms
//check getBallFromServer() du start
//synchrone avec if return;