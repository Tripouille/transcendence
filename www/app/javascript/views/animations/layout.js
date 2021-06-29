let $friends, $chat, $add_friend;
let friends_out = true, chat_out = true;
let animating = false;

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

function addFriend(name) {
	if (!name.trim()) return ;
	$.ajax({
		type: 'POST',
		url: '/friendships',
		headers: {
			'X-CSRF-Token': $('meta[name="csrf-token"]').attr('content')
		},
		data: {friend_name: name.trim()},
		success: function(response) {
			if (response.status == "success") {
				window.friendsListView.friendsCollection.fetch();
				$add_friend.find('input').val('');
				$add_friend.hide();
				unfoldFriends();
			}
			else {
				$add_friend.append($('<div class="error">Invalid username</div>'));
				setTimeout(function() {
					$add_friend.find('.error').remove();
				}, 1000);
			}
		}
	});
}

$(function() {
	let timer = null;
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

	const $friends_banner = $('#friends_banner');
	$friends = $('#friends');
	$friends_banner.on('click', function(e) {
		if (animating) return ;
		if (this != e.target) return ;
		if (friends_out)
			foldFriends();
		else
			unfoldFriends();
	});
	$add_friend = $('#friends_banner #add_friend');
	const $add_friend_input = $add_friend.find('input');
	$('#friends_banner .plus').on('click', function(e) {
		$add_friend.toggle();
		if ($add_friend.is(":visible"))
			$add_friend_input.focus();
		
	});
	$add_friend_input.keydown(function(e) {
		if (e.keyCode == 13)
			addFriend(this.value);
	});

	const $friends_menu = $friends.find('#friends_menu');
	window.active_friend = null;
	$friends.on('click', 'div.friend', function() {
		$friends.find('div.friend').removeClass('active');
		const $this = $(this);
		if (window.active_friend == this.id) {
			$friends_menu.hide();
			window.active_friend = null;
		}
		else {
			$this.addClass('active');
			$friends_menu.css({top: 'calc(3.2 * ' + $friends_menu.css('font-size') + ' + ' + $this.position().top + 'px)'});
			$friends_menu.show();
			window.active_friend = this.id;
		}
	}).on('mousedown', function(e) {e.preventDefault();});

	const $chat_banner = $('#chat_banner');
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
		if (window.active_friend) {
			const $friend_divs = $friends.find('div.friend');
			if (!$friend_divs.is(e.target) && !$friend_divs.has(e.target).length) {
				$friend_divs.removeClass('active');
				$friends_menu.hide();
				window.active_friend = null;
			}
		}
		$('#chat_rooms ul.room_menu').hide();
		const $chat_members_lists = $('#chat div.room_members');
		if (!$chat_members_lists.is(e.target) && !$chat_members_lists.has(e.target).length) {
			$chat_members_lists.find('ul.user_menu').hide();
		}
	});
});