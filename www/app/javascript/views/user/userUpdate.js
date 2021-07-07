import { User } from "../../models/user";

export const UserUpdateView = Backbone.View.extend({

	template: _.template($('#user-modify').html()),

	events: {
		'click #formSubmitUpdateUser input' : 'onFormSubmit',
		'click .back-btn' : 'clickHandler',
		'change .custom-file-input' : 'changeFileName'
	},

	model: new User({ id:initCurrentUserId }),

	initialize: function() {
		console.log('User Update View has been init')
	},

	render: function(id) {
		if (initCurrentUserId == id) {
			let _thisView = this;

			this.$el.attr({id: 'user'});
			this.$el.append('<div class="loading">Loading...</div>');
			this.$el.append('<div class="lds-ripple"><p>Loading</p><div></div><div></div></div>');
			this.model.fetch().done(function() {
				$.ajax({
					type: "GET",
					url: "users/" + initCurrentUserId + "/avatar",
					xhrFields: {
						responseType: 'blob'
					},
				}).done(function(data) {
					const url = window.URL || window.webkitURL;
					const src = url.createObjectURL(data);
					_thisView.chargePage(_thisView, src)
				});
			});
		} else {
			Backbone.history.navigate("user", { trigger: true });
		}
	},

	chargePage: function(_thisView, src) {
		_thisView.$el.html(_thisView.template(_thisView.model.attributes));
		$('#avatar_profile').attr('src', src);
		_thisView.$el.removeClass('loading');
		_thisView.$el.removeClass('lds-ripple');
		return _thisView;
	},

	updateProfil: function() {
		let _thisView = this;
		_.bindAll(this, "render");
		if ($('#username').val().trim().length < 2 || $('#username').val().trim().length > 20) {
			_thisView.showPopUpError("Invalid len Username Min 2 - Max 20");
		} else {
			this.model.save({ username: $('#username').val().trim() }, {
				error: function (model, response, options) {
					if (response.responseText.includes('PG::UniqueViolation: ERROR:  duplicate key value violates unique constraint \"index_users_on_username\"\n'))
						_thisView.showPopUpError("Username already exist.");
					else
						_thisView.showPopUpError("Server error.");
				}
			}).done(function() {
				Backbone.history.navigate("user", { trigger: true });
				$('nav #account_div p.username').text(_thisView.model.get('username'));	
			});
		}
	},

	onFormSubmit: function(e) {
		e.preventDefault();
		var fd = new FormData();
		const files = $('.custom-file-input')[0].files;
		let _thisView = this;

		if ($('#username').val().length < 1) {
			Backbone.history.navigate("user/" + initCurrentUserId + "/edit", { trigger: true });
		} else {
			if(files.length > 0) {
				if (files[0].type.substr(0, 6) === 'image/')
				{
					fd.append('file',files[0]);
					$.ajax({
						url: "users/" + initCurrentUserId + "/avatar_update",
						type: 'post',
						data: fd,
						contentType: false,
						processData: false,
						headers: {
							'X-Transaction': 'POST Example',
							'X-CSRF-Token': $('meta[name="csrf-token"]').attr('content')
						}
					}).done(function(response) {
						if(response != 0){
							_thisView.updateProfil();
						}
					});
				} else {
					console.log('Error');
					Backbone.history.navigate("user/" + initCurrentUserId + "/edit", { trigger: true });
				}
			} else {
				this.updateProfil();
			}
		}
	},

	clickHandler: function(e){
		e.preventDefault()
		Backbone.history.navigate("user", { trigger: true })
	},

	changeFileName: function(e) {
		const files = $('.custom-file-input')[0].files[0].name;
		$('.custom-file-input').attr('name', files);
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
