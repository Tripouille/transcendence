let $contacts, $contacts_button;
let contacts_out = true;

export function foldContacts() {
	if (!$contacts) return ;
	contacts_out = false;
	$contacts.addClass('folded');
	$contacts.animate({
		'height': 0,
		'padding-top': 0
		}, function() {
			$contacts.toggle();
			$contacts_button.addClass('folded');
		}
	);
	$contacts_button.animate({
		'border-bottom': '$border-width groove $border-color',
		'border-bottom-left-radius': '20px',
		'border-bottom-right-radius': '20px'
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
		contacts_out = !contacts_out;
		if (contacts_out) {
			$contacts_button.removeClass('folded');
			$contacts.toggle();
			$contacts.animate({
				'height': '65%',
				'padding-top': '1%'
				}, function() {
					$contacts.removeClass('folded');
				}
			);
		}
		else
			foldContacts();
		$contacts.addClass('red', 1000); //test en cours
	});
});