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
			this.model.fetch().done(function() {
				if (_thisView.model.get('username').length > 0) {
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

	onFormSubmit: function(e) {
		e.preventDefault();
		var fd = new FormData();
		const files = $('.custom-file-input')[0].files;
		if(files.length > 0 ){
			fd.append('file',files[0]);}
		$.ajax({
			url: "users/" + initCurrentUserId + "/avatar_update",
			type: 'post',
			data: fd,
			contentType: false,
			processData: false,
			headers: {
				'X-Transaction': 'POST Example',
				'X-CSRF-Token': $('meta[name="csrf-token"]').attr('content')
			},
			success: function(response){
				if(response != 0){
					Backbone.history.navigate("user", { trigger: true })
				}else{
					Backbone.history.navigate("user/" + initCurrentUserId + "/create", { trigger: true })
				}
			},
		});
		this.model.set('username', $('#username').val());
		_.bindAll(this, "render");
		this.model.save({
			success: this.render
		});
	}

});
