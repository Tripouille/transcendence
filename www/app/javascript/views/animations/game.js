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
	up: {
		interval: null,
		handler: movePaddleUp
	},
	down: {
		interval: null,
		handler: movePaddleDown
	},
	lastUpdate: 0,
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
	y: 50
};

let paddleIsActive = false, activeKey = null, side;
let $gameContainer, $gameArea, $ball, $playerInfos, $leftPoints, $rightPoints, $timer;
let paddleSpeed, paddleHeight, paddleTopLimit, paddleBottomLimit;
let ballInterval, waitingForServer = false;
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
			else if (data.content.act == 'press' || data.content.act == 'release')
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
	$playerInfos = $('#player_infos_container');
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
	BH.ball.lastServerUpdate = data.match.last_update;

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
	$ball.show();
	//ballInterval = GC.addInterval(moveBall, 10);
}

let press;

function pressKey(e, dir) {
	e.preventDefault();
	if (e.key == activeKey)
		return ;
	activeKey = e.key;
	pongSubscription.send({
		'act': 'press',
		'dir': dir
	});
}

function releaseKey(key, dir) {
	if (key == activeKey)
		activeKey = null;
	pongSubscription.send({
		'act': 'release',
		'dir': dir
	});
}

function cleanGameIntervals() {
	GC.cleanInterval(ballInterval);
	GC.cleanInterval(leftPaddle.up.interval);
	GC.cleanInterval(leftPaddle.down.interval);
	GC.cleanInterval(rightPaddle.up.interval);
	GC.cleanInterval(rightPaddle.down.interval);
}

function startPaddleAnimation(paddle, direction) {
	paddle.lastUpdate = getNow(); //ms
	paddle[direction].interval = GC.addInterval(function() {
		paddle[direction].handler(paddle);
	}, 50);
}

function stopPaddleAnimation(paddle, direction) {
	GC.cleanInterval(paddle[direction].interval);
	paddle[direction].interval = null;
}

function keyDownHandler(e) {
	console.log('key down');
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
		releaseKey(e.key, 'up');
	else if (e.key == DOWN_KEY)
		releaseKey(e.key, 'down');
}

function paddleMove(data) {
	const paddle = data.side == 'left' ? leftPaddle : rightPaddle;

	if (data.act == 'press') {
		updatePaddlePos(data);
		stopPaddleAnimation(paddle, data.dir == 'up' ? 'down' : 'up');
		startPaddleAnimation(paddle, data.dir);
	}
	else if (data.act == 'release')
	{
		stopPaddleAnimation(paddle, data.dir);
		updatePaddlePos(data);
	}
}

function updatePaddlePos(data) {
	leftPaddle.$paddle.css({top: data.left_top + '%'});
	rightPaddle.$paddle.css({top: data.right_top + '%'});
	leftPaddle.y = Number(data.left_top);
	rightPaddle.y = Number(data.right_top);
	//leftPaddle.lastUpdate = Number(data.last_update);
	//rightPaddle.lastUpdate = Number(data.last_update);
	console.log('in updatePaddlePos, lastUpdate = '+ leftPaddle.lastUpdate);
}

function getNow() {
	return (new Date().getTime());
}

function getTimeDeltaAndUpdate(handler) {
	const newTime = getNow();
	let timeDelta = newTime - handler.lastUpdate;
	console.log('newTime = '+ newTime + ', lastUpdate = ' + handler.lastUpdate + ', timeDelta = ' + timeDelta);
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
	BH.ball.lastUpdate = Number(match.last_update);
	BH.ball.lastServerUpdate = BH.ball.lastUpdate;
}