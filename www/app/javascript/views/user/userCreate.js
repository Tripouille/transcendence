import { User } from "../../models/user";

export const UserCreateView = Backbone.View.extend({

	template: _.template($('#user-create').html()),

	events: {
		'click #formSubmitCreateUser input' : 'onFormSubmit'
	},

	model: new User({ id:initCurrentUserId }),

	initialize: function() {
		console.log('User Create View has been init');
	},

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
		this.model.set('username', $('#username').val().trim());
		_.bindAll(this, "render");
		this.model.save({}).done(function() {
			Backbone.history.navigate("user", { trigger: true })
		});
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
							Backbone.history.navigate("", { trigger: true });
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
	}

});
