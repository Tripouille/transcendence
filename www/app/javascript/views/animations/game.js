import consumer from "../../channels/consumer"
import * as GC from '../garbage_collector';

const UP_KEY = "ArrowUp";
const DOWN_KEY = "ArrowDown";
const timerColors = {
	3: 'green',
	2: 'orange',
	1: 'red'
};

let BH = {ball: null, angles: null};
let leftPaddle = {
	interval: null,
	lastUpdate: 0,
	y: 50
};
let rightPaddle = {
	interval: null,
	lastUpdate: 0,
	y: 50
};

let activeKey = null, side;
let $gameContainer, $gameArea, $ball, $leftPoints, $rightPoints, $timer;
let paddleSpeed, paddleHeight, paddleTopLimit, paddleBottomLimit;
let ballInterval, status = 'ready';
let paddleMessages = [];
let sendingMessage = false;
let pongSubscription;

export function connect(matchId, serverSide) {
	side = serverSide;
	defineJqueryObjects();
	$(window).resize(resizeGameArea);
	console.log('subscribing to channel ' + matchId);
	pongSubscription = consumer.subscriptions.create({
		channel: "PongChannel",
		match_id: matchId
	},
	{
		connected() {},
		disconnected() {},
		received(data) {
			//console.log('Received data from pong channel : ', data.content);
			if (data.content.act == "initialize")
				initializeFromServer(data.content);
			else if (data.content.act == "launchTimer")
				timerStart();
			else if (data.content.act == "gameStart")
				gameStart(data.content.match);
			else if (['stop', 'up', 'down'].includes(data.content.dir))
				paddleMove(data.content);
			else if (data.content.act == 'updateMatch')
				setMatchFromServer(data.content.match);
			else if (data.content.act == 'score')
				score(data.content.match);
			else if (data.content.act == 'end')
				endMatch(data.content.match);
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
	$leftPoints = $('#player_infos_left .score');
	$rightPoints = $('#player_infos_right .score');
	$timer = $('#timer');
	leftPaddle.$paddle = $('#paddle_left_container');
	rightPaddle.$paddle = $('#paddle_right_container');
	resizeGameArea();
}

function initializeFromServer(data) {
	// Initialize players infos
	$('#player_infos_left .name').text(data.players.left.login);
	$('#player_infos_right .name').text(data.players.right.login);

	// Initialize paddle infos
	paddleSpeed = data.paddles.speed;
	paddleHeight = data.paddles.height;
	paddleTopLimit = paddleHeight / 2.0;
	paddleBottomLimit = 100.0 - paddleHeight / 2.0;

	// Initialize ball
	BH.ball = data.ball;
	BH.ball.lastUpdate = getNow();
	BH.angles = data.angles;

	// Keys
	$(document).keydown(keyDownHandler);
	$(document).keyup(keyUpHandler);

	status = "ready";
}

function timerStart() {
	status = "timer";
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
	}, 3000);
}

function gameStart(match) {
	setMatchFromServer(match);
	activeKey = null;
	sendingMessage = false;
	$ball.show();
	ballInterval = GC.addInterval(moveBall, 10);
	status = "playing";
}

function pressKey(e, dir) {
	e.preventDefault();
	if (status != "playing")
		return ;
	if (dir != activeKey) {
		activeKey = dir;
		paddleMessages.unshift({
			'dir': dir
		});
		if (!sendingMessage)
			sendNextMessage();
	}
}

function releaseKey(dir) {
	if (dir == activeKey) {
		activeKey = null;
		paddleMessages.unshift({
			'dir': 'stop'
		});
		if (!sendingMessage)
			sendNextMessage();
	}
}

function sendNextMessage() {
	if (paddleMessages.length > 0) {
		sendingMessage = true;
		console.log('sending message');
		pongSubscription.send(paddleMessages.pop());
	}
}

function cleanGameIntervals() {
	GC.cleanInterval(ballInterval);
	GC.cleanInterval(leftPaddle.interval);
	GC.cleanInterval(rightPaddle.interval);
}

function startPaddleAnimation(paddle, direction) {
	stopPaddleAnimation(paddle);
	paddle.lastUpdate = getNow(); //ms
	if (direction == 'up') {
		paddle.interval = GC.addInterval(function() {
			movePaddleUp(paddle);
		}, 10);
	}
	else if (direction == 'down') {
		paddle.interval = GC.addInterval(function() {
			movePaddleDown(paddle);
		}, 10);
	}
}

function stopPaddleAnimation(paddle) {
	GC.cleanInterval(paddle.interval);
	paddle.interval = null;
}

function keyDownHandler(e) {
	//console.log('key down');
	if (e.key == UP_KEY)
		pressKey(e, 'up');
	else if (e.key == DOWN_KEY)
		pressKey(e, 'down');
}

function keyUpHandler(e) {
	if (e.key == UP_KEY)
		releaseKey('up');
	else if (e.key == DOWN_KEY)
		releaseKey('down');
}

function paddleMove(data) {
	if (status != "playing")
		return ;
	const paddle = data.side == 'left' ? leftPaddle : rightPaddle;

	setMatchFromServer(data.match);

	if (data.dir == 'up' || data.dir == 'down')
		startPaddleAnimation(paddle, data.dir);
	else if (data.dir == 'stop')
		stopPaddleAnimation(paddle);

	if (data.side == side) {
		sendingMessage = false;
		sendNextMessage();
	}
}

function updatePaddlePos(data, paddle) {
	paddle.$paddle.css({top: data.top + '%'});
	paddle.y = Number(data.top);
}

function getNow() {
	return (new Date().getTime());
}

function getTimeDeltaAndUpdate(handler) {
	const newTime = getNow();
	let timeDelta = newTime - handler.lastUpdate;
	handler.lastUpdate = newTime;
	return (timeDelta);
}

function movePaddleUp(paddle) {
	const timeDelta = getTimeDeltaAndUpdate(paddle);
	paddle.y -= Math.min(timeDelta * paddleSpeed, paddle.y - paddleTopLimit);
	paddle.$paddle.css({top: paddle.y + '%'});
}

function movePaddleDown(paddle) {
	const timeDelta = getTimeDeltaAndUpdate(paddle);
	paddle.y += Math.min(timeDelta * paddleSpeed, paddleBottomLimit - paddle.y);
	paddle.$paddle.css({top: paddle.y + '%'});
}

function moveBall() {
	if (status != "playing") 
	 	return ;
	let timeDelta = getTimeDeltaAndUpdate(BH.ball);
	BH.ball.x += BH.ball.dx * BH.ball.speed * timeDelta;
	BH.ball.y += BH.ball.dy * BH.ball.speed * timeDelta;
	const side = BH.ball.dx < 0 ? 'left' : 'right';
	const vside = BH.ball.dy < 0 ? 'up' : 'down';
	if ((vside == 'up' && BH.ball.y <= BH.ball.topLimit)
	|| (vside == 'down' && BH.ball.y >= BH.ball.bottomLimit))
		BH.ball.dy *= -1.0;
	else if ((side == 'left' && BH.ball.x <= BH.ball.leftLimit)
	|| (side == 'right' && BH.ball.x >= BH.ball.rightLimit)) {
		if (ballHitPaddle(side)) {
			updateBallDirection(side);
			updateBallSpeed();
		}
		else
			status = "scoring";
	}
	else
		updateBallCss();
}

function updateBallCss() {
	$ball.css({
		top: BH.ball.y + '%',
		left: BH.ball.x + '%'
	});
}

function ballHitPaddle(side) {
	if (side == 'left') {
		return (BH.ball.y + BH.ball.radius >= leftPaddle.y - paddleHeight / 2.0
				&& BH.ball.y - BH.ball.radius <= leftPaddle.y + paddleHeight / 2.0);
	}
	else if (side == 'right') {
		return (BH.ball.y + BH.ball.radius >= rightPaddle.y - paddleHeight / 2.0
				&& BH.ball.y - BH.ball.radius <= rightPaddle.y + paddleHeight / 2.0);
	}
}

function updateBallDirection(side) {
	const distBallPaddleCenter = Math.min(getDistBallPaddleCenter(side), 100.0)
	BH.ball.dx = (side == 'left' ? 1 : -1) * (BH.angles.min_dx - BH.angles.inc_x * distBallPaddleCenter);
	BH.ball.dy = (BH.ball.dy < 0 ? -1 : 1) * (BH.angles.min_dy + BH.angles.inc_y * distBallPaddleCenter);
}

function getDistBallPaddleCenter(side) {
	if (side == 'left')
		return (Math.abs(leftPaddle.y - BH.ball.y) / (paddleHeight / 2.0)) * 100;
	else if (side == 'right')
		return (Math.abs(rightPaddle.y - BH.ball.y) / (paddleHeight / 2.0)) * 100;
}

function updateBallSpeed() {
	if (BH.ball.speed < Number(BH.ball.max_speed))
		BH.ball.speed *= Number(BH.ball.speed_multiplier);
}

function setMatchFromServer(match) {
	const now = getNow();
	leftPaddle.lastUpdate = now;
	rightPaddle.lastUpdate = now;
	BH.ball.lastUpdate = now;
	leftPaddle.y = Number(match.left_paddle_y);
	rightPaddle.y = Number(match.right_paddle_y);
	leftPaddle.$paddle.css({top: leftPaddle.y + '%'});
	rightPaddle.$paddle.css({top: rightPaddle.y + '%'});
	BH.ball.x = Number(match.ball_x);
	BH.ball.y = Number(match.ball_y);
	BH.ball.dx = Number(match.ball_dx);
	BH.ball.dy = Number(match.ball_dy);
	BH.ball.speed = Number(match.ball_speed);
	updateBallCss();
	BH.ball.active = true;
	status = match.status;
}

function score(match) {
	status = "scoring";
	cleanGameIntervals();
	$leftPoints.text(match.left_score);
	$rightPoints.text(match.right_score);
}

function endMatch(match) {
	setMatchFromServer(match);
	GC.addTimeout(function() {
		window.router.navigate('game', true);
	}, 1000);
	consumer.subscriptions.remove(pongSubscription);
}