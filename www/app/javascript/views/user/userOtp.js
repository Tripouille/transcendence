import { User } from "../../models/user";

export const UserOtpView = Backbone.View.extend({

	template: _.template($('#user-otp').html()),

	events: {
		'click #formSubmitCheckOtp input' : 'onOtpCheckFormSubmit',
	},

	model: new User({ id:initCurrentUserId }),

	initialize: function() {
		console.log('OTP View has been init')
	},

	render: function() {
		let _thisView = this;

		this.$el.attr({id: 'user'});
		this.$el.append('<div class="loading">Loading...</div>');
		this.$el.append('<div class="lds-ripple"><p>Loading</p><div></div><div></div></div>');
		this.model.fetch().done(function() {
			console.log(_thisView.model);
			// if (!_thisView.model.get('otp_required_for_login')) {
			// 	$.ajax({
			// 		type: "GET",
			// 		url: "/two_factor_settings/new"
			// 	}).done(function(data) {
			// 		_thisView.chargePage(_thisView)
			// 	});
			// } else {
			// 	_thisView.template = _.template($('#user-tfa-disable').html())
			// 	_thisView.chargePage(_thisView)
			// }
			_thisView.chargePage(_thisView)
		});
	},

	chargePage: function(_thisView) {
		_thisView.$el.html(_thisView.template(_thisView.model.attributes));
		_thisView.$el.removeClass('loading');
		_thisView.$el.removeClass('lds-ripple');
		return _thisView;
	},

	onOtpCheckFormSubmit: function(e) {
		e.preventDefault();
		let _thisView = this;
		var fd = new FormData();
		const code = $('#code').val().trim();

		fd.append('code',code);
		$.ajax({
			url: "/two_factor_settings/check_otp",
			type: 'post',
			data: JSON.stringify({ 'code': code}),
			contentType: 'application/json',
			processData: false,
			headers: {
				'X-Transaction': 'POST Example',
				'X-CSRF-Token': $('meta[name="csrf-token"]').attr('content')
			},
			error: function (xhr, ajaxOptions, thrownError) {
				if (xhr.status == 401) {
					_thisView.showPopUpError("Authentification Failled.");
				}
			}
		});

	},

	showPopUpError: function (error) {
		const $erroPopUp = $('#errorPopUp');

		$erroPopUp.html(error);
		$erroPopUp.stop().fadeIn(100);
		$erroPopUp.css("display", "block");
		setTimeout(function () {
			$erroPopUp.stop().fadeOut(1000, function () {
				$erroPopUp.css("display", "none");
			});
		}, 4000);
	}

});
