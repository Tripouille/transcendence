import { User } from "../../models/user";

export const UserCreateView = Backbone.View.extend({

	template: _.template($('#user-create').html()),

	events: {
		'click #formSubmitCreateUser input' : 'onFormSubmit'
	},

	model: new User({ id:initCurrentUserId }),

	render: function(id) {
		if (initCurrentUserId == id) {
			let _thisView = this;

			this.$el.attr({id: 'user'});
			this.model.fetch().done(function() {
				if (_thisView.model.get('username') !== _thisView.model.get('login')) {
					Backbone.history.navigate("user", { trigger: true });
				} else {
					_thisView.$el.empty();
					_thisView.$el.append(_thisView.template(_thisView.model.attributes));
					return _thisView;
				}
			});
		} else {
			Backbone.history.navigate("user", { trigger: true })
		}
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
				Backbone.history.navigate("game", { trigger: true })
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
			Backbone.history.navigate("user/" + initCurrentUserId + "/create", { trigger: true });
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
					Backbone.history.navigate("user/" + initCurrentUserId + "/create", { trigger: true });
				}
			} else {
				this.updateProfil();
			}
		}
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
