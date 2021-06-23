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
				return _thisView;
			});
		} else {
			Backbone.history.navigate("user", { trigger: true })
		}
	},

	getFileExt: function() {
		let files = $('input[name="image"]')[0].files;
		let ext = null;
		if(files[0] != null){
		 let filename =
			 files[0].name.replace(/\\/g, '/').replace(/.*\//, '');
		 ext = filename.replace(/^.*\./, '').toLowerCase();
		}
		return ext;
	},

	saveFile: function() {
		let picture = $('input[name="image"]')[0].files[0];
		let filename = this.model.get('login') + '_' + $.now() + '.' + this.getFileExt();
		let data = new FormData();
		data.append('file', picture, filename);
		$.ajax({
		  url: 'user/1/avatar'+this.model.get('picture'),
		  data: data,
		  cache: false,
		  contentType: false,
		  processData: false,
		  type: 'POST',
		  success: function(data){
			$('#loadingModal').modal('hide');
		  },
		  error: function(data){
			alert('no upload');
			$('#loadingModal').modal('hide');
		  }
		});
		return data;
	},

	onFormSubmit: function(e) {
		e.preventDefault();
		console.log(this.model.toJSON());
		this.model.set('username', $('#username').val());
		//this.model.set('pictures', this.saveFile());
		console.log(this.model.toJSON());
		_.bindAll(this, "render");
		this.model.save({
			success: this.render
		});
	}

});
