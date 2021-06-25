import { User } from "../../models/user";

export const UserUpdateView = Backbone.View.extend({

	template: _.template($('#user-modify').html()),

	events: {
		'click #formSubmitUpdateUser input' : 'onFormSubmit'
	},

	model: new User({ id:initCurrentUserId }),

	initialize: function() {
		console.log('User Update View has been init')
	},

	render: function(id) {
		if (initCurrentUserId == id) {
			let _thisView = this;
			this.model.fetch().done(function() {
				_thisView.$el.empty();
				_thisView.$el.append(_thisView.template(_thisView.model.attributes));
				$.ajax({
				type: "GET",
				url: "users/" + initCurrentUserId + "/avatar",
				xhrFields: {
					responseType: 'blob'
				},
				success (data) {
					const url = window.URL || window.webkitURL;
					const src = url.createObjectURL(data);
					$('#avatar_profile').attr('src', src);
				}
			});
				return _thisView;
			});
		} else {
			Backbone.history.navigate("user", { trigger: true })
		}
	},

	onFormSubmit: function(e) {
		e.preventDefault();
		var fd = new FormData();
		const files = $('#fileInput')[0].files;
		if(files.length > 0 ){
			fd.append('file',files[0]);}
		console.log(fd);
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
					console.log("Upload");
				}else{
					alert('file not uploaded');
				}
			},
		});
		console.log(files);
		console.log(this.model.toJSON());
		this.model.set('username', $('#username').val());
		console.log(this.model.toJSON());
		_.bindAll(this, "render");
		this.model.save({
			success: this.render
		});
	}

});
