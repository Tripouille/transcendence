let $contacts, $contacts_button;
let contacts_out = true;

export function foldContacts() {
	contacts_out = false;
	$contacts.css('overflow', 'hidden');
	$contacts.animate({'height': 0}, 300, function() {
		$contacts.css('padding-top', 0);
		$contacts_button.css('border-bottom-style', 'groove');
	});
}

function unfoldContacts() {
	contacts_out = true;
	$contacts.css('padding-top', '1%');
	$contacts_button.css('border-bottom-style', 'none');
	$contacts.animate({'height': '65%'}, 300, function() {
		$contacts.css('overflow', 'auto');
	});
}

$(function() {
	const $account_menu = $('#account_menu');
	const $account_button = $('#account_button');
	const $account_button_img = $('#account_button img');
	let account_menu_open = false;
	$account_button
		.on('click', function() {
			$account_menu.toggle();
			account_menu_open = !account_menu_open;
			if (account_menu_open)
				$account_button_img.css('opacity', 1);
		})
		.on('mouseenter', function() {
			$account_button_img.css('opacity', 1);
		})
		.on('mouseleave', function() {
			if (!account_menu_open)
				$account_button_img.css('opacity', 0.8);
		});

	$contacts_button = $('#contacts_button');
	$contacts = $('#contacts');
	$contacts_button.on('click', function() {
		if (contacts_out)
			foldContacts();
		else
			unfoldContacts();
	});
});