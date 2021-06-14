import { GuildModel } from '../../models/guild';

export const GuildNewView = Backbone.View.extend({
	events: {
		'click #formSubmitNewGuild a': 'onFormSubmit',
		'blur input[required]': 'onInputChange',
		'focus input[required]': function (e) {
			this.resetInputErrors(e.target);
		}
	},
	templates: {
		'error': _.template('<span class="error"><%=error%></span>')
	},
	onFormSubmit: function () {
		/* get data from form on submit button */
		/* save the new guild and the guild_id to the current user databses */
		let model = new GuildModel();
		var self = this;
		model.save({ name: $('#name').val(), anagram: $('#anagram').val() }, {
			success: function (model, response, options) {
				Backbone.history.navigate("guilds/" + model.get('id'), { trigger: true });
			},
			error: function (model, response, options) {
				console.log("Something went wrong while saving the new guild");
				// /* Regex to match
				//    DETAIL:  Key (name)=(Olivier Lidon) already exists.
				//    |____________||__||_______________________________|
				// 		  1^      2^      1       3^  2                 3
				// 				 |--------^--------||-^||---------------^------------| */
				// let regexKey = /(?<=DETAIL:  Key \()(.*)(?=\)=\((.*)\) already exists)/g;
				// let label = response.responseText.match(regexKey)[0];
				// /* AJOUTER reset error */
				// $('#newGuildForm').find('.error').remove();
				// if (label == "name" || label == "anagram")
				// 	self.showInputErrors(label.charAt(0).toUpperCase() + label.slice(1) + " already exist.", label);
				// else
				self.showInputErrors("Unknown server error.", "name");
			}
		});
	},
	/* render the form page */
	render: function () {
		let that = this;
		window.currentUser.fetch().done(function () {
			let guildId = window.currentUser.get('guild_id');
			if (guildId != null) {
				Backbone.history.navigate("guilds/" + guildId, { trigger: true });
			}
			else {
				let template = _.template($('#guildNewStatic').html());
				that.$el.html(template);
			}
			return this;
		});
	},
	/* validate the labels on the go */
	validateOnChange: function (attr) {
		if (attr.name == "name") {
			if (attr.value == "" || attr.value.length < 2 || attr.value.length > 30) {
				return "Guild name must be 2 to 30 characters long."
			}
		}
		if (attr.name == "anagram") {
			if (attr.value == "" || attr.value.length > 5) {
				return "Anagram must be 1 to 5 characters long."
			}
		}
		return true;
	},
	onInputChange: function (e) {
		var result = this.validateOnChange(e.target);

		if (result !== true)
			this.showInputErrors(result, e.target.name);
	},
	resetInputErrors: function (e) {
		$('#newGuildForm').find('label[for=' + e.name + '] span').remove();
	},
	showInputErrors: function (errors, labelName) {
		var $target = $('label[for=' + labelName + ']');
		var errorHTML = '';

		errorHTML += this.templates.error({ error: errors });
		$target.append(errorHTML);
	}
});
