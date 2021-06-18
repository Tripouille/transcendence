let $friends, $friends_banner;
let $chat, $chat_banner;
let friends_out = true, chat_out = true;
let animating = false, timer = null;

export function foldFriends() {
	$friends.addClass('folded');
	friends_out = false;
}

function unfoldFriends() {
	$friends.removeClass('folded');
	friends_out = true;
}

export function foldTchat() {
	$chat.addClass('folded');
	chat_out = false;
}
function unfoldTchat() {
	$chat.removeClass('folded');
	chat_out = true;
}

$(function() {
	$(window).on('resize', function() {
		if (timer) {
			clearTimeout(timer);
			timer = null;
		}
		else
			$(document.body).addClass('stop-transitions');
		timer = setTimeout(function() {
			$(document.body).removeClass('stop-transitions');
			timer = null;
		}, 100);
	});

	const $account_menu = $('#account_menu');
	const $account_button = $('#account_button');
	$account_button.on('click', function() {
		$account_menu.toggle();
	});

	$friends_banner = $('#friends_banner');
	$friends = $('#friends');
	$friends_banner.on('click', function() {
		if (animating) return ;
		if (friends_out)
			foldFriends();
		else
			unfoldFriends();
	});

	$chat_banner = $('#chat_banner');
	$chat = $('#chat');
	$chat_banner.on('click', function() {
		if (chat_out)
			foldTchat();
		else
			unfoldTchat();
	});

	$(document).on('click', function(e) {
		if (e.target !== $account_button[0])
			$account_menu.hide();
	});
});