let $contacts, $contacts_button;
let contacts_out = true;
let animating = false;

export function foldContacts() {
	animating = true;
	$contacts.css('overflow', 'hidden');
	$contacts.animate({'height': 0}, 300, function() {
		$contacts_button.css('border-bottom-style', 'groove');
		$contacts.css('padding-top', 0);
		contacts_out = false;
		animating = false;
	});
}

function unfoldContacts() {
	animating = true;
	$contacts_button.css('border-bottom-style', 'none');
	$contacts.css('padding-top', '1vh');
	$contacts.animate({'height': '65%'}, 300, function() {
		$contacts.css('overflow', 'auto');
		contacts_out = true;
		animating = false;
	});
}

$(function() {
	const $account_menu = $('#account_menu');
	const $account_button = $('#account_button');
	$account_button.on('click', function() {
		$account_menu.toggle();
	});

	$contacts_button = $('#contacts_button');
	$contacts = $('#contacts');
	$contacts_button.on('click', function() {
		if (animating) return ;
		if (contacts_out)
			foldContacts();
		else
			unfoldContacts();
	});
});