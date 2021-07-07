import { User } from "../../models/user";

export const UserTfaView = Backbone.View.extend({

	template: _.template($('#user-tfa').html()),

	events: {
		'click #formSubmitEnableOtp input' : 'onOtpFormSubmit',
		'click .disable-btn' : 'disableOtp',
	},

	model: new User({ id:initCurrentUserId }),

	initialize: function() {
		console.log('User Tfa View has been init')
	},

	render: function(id) {
		if (initCurrentUserId == id) {
			let _thisView = this;

			this.$el.attr({id: 'user'});
			this.$el.append('<div class="loading">Loading...</div>');
			this.$el.append('<div class="lds-ripple"><p>Loading</p><div></div><div></div></div>');

			this.model.fetch().done(function() {;
				if (!_thisView.model.get('otp_required_for_login')) {
					_thisView.template = _.template($('#user-tfa').html())
					$.ajax({
						type: "GET",
						url: "/two_factor_settings/new"
					}).done(function(data) {
						$.ajax({
							type: "GET",
							url: "/two_factor_settings/qr_code_image"
						}).done(function(value) {
							let blob = new Blob([value], {type: 'image/svg+xml'});
							let url = URL.createObjectURL(blob);
							$(".otp_secret").text(_thisView.model.get('otp_secret'))
							_thisView.chargePage(_thisView, url);
						})
					});
				} else {
					_thisView.template = _.template($('#user-tfa-disable').html())
					_thisView.chargePage(_thisView)
				}
			});
		};
	},

	chargePage: function(_thisView, url) {
		_thisView.$el.html(_thisView.template(_thisView.model.attributes));
		$('#my-svg').attr('src', url);
		_thisView.$el.removeClass('loading');
		_thisView.$el.removeClass('lds-ripple');
		return _thisView;
	},

	onOtpFormSubmit: function(e) {
		e.preventDefault();
		let _thisView = this;
		var fd = new FormData();
		const code = $('#code').val().trim();
		fd.append('code',code);
		$.ajax({
			url: "two_factor_settings",
			type: 'post',
			data: JSON.stringify({ 'code': code}),
			contentType: 'application/json',
			processData: false,
			headers: {
				'X-Transaction': 'POST Example',
				'X-CSRF-Token': $('meta[name="csrf-token"]').attr('content')
			},
			error: function(model, response, options){
				_thisView.showPopUpError("Code is not valide")
			}
		}).done(function(response) {
			if(response != 0){
				Backbone.history.navigate("user", { trigger: true })
			}
		});

	},

	disableOtp: function(e) {
		e.preventDefault();
		$.ajax({
			url: "two_factor_settings",
			type: 'delete',
			contentType: false,
			processData: false,
			headers: {
				'X-Transaction': 'POST Example',
				'X-CSRF-Token': $('meta[name="csrf-token"]').attr('content')
			}
		}).done(function(response) {
			Backbone.history.navigate("user", { trigger: true })
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
