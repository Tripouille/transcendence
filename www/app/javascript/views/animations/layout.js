let $friends, $friends_banner;
let $tchat, $tchat_banner;
let friends_out = true, tchat_out = true;
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
	$tchat.addClass('folded');
	tchat_out = false;
}
function unfoldTchat() {
	$tchat.removeClass('folded');
	tchat_out = true;
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

	$tchat_banner = $('#tchat_banner');
	$tchat = $('#tchat');
	$tchat_banner.on('click', function() {
		if (animating) return ;
		if (tchat_out)
			foldTchat();
		else
			unfoldTchat();
	});

	$(document).on('click', function(e) {
		if (e.target !== $account_button[0])
			$account_menu.hide();
	});
});