import consumer from "../../channels/consumer"
import * as GC from '../garbage_collector';

const LEFT_UP_KEY = "z";
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

export function connect(matchId) {
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
			console.log('Received data from pong channel : ', data.content);
			if (data.content.act == "connection")
				initializeFromServer(data.content);
			else if (data.content.act == "timerStart")
				timerStart();
			else if (data.content.act == "gameStart")
				gameStart(data.content.ball);
			else if (data.content.act == 'press' || data.content.act == 'release')
				paddleMove(data.content);
			else if (data.content.act == 'ballUpdate')
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
	console.log(data);
	$('#player_infos_left .name').text(data.match.left_player);
	$('#player_infos_right .name').text(data.match.right_player);
	paddleSpeed = data.paddles.speed;
	paddleHeight = data.paddles.height;
	paddleTopLimit = paddleHeight / 2.0;
	paddleBottomLimit = 100.0 - paddleHeight / 2.0;
	$(document).keydown(keyDownHandler);
	$(document).keyup(keyUpHandler);
}

function timerStart() {
	BH.ball = null;
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

function gameStart(serverBall) {
	leftPaddle.$paddle.css({top: '50%'});
	rightPaddle.$paddle.css({top: '50%'});
	leftPaddle.y = 50;
	rightPaddle.y = 50;
	leftPaddle.activeKey = null;
	rightPaddle.activeKey = null;
	paddleIsActive = true;
	$ball.show();
	//updateBallFromServer(serverBall);
	lastPreviousBallUpdate = (new Date()).getTime();
	//ballInterval = GC.addInterval(moveBall, 10);
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

function cleanGameIntervals() {
	GC.cleanInterval(ballInterval);
	GC.cleanInterval(leftPaddle.up.interval);
	GC.cleanInterval(leftPaddle.down.interval);
	GC.cleanInterval(rightPaddle.up.interval);
	GC.cleanInterval(rightPaddle.down.interval);
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
	
	paddle.y = data.y;
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
	if (handler.lastUpdate == 0) {
		handler.lastUpdate = newTime;
		return (0);
	}
	let timeDelta = newTime - handler.lastUpdate;
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
		BH.ball = null;
	}
	else if ((BH.ball.posX <= BH.ball.leftLimit && BH.ball.deltaX < 0)
	|| (BH.ball.posX >= BH.ball.rightLimit && BH.ball.deltaX > 0))
	{
		getBallFromServer();
		BH.ball = null;
	}
	else
	{
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

function updateBallFromServer(serverBall) {
	BH.ball = serverBall;
	$ball.css({
		top: BH.ball.posY + '%',
		left: BH.ball.posX + '%'
	});
}