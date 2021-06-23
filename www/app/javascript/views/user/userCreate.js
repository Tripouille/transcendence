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

	saveFile: function() {
		var picture = $('input[name="image"]')[0].files[0];
		console.log('picture');
		var data = new FormData();
		data.append('file', picture);
		console.log('data');
		$.ajax({
		  url: 'rest/accounts/upload/'+this.model.get('picture'),
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
		return picture;
	},

	onFormSubmit: function(e) {
		e.preventDefault();
		this.model.set('username', $('#username').val());
		//this.model.set('pictures', this.saveFile());
		_.bindAll(this, "render");
		this.model.save({
			success: Backbone.history.navigate("user", { trigger: true })
		});
	}

});
