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
	if (!name) return ;
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
	})

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
	$friends.on('click', 'div.friend', function(e) {
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
	});

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
	});

	const $room_form = $('#room_form');
	$room_form.find('#cancel_room_creation').on('click', function() {
		$room_form.trigger('reset');
		$room_form.removeClass('visible');
	});
	$room_form.on('submit', function(e) {
		e.preventDefault();
		let valid_form = true;
		const $this = $(this);
		const $room_password_input = $this.find('input#room_password');
		const $room_type_inputs = $this.find('input[name=room_type]:checked');
		if ($room_type_inputs.val() == 'password_protected'
		&& !$room_password_input.val().trim()) {
			$room_password_input.css('border-color', 'red');
			setTimeout(function() {$room_password_input.css('border-color', '');}, 1000);
			$room_password_input.focus();
			valid_form = false;
		}
		const $room_name_input = $this.find('input#room_name');
		if (!$room_name_input.val().trim()) {
			$room_name_input.css('border-color', 'red');
			setTimeout(function() {$room_name_input.css('border-color', '');}, 1000);
			$room_name_input.focus();
			valid_form = false;
		}

		if (valid_form) {
			window.chatRoomsView.chatRoomsCollection.create({
				name: $room_name_input.val(),
				room_type: $room_type_inputs.val(),
				password: $room_password_input.val()
			}, {wait: true});
			$this.trigger('reset');
			$this.removeClass('visible');
		}
	});
});