import { User } from "../../models/user";

export const UserCreateView = Backbone.View.extend({

	template: _.template($('#user-create').html()),

	events: {
		'click #formSubmitCreateUser input': 'onFormSubmit'
	},

	model: new User({ id: initCurrentUserId }),

	render: function (id) {
		if (initCurrentUserId == id) {
			let _thisView = this;

			this.$el.attr({ id: 'user' });
			this.model.fetch().done(function () {
				if (_thisView.model.get('username') !== _thisView.model.get('login')) {
					Backbone.history.navigate("user/" + initCurrentUserId + "/show", { trigger: true });
				} else {
					_thisView.$el.html(_thisView.template(_thisView.model.attributes));
					$.ajax({
						type: "GET",
						url: "users/" + initCurrentUserId + "/avatar",
						xhrFields: {
							responseType: 'blob'
						},
					}).done(function(data) {
						const url = window.URL || window.webkitURL;
						const src = url.createObjectURL(data);
						$('#avatar_profile').attr('src', src);
						_thisView.$el.find('input#username').focus();
					});
					return _thisView;
				}
			});
		} else {
			Backbone.history.navigate("user/" + initCurrentUserId + "/show", { trigger: true });
		}
	},

	updateProfil: function () {
		let _thisView = this;
		_.bindAll(this, "render");
		if ($('#username').val().trim().length < 2 || $('#username').val().trim().length > 20) {
			_thisView.showPopUpError("Invalid len Username Min 2 - Max 20");
		} else {
			let regex = new RegExp('^([a-zA-Z0-9]){3,20}$');
			if (!regex.test($('#username').val().trim())) {
				_thisView.showPopUpError("Username contains a invalid character.");
			} else {
				this.model.save({ username: $('#username').val().trim() }, {
					error: function (model, response, options) {
						if (response.responseText.includes('PG::UniqueViolation: ERROR:  duplicate key value violates unique constraint \"index_users_on_username\"\n'))
							_thisView.showPopUpError("Username already exist.");
						else
							_thisView.showPopUpError("Server error.");
					}
				}).done(function () {
					Backbone.history.navigate("game", { trigger: true })
					$('nav #account_div p.username').text(_thisView.model.get('username'));
				});
			}
		}
	},

	onFormSubmit: function (e) {
		e.preventDefault();
		var fd = new FormData();
		const files = $('.custom-file-input')[0].files;
		let _thisView = this;

		if ($('#username').val().length < 1) {
			Backbone.history.navigate("user/" + initCurrentUserId + "/create", { trigger: true });
		} else {
			if (files.length > 0) {
				if (files[0].type.substr(0, 6) === 'image/') {
					fd.append('file', files[0]);
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
					}).done(function (response) {
						if (response != 0) {
							_thisView.updateProfil();
						}
					});
				} else {
					_thisView.showPopUpError("Your file failed to upload. Please try again");
				}
			} else {
				this.updateProfil();
			}
		}
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
