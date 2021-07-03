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
			if (!_thisView.model.get('otp_required_for_login')) {
				$.ajax({
					type: "GET",
					url: "/two_factor_settings/new"
				}).done(function() {
					_thisView.model.fetch().done(function() {
						_thisView.template = _.template($('#user-tfa-disable').html());
						_thisView.chargePage(_thisView);
					});
				});
			} else {
				this.model.fetch().done(function() {
					_thisView.chargePage(_thisView)
				});
			}
		};
	},

	chargePage: function(_thisView) {
		_thisView.$el.html(_thisView.template(_thisView.model.attributes));
		_thisView.$el.removeClass('loading');
		_thisView.$el.removeClass('lds-ripple');
		return _thisView;
	},

	onOtpFormSubmit: function(e) {
		e.preventDefault();
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
			}
		}).done(function(response) {
			if(response != 0){
				console.log(response);
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
			if(response != 0){
				console.log(response);
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
	},

	qrcode: function(value){
		let that = this;
		 let qrcode = new QRCode('qrcode', {// qrcode is the container ID
		 width: 210, // width
		 height: 210, // height
		 text: value, // QR code content is URL
		 // render:'canvas', // set the rendering method (there are two methods table and canvas, the default is canvas)
		 // background:'#f0f', // background color
		 // foreground:'#ff0' // foreground color
		})
	}

});
