import consumer from "../../channels/consumer"
import * as GC from '../garbage_collector';

const UP_KEY = "w";
const DOWN_KEY = "s";
const timerColors = {
	3: 'green',
	2: 'orange',
	1: 'red'
};

let BH = {ball: null};
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

let paddleIsActive = false, activeKey = null, side;
let $gameContainer, $gameArea, $ball, $leftPoints, $rightPoints, $timer;
let paddleSpeed, paddleHeight, paddleTopLimit, paddleBottomLimit;
let ballInterval;
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
	$('#player_infos_left .name').text(data.match.left_player);
	$('#player_infos_right .name').text(data.match.right_player);

	// Initialize paddle infos
	paddleSpeed = data.paddles.speed;
	paddleHeight = data.paddles.height;
	paddleTopLimit = paddleHeight / 2.0;
	paddleBottomLimit = 100.0 - paddleHeight / 2.0;

	// Initialize ball
	BH.ball = data.ball;
	BH.ball.lastUpdate = data.match.last_update;

	// Keys
	$(document).keydown(keyDownHandler);
	$(document).keyup(keyUpHandler);
}

function timerStart() {
	cleanGameIntervals();
	paddleIsActive = false;
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
	paddleIsActive = true;
	sendingMessage = false;
	$ball.show();
	ballInterval = GC.addInterval(moveBall, 10);
}

function pressKey(e, dir) {
	e.preventDefault();
	if (e.key != activeKey) {
		activeKey = e.key;
		paddleMessages.unshift({
			'dir': dir
		});
		if (!sendingMessage)
			sendNextMessage();
	}
}

function releaseKey(key) {
	if (key == activeKey) {
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
		console.log('sending ', paddleMessages[paddleMessages.length - 1]);
		sendingMessage = true;
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
	console.log('key down, sending message = ', sendingMessage);
	if (!paddleIsActive)
		return ;
	if (e.key == UP_KEY)
		pressKey(e, 'up');
	else if (e.key == DOWN_KEY)
		pressKey(e, 'down');
}

function keyUpHandler(e) {
	if (!paddleIsActive)
		return ;
	if (e.key == UP_KEY)
		releaseKey(e.key);
	else if (e.key == DOWN_KEY)
		releaseKey(e.key);
}

function paddleMove(data) {
	const paddle = data.side == 'left' ? leftPaddle : rightPaddle;

	console.log('paddleMove', data.dir);
	if (data.dir == 'up' || data.dir == 'down') {
		updatePaddlePos(data);
		startPaddleAnimation(paddle, data.dir);
	}
	else if (data.dir == 'stop')
	{
		stopPaddleAnimation(paddle);
		updatePaddlePos(data);
	}

	if (data.side == side) {
		sendingMessage = false;
		sendNextMessage();
	}
}

function updatePaddlePos(data) {
	leftPaddle.$paddle.css({top: data.left_top + '%'});
	rightPaddle.$paddle.css({top: data.right_top + '%'});
	leftPaddle.y = Number(data.left_top);
	rightPaddle.y = Number(data.right_top);
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
	// if (BH.ball == null) // CHECK MATCH STATUS
	// 	return ;
	let timeDelta = getTimeDeltaAndUpdate(BH.ball);
	BH.ball.x += BH.ball.dx * BH.ball.speed * timeDelta;
	BH.ball.y += BH.ball.dy * BH.ball.speed * timeDelta;
	if (BH.ball.y <= BH.ball.topLimit || BH.ball.y >= BH.ball.bottomLimit) {
		BH.ball.dy *= -1.0;
	}
	else if ((BH.ball.x <= BH.ball.leftLimit && BH.ball.dx < 0)
	|| (BH.ball.x >= BH.ball.rightLimit && BH.ball.dx > 0)) {
		BH.ball.dx *= -1.0;
	}
	else
	{
		$ball.css({
			top: BH.ball.y + '%',
			left: BH.ball.x + '%'
		});
	}
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
	$ball.css({
		top: BH.ball.y + '%',
		left: BH.ball.x + '%'
	});
}