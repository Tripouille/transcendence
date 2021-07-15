import { User } from "../../models/user";

export const UserUpdateView = Backbone.View.extend({

	template: _.template($('#user-modify').html()),

	events: {
		'click #formSubmitUpdateUser input' : 'onFormSubmit',
		'change .custom-file-input' : 'changeAvatar'
	},

	model: new User({ id:initCurrentUserId }),

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
			Backbone.history.navigate("user/" + initCurrentUserId + "/show", { trigger: true });
		}
	},

	chargePage: function(_thisView, src) {
		console.log(this.model.attributes);
		_thisView.$el.html(_thisView.template(_thisView.model.attributes));
		$('#avatar_profile').attr('src', src);
		_thisView.$el.removeClass('loading');
		_thisView.$el.removeClass('lds-ripple');
		this.$el.find('.back-btn').on('click', this.back);
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
						_thisView.showPopUpError("Username already exists.");
					else
						_thisView.showPopUpError("Server error.");
				}
			}).done(function() {
			Backbone.history.navigate("user/" + initCurrentUserId + "/show", { trigger: true });
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

	back: function(e){
		e.preventDefault()
		Backbone.history.navigate("user/" + initCurrentUserId + "/show", { trigger: true });
	},

	changeAvatar: function(e) {
		const file = $('.custom-file-input')[0].files[0];
		if (file) {
			$('.custom-file-input').attr('name', file.name);
			const url = window.URL || window.webkitURL;
			const binaryData = [];
			binaryData.push(file);
			const fileURL = url.createObjectURL(new Blob(binaryData, {type: "application/zip"}));
			$('#avatar_profile').attr('src', fileURL);
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
