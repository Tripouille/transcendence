let $friends, $friends_button;
let $tchat, $tchat_arrow;
let friends_out = true, tchat_out = true;
let animating = false;

export function foldFriends() {
	animating = true;
	$friends.css('overflow', 'hidden');
	$friends.animate({'height': 0}, 300, function() {
		$friends_button.css('border-bottom-style', 'groove');
		$friends.css('padding-top', 0);
		friends_out = false;
		animating = false;
	});
}

function unfoldFriends() {
	animating = true;
	$friends_button.css('border-bottom-style', 'none');
	$friends.css('padding-top', '1vh');
	$friends.animate({'height': '65vh'}, 300, function() {
		$friends.css('overflow', 'auto');
		friends_out = true;
		animating = false;
	});
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
	const $account_menu = $('#account_menu');
	const $account_button = $('#account_button');
	$account_button.on('click', function() {
		$account_menu.toggle();
	});

	$friends_button = $('#friends_button');
	$friends = $('#friends');
	$friends_button.on('click', function() {
		if (animating) return ;
		if (friends_out)
			foldFriends();
		else
			unfoldFriends();
	});

	$tchat_arrow = $('#tchat #arrow');
	$tchat = $('#tchat');
	$tchat_arrow.on('click', function() {
		if (animating) return ;
		if (tchat_out)
			foldTchat();
		else
			unfoldTchat();
	});
});